from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import settings
from app.rag.embeddings import get_embeddings

_vectorstore: FAISS | None = None

SPLITTER = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def _index_path() -> Path:
    return settings.vector_store_dir / "index.faiss"


def get_vectorstore() -> FAISS | None:
    global _vectorstore
    if _vectorstore is not None:
        return _vectorstore

    index_file = _index_path()
    if index_file.exists():
        _vectorstore = FAISS.load_local(
            str(settings.vector_store_dir),
            get_embeddings(),
            allow_dangerous_deserialization=True,
        )
    return _vectorstore


def save_vectorstore(store: FAISS) -> None:
    global _vectorstore
    store.save_local(str(settings.vector_store_dir))
    _vectorstore = store


def add_documents(text: str, source: str) -> int:
    docs = SPLITTER.split_documents(
        [Document(page_content=text, metadata={"source": source})]
    )
    if not docs:
        return 0

    existing = get_vectorstore()
    if existing is None:
        store = FAISS.from_documents(docs, get_embeddings())
    else:
        store = existing
        store.add_documents(docs)

    save_vectorstore(store)
    return len(docs)


def search(query: str, k: int = 4) -> list[Document]:
    store = get_vectorstore()
    if store is None:
        return []
    return store.similarity_search(query, k=k)
