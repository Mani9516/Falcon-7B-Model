import re

import requests
from requests.exceptions import ConnectionError as RequestsConnectionError

from app.config import settings
from app.rag.vectorstore import search

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

SYSTEM_PROMPT = """You are Qubi, a helpful personal AI assistant.
Answer questions clearly and concisely using the provided context when available.
If the context does not contain enough information, say so honestly and answer from general knowledge.
Use plain text only — do not use markdown, asterisks (*), or bold formatting in your replies."""


def _groq_help() -> str:
    return (
        "Groq API key is missing.\n\n"
        "Groq is FREE — get a key in under a minute:\n"
        "1. Sign up at https://console.groq.com\n"
        "2. Go to API Keys and create a key\n"
        "3. Set GROQ_API_KEY=gsk_your_key in backend/.env\n"
        "4. Restart the backend server"
    )


def _ollama_help() -> str:
    return (
        "Ollama is not running.\n\n"
        "Ollama is FREE and runs locally:\n"
        "1. Install from https://ollama.com/download\n"
        "2. Run: ollama pull llama3.2\n"
        "3. Set LLM_PROVIDER=ollama in backend/.env\n"
        "4. Restart the backend server"
    )


def _clean_response(text: str) -> str:
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    return text.replace("*", "")


def _format_context(docs: list) -> str:
    if not docs:
        return "No relevant documents found."
    parts = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        parts.append(f"[{i}] ({source})\n{doc.page_content}")
    return "\n\n".join(parts)


def _call_groq(messages: list[dict]) -> str:
    if not settings.groq_key:
        raise ValueError(_groq_help())

    response = requests.post(
        GROQ_URL,
        headers={
            "Authorization": f"Bearer {settings.groq_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.groq_model,
            "messages": messages,
            "max_tokens": 512,
            "temperature": 0.3,
        },
        timeout=120,
    )

    if response.status_code == 401:
        raise ValueError(f"Invalid Groq API key. {_groq_help()}")

    if not response.ok:
        raise ValueError(f"Groq API error ({response.status_code}): {response.text[:300]}")

    return response.json()["choices"][0]["message"]["content"].strip()


def _call_ollama(messages: list[dict]) -> str:
    response = requests.post(
        f"{settings.ollama_base_url.rstrip('/')}/api/chat",
        json={"model": settings.ollama_model, "messages": messages, "stream": False},
        timeout=180,
    )

    if response.status_code == 404:
        raise ValueError(
            f"Model '{settings.ollama_model}' not found. Run: ollama pull {settings.ollama_model}"
        )

    if not response.ok:
        raise ValueError(f"Ollama error ({response.status_code}): {response.text[:300]}")

    return response.json()["message"]["content"].strip()


def _call_llm(messages: list[dict]) -> str:
    if settings.llm_provider == "ollama":
        return _call_ollama(messages)
    return _call_groq(messages)


def generate_response(query: str) -> str:
    docs = search(query)
    context = _format_context(docs)

    if settings.llm_provider == "groq" and not settings.groq_key:
        return f"⚠️ {_groq_help()}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"},
    ]

    try:
        return _clean_response(_call_llm(messages))
    except RequestsConnectionError:
        if settings.llm_provider == "ollama":
            return f"⚠️ {_ollama_help()}"
        return "⚠️ Could not connect to Groq API. Check your internet connection."
    except ValueError as exc:
        return f"⚠️ {exc}"
    except Exception as exc:
        return f"Error generating response: {exc}"
