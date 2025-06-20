import httpx
from typing import List, Dict, Any
from loguru import logger
from utils.config import settings

class RerankerService:
    """Service for reranking retrieved documents"""
    
    def __init__(self):
        self.api_url = settings.RERANKER_API_URL
        self.api_key = settings.RERANKER_API_KEY
        self.client = httpx.AsyncClient(timeout=10.0)
    
    async def rerank_documents(
        self,
        query: str,
        documents: List[Dict[str, Any]],
        top_k: int = 3
    ) -> List[Dict[str, Any]]:
        """Rerank documents based on relevance to query"""
        try:
            if not documents:
                return []
            
            # Prepare documents for reranking
            doc_texts = [doc.get("text", "") for doc in documents]
            
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}" if self.api_key else None
            }
            headers = {k: v for k, v in headers.items() if v is not None}
            
            payload = {
                "model": "jina-reranker-v1-base-en",
                "query": query,
                "documents": doc_texts,
                "top_n": min(top_k, len(documents))
            }
            
            response = await self.client.post(
                self.api_url,
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            
            result = response.json()
            
            # Map reranked results back to original documents
            reranked_docs = []
            for item in result.get("results", []):
                original_index = item.get("index", 0)
                if original_index < len(documents):
                    doc = documents[original_index].copy()
                    doc["rerank_score"] = item.get("relevance_score", 0.0)
                    reranked_docs.append(doc)
            
            return reranked_docs
            
        except Exception as e:
            logger.error(f"Error reranking documents: {e}")
            # Return original documents if reranking fails
            return documents[:top_k]

# Global instance
reranker_service = RerankerService()