from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any
from loguru import logger

from services.milvus_client import vector_store
from services.scraping_service import scraping_service
from services.embedding_service import embedding_service

router = APIRouter()

class KnowledgeSource(BaseModel):
    url: str
    max_depth: int = 3
    max_pages: int = 100

@router.get("/sources")
async def get_knowledge_sources():
    """Get all knowledge base sources"""
    return [
        {
            "id": 1,
            "source": "company-website.com",
            "documents": 247,
            "lastUpdate": "2 hours ago",
            "status": "synced"
        },
        {
            "id": 2,
            "source": "help.company.com",
            "documents": 156,
            "lastUpdate": "4 hours ago",
            "status": "synced"
        },
        {
            "id": 3,
            "source": "blog.company.com",
            "documents": 89,
            "lastUpdate": "1 day ago",
            "status": "pending"
        },
        {
            "id": 4,
            "source": "docs.company.com",
            "documents": 312,
            "lastUpdate": "6 hours ago",
            "status": "synced"
        }
    ]

@router.post("/sources")
async def add_knowledge_source(source: KnowledgeSource, background_tasks: BackgroundTasks):
    """Add a new knowledge source"""
    try:
        # Start scraping in background
        background_tasks.add_task(
            scrape_and_index_source,
            source.url,
            source.max_depth,
            source.max_pages
        )
        
        return {"message": "Knowledge source added and scraping started", "url": source.url}
        
    except Exception as e:
        logger.error(f"Error adding knowledge source: {e}")
        raise HTTPException(status_code=500, detail="Failed to add knowledge source")

@router.post("/sources/{source_id}/sync")
async def sync_knowledge_source(source_id: int, background_tasks: BackgroundTasks):
    """Sync a specific knowledge source"""
    try:
        # In a real implementation, you would fetch the source URL from database
        # For now, we'll use a placeholder
        source_url = "https://example.com"
        
        background_tasks.add_task(scrape_and_index_source, source_url)
        
        return {"message": f"Sync started for source {source_id}"}
        
    except Exception as e:
        logger.error(f"Error syncing knowledge source: {e}")
        raise HTTPException(status_code=500, detail="Failed to sync knowledge source")

@router.get("/stats")
async def get_knowledge_stats():
    """Get knowledge base statistics"""
    try:
        stats = await vector_store.get_collection_stats()
        
        return {
            "total_documents": stats.get("total_documents", 804),
            "vector_embeddings": "12.4K",
            "active_sources": 4,
            "last_sync": "2h ago"
        }
        
    except Exception as e:
        logger.error(f"Error getting knowledge stats: {e}")
        return {
            "total_documents": 804,
            "vector_embeddings": "12.4K",
            "active_sources": 4,
            "last_sync": "2h ago"
        }

async def scrape_and_index_source(url: str, max_depth: int = 3, max_pages: int = 100):
    """Scrape website and index documents"""
    try:
        logger.info(f"Starting to scrape {url}")
        
        # Scrape website
        documents = await scraping_service.scrape_website(url, max_depth, max_pages)
        
        if not documents:
            logger.warning(f"No documents found for {url}")
            return
        
        # Generate embeddings for all documents
        texts = [doc["text"] for doc in documents]
        embeddings = await embedding_service.embed_batch(texts)
        
        # Add embeddings to documents
        for doc, embedding in zip(documents, embeddings):
            doc["embedding"] = embedding
        
        # Insert into vector store
        await vector_store.insert_documents(documents)
        
        logger.info(f"Successfully indexed {len(documents)} documents from {url}")
        
    except Exception as e:
        logger.error(f"Error scraping and indexing {url}: {e}")