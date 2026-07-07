import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"

_PLACEHOLDERS = {
    "",
    "your_groq_api_key_here",
    "your_api_key_here",
    "gsk_your_key_here",
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # LLM provider: "ollama" (free local) or "groq" (free cloud)
    llm_provider: str = "ollama"
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2"

    # Embeddings run locally — no API key needed
    embedding_model_id: str = "sentence-transformers/all-MiniLM-L6-v2"
    vector_store_path: str = "./data/faiss_index"
    upload_dir: str = "./data/uploads"

    @property
    def groq_key(self) -> str:
        key = self.groq_api_key.strip()
        if key in _PLACEHOLDERS or not key.startswith("gsk_"):
            return ""
        return key

    @property
    def llm_model_name(self) -> str:
        if self.llm_provider == "ollama":
            return self.ollama_model
        return self.groq_model

    @property
    def llm_ready(self) -> bool:
        if self.llm_provider == "ollama":
            from app.rag.ollama import check_ollama
            status = check_ollama()
            return status["running"] and status.get("model_ready", False)
        return bool(self.groq_key)

    @property
    def vector_store_dir(self) -> Path:
        path = Path(self.vector_store_path)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def upload_path(self) -> Path:
        path = Path(self.upload_dir)
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
