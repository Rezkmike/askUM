import schedule
import time
import asyncio
from loguru import logger
from services.scraping_service import scraping_service
from services.embedding_service import embedding_service
from services.milvus_client import vector_store

class ScrapingScheduler:
    """Scheduler for periodic web scraping tasks"""
    
    def __init__(self):
        self.running = False
    
    def start(self):
        """Start the scheduler"""
        self.running = True
        
        # Schedule periodic scraping jobs
        schedule.every(6).hours.do(self.run_scheduled_scraping)
        schedule.every().day.at("02:00").do(self.cleanup_old_documents)
        
        logger.info("Scraping scheduler started")
        
        # Run scheduler loop
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    
    def stop(self):
        """Stop the scheduler"""
        self.running = False
        logger.info("Scraping scheduler stopped")
    
    async def run_scheduled_scraping(self):
        """Run scheduled scraping for configured sources"""
        try:
            logger.info("Starting scheduled scraping")
            
            # In a real implementation, you would fetch configured sources from database
            sources = [
                {"url": "https://company-website.com", "max_depth": 3, "max_pages": 100},
                {"url": "https://help.company.com", "max_depth": 2, "max_pages": 50},
                {"url": "https://docs.company.com", "max_depth": 4, "max_pages": 200}
            ]
            
            for source in sources:
                await self.scrape_and_index_source(
                    source["url"],
                    source["max_depth"],
                    source["max_pages"]
                )
            
            logger.info("Scheduled scraping completed")
            
        except Exception as e:
            logger.error(f"Error in scheduled scraping: {e}")
    
    async def scrape_and_index_source(self, url: str, max_depth: int, max_pages: int):
        """Scrape and index a single source"""
        try:
            logger.info(f"Scraping {url}")
            
            # Scrape website
            documents = await scraping_service.scrape_website(url, max_depth, max_pages)
            
            if not documents:
                logger.warning(f"No documents found for {url}")
                return
            
            # Generate embeddings
            texts = [doc["text"] for doc in documents]
            embeddings = await embedding_service.embed_batch(texts)
            
            # Add embeddings to documents
            for doc, embedding in zip(documents, embeddings):
                doc["embedding"] = embedding
            
            # Insert into vector store
            await vector_store.insert_documents(documents)
            
            logger.info(f"Successfully indexed {len(documents)} documents from {url}")
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
    
    async def cleanup_old_documents(self):
        """Clean up old documents from vector store"""
        try:
            logger.info("Starting document cleanup")
            
            # In a real implementation, you would:
            # 1. Identify documents older than a certain threshold
            # 2. Remove them from the vector store
            # 3. Update source statistics
            
            logger.info("Document cleanup completed")
            
        except Exception as e:
            logger.error(f"Error in document cleanup: {e}")

# Global scheduler instance
scraping_scheduler = ScrapingScheduler()

if __name__ == "__main__":
    # Run scheduler as standalone process
    scraping_scheduler.start()