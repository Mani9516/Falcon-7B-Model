# Qubi — AI QnA Chatbot

A full-stack RAG-powered chatbot with **LangChain**, **FAISS**, **Ollama/Groq**, and a **Qubi-style** Next.js UI.

## Architecture

```
┌─────────────────┐     REST API      ┌──────────────────────────────┐
│  Next.js UI     │ ◄──────────────► │  FastAPI Backend              │
│  (port 3000)    │                   │  (port 8000)                  │
│                 │                   │                               │
│  • Sidebar      │                   │  • /api/chat    — QnA         │
│  • Chat         │                   │  • /api/upload  — RAG ingest  │
│  • File upload  │                   │  • /api/chats   — History     │
│  • Voice input  │                   │                               │
└─────────────────┘                   │  ┌─────────┐  ┌───────────┐  │
                                      │  │  FAISS  │  │  Ollama   │  │
                                      │  │  Vector │  │  / Groq   │  │
                                      │  │  Store  │  │  LLM      │  │
                                      │  └─────────┘  └───────────┘  │
                                      └──────────────────────────────┘
```

## Quick Start

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` — default uses **Ollama** (free, local):

```
LLM_PROVIDER=ollama
OLLAMA_MODEL=llama3.2
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features

| Feature | Description |
|---------|-------------|
| **RAG Pipeline** | Upload PDF/TXT/MD/CSV → chunked → embedded → stored in FAISS |
| **Ollama / Groq** | Free local (Ollama) or free cloud (Groq) LLM |
| **Chat History** | Sidebar with date-grouped conversations |
| **Delete Chats** | Remove conversations from sidebar or header |
| **File Upload** | Paperclip button — indexes documents for Q&A |
| **Voice Input** | Browser speech recognition (Chrome/Edge) |
| **Qubi UI** | Dark sidebar, robot logo, modern laptop layout |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + LLM status |
| `GET` | `/api/chats` | List all chats |
| `POST` | `/api/chats` | Create new chat |
| `DELETE` | `/api/chats/{id}` | Delete a chat |
| `GET` | `/api/chats/{id}/messages` | Get chat messages |
| `POST` | `/api/chat` | Send message, get AI response |
| `POST` | `/api/upload` | Upload & index a document |

## License

MIT
