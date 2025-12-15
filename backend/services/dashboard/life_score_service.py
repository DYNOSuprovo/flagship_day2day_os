"""Life Score Service - Unified wellness score calculation."""

from fastapi import APIRouter
from datetime import datetime, date

router = APIRouter()


def calculate_life_score() -> dict:
    """Calculate unified life score from all pillars."""
    
    # Get data from each module
    physical_score = calculate_physical_score()
    mental_score = calculate_mental_score()
    financial_score = calculate_financial_score()
    spiritual_score = calculate_spiritual_score()
    
    # Weighted average
    weights = {
        "physical": 0.30,
        "mental": 0.30,
        "financial": 0.20,
        "spiritual": 0.20
    }
    
    total_score = (
        physical_score * weights["physical"] +
        mental_score * weights["mental"] +
        financial_score * weights["financial"] +
        spiritual_score * weights["spiritual"]
    )
    
    # Determine status
    if total_score >= 80:
        status = "Thriving"
        status_color = "emerald"
    elif total_score >= 60:
        status = "Growing"
        status_color = "blue"
    elif total_score >= 40:
        status = "Stable"
        status_color = "yellow"
    else:
        status = "Needs Focus"
        status_color = "red"
    
    return {
        "total_score": round(total_score),
        "status": status,
        "status_color": status_color,
        "breakdown": {
            "physical": {
                "score": physical_score,
                "label": "Body",
                "icon": "💪",
                "color": "orange"
            },
            "mental": {
                "score": mental_score,
                "label": "Mind", 
                "icon": "🧠",
                "color": "purple"
            },
            "financial": {
                "score": financial_score,
                "label": "Wealth",
                "icon": "💰",
                "color": "emerald"
            },
            "spiritual": {
                "score": spiritual_score,
                "label": "Spirit",
                "icon": "🕉️",
                "color": "cyan"
            }
        },
        "trend": calculate_trend(),
        "calculated_at": datetime.now().isoformat()
    }


def calculate_physical_score() -> int:
    """Calculate physical wellness score from diet and activity."""
    try:
        from services.diet.diet_service import _logged_meals
        from services.habits.habits_service import get_db
        
        score = 50  # Base score
        
        # Bonus for logged meals today
        today = date.today().isoformat()
        today_meals = [m for m in _logged_meals if m.get("logged_at", "").startswith(today)]
        if len(today_meals) >= 3:
            score += 25
        elif len(today_meals) >= 1:
            score += 10
        
        # Bonus for physical habits completed
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) as count FROM habit_completions 
                WHERE completed_date = ?
            """, (today,))
            completed = cursor.fetchone()["count"]
            conn.close()
            score += min(completed * 5, 25)
        except:
            pass
        
        return min(score, 100)
    except:
        return 60  # Default


def calculate_mental_score() -> int:
    """Calculate mental wellness from focus and emotional states."""
    try:
        from services.gamification.gamification_service import get_xp_status
        
        score = 50
        
        # XP progress indicates engagement
        try:
            xp_data = get_xp_status()
            level = xp_data.get("level", 1)
            score += min(level * 5, 30)
        except:
            pass
        
        # Add focus session bonus (would track in production)
        score += 15  # Assume some focus activity
        
        return min(score, 100)
    except:
        return 55


def calculate_financial_score() -> int:
    """Calculate financial wellness score."""
    # In production, would pull from actual financial data
    # For now, return a reasonable estimate
    return 65


def calculate_spiritual_score() -> int:
    """Calculate spiritual wellness from emotional/meditation sessions."""
    try:
        from services.emotional.emotional_service import _conversation_count
        
        score = 50
        
        # Bonus for spiritual conversations
        if _conversation_count > 0:
            score += min(_conversation_count * 10, 30)
        
        return min(score, 100)
    except:
        return 50


def calculate_trend() -> str:
    """Calculate recent trend direction."""
    # Would compare with historical data in production
    return "up"  # up, down, stable


@router.get("/life-score")
def get_life_score():
    """Get the unified life score."""
    return calculate_life_score()


@router.get("/daily-recap")
def get_daily_recap():
    """Get today's comprehensive recap."""
    today = date.today()
    
    # Gather data from all modules
    recap = {
        "date": today.isoformat(),
        "day_of_week": today.strftime("%A"),
        "life_score": calculate_life_score(),
        "highlights": [],
        "stats": {}
    }
    
    # Diet stats
    try:
        from services.diet.diet_service import _logged_meals
        today_str = today.isoformat()
        today_meals = [m for m in _logged_meals if m.get("logged_at", "").startswith(today_str)]
        total_calories = sum(m.get("calories", 0) for m in today_meals)
        
        recap["stats"]["diet"] = {
            "meals_logged": len(today_meals),
            "total_calories": total_calories,
            "icon": "🍽️"
        }
        
        if len(today_meals) >= 3:
            recap["highlights"].append({
                "type": "achievement",
                "text": "Logged all meals today!",
                "icon": "🏆"
            })
    except:
        recap["stats"]["diet"] = {"meals_logged": 0, "total_calories": 0, "icon": "🍽️"}
    
    # Habits stats
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) as total FROM habits WHERE active = 1")
        total_habits = cursor.fetchone()["total"]
        
        cursor.execute("""
            SELECT COUNT(*) as completed FROM habit_completions 
            WHERE completed_date = ?
        """, (today.isoformat(),))
        completed_habits = cursor.fetchone()["completed"]
        
        conn.close()
        
        recap["stats"]["habits"] = {
            "completed": completed_habits,
            "total": total_habits,
            "rate": round(completed_habits / total_habits * 100) if total_habits > 0 else 0,
            "icon": "🔥"
        }
        
        if completed_habits == total_habits and total_habits > 0:
            recap["highlights"].append({
                "type": "perfect",
                "text": "Perfect habit day!",
                "icon": "⭐"
            })
    except:
        recap["stats"]["habits"] = {"completed": 0, "total": 0, "rate": 0, "icon": "🔥"}
    
    # Gamification stats
    try:
        from services.gamification.gamification_service import get_xp_status
        xp_data = get_xp_status()
        
        recap["stats"]["progress"] = {
            "level": xp_data.get("level", 1),
            "xp": xp_data.get("current_xp", 0),
            "xp_today": xp_data.get("xp_today", 0),
            "icon": "✨"
        }
        
        if xp_data.get("xp_today", 0) >= 100:
            recap["highlights"].append({
                "type": "xp",
                "text": f"Earned {xp_data.get('xp_today', 0)} XP today!",
                "icon": "💫"
            })
    except:
        recap["stats"]["progress"] = {"level": 1, "xp": 0, "xp_today": 0, "icon": "✨"}
    
    # Add motivational message based on performance
    score = recap["life_score"]["total_score"]
    if score >= 80:
        recap["message"] = "Incredible day! You're absolutely crushing it. 🔥"
    elif score >= 60:
        recap["message"] = "Great progress today! Keep the momentum going. 💪"
    elif score >= 40:
        recap["message"] = "Solid effort! Tomorrow is a new opportunity. 🌟"
    else:
        recap["message"] = "Every step counts. Let's make tomorrow better! 🚀"
    
    return recap
