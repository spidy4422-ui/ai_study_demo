# Spidy Assist 🤖

**Spidy Assist** is an AI-powered chatbot that helps users interact with an AI assistant through a simple and user-friendly web interface.

**Live Demo:** https://spidy4422-ui.github.io/ai_study_demo/client/

## ✨ Features

- AI-powered chat using OpenRouter API
- Real-time AI responses
- Chat history saved in browser
- Dark mode
- Delete individual messages
- Clear entire chat history
- Typing animation
- Responsive chat interface

##  Technologies Used

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### AI Integration
- OpenRouter API

### Deployment
- GitHub Pages (Frontend)
- Render (Backend)

## Project Structure

```text
ai_study_demo/
│
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
└── README.md
```

##  Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/spidy4422-ui/ai_study_demo.git
```

### 2. Open the project folder

```bash
cd ai_study_demo
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create a `.env` file inside the `server` folder:

```env
OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=your_model_name
```

Never share or upload your API key.

### 5. Start the backend

```bash
npm start
```

The backend will run on:

`http://localhost:3000`

### 6. Open the frontend

Open `client/index.html` using VS Code Live Server or another local web server.

For local testing, configure the frontend API endpoint to:

`http://localhost:3000/chat`

## Live Project

Visit: https://spidy4422-ui.github.io/ai_study_demo/client/

##  Developer

**Spidy Assist**

An AI chatbot project built using HTML, CSS, JavaScript, Node.js, Express.js and OpenRouter API.

---

*Built with curiosity and a passion for learning AI development.*