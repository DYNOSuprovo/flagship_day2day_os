"""Achievement System - Badges and milestones."""

from fastapi import APIRouter
from datetime import datetime, date
import sqlite3
import os

router = APIRouter()

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "app.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_achievements_table():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            achievement_id TEXT NOT NULL UNIQUE,
            unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    conn.commit()
    conn.close()


init_achievements_table()


# All available achievements
ACHIEVEMENTS = [
    # Habit Achievements
    {"id": "first_habit", "name": "First Step", "description": "Complete your first habit", "icon": "🌱", "category": "habits", "xp": 50},
    {"id": "habit_streak_7", "name": "Week Warrior", "description": "7-day habit streak", "icon": "🔥", "category": "habits", "xp": 100},
    {"id": "habit_streak_30", "name": "Monthly Master", "description": "30-day habit streak", "icon": "💎", "category": "habits", "xp": 500},
    {"id": "habit_perfectionist", "name": "Perfectionist", "description": "Complete all habits in a day", "icon": "⭐", "category": "habits", "xp": 75},
    
    # Focus Achievements
    {"id": "first_focus", "name": "Focused Mind", "description": "Complete first focus session", "icon": "🎯", "category": "focus", "xp": 50},
    {"id": "focus_5_sessions", "name": "Deep Worker", "description": "Complete 5 focus sessions", "icon": "🧠", "category": "focus", "xp": 100},
    {"id": "focus_marathon", "name": "Marathon Mode", "description": "3 focus sessions in one day", "icon": "🏃", "category": "focus", "xp": 150},
    
    # Diet Achievements
    {"id": "first_meal", "name": "Nutrition Aware", "description": "Log your first meal", "icon": "🥗", "category": "diet", "xp": 50},
    {"id": "meal_tracker", "name": "Meal Tracker", "description": "Log 10 meals", "icon": "📝", "category": "diet", "xp": 100},
    {"id": "calorie_master", "name": "Calorie Master", "description": "Hit calorie goal 5 days", "icon": "🎯", "category": "diet", "xp": 200},
    
    # XP/Level Achievements
    {"id": "level_5", "name": "Rising Star", "description": "Reach Level 5", "icon": "⭐", "category": "progress", "xp": 0},
    {"id": "level_10", "name": "Veteran", "description": "Reach Level 10", "icon": "🌟", "category": "progress", "xp": 0},
    {"id": "xp_1000", "name": "XP Hunter", "description": "Earn 1,000 total XP", "icon": "✨", "category": "progress", "xp": 0},
    {"id": "xp_5000", "name": "XP Champion", "description": "Earn 5,000 total XP", "icon": "💫", "category": "progress", "xp": 0},
    
    # Special Achievements
    {"id": "early_bird", "name": "Early Bird", "description": "Log activity before 6 AM", "icon": "🌅", "category": "special", "xp": 100},
    {"id": "night_owl", "name": "Night Owl", "description": "Log activity after 11 PM", "icon": "🦉", "category": "special", "xp": 100},
    {"id": "life_score_80", "name": "Thriving", "description": "Reach 80+ Life Score", "icon": "🏆", "category": "special", "xp": 300},
    {"id": "all_modules", "name": "Full Stack Human", "description": "Use all app modules in one day", "icon": "🚀", "category": "special", "xp": 250},
]


def get_unlocked_achievements() -> list:
    """Get all unlocked achievements."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT achievement_id, unlocked_at FROM user_achievements")
    rows = cursor.fetchall()
    conn.close()
    return {row["achievement_id"]: row["unlocked_at"] for row in rows}


def unlock_achievement(achievement_id: str) -> dict:
    """Unlock an achievement and award XP."""
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if already unlocked
    cursor.execute("SELECT id FROM user_achievements WHERE achievement_id = ?", (achievement_id,))
    if cursor.fetchone():
        conn.close()
        return {"already_unlocked": True}
    
    # Find achievement
    achievement = next((a for a in ACHIEVEMENTS if a["id"] == achievement_id), None)
    if not achievement:
        conn.close()
        return {"error": "Achievement not found"}
    
    # Unlock
    cursor.execute("""
        INSERT INTO user_achievements (achievement_id) VALUES (?)
    """, (achievement_id,))
    conn.commit()
    conn.close()
    
    # Award XP
    if achievement["xp"] > 0:
        try:
            from services.gamification.gamification_service import add_xp
            add_xp(achievement["xp"], "achievement", f"Unlocked: {achievement['name']}")
        except:
            pass
    
    return {
        "success": True,
        "achievement": achievement,
        "message": f"🏆 Achievement Unlocked: {achievement['name']}!"
    }


@router.get("/")
def get_achievements():
    """Get all achievements with unlock status."""
    unlocked = get_unlocked_achievements()
    
    result = []
    for ach in ACHIEVEMENTS:
        result.append({
            **ach,
            "unlocked": ach["id"] in unlocked,
            "unlocked_at": unlocked.get(ach["id"])
        })
    
    # Sort: unlocked first, then by category
    result.sort(key=lambda x: (not x["unlocked"], x["category"]))
    
    unlocked_count = len(unlocked)
    total_count = len(ACHIEVEMENTS)
    
    return {
        "achievements": result,
        "unlocked_count": unlocked_count,
        "total_count": total_count,
        "completion_percentage": round(unlocked_count / total_count * 100) if total_count > 0 else 0
    }


@router.post("/{achievement_id}/unlock")
def unlock(achievement_id: str):
    """Manually unlock an achievement."""
    return unlock_achievement(achievement_id)


@router.get("/check")
def check_achievements():
    """Check and auto-unlock any earned achievements."""
    newly_unlocked = []
    
    # Check habit achievements
    try:
        from services.habits.habits_service import get_db as get_habits_db
        conn = get_habits_db()
        cursor = conn.cursor()
        
        # First habit
        cursor.execute("SELECT COUNT(*) as count FROM habit_completions")
        if cursor.fetchone()["count"] >= 1:
            result = unlock_achievement("first_habit")
            if result.get("success"):
                newly_unlocked.append(result["achievement"])
        
        conn.close()
    except:
        pass
    
    # Check XP achievements
    try:
        from services.gamification.gamification_service import get_xp_status
        xp_data = get_xp_status()
        
        if xp_data.get("level", 0) >= 5:
            result = unlock_achievement("level_5")
            if result.get("success"):
                newly_unlocked.append(result["achievement"])
        
        if xp_data.get("level", 0) >= 10:
            result = unlock_achievement("level_10")
            if result.get("success"):
                newly_unlocked.append(result["achievement"])
        
        if xp_data.get("total_xp", 0) >= 1000:
            result = unlock_achievement("xp_1000")
            if result.get("success"):
                newly_unlocked.append(result["achievement"])
    except:
        pass
    
    # Check time-based achievements
    hour = datetime.now().hour
    if hour < 6:
        result = unlock_achievement("early_bird")
        if result.get("success"):
            newly_unlocked.append(result["achievement"])
    elif hour >= 23:
        result = unlock_achievement("night_owl")
        if result.get("success"):
            newly_unlocked.append(result["achievement"])
    
    return {
        "checked": True,
        "newly_unlocked": newly_unlocked,
        "count": len(newly_unlocked)
    }
