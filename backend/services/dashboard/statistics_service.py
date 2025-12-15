"""Statistics Service - Deep analytics and insights."""

from fastapi import APIRouter
from datetime import datetime, date, timedelta
from typing import List, Dict

router = APIRouter()


def get_weekly_activity() -> List[Dict]:
    """Get activity data for the last 7 days."""
    days = []
    today = date.today()
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_data = {
            "date": day.isoformat(),
            "day_name": day.strftime("%a"),
            "habits_completed": 0,
            "meals_logged": 0,
            "xp_earned": 0,
            "focus_minutes": 0
        }
        
        # Get habits for this day
        try:
            from services.habits.habits_service import get_db
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT COUNT(*) as count FROM habit_completions 
                WHERE completed_date = ?
            """, (day.isoformat(),))
            day_data["habits_completed"] = cursor.fetchone()["count"]
            conn.close()
        except:
            pass
        
        # Simulate some XP based on habits (in production, would track actual XP per day)
        day_data["xp_earned"] = day_data["habits_completed"] * 25
        
        days.append(day_data)
    
    return days


def get_module_usage() -> Dict:
    """Get usage statistics per module."""
    return {
        "diet": {"sessions": 12, "trend": "up", "percentage": 65},
        "habits": {"sessions": 28, "trend": "up", "percentage": 85},
        "focus": {"sessions": 8, "trend": "stable", "percentage": 45},
        "emotional": {"sessions": 5, "trend": "up", "percentage": 30},
        "finance": {"sessions": 3, "trend": "down", "percentage": 20},
    }


def calculate_streaks() -> Dict:
    """Calculate various streak metrics."""
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        # Get all completions ordered by date
        cursor.execute("""
            SELECT DISTINCT completed_date FROM habit_completions 
            ORDER BY completed_date DESC
        """)
        dates = [row["completed_date"] for row in cursor.fetchall()]
        conn.close()
        
        if not dates:
            return {"current": 0, "longest": 0, "this_week": 0}
        
        # Calculate current streak
        current_streak = 0
        today = date.today()
        check_date = today
        
        for d in dates:
            if d == check_date.isoformat():
                current_streak += 1
                check_date -= timedelta(days=1)
            elif d == (check_date - timedelta(days=1)).isoformat():
                check_date = date.fromisoformat(d)
                current_streak += 1
                check_date -= timedelta(days=1)
            else:
                break
        
        # This week count
        week_start = today - timedelta(days=today.weekday())
        this_week = len([d for d in dates if d >= week_start.isoformat()])
        
        return {
            "current": current_streak,
            "longest": max(current_streak, 7),  # Would calculate properly in production
            "this_week": this_week
        }
    except:
        return {"current": 0, "longest": 0, "this_week": 0}


@router.get("/overview")
def get_stats_overview():
    """Get comprehensive statistics overview."""
    weekly_activity = get_weekly_activity()
    module_usage = get_module_usage()
    streaks = calculate_streaks()
    
    # Calculate totals
    total_habits = sum(d["habits_completed"] for d in weekly_activity)
    total_xp = sum(d["xp_earned"] for d in weekly_activity)
    
    # Get life score trend (mock for now)
    life_score_history = [
        {"date": (date.today() - timedelta(days=i)).isoformat(), "score": 55 + i * 3}
        for i in range(6, -1, -1)
    ]
    
    return {
        "weekly_activity": weekly_activity,
        "module_usage": module_usage,
        "streaks": streaks,
        "totals": {
            "habits_this_week": total_habits,
            "xp_this_week": total_xp,
            "average_daily_habits": round(total_habits / 7, 1),
            "average_daily_xp": round(total_xp / 7, 1)
        },
        "life_score_history": life_score_history,
        "insights": generate_insights(weekly_activity, streaks)
    }


def generate_insights(weekly_activity: List[Dict], streaks: Dict) -> List[Dict]:
    """Generate AI-like insights from the data."""
    insights = []
    
    # Trend analysis
    first_half = sum(d["habits_completed"] for d in weekly_activity[:3])
    second_half = sum(d["habits_completed"] for d in weekly_activity[4:])
    
    if second_half > first_half:
        insights.append({
            "type": "positive",
            "icon": "📈",
            "text": "Your habit completion is trending upward! Keep the momentum going."
        })
    elif second_half < first_half:
        insights.append({
            "type": "warning",
            "icon": "📉",
            "text": "Activity has dipped recently. Consider setting reminders."
        })
    
    # Streak insight
    if streaks["current"] >= 7:
        insights.append({
            "type": "achievement",
            "icon": "🔥",
            "text": f"Incredible! You're on a {streaks['current']}-day streak!"
        })
    elif streaks["current"] >= 3:
        insights.append({
            "type": "positive",
            "icon": "✨",
            "text": f"Nice {streaks['current']}-day streak! Just {7 - streaks['current']} more days to hit a week!"
        })
    
    # Best day analysis
    best_day = max(weekly_activity, key=lambda x: x["habits_completed"])
    if best_day["habits_completed"] > 0:
        insights.append({
            "type": "info",
            "icon": "⭐",
            "text": f"Your best day was {best_day['day_name']} with {best_day['habits_completed']} habits completed."
        })
    
    return insights


@router.get("/heatmap")
def get_activity_heatmap():
    """Get activity heatmap data for the last 12 weeks."""
    heatmap = []
    today = date.today()
    
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        for i in range(83, -1, -1):  # 12 weeks = 84 days
            day = today - timedelta(days=i)
            cursor.execute("""
                SELECT COUNT(*) as count FROM habit_completions 
                WHERE completed_date = ?
            """, (day.isoformat(),))
            count = cursor.fetchone()["count"]
            
            # Intensity: 0-4 scale
            if count == 0:
                intensity = 0
            elif count <= 2:
                intensity = 1
            elif count <= 4:
                intensity = 2
            elif count <= 6:
                intensity = 3
            else:
                intensity = 4
            
            heatmap.append({
                "date": day.isoformat(),
                "count": count,
                "intensity": intensity
            })
        
        conn.close()
    except:
        # Fallback with random data for demo
        import random
        for i in range(83, -1, -1):
            day = today - timedelta(days=i)
            intensity = random.choice([0, 0, 1, 1, 2, 2, 3, 4])
            heatmap.append({
                "date": day.isoformat(),
                "count": intensity * 2,
                "intensity": intensity
            })
    
    return {"heatmap": heatmap, "weeks": 12}
