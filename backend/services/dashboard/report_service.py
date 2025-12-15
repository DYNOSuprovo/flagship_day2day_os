"""Weekly Report Service - Generate weekly summaries."""

from fastapi import APIRouter
from datetime import datetime, date, timedelta
from typing import Dict, List

router = APIRouter()


def get_week_dates():
    """Get start and end of current week."""
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start, end


def gather_weekly_data() -> Dict:
    """Gather all data for weekly report."""
    start, end = get_week_dates()
    
    report = {
        "period": {
            "start": start.isoformat(),
            "end": end.isoformat(),
            "week_number": start.isocalendar()[1]
        },
        "habits": {"completed": 0, "total": 0, "rate": 0, "best_day": None},
        "xp": {"earned": 0, "level_gained": False, "start_level": 1, "end_level": 1},
        "focus": {"sessions": 0, "minutes": 0},
        "meals": {"logged": 0, "avg_calories": 0},
        "challenges": {"completed": 0, "in_progress": 0},
        "achievements": {"unlocked": []},
        "life_score": {"average": 0, "trend": "stable"},
        "highlights": [],
        "areas_to_improve": []
    }
    
    # Get habits data
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT completed_date, COUNT(*) as count 
            FROM habit_completions 
            WHERE completed_date >= ? AND completed_date <= ?
            GROUP BY completed_date
        """, (start.isoformat(), end.isoformat()))
        
        daily_counts = {row["completed_date"]: row["count"] for row in cursor.fetchall()}
        report["habits"]["completed"] = sum(daily_counts.values())
        
        cursor.execute("SELECT COUNT(*) as total FROM habits WHERE active = 1")
        total_habits = cursor.fetchone()["total"]
        report["habits"]["total"] = total_habits * 7  # Week's worth
        
        if report["habits"]["total"] > 0:
            report["habits"]["rate"] = round(report["habits"]["completed"] / report["habits"]["total"] * 100)
        
        if daily_counts:
            best_day = max(daily_counts, key=daily_counts.get)
            report["habits"]["best_day"] = best_day
        
        conn.close()
    except:
        pass
    
    # Get XP data
    try:
        from services.gamification.gamification_service import get_xp_status
        xp_data = get_xp_status()
        report["xp"]["end_level"] = xp_data.get("level", 1)
        report["xp"]["earned"] = xp_data.get("xp_this_week", 0) or report["habits"]["completed"] * 25
    except:
        pass
    
    # Get meals data
    try:
        from services.diet.diet_service import _logged_meals
        week_meals = [m for m in _logged_meals if start.isoformat() <= m.get("logged_at", "")[:10] <= end.isoformat()]
        report["meals"]["logged"] = len(week_meals)
        if week_meals:
            total_cal = sum(m.get("calories", 0) for m in week_meals)
            report["meals"]["avg_calories"] = round(total_cal / len(week_meals))
    except:
        pass
    
    # Get challenges data
    try:
        from services.gamification.challenges_service import get_weekly_challenges
        challenges = get_weekly_challenges()
        report["challenges"]["completed"] = len([c for c in challenges.get("challenges", []) if c.get("completed")])
        report["challenges"]["in_progress"] = len([c for c in challenges.get("challenges", []) if not c.get("completed") and c.get("progress", 0) > 0])
    except:
        pass
    
    # Get achievements
    try:
        from services.gamification.achievements_service import get_db as get_ach_db
        conn = get_ach_db()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT achievement_id FROM user_achievements 
            WHERE unlocked_at >= ?
        """, (start.isoformat(),))
        report["achievements"]["unlocked"] = [row["achievement_id"] for row in cursor.fetchall()]
        conn.close()
    except:
        pass
    
    # Generate highlights
    if report["habits"]["rate"] >= 80:
        report["highlights"].append({
            "icon": "🔥",
            "text": f"Crushed {report['habits']['rate']}% habit completion rate!"
        })
    
    if report["xp"]["earned"] >= 200:
        report["highlights"].append({
            "icon": "⚡",
            "text": f"Earned {report['xp']['earned']} XP this week!"
        })
    
    if report["challenges"]["completed"] >= 2:
        report["highlights"].append({
            "icon": "🏆",
            "text": f"Completed {report['challenges']['completed']} weekly challenges!"
        })
    
    if len(report["achievements"]["unlocked"]) > 0:
        report["highlights"].append({
            "icon": "🎖️",
            "text": f"Unlocked {len(report['achievements']['unlocked'])} new achievement(s)!"
        })
    
    # Areas to improve
    if report["habits"]["rate"] < 50:
        report["areas_to_improve"].append({
            "icon": "📋",
            "text": "Try to complete more daily habits"
        })
    
    if report["meals"]["logged"] < 7:
        report["areas_to_improve"].append({
            "icon": "🍽️",
            "text": "Log meals more consistently"
        })
    
    # Calculate life score average (mock for now)
    report["life_score"]["average"] = min(100, 50 + report["habits"]["rate"] // 3 + report["xp"]["earned"] // 50)
    
    return report


@router.get("/weekly")
def get_weekly_report():
    """Get the weekly report."""
    return gather_weekly_data()


@router.get("/summary")
def get_quick_summary():
    """Get a quick summary for dashboard."""
    report = gather_weekly_data()
    
    return {
        "period": report["period"],
        "habit_rate": report["habits"]["rate"],
        "xp_earned": report["xp"]["earned"],
        "challenges_done": report["challenges"]["completed"],
        "highlights_count": len(report["highlights"])
    }
