from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger
import time
import uuid

from services.scraping_service import scraping_service
from services.embedding_service import embedding_service
from services.milvus_client import vector_store

router = APIRouter()

class ScrapingJob(BaseModel):
    urls: List[str]
    max_depth: int = 3
    max_pages: int = 100
    delay: Optional[int] = None

class ScrapingStatus(BaseModel):
    job_id: str
    status: str
    progress: int
    total_pages: int
    current_url: str

# In-memory job storage (in production, use Redis or database)
scraping_jobs = {}

@router.post("/start")
async def start_scraping_job(job: ScrapingJob, background_tasks: BackgroundTasks):
    """Start a new scraping job"""
    try:
        job_id = f"scraping_{uuid.uuid4().hex[:8]}"
        
        # Initialize job status
        scraping_jobs[job_id] = {
            "job_id": job_id,
            "status": "started",
            "progress": 0,
            "total_pages": 0,
            "urls": job.urls,
            "started_at": time.time(),
            "current_url": "",
            "documents_created": 0,
            "errors": 0
        }
        
        # Start scraping in background
        background_tasks.add_task(
            run_scraping_job,
            job_id,
            job.urls,
            job.max_depth,
            job.max_pages
        )
        
        return {"job_id": job_id, "status": "started", "urls": job.urls}
        
    except Exception as e:
        logger.error(f"Error starting scraping job: {e}")
        raise HTTPException(status_code=500, detail="Failed to start scraping job")

@router.get("/jobs")
async def get_scraping_jobs():
    """Get all scraping jobs"""
    return list(scraping_jobs.values())

@router.get("/jobs/{job_id}")
async def get_scraping_job_status(job_id: str):
    """Get status of a specific scraping job"""
    if job_id not in scraping_jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return scraping_jobs[job_id]

@router.delete("/jobs/{job_id}")
async def cancel_scraping_job(job_id: str):
    """Cancel a running scraping job"""
    try:
        if job_id not in scraping_jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        scraping_jobs[job_id]["status"] = "cancelled"
        logger.info(f"Scraping job {job_id} cancelled")
        
        return {"message": f"Scraping job {job_id} cancelled"}
        
    except Exception as e:
        logger.error(f"Error cancelling scraping job: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel scraping job")

async def run_scraping_job(job_id: str, urls: List[str], max_depth: int, max_pages: int):
    """Run scraping job for multiple URLs"""
    try:
        logger.info(f"Starting scraping job {job_id} for {len(urls)} URLs")
        
        job = scraping_jobs[job_id]
        job["status"] = "running"
        
        total_documents = 0
        
        for i, url in enumerate(urls):
            if job["status"] == "cancelled":
                break
                
            try:
                job["current_url"] = url
                job["progress"] = int((i / len(urls)) * 100)
                
                logger.info(f"Scraping {url}")
                documents = await scraping_service.scrape_website(url, max_depth, max_pages)
                
                if documents:
                    # Generate embeddings
                    texts = [doc["text"] for doc in documents]
                    embeddings = await embedding_service.embed_batch(texts)
                    
                    # Add embeddings to documents
                    for doc, embedding in zip(documents, embeddings):
                        doc["embedding"] = embedding
                    
                    # Insert into vector store
                    await vector_store.insert_documents(documents)
                    
                    total_documents += len(documents)
                    job["documents_created"] = total_documents
                    
                    logger.info(f"Indexed {len(documents)} documents from {url}")
                
            except Exception as e:
                logger.error(f"Error scraping {url}: {e}")
                job["errors"] += 1
        
        job["status"] = "completed" if job["status"] != "cancelled" else "cancelled"
        job["progress"] = 100
        job["completed_at"] = time.time()
        
        logger.info(f"Scraping job {job_id} completed. Total documents: {total_documents}")
        
    except Exception as e:
        logger.error(f"Error in scraping job {job_id}: {e}")
        if job_id in scraping_jobs:
            scraping_jobs[job_id]["status"] = "failed"
            scraping_jobs[job_id]["error"] = str(e)