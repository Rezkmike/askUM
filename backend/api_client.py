"""
API client for testing the backend endpoints
"""
import httpx
import asyncio
from typing import Dict, Any

class TelegramRAGClient:
    """Client for interacting with the Telegram RAG API"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.client = httpx.AsyncClient()
    
    async def health_check(self) -> Dict[str, Any]:
        """Check API health"""
        response = await self.client.get(f"{self.base_url}/health")
        return response.json()
    
    async def get_dashboard_metrics(self) -> Dict[str, Any]:
        """Get dashboard metrics"""
        response = await self.client.get(f"{self.base_url}/api/dashboard/metrics")
        return response.json()
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get system status"""
        response = await self.client.get(f"{self.base_url}/api/dashboard/system-status")
        return response.json()
    
    async def start_scraping_job(self, urls: list, max_depth: int = 3, max_pages: int = 100) -> Dict[str, Any]:
        """Start a scraping job"""
        payload = {
            "urls": urls,
            "max_depth": max_depth,
            "max_pages": max_pages
        }
        response = await self.client.post(f"{self.base_url}/api/scraping/start", json=payload)
        return response.json()
    
    async def get_scraping_jobs(self) -> Dict[str, Any]:
        """Get all scraping jobs"""
        response = await self.client.get(f"{self.base_url}/api/scraping/jobs")
        return response.json()
    
    async def add_knowledge_source(self, url: str, max_depth: int = 3, max_pages: int = 100) -> Dict[str, Any]:
        """Add a knowledge source"""
        payload = {
            "url": url,
            "max_depth": max_depth,
            "max_pages": max_pages
        }
        response = await self.client.post(f"{self.base_url}/api/knowledge/sources", json=payload)
        return response.json()
    
    async def get_knowledge_sources(self) -> Dict[str, Any]:
        """Get knowledge sources"""
        response = await self.client.get(f"{self.base_url}/api/knowledge/sources")
        return response.json()
    
    async def simulate_telegram_message(self, user_id: int, chat_id: int, text: str) -> Dict[str, Any]:
        """Simulate a Telegram message"""
        payload = {
            "update_id": 123456,
            "message": {
                "message_id": 1,
                "from": {"id": user_id, "first_name": "Test", "username": "testuser"},
                "chat": {"id": chat_id, "type": "private"},
                "date": 1640995200,
                "text": text
            }
        }
        response = await self.client.post(f"{self.base_url}/api/telegram/webhook", json=payload)
        return response.json()
    
    async def close(self):
        """Close the client"""
        await self.client.aclose()

# Example usage
async def main():
    """Example usage of the API client"""
    client = TelegramRAGClient()
    
    try:
        # Health check
        health = await client.health_check()
        print("Health:", health)
        
        # Get metrics
        metrics = await client.get_dashboard_metrics()
        print("Metrics:", metrics)
        
        # Start scraping job
        scraping_result = await client.start_scraping_job(["https://example.com"])
        print("Scraping job:", scraping_result)
        
        # Simulate Telegram message
        message_result = await client.simulate_telegram_message(
            user_id=12345,
            chat_id=12345,
            text="Hello, can you help me with something?"
        )
        print("Message result:", message_result)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())