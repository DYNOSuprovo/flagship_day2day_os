"""Time Capsule Service - Messages to future self."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta
import json
import os

router = APIRouter()

CAPSULES_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "time_capsules.json")


class CapsuleCreate(BaseModel):
    message: str
    mood: str
    open_date: str  # ISO date string
    tags: Optional[List[str]] = []


def load_capsules():
    if os.path.exists(CAPSULES_PATH):
        with open(CAPSULES_PATH, "r") as f:
            return json.load(f)
    return {"capsules": [], "opened": []}


def save_capsules(data):
    with open(CAPSULES_PATH, "w") as f:
        json.dump(data, f, indent=2)


@router.get("/")
def get_capsules():
    """Get all capsules (locked and unlockable)."""
    data = load_capsules()
    today = date.today().isoformat()
    
    capsules = []
    unlockable = []
    
    for capsule in data["capsules"]:
        is_openable = capsule["open_date"] <= today
        capsule_data = {
            **capsule,
            "is_openable": is_openable,
            "days_until": max(0, (date.fromisoformat(capsule["open_date"]) - date.today()).days)
        }
        
        # Hide message content until openable
        if not is_openable:
            capsule_data["message"] = "🔒 Locked until " + capsule["open_date"]
        
        if is_openable:
            unlockable.append(capsule_data)
        else:
            capsules.append(capsule_data)
    
    return {
        "locked": capsules,
        "unlockable": unlockable,
        "opened": data["opened"][-10:],  # Last 10 opened
        "total_locked": len(capsules),
        "total_unlockable": len(unlockable)
    }


@router.post("/")
def create_capsule(capsule: CapsuleCreate):
    """Create a new time capsule."""
    data = load_capsules()
    
    new_capsule = {
        "id": f"cap_{datetime.now().timestamp()}",
        "message": capsule.message,
        "mood": capsule.mood,
        "open_date": capsule.open_date,
        "tags": capsule.tags,
        "created_at": datetime.now().isoformat(),
        "life_score_at_creation": 75,  # Would get from life score service
    }
    
    data["capsules"].append(new_capsule)
    save_capsules(data)
    
    # Calculate days until opening
    days_until = (date.fromisoformat(capsule.open_date) - date.today()).days
    
    return {
        "success": True,
        "capsule_id": new_capsule["id"],
        "days_until_open": days_until,
        "message": f"Time capsule sealed! Opens in {days_until} days ✨"
    }


@router.post("/{capsule_id}/open")
def open_capsule(capsule_id: str):
    """Open a time capsule if it's ready."""
    data = load_capsules()
    today = date.today().isoformat()
    
    # Find the capsule
    capsule = None
    for i, c in enumerate(data["capsules"]):
        if c["id"] == capsule_id:
            capsule = c
            capsule_index = i
            break
    
    if not capsule:
        return {"error": "Capsule not found"}
    
    if capsule["open_date"] > today:
        days_left = (date.fromisoformat(capsule["open_date"]) - date.today()).days
        return {"error": f"This capsule is still locked! {days_left} days remaining."}
    
    # Move to opened
    capsule["opened_at"] = datetime.now().isoformat()
    data["opened"].append(capsule)
    data["capsules"].pop(capsule_index)
    save_capsules(data)
    
    # Award XP for opening
    try:
        from services.gamification.gamification_service import add_xp
        add_xp(50, "time_capsule", "Opened a time capsule from the past!")
    except:
        pass
    
    return {
        "success": True,
        "capsule": capsule,
        "message": "You've opened a message from your past self! 💌"
    }


@router.delete("/{capsule_id}")
def delete_capsule(capsule_id: str):
    """Delete a capsule (only if locked)."""
    data = load_capsules()
    
    for i, c in enumerate(data["capsules"]):
        if c["id"] == capsule_id:
            data["capsules"].pop(i)
            save_capsules(data)
            return {"success": True}
    
    return {"error": "Capsule not found"}


# Quick capsule templates
CAPSULE_PROMPTS = [
    {"emoji": "🎯", "prompt": "What are your top 3 goals right now?"},
    {"emoji": "💭", "prompt": "What's on your mind today?"},
    {"emoji": "🙏", "prompt": "What are you grateful for?"},
    {"emoji": "🌟", "prompt": "What would make today amazing?"},
    {"emoji": "💪", "prompt": "What challenge are you facing?"},
    {"emoji": "❤️", "prompt": "A message of encouragement to future you..."},
    {"emoji": "🔮", "prompt": "Where do you see yourself when this opens?"},
    {"emoji": "📝", "prompt": "What lessons have you learned recently?"},
]


@router.get("/prompts")
def get_prompts():
    """Get writing prompts for capsules."""
    return {"prompts": CAPSULE_PROMPTS}
