# Qubi — AI QnA Chatbot

A full-stack RAG-powered chatbot using **Falcon-7B-Instruct**, **LangChain**, **FAISS**, and a **Qubi-style** Next.js UI.

![Qubi UI](assets/c__Users_ManiChourasiya_G10XI_AppData_Roaming_Cursor_User_workspaceStorage_8d832342d0fca0fb0aae6b54bf315ecb_images_image-bd5773ae-89cc-473f-94b7-d98e1dbb08da.png)

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
                                      │  │  FAISS  │  │  Falcon   │  │
                                      │  │  Vector │  │  7B via   │  │
                                      │  │  Store  │  │  HF API   │  │
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

Edit `backend/.env` and set your Hugging Face token:

```
HUGGINGFACE_API_TOKEN=hf_your_token_here
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
| **Falcon-7B-Instruct** | Context-aware answers via Hugging Face Inference API |
| **Chat History** | Sidebar with date-grouped conversations |
| **File Upload** | Paperclip button — indexes documents for Q&A |
| **Voice Input** | Browser speech recognition (Chrome/Edge) |
| **Qubi UI** | Dark sidebar, purple branding, green send button |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check + token status |
| `GET` | `/api/chats` | List all chats |
| `POST` | `/api/chats` | Create new chat |
| `GET` | `/api/chats/{id}/messages` | Get chat messages |
| `POST` | `/api/chat` | Send message, get AI response |
| `POST` | `/api/upload` | Upload & index a document |

## Project Structure

```
project 5/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings from .env
│   │   ├── api/routes.py    # REST endpoints
│   │   └── rag/
│   │       ├── embeddings.py
│   │       ├── vectorstore.py
│   │       └── chain.py     # Falcon prompt + generation
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # Sidebar, Chat, InputBar
│   │   └── lib/api.ts       # Backend client
│   └── package.json
└── README.md
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `HUGGINGFACE_API_TOKEN` | — | Required for Falcon responses |
| `FALCON_MODEL_ID` | `tiiuae/falcon-7b-instruct` | LLM model |
| `EMBEDDING_MODEL_ID` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model |
| `VECTOR_STORE_PATH` | `./data/faiss_index` | FAISS index location |

## Notes

- Get a free Hugging Face token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- Falcon-7B may require accepting the model license on Hugging Face first
- Voice input uses the Web Speech API (works best in Chrome/Edge)
- Chat history is in-memory — restart clears it (swap for a DB in production)

## License

MIT
