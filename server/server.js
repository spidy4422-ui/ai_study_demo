// .env file ke variables ko process.env me load karne ke liye
require("dotenv").config();

// Express framework import kar rahe hain server banane ke liye
const express = require("express");

// CORS import kar rahe hain taaki frontend backend se connect kar sake
const cors = require("cors");

// Express app initialize kiya
const app = express();

// CORS enable kiya
app.use(cors());

// JSON body ko parse karne ke liye middleware
app.use(express.json());

// Root route sirf check ke liye ki server chal raha hai ya nahi
app.get("/", (req, res) => {
  res.send("Server is running properly 🚀");
});

// Chat route jaha frontend se message aayega
app.post("/chat", async (req, res) => {
  try {
    // User ka bheja hua message request body se le rahe hain
    const userMessage = req.body.message;

    // Agar API key missing hai to turant response bhej do
    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({
        reply: "API key load nahi ho rahi bhai 😅"
      });
    }

    // OpenRouter API ko request bhej rahe hain
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        // Authorization me secure tarike se .env wali key use ki ja rahi hai
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,

        // JSON content send karne ke liye content type
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // Model choose kiya gaya hai automatic selection ke liye
        model: "openrouter/auto",

        // Messages array API ko batata hai ki user ne kya bola
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    });

    // API response ko JSON me convert kar rahe hain
    const data = await response.json();

    // Agar API successful response nahi de rahi to error handle karo
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);

      return res.status(response.status).json({
        reply: "API error aaya bhai 😅"
      });
    }

    // Agar proper choices mili hain to AI reply bhejo
    if (data.choices && data.choices.length > 0) {
      return res.json({
        reply: data.choices[0].message.content
      });
    }

    // Agar choices empty hain to fallback message bhejo
    return res.json({
      reply: "AI se response nahi aaya 😅"
    });
  } catch (error) {
    // Server side unexpected error console me print karo
    console.error("Server error:", error);

    // User ko friendly error message do
    return res.status(500).json({
      reply: "Server error aaya bhai 😅"
    });
  }
});

// Server ko port 3000 par run kara rahe hain
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});