import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

_default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
_extra = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = _default_origins + [o.strip() for o in _extra.split(",") if o.strip()]

app = FastAPI(
    title="Qubi API",
    description="RAG-powered QnA chatbot with Ollama/Groq",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router, prefix="/api")


@app.get("/")
def root():
    return {"name": "Qubi API", "docs": "/docs"}
