"""
Friend System Service
Handles friend requests, friend lists, and social features
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import os

router = APIRouter()

# Data file path
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
FRIENDS_FILE = os.path.join(DATA_DIR, "friends.json")

class FriendRequest(BaseModel):
    from_user: str
    to_user: str
    status: str = "pending"  # pending, accepted, rejected
    created_at: Optional[str] = None

class Friend(BaseModel):
    user_id: str
    username: str
    avatar: str = "😎"
    level: int = 1
    xp: int = 0
    streak: int = 0
    added_at: Optional[str] = None

class UserProfile(BaseModel):
    user_id: str
    username: str
    avatar: str = "😎"
    bio: str = ""
    level: int = 1
    xp: int = 0
    streak: int = 0
    friends: List[str] = []
    friend_requests: List[dict] = []
    privacy: str = "public"  # public, friends, private

def load_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(FRIENDS_FILE):
        with open(FRIENDS_FILE, "r") as f:
            return json.load(f)
    return {
        "users": {
            "current_user": {
                "user_id": "current_user",
                "username": "You",
                "avatar": "😎",
                "bio": "Living my best life!",
                "level": 28,
                "xp": 8750,
                "streak": 21,
                "friends": ["user_1", "user_2"],
                "friend_requests": [],
                "privacy": "public"
            },
            "user_1": {
                "user_id": "user_1",
                "username": "ZenMaster",
                "avatar": "🧘",
                "bio": "Meditation enthusiast",
                "level": 45,
                "xp": 15420,
                "streak": 128,
                "friends": ["current_user"],
                "friend_requests": [],
                "privacy": "public"
            },
            "user_2": {
                "user_id": "user_2",
                "username": "FitnessPro",
                "avatar": "💪",
                "bio": "Never skip leg day",
                "level": 42,
                "xp": 14250,
                "streak": 95,
                "friends": ["current_user"],
                "friend_requests": [],
                "privacy": "public"
            },
            "user_3": {
                "user_id": "user_3",
                "username": "MindfulOne",
                "avatar": "🌟",
                "bio": "One breath at a time",
                "level": 38,
                "xp": 12800,
                "streak": 67,
                "friends": [],
                "friend_requests": [],
                "privacy": "public"
            }
        },
        "requests": []
    }

def save_data(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(FRIENDS_FILE, "w") as f:
        json.dump(data, f, indent=2)

@router.get("/")
async def get_friends():
    """Get current user's friend list"""
    data = load_data()
    current_user = data["users"].get("current_user", {})
    friend_ids = current_user.get("friends", [])
    
    friends = []
    for fid in friend_ids:
        if fid in data["users"]:
            user = data["users"][fid]
            friends.append({
                "user_id": user["user_id"],
                "username": user["username"],
                "avatar": user["avatar"],
                "level": user["level"],
                "xp": user["xp"],
                "streak": user["streak"]
            })
    
    return {"friends": friends, "count": len(friends)}

@router.get("/suggestions")
async def get_friend_suggestions():
    """Get friend suggestions"""
    data = load_data()
    current_user = data["users"].get("current_user", {})
    friend_ids = current_user.get("friends", [])
    
    suggestions = []
    for uid, user in data["users"].items():
        if uid != "current_user" and uid not in friend_ids and user.get("privacy") == "public":
            suggestions.append({
                "user_id": user["user_id"],
                "username": user["username"],
                "avatar": user["avatar"],
                "level": user["level"],
                "mutual_friends": 0
            })
    
    return {"suggestions": suggestions}

@router.post("/request/{user_id}")
async def send_friend_request(user_id: str):
    """Send a friend request"""
    data = load_data()
    
    if user_id not in data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already friends
    current_user = data["users"].get("current_user", {})
    if user_id in current_user.get("friends", []):
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Create request
    request = {
        "from_user": "current_user",
        "to_user": user_id,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    data["requests"].append(request)
    data["users"][user_id]["friend_requests"].append(request)
    save_data(data)
    
    return {"message": "Friend request sent", "request": request}

@router.post("/accept/{user_id}")
async def accept_friend_request(user_id: str):
    """Accept a friend request"""
    data = load_data()
    
    if user_id not in data["users"]:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add to friends list for both users
    if user_id not in data["users"]["current_user"]["friends"]:
        data["users"]["current_user"]["friends"].append(user_id)
    
    if "current_user" not in data["users"][user_id]["friends"]:
        data["users"][user_id]["friends"].append("current_user")
    
    # Remove request
    data["requests"] = [r for r in data["requests"] 
                        if not (r["from_user"] == user_id and r["to_user"] == "current_user")]
    
    save_data(data)
    
    return {"message": "Friend request accepted"}

@router.delete("/{user_id}")
async def remove_friend(user_id: str):
    """Remove a friend"""
    data = load_data()
    
    if user_id in data["users"]["current_user"]["friends"]:
        data["users"]["current_user"]["friends"].remove(user_id)
    
    if "current_user" in data["users"].get(user_id, {}).get("friends", []):
        data["users"][user_id]["friends"].remove("current_user")
    
    save_data(data)
    
    return {"message": "Friend removed"}

@router.get("/requests")
async def get_friend_requests():
    """Get pending friend requests"""
    data = load_data()
    pending = [r for r in data["requests"] 
               if r["to_user"] == "current_user" and r["status"] == "pending"]
    
    # Enrich with user data
    enriched = []
    for req in pending:
        if req["from_user"] in data["users"]:
            user = data["users"][req["from_user"]]
            enriched.append({
                **req,
                "username": user["username"],
                "avatar": user["avatar"],
                "level": user["level"]
            })
    
    return {"requests": enriched}

@router.get("/activity")
async def get_friend_activity():
    """Get recent friend activity"""
    data = load_data()
    current_user = data["users"].get("current_user", {})
    friend_ids = current_user.get("friends", [])
    
    # Mock activity feed
    activities = []
    for fid in friend_ids:
        if fid in data["users"]:
            user = data["users"][fid]
            activities.append({
                "user_id": fid,
                "username": user["username"],
                "avatar": user["avatar"],
                "action": "completed a habit",
                "timestamp": datetime.now().isoformat()
            })
            activities.append({
                "user_id": fid,
                "username": user["username"],
                "avatar": user["avatar"],
                "action": f"is on a {user['streak']} day streak! 🔥",
                "timestamp": datetime.now().isoformat()
            })
    
    return {"activities": activities[:10]}
