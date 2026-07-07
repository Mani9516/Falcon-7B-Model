import requests

from app.config import settings


def check_ollama() -> dict:
    """Ping Ollama and return status + installed models."""
    try:
        response = requests.get(
            f"{settings.ollama_base_url.rstrip('/')}/api/tags",
            timeout=5,
        )
        if not response.ok:
            return {"running": False, "models": [], "error": f"HTTP {response.status_code}"}

        models = [m["name"] for m in response.json().get("models", [])]
        model_ready = any(
            settings.ollama_model in name or name.startswith(f"{settings.ollama_model}:")
            for name in models
        )
        return {"running": True, "models": models, "model_ready": model_ready}
    except requests.exceptions.ConnectionError:
        return {"running": False, "models": [], "error": "Ollama not running"}
    except Exception as exc:
        return {"running": False, "models": [], "error": str(exc)}
