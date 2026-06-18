# Yazaki AI 🤖

> AI-powered chatbot for **Yazaki India** — answers employee queries based on the Domestic Travel Policy using a RAG (Retrieval-Augmented Generation) pipeline.

![Status](https://img.shields.io/badge/status-live-brightgreen) ![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688) ![React](https://img.shields.io/badge/React-Vite-61DAFB) ![ChromaDB](https://img.shields.io/badge/ChromaDB-0.4.24-orange)

---

## ✨ Features

- 🎙️ **Voice Input** — Speak your question (Web Speech API)
- 🔊 **Voice Output** — Assistant speaks the answer back
- 📄 **PDF Knowledge Base** — Upload policy documents to train the bot
- 🧠 **RAG Pipeline** — ChromaDB semantic search + OpenRouter LLM
- 🔄 **Auto Fallback** — Primary LLM fails → fallback kicks in automatically
- 📱 **Responsive UI** — Works on both desktop and mobile
- 🔒 **No Data Storage** — No localStorage, no cookies, fresh session every time

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Framer Motion + Tailwind CSS |
| Backend | FastAPI + Uvicorn (Python 3.11) |
| Vector DB | ChromaDB 0.4.24 (persistent) |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| LLM | OpenRouter (`openai/gpt-oss-120b:free` + fallback) |
| Voice | Web Speech API (STT + TTS) |
| Deployment | Render (Docker) |

---

## 📁 Project Structure

```
yazaki-ai/
├── Dockerfile                        # Multi-stage build (Node + Python)
├── render.yaml                       # Render deployment config
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point + routes
│   │   ├── config.py                 # Pydantic settings (env vars)
│   │   └── services/
│   │       ├── rag.py                # RAG pipeline + PDF ingestion
│   │       ├── openrouter_service.py # LLM service (primary + fallback)
│   │       └── chroma.py             # ChromaDB vector store
│   ├── data/
│   │   └── chroma_store/             # Persistent vector DB (git ignored)
│   ├── .env                          # Secrets (git ignored)
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx                   # Root component (responsive layout)
    │   ├── components/
    │   │   ├── AssistantAvatar.jsx   # Animated Yazaki AI avatar
    │   │   ├── ChatSidebar.jsx       # Chat interface
    │   │   ├── InputBox.jsx          # Text input
    │   │   ├── Navbar.jsx            # Top navigation
    │   │   ├── VoiceButton.jsx       # Mic button
    │   │   └── VoiceControls.jsx     # STT + TTS controls
    │   ├── hooks/
    │   │   └── useVoice.js           # Voice hook (STT + TTS)
    │   ├── store/
    │   │   └── ChatContext.jsx       # Global state (no localStorage)
    │   └── styles/
    │       └── assistant.css
    ├── public/
    │   └── ai-avatar.png             # Yazaki AI bot image
    ├── index.html
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- OpenRouter API key (free — no credit card needed)

### 1. Clone the repo

```bash
git clone https://github.com/swarnaverma10/-Yazaki-Chatbot.git
cd -Yazaki-Chatbot
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` file:

```env
# ── OpenRouter ───────────────────────────────────────────────
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openai/gpt-oss-120b:free
OPENROUTER_FALLBACK_MODEL=google/gemma-4-31b-it:free

# ── App ──────────────────────────────────────────────────────
APP_NAME=Yazaki AI
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DEBUG=True

# ── ChromaDB ─────────────────────────────────────────────────
CHROMA_PERSIST_DIR=./data/chroma_store
CHROMA_COLLECTION_NAME=yazaki_knowledge
```

Start backend:

```bash
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend live at: `http://localhost:5173`

---

## 📄 Adding Knowledge via PDF

1. Go to `http://localhost:8000/docs`
2. Find `/upload-pdf` → **Try it out**
3. Select your PDF → **Execute**

The bot will now answer questions based on the uploaded document.

> **To reset:** Use `/clear-knowledge-base` DELETE endpoint, then re-upload your PDF.

---

## 🧠 How It Works

```
Employee Question (text or voice)
         ↓
ChromaDB Semantic Search
(all-MiniLM-L6-v2 embeddings, top 5 chunks)
         ↓
Context Builder (relevant chunks)
         ↓
OpenRouter LLM
(primary model → auto fallback if fails)
         ↓
Answer + Voice Output
```

---

## 🌐 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | App status + chunk count |
| `POST` | `/chat` | Text question → answer |
| `POST` | `/voice-query` | Voice question → answer |
| `POST` | `/upload-pdf` | Add PDF to knowledge base |
| `DELETE` | `/clear-knowledge-base` | Wipe ChromaDB collection |

---

## 🚀 Deployment (Render)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect GitHub repo
4. Runtime: **Docker**
5. Add environment variables:
   - `OPENROUTER_API_KEY`
   - `APP_URL` = `https://yazaki-ai.onrender.com`
   - `FRONTEND_URL` = `https://yazaki-ai.onrender.com`
6. Deploy!

---

## 🔑 Getting OpenRouter API Key

1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up (free, no credit card needed)
3. Click **Create Key**
4. Paste into `backend/.env`

---

## 📝 License

MIT — Built for Yazaki India.