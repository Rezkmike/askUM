from sentence_transformers import SentenceTransformer
from typing import List, Union
from loguru import logger
from utils.config import settings
import numpy as np

class EmbeddingService:
    """Service for generating embeddings"""
    
    def __init__(self):
        self.model = None
        self.model_name = settings.EMBEDDING_MODEL
    
    async def initialize(self):
        """Initialize the embedding model"""
        try:
            self.model = SentenceTransformer(self.model_name)
            logger.info(f"Embedding model {self.model_name} loaded successfully")
        except Exception as e:
            logger.error(f"Error loading embedding model: {e}")
            raise
    
    async def embed_text(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        if self.model is None:
            await self.initialize()
        
        try:
            embedding = self.model.encode(text, convert_to_tensor=False)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            return []
    
    async def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        if self.model is None:
            await self.initialize()
        
        try:
            embeddings = self.model.encode(texts, convert_to_tensor=False)
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            return []

# Global instance
embedding_service = EmbeddingService()