"""Profile Service - User profile management."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import json
import os

router = APIRouter()

PROFILE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "user_profile.json")


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_style: Optional[str] = None  # "titan" or "valkyrie"
    timezone: Optional[str] = None


def get_default_profile():
    return {
        "name": "Traveler",
        "bio": "On a journey to holistic wellness",
        "avatar_style": "titan",
        "timezone": "Asia/Kolkata",
        "joined_at": datetime.now().isoformat(),
        "last_active": datetime.now().isoformat()
    }


def load_profile():
    if os.path.exists(PROFILE_PATH):
        with open(PROFILE_PATH, "r") as f:
            return json.load(f)
    return get_default_profile()


def save_profile(profile):
    with open(PROFILE_PATH, "w") as f:
        json.dump(profile, f, indent=2)


def calculate_all_time_stats():
    """Calculate all-time statistics."""
    stats = {
        "total_xp": 0,
        "level": 1,
        "total_habits_completed": 0,
        "longest_streak": 0,
        "meals_logged": 0,
        "focus_sessions": 0,
        "achievements_unlocked": 0,
        "challenges_completed": 0,
        "days_active": 0
    }
    
    # Get XP stats
    try:
        from services.gamification.gamification_service import get_xp_status
        xp_data = get_xp_status()
        stats["total_xp"] = xp_data.get("total_xp", 0)
        stats["level"] = xp_data.get("level", 1)
    except:
        pass
    
    # Get habits stats
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as count FROM habit_completions")
        stats["total_habits_completed"] = cursor.fetchone()["count"]
        
        cursor.execute("SELECT COUNT(DISTINCT completed_date) as days FROM habit_completions")
        stats["days_active"] = cursor.fetchone()["days"]
        
        conn.close()
    except:
        pass
    
    # Get meals stats
    try:
        from services.diet.diet_service import _logged_meals
        stats["meals_logged"] = len(_logged_meals)
    except:
        pass
    
    # Get achievements stats
    try:
        from services.gamification.achievements_service import get_db as get_ach_db
        conn = get_ach_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM user_achievements")
        stats["achievements_unlocked"] = cursor.fetchone()["count"]
        conn.close()
    except:
        pass
    
    # Get challenges stats
    try:
        from services.gamification.challenges_service import get_db as get_ch_db
        conn = get_ch_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as count FROM challenge_progress WHERE completed = 1")
        stats["challenges_completed"] = cursor.fetchone()["count"]
        conn.close()
    except:
        pass
    
    return stats


@router.get("/")
def get_profile():
    """Get user profile with all-time stats."""
    profile = load_profile()
    stats = calculate_all_time_stats()
    
    # Calculate days since joined
    joined = datetime.fromisoformat(profile.get("joined_at", datetime.now().isoformat()))
    days_since = (datetime.now() - joined).days
    
    return {
        **profile,
        "stats": stats,
        "days_since_joined": days_since
    }


@router.put("/")
def update_profile(update: ProfileUpdate):
    """Update user profile."""
    profile = load_profile()
    
    if update.name:
        profile["name"] = update.name
    if update.bio:
        profile["bio"] = update.bio
    if update.avatar_style:
        profile["avatar_style"] = update.avatar_style
    if update.timezone:
        profile["timezone"] = update.timezone
    
    profile["last_active"] = datetime.now().isoformat()
    
    save_profile(profile)
    return {"success": True, "profile": profile}


@router.get("/activity-calendar")
def get_activity_calendar():
    """Get activity data for calendar view."""
    activity = {}
    
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT completed_date, COUNT(*) as count 
            FROM habit_completions 
            GROUP BY completed_date
            ORDER BY completed_date DESC
            LIMIT 365
        """)
        
        for row in cursor.fetchall():
            activity[row["completed_date"]] = row["count"]
        
        conn.close()
    except:
        pass
    
    return {"activity": activity}
