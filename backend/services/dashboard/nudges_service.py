"""Smart Nudges Service - AI-powered proactive suggestions."""

from fastapi import APIRouter
from datetime import datetime, date
from typing import List
import random

router = APIRouter()


def get_current_context() -> dict:
    """Gather context from all modules."""
    context = {
        "hour": datetime.now().hour,
        "day_of_week": datetime.now().weekday(),
        "habits_completed": 0,
        "habits_total": 0,
        "meals_logged": 0,
        "life_score": 50,
        "xp_today": 0,
        "focus_sessions": 0
    }
    
    # Get habits data
    try:
        from services.habits.habits_service import get_db
        conn = get_db()
        cursor = conn.cursor()
        
        today = date.today().isoformat()
        cursor.execute("SELECT COUNT(*) as total FROM habits WHERE active = 1")
        context["habits_total"] = cursor.fetchone()["total"]
        
        cursor.execute("""
            SELECT COUNT(*) as completed FROM habit_completions 
            WHERE completed_date = ?
        """, (today,))
        context["habits_completed"] = cursor.fetchone()["completed"]
        
        conn.close()
    except:
        pass
    
    # Get meals data
    try:
        from services.diet.diet_service import _logged_meals
        today_str = date.today().isoformat()
        context["meals_logged"] = len([m for m in _logged_meals if m.get("logged_at", "").startswith(today_str)])
    except:
        pass
    
    # Get XP data
    try:
        from services.gamification.gamification_service import get_xp_status
        xp_data = get_xp_status()
        context["xp_today"] = xp_data.get("xp_today", 0)
    except:
        pass
    
    return context


def generate_nudges(context: dict) -> List[dict]:
    """Generate personalized nudges using Cross-Domain Intelligence."""
    nudges = []
    hour = context["hour"]
    
    # --- CROSS-DOMAIN ANALYTICS ---
    
    # 1. Retail Therapy Detector (Mood + Finance)
    # Check if high spending follows negative mood
    try:
        from services.finance.transaction_manager import transaction_manager
        from database import get_db_connection
        
        # Get today's spending
        summary = transaction_manager.get_summary()
        today_spent = summary.get("total_expenses", 0) # Simplified, ideally filter by today
        
        # Get recent mood
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT mood, intensity FROM mood_logs ORDER BY id DESC LIMIT 1")
        last_mood = cursor.fetchone()
        conn.close()
        
        if last_mood and today_spent > 1000: # Threshold
            mood_txt = last_mood["mood"].lower()
            if any(m in mood_txt for m in ["sad", "stress", "anxious", "bored"]):
                nudges.append({
                    "type": "finance_mood",
                    "priority": "high",
                    "icon": "💸",
                    "title": "Retail Therapy Alert",
                    "message": f"You've spent ₹{today_spent} while feeling {mood_txt}. Pause and reflect?",
                    "action": {"label": "Review Spending", "href": "/finance"},
                    "color": "orange"
                })
    except Exception as e:
        print(f"Nudge Error (Finance): {e}")

    # 2. Energy & Fuel Check (Sleep + Diet)
    # If late activity detected (low sleep) and no breakfast logged
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        # Check last activity before 6 AM today
        cursor.execute("SELECT timestamp FROM activities ORDER BY id DESC LIMIT 1")
        last_act = cursor.fetchone()
        conn.close()
        
        if last_act and hour < 11:
            # Mock sleep logic: If user was active late, assume tired
            is_tired = True # In real app, calculate diff
            
            if is_tired and context["meals_logged"] == 0:
                 nudges.append({
                    "type": "health_energy",
                    "priority": "high",
                    "icon": "🔋",
                    "title": "Low Energy Warning",
                    "message": "Late night yesterday? Fuel up with a high-protein breakfast.",
                    "action": {"label": "Log Breakfast", "href": "/diet"},
                    "color": "emerald"
                })
    except Exception as e:
         print(f"Nudge Error (Health): {e}")

    # --- STANDARD NUDGES ---

    # Morning Kickoff
    if 6 <= hour < 9:
        nudges.append({
            "type": "morning",
            "priority": "medium",
            "icon": "☀️",
            "title": "Rise & Shine",
            "message": "Ready to conquer the day? Check your goals.",
            "action": {"label": "View Goals", "href": "/dashboard"},
            "color": "amber"
        })
    
    # Lunch Reminder
    if 11 <= hour < 14 and context["meals_logged"] == 0:
        nudges.append({
            "type": "reminder",
            "priority": "high",
            "icon": "🍽️",
            "title": "Fuel Your Body",
            "message": "Tracking what you eat helps you perform better.",
            "action": {"label": "Log Meal", "href": "/diet"},
            "color": "emerald"
        })
    
    # Focus Time
    if 14 <= hour < 17:
        nudges.append({
            "type": "focus",
            "priority": "medium",
            "icon": "🧠",
            "title": "Deep Work Window",
            "message": "Your brain is primed for focus right now.",
            "action": {"label": "Start Timer", "href": "/focus"},
            "color": "indigo"
        })
        
    # Evening Wind Down
    if 20 <= hour:
        nudges.append({
            "type": "reflection",
            "priority": "medium",
            "icon": "🌙",
            "title": "Disconnect & Recharge",
            "message": "Time to switch off screens for better sleep.",
            "action": {"label": "Log Dream", "href": "/dreams"},
            "color": "purple"
        })

    # Progress-based nudges
    if context["habits_completed"] < context["habits_total"] and hour >= 18:
        remaining = context["habits_total"] - context["habits_completed"]
        nudges.append({
            "type": "urgent",
            "priority": "high",
            "icon": "⚡",
            "title": "Finish Strong",
            "message": f"Just {remaining} habits left to keep your streak!",
            "action": {"label": "Complete Now", "href": "/habits"},
            "color": "orange"
        })
    
    
    # Motivational nudges
    if context["xp_today"] >= 100:
        nudges.append({
            "type": "achievement",
            "priority": "low", 
            "icon": "✨",
            "title": f"+{context['xp_today']} XP Today",
            "message": "You're on fire! Keep up the momentum.",
            "action": {"label": "View Progress", "href": "/dashboard"},
            "color": "yellow"
        })
    
    # Challenge nudge
    if context["day_of_week"] == 0:  # Monday
        nudges.append({
            "type": "weekly",
            "priority": "medium",
            "icon": "🏆",
            "title": "New Week, New Challenges",
            "message": "Check out this week's challenges for bonus XP!",
            "action": {"label": "View Challenges", "href": "/challenges"},
            "color": "indigo"
        })

    # Sort by priority
    priority_order = {"high": 0, "medium": 1, "low": 2}
    nudges.sort(key=lambda x: priority_order.get(x["priority"], 1))
    
    return nudges[:5]  # Max 5 nudges


@router.get("/")
def get_smart_nudges():
    """Get personalized smart nudges."""
    context = get_current_context()
    nudges = generate_nudges(context)
    
    return {
        "nudges": nudges,
        "context": {
            "time_of_day": "morning" if context["hour"] < 12 else "afternoon" if context["hour"] < 17 else "evening",
            "habits_status": f"{context['habits_completed']}/{context['habits_total']}",
            "xp_today": context["xp_today"]
        },
        "generated_at": datetime.now().isoformat()
    }


# Motivational quotes for variety
QUOTES = [
    {"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs"},
    {"text": "Success is not final, failure is not fatal: it is the courage to continue that counts.", "author": "Winston Churchill"},
    {"text": "Believe you can and you're halfway there.", "author": "Theodore Roosevelt"},
    {"text": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt"},
    {"text": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius"},
    {"text": "Your limitation—it's only your imagination.", "author": "Unknown"},
    {"text": "Push yourself, because no one else is going to do it for you.", "author": "Unknown"},
    {"text": "Great things never come from comfort zones.", "author": "Unknown"},
]


@router.get("/quote")
def get_motivational_quote():
    """Get a random motivational quote."""
    quote = random.choice(QUOTES)
    return {"quote": quote["text"], "author": quote["author"]}
