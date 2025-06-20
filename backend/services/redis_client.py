import aioredis
import json
from typing import List, Dict, Any, Optional
from loguru import logger
from utils.config import settings

redis_client = None

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    try:
        redis_url = f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
        if settings.REDIS_PASSWORD:
            redis_url = f"redis://:{settings.REDIS_PASSWORD}@{settings.REDIS_HOST}:{settings.REDIS_PORT}/{settings.REDIS_DB}"
            
        redis_client = aioredis.from_url(
            redis_url,
            decode_responses=True
        )
        await redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        raise

async def get_redis_client():
    """Get Redis client instance"""
    global redis_client
    if redis_client is None:
        await init_redis()
    return redis_client

class ConversationManager:
    """Manage user conversations in Redis"""
    
    def __init__(self):
        self.ttl = 3600 * 24  # 24 hours
    
    async def get_conversation_history(self, user_id: str) -> List[Dict[str, Any]]:
        """Get recent conversation history for a user"""
        try:
            client = await get_redis_client()
            key = f"conversation:{user_id}"
            history = await client.lrange(key, 0, settings.MAX_CONVERSATION_HISTORY - 1)
            return [json.loads(msg) for msg in history]
        except Exception as e:
            logger.error(f"Error getting conversation history: {e}")
            return []
    
    async def add_message(self, user_id: str, message: Dict[str, Any]):
        """Add a message to user's conversation history"""
        try:
            client = await get_redis_client()
            key = f"conversation:{user_id}"
            
            # Add message to the beginning of the list
            await client.lpush(key, json.dumps(message))
            
            # Keep only the latest messages
            await client.ltrim(key, 0, settings.MAX_CONVERSATION_HISTORY - 1)
            
            # Set expiration
            await client.expire(key, self.ttl)
            
        except Exception as e:
            logger.error(f"Error adding message to conversation: {e}")
    
    async def clear_conversation(self, user_id: str):
        """Clear conversation history for a user"""
        try:
            client = await get_redis_client()
            key = f"conversation:{user_id}"
            await client.delete(key)
        except Exception as e:
            logger.error(f"Error clearing conversation: {e}")
    
    async def get_redis_client(self):
        """Get Redis client for stats"""
        return await get_redis_client()

class CacheManager:
    """General purpose cache manager"""
    
    async def get(self, key: str) -> Optional[str]:
        """Get value from cache"""
        try:
            client = await get_redis_client()
            return await client.get(key)
        except Exception as e:
            logger.error(f"Error getting cache value: {e}")
            return None
    
    async def set(self, key: str, value: str, ttl: int = 3600):
        """Set value in cache with TTL"""
        try:
            client = await get_redis_client()
            await client.setex(key, ttl, value)
        except Exception as e:
            logger.error(f"Error setting cache value: {e}")
    
    async def delete(self, key: str):
        """Delete key from cache"""
        try:
            client = await get_redis_client()
            await client.delete(key)
        except Exception as e:
            logger.error(f"Error deleting cache key: {e}")

# Global instances
conversation_manager = ConversationManager()
cache_manager = CacheManager()