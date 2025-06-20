"""
Setup script for the Telegram RAG Chatbot backend
"""
import asyncio
import os
from loguru import logger

from services.database import init_databases
from services.embedding_service import embedding_service
from utils.config import settings

async def setup_system():
    """Initialize the entire system"""
    logger.info("Starting system setup...")
    
    try:
        # Initialize databases
        logger.info("Initializing databases...")
        await init_databases()
        
        # Initialize embedding service
        logger.info("Initializing embedding service...")
        await embedding_service.initialize()
        
        # Test basic functionality
        logger.info("Testing basic functionality...")
        test_embedding = await embedding_service.embed_text("Hello world")
        if test_embedding:
            logger.info("✅ Embedding service working correctly")
        else:
            logger.error("❌ Embedding service failed")
        
        logger.info("✅ System setup completed successfully!")
        
        # Print configuration summary
        print("\n" + "="*50)
        print("TELEGRAM RAG CHATBOT - SETUP COMPLETE")
        print("="*50)
        print(f"Redis Host: {settings.REDIS_HOST}:{settings.REDIS_PORT}")
        print(f"Milvus Host: {settings.MILVUS_HOST}:{settings.MILVUS_PORT}")
        print(f"Embedding Model: {settings.EMBEDDING_MODEL}")
        print(f"LLM API URL: {settings.LLM_API_URL}")
        print(f"Reranker API: {settings.RERANKER_API_URL}")
        print(f"Debug Mode: {settings.DEBUG}")
        print("="*50)
        
        if not settings.TELEGRAM_BOT_TOKEN:
            print("⚠️  WARNING: TELEGRAM_BOT_TOKEN not set!")
        if not settings.LLM_API_URL:
            print("⚠️  WARNING: LLM_API_URL not set!")
        if not settings.RERANKER_API_KEY:
            print("⚠️  WARNING: RERANKER_API_KEY not set!")
        
        print("\nNext steps:")
        print("1. Set your environment variables in .env")
        print("2. Start the server: uvicorn main:app --reload")
        print("3. Visit http://localhost:8000/docs for API documentation")
        print("4. Set up your Telegram webhook")
        
    except Exception as e:
        logger.error(f"System setup failed: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(setup_system())