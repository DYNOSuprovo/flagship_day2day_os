"""Dashboard service API endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import random
from datetime import datetime

from .activity_tracker import (
    log_activity,
    get_recent_activities,
    calculate_habit_streak
)
from .insights_generator import generate_insight

router = APIRouter()


class ActivityLog(BaseModel):
    type: str
    description: str
    metadata: Optional[Dict] = None


from services.finance.transaction_manager import transaction_manager

@router.get("/overview")
def get_dashboard_overview():
    """Get comprehensive dashboard data."""
    
    # Get recent activities
    recent_activities = get_recent_activities(limit=5)
    
    # Get real finance data
    finance_summary = transaction_manager.get_summary()
    
    # Calculate metrics
    metrics = {
        "weight_progress": {
            "current": round(random.uniform(-3.5, -1.5), 1),  # Mock: -3.5 to -1.5 kg
            "goal": -5.0,
            "unit": "kg",
            "status": "on_track"
        },
        "budget": {
            "remaining": finance_summary["remaining_budget"],
            "total": finance_summary["budget_limit"],
            "spent": finance_summary["total_expenses"],
            "currency": "INR"
        },
        "habit_streak": calculate_habit_streak()
    }
    
    # Generate AI insight
    try:
        insight_context = {
            "activity_count": len(recent_activities),
            "recent_activities": recent_activities,
            "metrics": metrics
        }
        ai_insight = generate_insight(insight_context)
    except Exception as e:
        print(f"Error generating insight: {e}")
        ai_insight = {
            "message": "Stay healthy and active!",
            "confidence": 0.0,
            "tags": ["fallback", "error"]
        }
    
    return {
        "metrics": metrics,
        "recent_activity": recent_activities,
        "ai_insight": ai_insight,
        "last_updated": datetime.now().isoformat()
    }


@router.post("/log-activity")
def create_activity_log(activity: ActivityLog):
    """Log a new activity."""
    try:
        logged = log_activity(
            activity.type,
            activity.description,
            activity.metadata
        )
        return {
            "success": True,
            "activity": logged
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activities")
def get_activities(limit: int = 10):
    """Get recent activities."""
    activities = get_recent_activities(limit=limit)
    return {
        "activities": activities,
        "total": len(activities)
    }


@router.post("/refresh-insight")
def refresh_insight():
    """Generate a fresh AI insight."""
    recent_activities = get_recent_activities(limit=5)
    context = {
        "activity_count": len(recent_activities),
        "recent_activities": recent_activities
    }
    insight = generate_insight(context)
    return {
        "insight": insight,
        "generated_at": datetime.now().isoformat()
    }
