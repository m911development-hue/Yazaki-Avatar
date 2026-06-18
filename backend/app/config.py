from pydantic_settings import BaseSettings


class Config(BaseSettings):
    # App
    APP_NAME: str = "Yazaki AI"
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:5173"
    DEBUG: bool = True

    # OpenRouter
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "openai/gpt-oss-120b:free"
    OPENROUTER_FALLBACK_MODEL: str = "google/gemma-4-31b-it:free"

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./data/chroma_store"
    CHROMA_COLLECTION_NAME: str = "yazaki_knowledge"

    # Scraper (unused)
    TARGET_URL: str = "https://www.yazaki-group.com"
    MAX_PAGES: int = 50

    class Config:
        env_file = ".env"


config = Config()