"""Goals Service - Set and track personal goals."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import sqlite3
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_goals_table():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            target_value REAL NOT NULL,
            current_value REAL DEFAULT 0,
            unit TEXT NOT NULL,
            deadline TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            completed INTEGER DEFAULT 0,
            completed_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()


init_goals_table()


class GoalCreate(BaseModel):
    category: str
    name: str
    description: Optional[str] = None
    target_value: float
    current_value: Optional[float] = 0
    unit: str
    deadline: Optional[str] = None


class GoalUpdate(BaseModel):
    current_value: float


@router.get("/")
def get_goals():
    """Get all active goals."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM goals WHERE completed = 0 ORDER BY deadline ASC
    """)
    
    goals = []
    for row in cursor.fetchall():
        progress = (row["current_value"] / row["target_value"] * 100) if row["target_value"] > 0 else 0
        days_left = None
        if row["deadline"]:
            deadline = date.fromisoformat(row["deadline"])
            days_left = (deadline - date.today()).days
        
        goals.append({
            "id": row["id"],
            "category": row["category"],
            "name": row["name"],
            "description": row["description"],
            "target_value": row["target_value"],
            "current_value": row["current_value"],
            "unit": row["unit"],
            "deadline": row["deadline"],
            "progress": min(progress, 100),
            "days_left": days_left,
            "created_at": row["created_at"]
        })
    
    conn.close()
    return {"goals": goals, "total": len(goals)}


@router.get("/completed")
def get_completed_goals():
    """Get completed goals."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM goals WHERE completed = 1 ORDER BY completed_at DESC LIMIT 20
    """)
    
    goals = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {"goals": goals}


@router.post("/")
def create_goal(goal: GoalCreate):
    """Create a new goal."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO goals (category, name, description, target_value, current_value, unit, deadline)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (goal.category, goal.name, goal.description, goal.target_value, goal.current_value, goal.unit, goal.deadline))
    
    goal_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {"success": True, "goal_id": goal_id}


@router.put("/{goal_id}")
def update_goal_progress(goal_id: int, update: GoalUpdate):
    """Update goal progress."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Get current goal
    cursor.execute("SELECT * FROM goals WHERE id = ?", (goal_id,))
    goal = cursor.fetchone()
    
    if not goal:
        conn.close()
        return {"error": "Goal not found"}
    
    # Check if completed
    completed = update.current_value >= goal["target_value"]
    
    cursor.execute("""
        UPDATE goals 
        SET current_value = ?, completed = ?, completed_at = ?
        WHERE id = ?
    """, (
        update.current_value,
        1 if completed else 0,
        datetime.now().isoformat() if completed else None,
        goal_id
    ))
    
    conn.commit()
    conn.close()
    
    # Award XP if completed
    if completed:
        try:
            from services.gamification.gamification_service import add_xp
            add_xp(100, "goal_complete", f"Completed goal: {goal['name']}")
        except:
            pass
    
    return {"success": True, "completed": completed}


@router.delete("/{goal_id}")
def delete_goal(goal_id: int):
    """Delete a goal."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM goals WHERE id = ?", (goal_id,))
    conn.commit()
    conn.close()
    return {"success": True}


# Predefined goal templates
GOAL_TEMPLATES = [
    {"category": "health", "name": "Lose Weight", "unit": "kg", "icon": "⚖️", "suggested_target": 5},
    {"category": "health", "name": "Drink Water", "unit": "glasses/day", "icon": "💧", "suggested_target": 8},
    {"category": "health", "name": "Steps Daily", "unit": "steps", "icon": "🚶", "suggested_target": 10000},
    {"category": "finance", "name": "Save Money", "unit": "₹", "icon": "💰", "suggested_target": 50000},
    {"category": "finance", "name": "Reduce Expenses", "unit": "₹/month", "icon": "📉", "suggested_target": 5000},
    {"category": "habits", "name": "Build Streak", "unit": "days", "icon": "🔥", "suggested_target": 30},
    {"category": "habits", "name": "Read Books", "unit": "books", "icon": "📚", "suggested_target": 12},
    {"category": "focus", "name": "Focus Hours", "unit": "hours/week", "icon": "🎯", "suggested_target": 20},
    {"category": "mindfulness", "name": "Meditate", "unit": "sessions", "icon": "🧘", "suggested_target": 30},
]


@router.get("/templates")
def get_goal_templates():
    """Get predefined goal templates."""
    return {"templates": GOAL_TEMPLATES}
