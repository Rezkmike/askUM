from loguru import logger
from .redis_client import init_redis
from .milvus_client import init_milvus

async def init_databases():
    """Initialize all database connections"""
    try:
        # Initialize Redis
        await init_redis()
        logger.info("Redis connection initialized")
        
        # Initialize Milvus
        await init_milvus()
        logger.info("Milvus connection initialized")
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise