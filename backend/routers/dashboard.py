from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    return {
        "active_users": 2847,
        "messages_today": 18392,
        "avg_response_time": 1.2,
        "rag_accuracy": 94.7,
        "change_active_users": "+12.5%",
        "change_messages": "+8.2%",
        "change_response_time": "-0.3s",
        "change_accuracy": "+2.1%"
    }

@router.get("/system-status")
async def get_system_status():
    """Get system status for all services"""
    return [
        {"service": "Telegram API", "status": "healthy", "uptime": "99.9%"},
        {"service": "LLM Service", "status": "healthy", "uptime": "99.7%"},
        {"service": "Redis Cache", "status": "healthy", "uptime": "100%"},
        {"service": "Milvus Vector DB", "status": "warning", "uptime": "98.2%"},
        {"service": "Reranker API", "status": "healthy", "uptime": "99.5%"}
    ]

@router.get("/conversations")
async def get_recent_conversations():
    """Get recent conversations"""
    return [
        {
            "id": 1,
            "user": "@john_doe",
            "message": "How do I reset my password?",
            "time": "2 min ago",
            "status": "resolved"
        },
        {
            "id": 2,
            "user": "@sarah_smith",
            "message": "What are your business hours?",
            "time": "5 min ago",
            "status": "resolved"
        },
        {
            "id": 3,
            "user": "@mike_wilson",
            "message": "Can you help with billing issues?",
            "time": "8 min ago",
            "status": "pending"
        },
        {
            "id": 4,
            "user": "@emma_brown",
            "message": "Product information needed",
            "time": "12 min ago",
            "status": "resolved"
        }
    ]

@router.get("/activity")
async def get_activity_data():
    """Get activity data for charts"""
    # Generate sample data for the last 24 hours
    now = datetime.now()
    data = []
    
    for i in range(24):
        timestamp = now - timedelta(hours=i)
        data.append({
            "timestamp": timestamp.isoformat(),
            "messages": random.randint(50, 200),
            "users": random.randint(20, 80),
            "response_time": round(random.uniform(0.8, 2.5), 2)
        })
    
    return data[::-1]  # Reverse to get chronological order