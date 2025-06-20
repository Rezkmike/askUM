from fastapi import APIRouter
from typing import List, Dict, Any
from loguru import logger

from services.dashboard_service import dashboard_service

router = APIRouter()

@router.get("/metrics")
async def get_dashboard_metrics():
    """Get dashboard metrics"""
    try:
        return await dashboard_service.get_system_metrics()
    except Exception as e:
        logger.error(f"Error getting dashboard metrics: {e}")
        return {
            "active_users": 0,
            "messages_today": 0,
            "avg_response_time": 0,
            "rag_accuracy": 0,
            "change_active_users": "0%",
            "change_messages": "0%",
            "change_response_time": "0s",
            "change_accuracy": "0%"
        }

@router.get("/system-status")
async def get_system_status():
    """Get system status for all services"""
    try:
        return await dashboard_service.get_system_health()
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        return []

@router.get("/conversations")
async def get_recent_conversations():
    """Get recent conversations"""
    # This would typically fetch from Redis/database
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
    try:
        return await dashboard_service.get_activity_data()
    except Exception as e:
        logger.error(f"Error getting activity data: {e}")
        return []