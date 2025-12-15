"""Habits Service - CRUD operations for habit tracking."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
import sqlite3
import os

router = APIRouter()

# Database path
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")


def get_db():
    """Get database connection."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_habits_table():
    """Initialize habits tables if they don't exist."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Habits table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT DEFAULT '',
            icon TEXT DEFAULT '🎯',
            color TEXT DEFAULT 'orange',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            active INTEGER DEFAULT 1
        )
    """)
    
    # Habit completions table (for tracking daily completions)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS habit_completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER NOT NULL,
            completed_date TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (habit_id) REFERENCES habits (id),
            UNIQUE(habit_id, completed_date)
        )
    """)
    
    conn.commit()
    conn.close()


# Initialize on import
init_habits_table()


# Pydantic models
class HabitCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    icon: Optional[str] = "🎯"
    color: Optional[str] = "orange"


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    active: Optional[bool] = None


def calculate_streak(habit_id: int) -> int:
    """Calculate current streak for a habit."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT completed_date FROM habit_completions 
        WHERE habit_id = ? 
        ORDER BY completed_date DESC
    """, (habit_id,))
    
    completions = [row["completed_date"] for row in cursor.fetchall()]
    conn.close()
    
    if not completions:
        return 0
    
    streak = 0
    today = date.today()
    current_date = today
    
    for comp_date_str in completions:
        comp_date = date.fromisoformat(comp_date_str)
        if comp_date == current_date:
            streak += 1
            current_date = current_date.replace(day=current_date.day - 1) if current_date.day > 1 else current_date
        elif comp_date == current_date.replace(day=current_date.day - 1) if current_date.day > 1 else None:
            streak += 1
            current_date = comp_date
        else:
            break
    
    return streak


@router.get("/")
def get_habits():
    """Get all active habits with their current streaks and today's completion status."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM habits WHERE active = 1 ORDER BY created_at DESC")
    habits = cursor.fetchall()
    
    today = date.today().isoformat()
    result = []
    
    for habit in habits:
        # Check if completed today
        cursor.execute("""
            SELECT id FROM habit_completions 
            WHERE habit_id = ? AND completed_date = ?
        """, (habit["id"], today))
        completed_today = cursor.fetchone() is not None
        
        result.append({
            "id": habit["id"],
            "name": habit["name"],
            "description": habit["description"],
            "icon": habit["icon"],
            "color": habit["color"],
            "streak": calculate_streak(habit["id"]),
            "completed": completed_today,
            "created_at": habit["created_at"]
        })
    
    conn.close()
    return {"habits": result, "total": len(result)}


@router.post("/")
def create_habit(habit: HabitCreate):
    """Create a new habit."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO habits (name, description, icon, color) 
        VALUES (?, ?, ?, ?)
    """, (habit.name, habit.description, habit.icon, habit.color))
    
    habit_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "habit": {
            "id": habit_id,
            "name": habit.name,
            "description": habit.description,
            "icon": habit.icon,
            "color": habit.color,
            "streak": 0,
            "completed": False
        },
        "message": f"Created habit: {habit.name}"
    }


@router.post("/{habit_id}/toggle")
def toggle_habit(habit_id: int):
    """Toggle a habit's completion for today."""
    conn = get_db()
    cursor = conn.cursor()
    
    today = date.today().isoformat()
    
    # Check if already completed today
    cursor.execute("""
        SELECT id FROM habit_completions 
        WHERE habit_id = ? AND completed_date = ?
    """, (habit_id, today))
    existing = cursor.fetchone()
    
    if existing:
        # Uncomplete
        cursor.execute("DELETE FROM habit_completions WHERE id = ?", (existing["id"],))
        completed = False
        message = "Habit unmarked for today"
    else:
        # Complete
        cursor.execute("""
            INSERT INTO habit_completions (habit_id, completed_date) 
            VALUES (?, ?)
        """, (habit_id, today))
        completed = True
        message = "Habit completed! 🔥"
        
        # Award XP for completing a habit
        try:
            from services.gamification.gamification_service import add_xp
            add_xp(25, "habit_complete", f"Completed daily habit")
        except Exception:
            pass
    
    conn.commit()
    
    new_streak = calculate_streak(habit_id)
    conn.close()
    
    return {
        "success": True,
        "completed": completed,
        "streak": new_streak,
        "message": message
    }


@router.delete("/{habit_id}")
def delete_habit(habit_id: int):
    """Soft delete a habit (mark as inactive)."""
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE habits SET active = 0 WHERE id = ?", (habit_id,))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Habit deleted"}


@router.get("/stats")
def get_habit_stats():
    """Get overall habit statistics."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Total habits
    cursor.execute("SELECT COUNT(*) as count FROM habits WHERE active = 1")
    total_habits = cursor.fetchone()["count"]
    
    # Completions today
    today = date.today().isoformat()
    cursor.execute("""
        SELECT COUNT(*) as count FROM habit_completions 
        WHERE completed_date = ?
    """, (today,))
    completed_today = cursor.fetchone()["count"]
    
    # Total completions this week
    week_start = date.today().replace(day=date.today().day - date.today().weekday())
    cursor.execute("""
        SELECT COUNT(*) as count FROM habit_completions 
        WHERE completed_date >= ?
    """, (week_start.isoformat(),))
    completed_this_week = cursor.fetchone()["count"]
    
    # Best streak (approximate)
    cursor.execute("""
        SELECT habit_id, COUNT(*) as count FROM habit_completions 
        GROUP BY habit_id ORDER BY count DESC LIMIT 1
    """)
    best = cursor.fetchone()
    best_streak = best["count"] if best else 0
    
    conn.close()
    
    return {
        "total_habits": total_habits,
        "completed_today": completed_today,
        "completed_this_week": completed_this_week,
        "completion_rate": round((completed_today / total_habits * 100) if total_habits > 0 else 0, 1),
        "best_streak": best_streak
    }
