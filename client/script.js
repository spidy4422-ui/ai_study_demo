
// DOM elements
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");

// Backend API endpoint
const API_URL = "https://ai-study-demo.onrender.com/chat";


// Audio notification for AI responses
const aiSound = new Audio(
  "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
);

// Restore saved chat and preferences
window.onload = () => {
  chatBox.innerHTML = localStorage.getItem("chat") || "";

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  if (!chatBox.innerHTML.trim()) {
    addAIMessageTyping("Hey Aniruddh! 👋 How can I assist you today?");
  }

  scrollToBottom();
};

// Save the current conversation
function saveChat() {
  localStorage.setItem("chat", chatBox.innerHTML);
}

// Keep the latest message visible
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Return the current time in 12-hour format
function getTime() {
  const now = new Date();
  let hours = now.getHours();

  const minutes = now.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
}

// Play the notification sound without interrupting the chat
function safePlaySound() {
  aiSound.play().catch(() => {});
}

// Display an AI message with a typing animation
async function addAIMessageTyping(text) {
  const loader = createAILoader();
  await typeText(loader, text);
}

// Create the temporary AI typing indicator
function createAILoader() {
  const loader = document.createElement("div");
  loader.className = "message ai";

  loader.innerHTML = `
    <div class="msg-icon">🤖</div>

    <div class="message-content">
      <div class="bubble typing">
        <span></span><span></span><span></span>
      </div>
    </div>

    <button
      class="delete"
      onclick="deleteMsg(this)"
      title="Delete message"
    >✖</button>
  `;

  chatBox.appendChild(loader);
  scrollToBottom();

  return loader;
}

// Display text character by character
async function typeText(loader, text) {
  const bubble = loader.querySelector(".bubble");

  bubble.classList.remove("typing");
  bubble.textContent = "";

  const baseSpeed = 12;
  const maxSpeed = 28;
  const delayPerChar = Math.min(
    maxSpeed,
    Math.max(baseSpeed, text.length * 0.35)
  );

  for (let i = 0; i < text.length; i++) {
    bubble.textContent += text[i];
    scrollToBottom();

    await new Promise((resolve) =>
      setTimeout(resolve, delayPerChar)
    );
  }

  const content = loader.querySelector(".message-content");

  const timeElement = document.createElement("div");
  timeElement.className = "time";
  timeElement.textContent = getTime();

  content.appendChild(timeElement);

  safePlaySound();
  saveChat();
  scrollToBottom();
}

// Add a user message to the conversation
function addUserMessage(userText) {
  const userMessage = document.createElement("div");
  userMessage.className = "message user";

  userMessage.innerHTML = `
    <div class="message-content">
      <div class="bubble">${escapeHTML(userText)}</div>
      <div class="time">${getTime()}</div>
    </div>

    <button
      class="delete"
      onclick="deleteMsg(this)"
      title="Delete message"
    >✖</button>
  `;

  chatBox.appendChild(userMessage);

  scrollToBottom();
  saveChat();
}

// Escape HTML characters before inserting user input into the DOM
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;

  return div.innerHTML;
}

// Send a message to the backend and display the AI response
async function sendMessage() {
  const userText = userInput.value.trim();

  if (!userText) return;

  addUserMessage(userText);

  userInput.value = "";
  userInput.focus();

  const loader = createAILoader();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: userText
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (typeof data.reply !== "string" || !data.reply.trim()) {
      throw new Error("Invalid response received from the server.");
    }

    await typeText(loader, data.reply);

  } catch (error) {
    console.error("Chat request failed:", error);

    await typeText(
      loader,
      "Sorry, something went wrong. Please check your connection and try again."
    );
  }
}

// Send a message when Enter is pressed
function handleKey(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

// Clear the entire conversation
function clearChat() {
  const isConfirmed = confirm(
    "Are you sure you want to clear the entire chat?"
  );

  if (!isConfirmed) return;

  chatBox.innerHTML = "";
  localStorage.removeItem("chat");

  addAIMessageTyping("Chat cleared successfully! ✅");
}

// Delete an individual message
function deleteMsg(button) {
  const isConfirmed = confirm("Delete this message?");

  if (!isConfirmed) return;

  const message = button.parentElement;

  message.style.opacity = "0";
  message.style.transform = "translateY(8px)";
  message.style.transition = "all 0.25s ease";

  setTimeout(() => {
    message.remove();
    saveChat();
  }, 250);
}

// Toggle dark mode and save the selected theme
function toggleDarkMode() {
  document.body.classList.toggle("dark");

  const currentTheme = document.body.classList.contains("dark")
    ? "dark"
    : "light";

  localStorage.setItem("theme", currentTheme);
}

// Keep the latest messages visible when the mobile keyboard opens
userInput.addEventListener("focus", () => {
  setTimeout(scrollToBottom, 300);
});
