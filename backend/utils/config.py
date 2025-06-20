from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBHOOK_URL: Optional[str] = None
    
    # Redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: Optional[str] = None
    REDIS_DB: int = 0
    
    # Milvus
    MILVUS_HOST: str = "localhost"
    MILVUS_PORT: int = 19530
    MILVUS_USER: Optional[str] = None
    MILVUS_PASSWORD: Optional[str] = None
    
    # LLM
    LLM_API_URL: str = ""
    LLM_API_KEY: Optional[str] = None
    
    # Reranker
    RERANKER_API_URL: str = "https://api.jina.ai/v1/rerank"
    RERANKER_API_KEY: Optional[str] = None
    
    # Embedding
    EMBEDDING_MODEL: str = "nomic-ai/nomic-embed-text-v1.5"
    
    # Application
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    MAX_CONVERSATION_HISTORY: int = 5
    RAG_TOP_K: int = 10
    RAG_TOP_RERANK: int = 3
    
    # Scraping
    SCRAPING_DELAY: int = 1
    MAX_SCRAPING_DEPTH: int = 3
    USER_AGENT: str = "TelegramRAGBot/1.0"
    
    class Config:
        env_file = ".env"

settings = Settings()