import httpx
from typing import List, Dict, Any, Optional
from loguru import logger
from utils.config import settings

class LLMService:
    """Service for interacting with the self-hosted LLM"""
    
    def __init__(self):
        self.api_url = settings.LLM_API_URL
        self.api_key = settings.LLM_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def generate_response(
        self,
        user_query: str,
        conversation_history: List[Dict[str, Any]],
        rag_context: str
    ) -> str:
        """Generate response using LLM with conversation history and RAG context"""
        try:
            # Prepare the prompt
            system_prompt = self._build_system_prompt(rag_context)
            messages = self._build_messages(system_prompt, conversation_history, user_query)
            
            # Make API call to LLM
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {self.api_key}" if self.api_key else None
            }
            headers = {k: v for k, v in headers.items() if v is not None}
            
            payload = {
                "model": "your-model-name",  # Configure based on your LLM setup
                "messages": messages,
                "max_tokens": 1000,
                "temperature": 0.7,
                "stream": False
            }
            
            response = await self.client.post(
                self.api_url,
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later."
    
    def _build_system_prompt(self, rag_context: str) -> str:
        """Build system prompt with RAG context"""
        return f"""You are a helpful AI assistant for a Telegram chatbot. You have access to relevant information from the knowledge base to answer user questions accurately.

Context from knowledge base:
{rag_context}

Instructions:
- Use the provided context to answer questions when relevant
- If the context doesn't contain relevant information, say so politely
- Be concise but helpful in your responses
- Maintain a friendly and professional tone
- If asked about something not in the context, use your general knowledge but mention the limitation"""
    
    def _build_messages(
        self,
        system_prompt: str,
        conversation_history: List[Dict[str, Any]],
        user_query: str
    ) -> List[Dict[str, str]]:
        """Build message array for LLM API"""
        messages = [{"role": "system", "content": system_prompt}]
        
        # Add conversation history (last 5 messages)
        for msg in reversed(conversation_history[-settings.MAX_CONVERSATION_HISTORY:]):
            messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        
        # Add current user query
        messages.append({"role": "user", "content": user_query})
        
        return messages

# Global instance
llm_service = LLMService()