from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from loguru import logger
import os
from dotenv import load_dotenv

from routers import telegram, dashboard, scraping, knowledge, auth
from services.database import init_databases
from services.redis_client import get_redis_client
from services.milvus_client import get_milvus_client
from utils.config import settings

load_dotenv()

# Security
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Telegram RAG Chatbot Backend...")
    await init_databases()
    logger.info("Databases initialized successfully")
    yield
    # Shutdown
    logger.info("Shutting down...")

app = FastAPI(
    title="Telegram RAG Chatbot API",
    description="Backend API for Telegram chatbot with RAG capabilities",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://localhost:5173", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(telegram.router, prefix="/api/telegram", tags=["telegram"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(scraping.router, prefix="/api/scraping", tags=["scraping"])
app.include_router(knowledge.router, prefix="/api/knowledge", tags=["knowledge"])

@app.get("/")
async def root():
    return {"message": "Telegram RAG Chatbot API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        redis_client = await get_redis_client()
        await redis_client.ping()
        redis_status = "healthy"
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        redis_status = "unhealthy"
    
    try:
        milvus_client = get_milvus_client()
        # Simple connection test
        milvus_status = "healthy"
    except Exception as e:
        logger.error(f"Milvus health check failed: {e}")
        milvus_status = "unhealthy"
    
    return {
        "status": "healthy",
        "services": {
            "redis": redis_status,
            "milvus": milvus_status,
            "api": "healthy"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )