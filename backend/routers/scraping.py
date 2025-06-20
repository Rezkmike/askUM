from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from loguru import logger

from services.scraping_service import scraping_service

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

@router.post("/start")
async def start_scraping_job(job: ScrapingJob, background_tasks: BackgroundTasks):
    """Start a new scraping job"""
    try:
        job_id = f"scraping_{int(time.time())}"
        
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
    # In a real implementation, this would fetch from database
    return [
        {
            "job_id": "scraping_1703123456",
            "status": "completed",
            "progress": 100,
            "total_pages": 45,
            "urls": ["https://example.com"],
            "started_at": "2024-01-01T10:00:00Z",
            "completed_at": "2024-01-01T10:15:00Z"
        },
        {
            "job_id": "scraping_1703123789",
            "status": "running",
            "progress": 60,
            "total_pages": 30,
            "urls": ["https://docs.example.com"],
            "started_at": "2024-01-01T11:00:00Z",
            "current_url": "https://docs.example.com/api/reference"
        }
    ]

@router.get("/jobs/{job_id}")
async def get_scraping_job_status(job_id: str):
    """Get status of a specific scraping job"""
    # In a real implementation, this would fetch from database/cache
    return {
        "job_id": job_id,
        "status": "running",
        "progress": 75,
        "total_pages": 40,
        "current_url": "https://example.com/page-30",
        "pages_scraped": 30,
        "documents_created": 156,
        "errors": 2
    }

@router.delete("/jobs/{job_id}")
async def cancel_scraping_job(job_id: str):
    """Cancel a running scraping job"""
    try:
        # In a real implementation, you would cancel the background task
        logger.info(f"Cancelling scraping job {job_id}")
        
        return {"message": f"Scraping job {job_id} cancelled"}
        
    except Exception as e:
        logger.error(f"Error cancelling scraping job: {e}")
        raise HTTPException(status_code=500, detail="Failed to cancel scraping job")

async def run_scraping_job(job_id: str, urls: List[str], max_depth: int, max_pages: int):
    """Run scraping job for multiple URLs"""
    try:
        logger.info(f"Starting scraping job {job_id} for {len(urls)} URLs")
        
        total_documents = 0
        
        for url in urls:
            logger.info(f"Scraping {url}")
            documents = await scraping_service.scrape_website(url, max_depth, max_pages)
            total_documents += len(documents)
            
            # Here you would typically:
            # 1. Generate embeddings for documents
            # 2. Store in vector database
            # 3. Update job progress in database/cache
        
        logger.info(f"Scraping job {job_id} completed. Total documents: {total_documents}")
        
    except Exception as e:
        logger.error(f"Error in scraping job {job_id}: {e}")