// Chat box element ko select kar rahe hain jaha messages show honge
const chatBox = document.getElementById("chat-box");

// Input field select kar rahe hain
const userInput = document.getElementById("user-input");

// AI message aane par ek sound bajane ke liye audio object banaya
const aiSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

window.onload = () => {
  // Purani chat localStorage se load kar rahe hain
  chatBox.innerHTML = localStorage.getItem("chat") || "";

  // Saved theme ko restore kar rahe hain
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
  }

  // Agar chat box empty hai to welcome message dikhao
  if (!chatBox.innerHTML.trim()) {
    addAIMessageTyping("Hey Aniruddh! 👋 How can I assist you today?");
  }

  // Scroll ko bottom par le aao
  scrollToBottom();
};

// Chat HTML ko localStorage me save karne ka function
function saveChat() {
  localStorage.setItem("chat", chatBox.innerHTML);
}

// Scroll hamesha latest message tak le jaane ke liye function
function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Current time ko readable format me return karega
function getTime() {
  const now = new Date();

  // Hour nikaal rahe hain
  let hours = now.getHours();

  // Minutes ko 2 digit format me convert kar rahe hain
  const minutes = now.getMinutes().toString().padStart(2, "0");

  // AM/PM decide kar rahe hain
  const ampm = hours >= 12 ? "PM" : "AM";

  // 24 hour format ko 12 hour format me convert kar rahe hain
  hours = hours % 12 || 12;

  // Final formatted time return
  return `${hours}:${minutes} ${ampm}`;
}

// AI sound safe tarike se play karne ke liye
function safePlaySound() {
  // Browser kabhi-kabhi audio play reject karta hai, isliye catch lagaya
  aiSound.play().catch(() => {});
}

// Welcome ya manual AI message typing effect ke saath show karne ke liye function
async function addAIMessageTyping(text) {
  // Pehle loader banao
  const loader = createAILoader();

  // Fir text ko typing effect se show karo
  await typeText(loader, text);
}

// AI ke liye temporary typing loader create karte hain
function createAILoader() {
  // Outer wrapper div banaya
  const loader = document.createElement("div");

  // Is message ko AI class di gayi taaki left side par aaye
  loader.className = "message ai";

  // Loader ke andar AI icon + typing bubble banaya
  loader.innerHTML = `
    <div class="msg-icon">🤖</div>

    <div class="message-content">
      <div class="bubble typing">
        <span></span><span></span><span></span>
      </div>
    </div>

    <button class="delete" onclick="deleteMsg(this)" title="Delete message">✖</button>
  `;

  // Loader ko chat area me append kiya
  chatBox.appendChild(loader);

  // Latest message tak scroll
  scrollToBottom();

  // Bana hua loader return kar diya
  return loader;
}

// Typing effect se AI text dikhane ka function
async function typeText(loader, text) {
  // Bubble element ko select kiya
  const bubble = loader.querySelector(".bubble");

  // Typing class hata di kyunki ab actual text dikhana hai
  bubble.classList.remove("typing");

  // Bubble ko empty kiya
  bubble.textContent = "";

  // Text ki length ke hisaab se speed set kar rahe hain
  const baseSpeed = 12;
  const maxSpeed = 28;
  const delayPerChar = Math.min(maxSpeed, Math.max(baseSpeed, text.length * 0.35));

  // Har character ko ek-ek karke append karenge
  for (let i = 0; i < text.length; i++) {
    bubble.textContent += text[i];

    // Har character ke baad thoda scroll bottom
    scrollToBottom();

    // Typing effect ke liye delay
    await new Promise((resolve) => setTimeout(resolve, delayPerChar));
  }

  // Message content wrapper select kiya
  const content = loader.querySelector(".message-content");

  // Time add kiya
  content.innerHTML += `<div class="time">${getTime()}</div>`;

  // Sound play kiya
  safePlaySound();

  // Chat save kar di
  saveChat();

  // Final scroll bottom
  scrollToBottom();
}

// User message DOM me add karne ka function
function addUserMessage(userText) {
  // User message wrapper create kiya
  const userMessage = document.createElement("div");

  // Isko user class di gayi taaki right side par aaye
  userMessage.className = "message user";

  // User message ka HTML structure
  userMessage.innerHTML = `
    <div class="message-content">
      <div class="bubble">${escapeHTML(userText)}</div>
      <div class="time">${getTime()}</div>
    </div>

    <button class="delete" onclick="deleteMsg(this)" title="Delete message">✖</button>
  `;

  // Chat box me append
  chatBox.appendChild(userMessage);

  // Scroll bottom
  scrollToBottom();

  // Save chat
  saveChat();
}

// HTML special characters ko safe banane ke liye function
function escapeHTML(text) {
  // Temporary div create karte hain
  const div = document.createElement("div");

  // User ka text textContent me daalte hain taaki HTML execute na ho
  div.textContent = text;

  // Safe HTML return karte hain
  return div.innerHTML;
}

// Message bhejne ka main function
async function sendMessage() {
  // Input field se text nikaal rahe hain
  const userText = userInput.value.trim();

  // Agar input empty hai to kuch mat karo
  if (!userText) return;

  // User message screen par show karo
  addUserMessage(userText);

  // Input box clear karo
  userInput.value = "";

  // Input par wapas focus do
  userInput.focus();

  // AI typing loader create karo
  const loader = createAILoader();

  try {
    // Backend API ko message bhej rahe hain
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userText })
    });

    // Agar response valid nahi hai to error throw karo
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }

    // JSON response parse karo
    const data = await res.json();

    // AI reply ko typing effect ke saath show karo
    await typeText(loader, `Hey Aniruddh, ${data.reply}`);
  } catch (error) {
    // Console me debugging ke liye error print kar do
    console.error("Frontend error:", error);

    // Error aane par friendly message show karo
    await typeText(loader, "Oops! Something went wrong 😅");
  }
}

// Keyboard se Enter press karne par message send hoga
function handleKey(event) {
  // Sirf Enter press hone par sendMessage chale
  if (event.key === "Enter") {
    sendMessage();
  }
}

// Puri chat clear karne ka function
function clearChat() {
  // User se confirmation lo
  const isConfirmed = confirm("Are you sure you want to clear all chat?");

  // Agar user confirm nahi kare to function stop
  if (!isConfirmed) return;

  // Chat box empty kar do
  chatBox.innerHTML = "";

  // LocalStorage se bhi purani chat hata do
  localStorage.removeItem("chat");

  // Welcome message fir se dikhao
  addAIMessageTyping("Chat cleared successfully ✅");
}

// Individual message delete karne ka function
function deleteMsg(button) {
  // Delete se pehle confirmation
  const isConfirmed = confirm("Delete this message?");

  // Agar cancel kiya to kuch mat karo
  if (!isConfirmed) return;

  // Button ke parent message wrapper ko target karo
  const msg = button.parentElement;

  // Remove hone se pehle smooth animation lagao
  msg.style.opacity = "0";
  msg.style.transform = "translateY(8px)";
  msg.style.transition = "all 0.25s ease";

  // Thodi delay ke baad actual remove
  setTimeout(() => {
    msg.remove();

    // Remove ke baad updated chat save karo
    saveChat();
  }, 250);
}

// Dark mode on/off karne ka function

function toggleDarkMode() {
  // Body par dark class toggle hogi
  document.body.classList.toggle("dark");

  // Current theme ko localStorage me save karenge
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
}
// Mobile keyboard open hone par latest messages visible rahein
userInput.addEventListener("focus", () => {
  setTimeout(() => {
    scrollToBottom();
  }, 300);
});