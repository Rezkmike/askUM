import asyncio
import httpx
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from typing import List, Dict, Any, Set
from loguru import logger
from utils.config import settings
import time

class WebScrapingService:
    """Service for web scraping and content extraction"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(
            timeout=30.0,
            headers={"User-Agent": settings.USER_AGENT}
        )
        self.visited_urls: Set[str] = set()
    
    async def scrape_website(
        self,
        base_url: str,
        max_depth: int = None,
        max_pages: int = 100
    ) -> List[Dict[str, Any]]:
        """Scrape website and extract content"""
        if max_depth is None:
            max_depth = settings.MAX_SCRAPING_DEPTH
        
        try:
            self.visited_urls.clear()
            documents = []
            
            # Start scraping from base URL
            await self._scrape_recursive(
                base_url,
                base_url,
                documents,
                depth=0,
                max_depth=max_depth,
                max_pages=max_pages
            )
            
            logger.info(f"Scraped {len(documents)} documents from {base_url}")
            return documents
            
        except Exception as e:
            logger.error(f"Error scraping website {base_url}: {e}")
            return []
    
    async def _scrape_recursive(
        self,
        url: str,
        base_url: str,
        documents: List[Dict[str, Any]],
        depth: int,
        max_depth: int,
        max_pages: int
    ):
        """Recursively scrape pages"""
        if (depth > max_depth or 
            len(documents) >= max_pages or 
            url in self.visited_urls):
            return
        
        try:
            self.visited_urls.add(url)
            
            # Fetch page content
            response = await self.client.get(url)
            response.raise_for_status()
            
            # Parse HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract content
            content = self._extract_content(soup)
            if content.strip():
                # Chunk content
                chunks = self._chunk_content(content)
                
                for i, chunk in enumerate(chunks):
                    documents.append({
                        "text": chunk,
                        "source_url": url,
                        "title": self._extract_title(soup),
                        "chunk_index": i,
                        "timestamp": int(time.time())
                    })
            
            # Find links for recursive scraping
            if depth < max_depth:
                links = self._extract_links(soup, base_url)
                
                for link in links:
                    if len(documents) >= max_pages:
                        break
                    
                    await asyncio.sleep(settings.SCRAPING_DELAY)
                    await self._scrape_recursive(
                        link, base_url, documents, depth + 1, max_depth, max_pages
                    )
            
        except Exception as e:
            logger.error(f"Error scraping URL {url}: {e}")
    
    def _extract_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
        
        # Try to find main content areas
        main_content = (
            soup.find("main") or 
            soup.find("article") or 
            soup.find("div", class_=lambda x: x and "content" in x.lower()) or
            soup.find("body")
        )
        
        if main_content:
            text = main_content.get_text(separator=" ", strip=True)
        else:
            text = soup.get_text(separator=" ", strip=True)
        
        # Clean up text
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        return ' '.join(lines)
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title"""
        title_tag = soup.find("title")
        if title_tag:
            return title_tag.get_text().strip()
        
        h1_tag = soup.find("h1")
        if h1_tag:
            return h1_tag.get_text().strip()
        
        return "Untitled"
    
    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Extract internal links from page"""
        links = []
        base_domain = urlparse(base_url).netloc
        
        for link in soup.find_all("a", href=True):
            href = link["href"]
            full_url = urljoin(base_url, href)
            
            # Only include internal links
            if urlparse(full_url).netloc == base_domain:
                links.append(full_url)
        
        return list(set(links))  # Remove duplicates
    
    def _chunk_content(self, content: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split content into overlapping chunks"""
        if len(content) <= chunk_size:
            return [content]
        
        chunks = []
        start = 0
        
        while start < len(content):
            end = start + chunk_size
            
            # Try to break at sentence boundary
            if end < len(content):
                # Look for sentence endings
                for i in range(end, max(start + chunk_size // 2, end - 100), -1):
                    if content[i] in '.!?':
                        end = i + 1
                        break
            
            chunk = content[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - overlap
            if start >= len(content):
                break
        
        return chunks

# Global instance
scraping_service = WebScrapingService()