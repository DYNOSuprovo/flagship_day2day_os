"""Challenges Service - Weekly challenges and achievements."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
import sqlite3
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_challenges_table():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS challenge_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id TEXT NOT NULL,
            progress INTEGER DEFAULT 0,
            completed INTEGER DEFAULT 0,
            started_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed_at TEXT,
            UNIQUE(challenge_id)
        )
    """)
    
    conn.commit()
    conn.close()


init_challenges_table()


# Weekly challenges definition
WEEKLY_CHALLENGES = [
    {
        "id": "focus_master",
        "name": "Focus Master",
        "description": "Complete 5 focus sessions this week",
        "icon": "🎯",
        "target": 5,
        "xp_reward": 200,
        "color": "indigo",
        "category": "mind"
    },
    {
        "id": "habit_streak",
        "name": "Habit Warrior",
        "description": "Complete all daily habits for 7 days",
        "icon": "🔥",
        "target": 7,
        "xp_reward": 300,
        "color": "orange",
        "category": "discipline"
    },
    {
        "id": "nutrition_pro",
        "name": "Nutrition Pro",
        "description": "Log 21 meals this week",
        "icon": "🥗",
        "target": 21,
        "xp_reward": 150,
        "color": "emerald",
        "category": "body"
    },
    {
        "id": "mindful_soul",
        "name": "Mindful Soul",
        "description": "Have 3 conversations with Gita AI",
        "icon": "🕉️",
        "target": 3,
        "xp_reward": 100,
        "color": "purple",
        "category": "spirit"
    },
    {
        "id": "early_bird",
        "name": "Early Bird",
        "description": "Log activity before 7 AM for 5 days",
        "icon": "🌅",
        "target": 5,
        "xp_reward": 175,
        "color": "amber",
        "category": "discipline"
    }
]


def get_challenge_progress(challenge_id: str) -> dict:
    """Get current progress for a challenge."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM challenge_progress WHERE challenge_id = ?
    """, (challenge_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "progress": row["progress"],
            "completed": bool(row["completed"]),
            "started_at": row["started_at"],
            "completed_at": row["completed_at"]
        }
    return {"progress": 0, "completed": False, "started_at": None, "completed_at": None}


@router.get("/weekly")
def get_weekly_challenges():
    """Get all weekly challenges with progress."""
    challenges = []
    
    for challenge in WEEKLY_CHALLENGES:
        progress_data = get_challenge_progress(challenge["id"])
        
        challenges.append({
            **challenge,
            "progress": progress_data["progress"],
            "completed": progress_data["completed"],
            "percentage": min(round(progress_data["progress"] / challenge["target"] * 100), 100)
        })
    
    # Sort: incomplete first, then by percentage
    challenges.sort(key=lambda x: (x["completed"], -x["percentage"]))
    
    return {
        "challenges": challenges,
        "week_start": (date.today() - timedelta(days=date.today().weekday())).isoformat(),
        "week_end": (date.today() + timedelta(days=6-date.today().weekday())).isoformat(),
        "total_xp_available": sum(c["xp_reward"] for c in WEEKLY_CHALLENGES if not get_challenge_progress(c["id"])["completed"])
    }


@router.post("/{challenge_id}/increment")
def increment_challenge(challenge_id: str, amount: int = 1):
    """Increment progress on a challenge."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get current progress
    cursor.execute("SELECT * FROM challenge_progress WHERE challenge_id = ?", (challenge_id,))
    existing = cursor.fetchone()
    
    # Find challenge definition
    challenge = next((c for c in WEEKLY_CHALLENGES if c["id"] == challenge_id), None)
    if not challenge:
        conn.close()
        return {"error": "Challenge not found"}
    
    if existing:
        new_progress = existing["progress"] + amount
        completed = new_progress >= challenge["target"]
        
        cursor.execute("""
            UPDATE challenge_progress 
            SET progress = ?, completed = ?, completed_at = ?
            WHERE challenge_id = ?
        """, (
            new_progress, 
            1 if completed else 0,
            datetime.now().isoformat() if completed and not existing["completed"] else existing["completed_at"],
            challenge_id
        ))
        
        # Award XP if just completed
        if completed and not existing["completed"]:
            try:
                from services.gamification.gamification_service import add_xp
                add_xp(challenge["xp_reward"], "challenge_complete", f"Completed: {challenge['name']}")
            except:
                pass
    else:
        new_progress = amount
        completed = new_progress >= challenge["target"]
        
        cursor.execute("""
            INSERT INTO challenge_progress (challenge_id, progress, completed, completed_at)
            VALUES (?, ?, ?, ?)
        """, (
            challenge_id, 
            new_progress, 
            1 if completed else 0,
            datetime.now().isoformat() if completed else None
        ))
        
        if completed:
            try:
                from services.gamification.gamification_service import add_xp
                add_xp(challenge["xp_reward"], "challenge_complete", f"Completed: {challenge['name']}")
            except:
                pass
    
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "challenge_id": challenge_id,
        "new_progress": new_progress,
        "completed": completed,
        "xp_awarded": challenge["xp_reward"] if completed else 0
    }


@router.post("/reset-weekly")
def reset_weekly_challenges():
    """Reset all challenges for new week."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM challenge_progress")
    conn.commit()
    conn.close()
    return {"success": True, "message": "Weekly challenges reset"}
