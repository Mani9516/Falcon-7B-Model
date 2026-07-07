import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.config import settings
from app.rag.chain import generate_response
from app.rag.vectorstore import add_documents

router = APIRouter()

# In-memory chat store (replace with DB in production)
_chats: dict[str, dict] = {}
_messages: dict[str, list[dict]] = {}


class ChatCreate(BaseModel):
    title: str = "New Chat"


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    chat_id: str | None = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    chat_id: str
    timestamp: str
    type: str = "text"
    metadata: dict | None = None


class ChatResponse(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str


def _now() -> str:
    return datetime.utcnow().isoformat() + "Z"


def _ensure_chat(chat_id: str | None) -> str:
    if chat_id and chat_id in _chats:
        return chat_id

    new_id = str(uuid.uuid4())
    now = _now()
    _chats[new_id] = {
        "id": new_id,
        "title": "New Chat",
        "created_at": now,
        "updated_at": now,
    }
    _messages[new_id] = []
    return new_id


@router.get("/health")
def health():
    from app.rag.ollama import check_ollama

    ollama = check_ollama() if settings.llm_provider == "ollama" else None
    return {
        "status": "ok",
        "provider": settings.llm_provider,
        "model": settings.llm_model_name,
        "llm_ready": settings.llm_ready,
        "ollama": ollama,
    }


@router.get("/chats", response_model=list[ChatResponse])
def list_chats():
    return sorted(_chats.values(), key=lambda c: c["updated_at"], reverse=True)


@router.post("/chats", response_model=ChatResponse)
def create_chat(body: ChatCreate):
    chat_id = str(uuid.uuid4())
    now = _now()
    chat = {
        "id": chat_id,
        "title": body.title,
        "created_at": now,
        "updated_at": now,
    }
    _chats[chat_id] = chat
    _messages[chat_id] = []
    return chat


@router.get("/chats/{chat_id}/messages")
def get_messages(chat_id: str):
    if chat_id not in _chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    return _messages.get(chat_id, [])


@router.delete("/chats/{chat_id}")
def delete_chat(chat_id: str):
    if chat_id not in _chats:
        raise HTTPException(status_code=404, detail="Chat not found")
    del _chats[chat_id]
    _messages.pop(chat_id, None)
    return {"ok": True, "id": chat_id}


@router.post("/chat", response_model=MessageResponse)
def chat(body: MessageCreate):
    chat_id = _ensure_chat(body.chat_id)
    now = _now()

    user_msg = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": body.content,
        "chat_id": chat_id,
        "timestamp": now,
        "type": "text",
    }
    _messages[chat_id].append(user_msg)

    if len(_messages[chat_id]) == 1:
        _chats[chat_id]["title"] = body.content[:50] + ("..." if len(body.content) > 50 else "")

    assistant_content = generate_response(body.content)
    assistant_msg = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": assistant_content,
        "chat_id": chat_id,
        "timestamp": _now(),
        "type": "text",
    }
    _messages[chat_id].append(assistant_msg)
    _chats[chat_id]["updated_at"] = assistant_msg["timestamp"]

    return assistant_msg


@router.post("/upload")
async def upload_file(file: UploadFile = File(...), chat_id: str | None = None):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    chat_id = _ensure_chat(chat_id)
    dest = settings.upload_path / f"{uuid.uuid4()}_{file.filename}"

    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    text = _extract_text(dest)
    chunk_count = add_documents(text, source=file.filename) if text.strip() else 0

    now = _now()
    user_msg = {
        "id": str(uuid.uuid4()),
        "role": "user",
        "content": f"Uploaded file: {file.filename}",
        "chat_id": chat_id,
        "timestamp": now,
        "type": "file",
        "metadata": {
            "filename": file.filename,
            "chunks_indexed": chunk_count,
            "url": str(dest.name),
        },
    }
    _messages[chat_id].append(user_msg)

    assistant_content = (
        f"Thanks for sharing **{file.filename}** — I've indexed {chunk_count} text chunks. "
        "Ask me anything about this document!"
    )
    assistant_msg = {
        "id": str(uuid.uuid4()),
        "role": "assistant",
        "content": assistant_content,
        "chat_id": chat_id,
        "timestamp": _now(),
        "type": "text",
    }
    _messages[chat_id].append(assistant_msg)
    _chats[chat_id]["updated_at"] = assistant_msg["timestamp"]

    return {
        "message": assistant_msg,
        "chunks_indexed": chunk_count,
        "filename": file.filename,
    }


def _extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if suffix in {".txt", ".md", ".csv"}:
        return path.read_text(encoding="utf-8", errors="ignore")
    raise HTTPException(status_code=400, detail=f"Unsupported file type: {suffix}")
