"""
Health check endpoint.
"""
from fastapi import APIRouter
from datetime import datetime
from api.config import config
import sys

router = APIRouter(prefix="/health", tags=["health"])


@router.get("", response_model=dict)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database_connected": config.DB_FOLDER.exists(),
        "timestamp": datetime.now().isoformat()
    }


@router.get("", response_model=dict)
async def health_check_v2():
    """Alternative health check endpoint."""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "database_connected": config.DB_FOLDER.exists(),
        "timestamp": datetime.now().isoformat()
    }
