from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any
from loguru import logger

from services.redis_client import conversation_manager
from services.embedding_service import embedding_service
from services.milvus_client import vector_store
from services.reranker_service import reranker_service
from services.llm_service import llm_service

router = APIRouter()

class TelegramUpdate(BaseModel):
    update_id: int
    message: Dict[str, Any]

class TelegramResponse(BaseModel):
    method: str
    chat_id: int
    text: str

@router.post("/webhook")
async def telegram_webhook(update: TelegramUpdate, background_tasks: BackgroundTasks):
    """Handle incoming Telegram webhook"""
    try:
        message = update.message
        chat_id = message.get("chat", {}).get("id")
        user_id = str(message.get("from", {}).get("id"))
        text = message.get("text", "")
        
        if not text or not chat_id:
            return {"status": "ignored"}
        
        # Process message in background
        background_tasks.add_task(process_message, user_id, chat_id, text)
        
        return {"status": "processing"}
        
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

async def process_message(user_id: str, chat_id: int, text: str):
    """Process incoming message and generate response"""
    try:
        # Get conversation history
        conversation_history = await conversation_manager.get_conversation_history(user_id)
        
        # Add user message to history
        await conversation_manager.add_message(user_id, {
            "role": "user",
            "content": text,
            "timestamp": int(time.time())
        })
        
        # Generate embedding for user query
        query_embedding = await embedding_service.embed_text(text)
        
        # Retrieve similar documents from vector store
        similar_docs = await vector_store.search_similar(
            query_embedding,
            top_k=settings.RAG_TOP_K
        )
        
        # Rerank documents
        reranked_docs = await reranker_service.rerank_documents(
            text,
            similar_docs,
            top_k=settings.RAG_TOP_RERANK
        )
        
        # Prepare RAG context
        rag_context = "\n\n".join([
            f"Source: {doc.get('title', 'Unknown')} ({doc.get('source_url', 'Unknown')})\n{doc.get('text', '')}"
            for doc in reranked_docs
        ])
        
        # Generate response using LLM
        response = await llm_service.generate_response(
            text,
            conversation_history,
            rag_context
        )
        
        # Add assistant response to history
        await conversation_manager.add_message(user_id, {
            "role": "assistant",
            "content": response,
            "timestamp": int(time.time())
        })
        
        # Send response back to Telegram
        await send_telegram_message(chat_id, response)
        
    except Exception as e:
        logger.error(f"Error processing message: {e}")
        await send_telegram_message(chat_id, "Sorry, I encountered an error processing your message.")

async def send_telegram_message(chat_id: int, text: str):
    """Send message to Telegram user"""
    try:
        # This would typically use the Telegram Bot API
        # For now, we'll just log it
        logger.info(f"Sending to chat {chat_id}: {text}")
        
        # In production, you would make an HTTP request to:
        # https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
        
    except Exception as e:
        logger.error(f"Error sending Telegram message: {e}")

@router.get("/stats")
async def get_telegram_stats():
    """Get Telegram bot statistics"""
    # This would typically fetch real stats from your bot
    return {
        "active_users": 2847,
        "messages_today": 18392,
        "avg_response_time": 1.2,
        "uptime": "99.9%"
    }