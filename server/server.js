
// Environment variables load karo
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Server configuration
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL;

// Middleware
app.use(cors());
app.use(express.json());

// Server health check
app.get("/", (req, res) => {
  res.send("Aniruddh Assist server is running successfully!");
});

// AI chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message;

    // Validate user input
    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return res.status(400).json({
        reply: "Please enter a valid message."
      });
    }

    // Check API configuration
    if (!API_KEY || !MODEL) {
      console.error("OpenRouter configuration is missing.");

      return res.status(500).json({
        reply: "AI service configuration is missing."
      });
    }

    // Send request to OpenRouter
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "user",
              content: userMessage.trim()
            }
          ]
        })
      }
    );

    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      console.error(
        "OpenRouter API error:",
        response.status,
        data.error?.message || "Unknown error"
      );

      return res.status(502).json({
        reply: "AI service error. Please try again."
      });
    }

    // Extract AI response
    const reply = data.choices?.[0]?.message?.content;

    return res.json({
      reply: reply || "AI could not generate a response."
    });

  } catch (error) {
    console.error("Server error:", error.message);

    return res.status(500).json({
      reply: "Something went wrong. Please try again."
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
