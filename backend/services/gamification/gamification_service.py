from fastapi import APIRouter, HTTPException
from database import get_db_connection
from datetime import datetime

router = APIRouter()

LEVEL_THRESHOLDS = {
    1: 0,
    2: 100,
    3: 300,
    4: 600,
    5: 1000,
    6: 1500,
    7: 2100,
    8: 2800,
    9: 3600,
    10: 5000
}

def get_level_from_xp(xp):
    current_level = 1
    for level, threshold in LEVEL_THRESHOLDS.items():
        if xp >= threshold:
            current_level = level
        else:
            break
    return current_level

@router.get("/stats")
def get_user_stats():
    """Get user's gamification stats."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM user_stats WHERE id = 1")
    stats = dict(cursor.fetchone())
    conn.close()
    
    # Calculate progress to next level
    current_level = stats['level']
    current_xp = stats['xp']
    next_level_xp = LEVEL_THRESHOLDS.get(current_level + 1, 10000)
    prev_level_xp = LEVEL_THRESHOLDS.get(current_level, 0)
    
    progress = 0
    if next_level_xp > prev_level_xp:
        progress = (current_xp - prev_level_xp) / (next_level_xp - prev_level_xp) * 100
        
    return {
        **stats,
        "next_level_xp": next_level_xp,
        "progress": round(progress, 1),
        "title": get_title_for_level(current_level)
    }

def grant_xp(user_id: int, amount: int):
    """Internal function to grant XP to a user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT xp, level FROM user_stats WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    
    # Handle case where user_stats might not exist yet (though init_db should handle it)
    if not row:
        conn.close()
        return None

    current_xp = row['xp']
    current_level = row['level']
    
    new_xp = current_xp + amount
    new_level = get_level_from_xp(new_xp)
    
    cursor.execute("UPDATE user_stats SET xp = ?, level = ? WHERE id = ?", (new_xp, new_level, user_id))
    conn.commit()
    conn.close()
    
    return {
        "new_xp": new_xp,
        "new_level": new_level,
        "leveled_up": new_level > current_level
    }

@router.post("/add-xp")
def add_xp(amount: int = 10):
    """Add XP to user (API Endpoint)."""
    result = grant_xp(1, amount)
    if not result:
         raise HTTPException(status_code=404, detail="User stats not found")
    return result

def get_title_for_level(level):
    titles = {
        1: "Novice",
        2: "Apprentice",
        3: "Seeker",
        4: "Achiever",
        5: "Pro",
        6: "Master",
        7: "Grandmaster",
        8: "Legend",
        9: "Demi-God",
        10: "God Level"
    }
    return titles.get(level, "Novice")
