from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import get_db_connection

router = APIRouter()

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    archetype: Optional[str] = None
    baseline_stress: Optional[int] = None
    baseline_energy: Optional[int] = None
    baseline_wealth: Optional[int] = None
    onboarding_completed: Optional[int] = None

@router.get("/profile")
def get_user_profile():
    """Get the current user's profile."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM user_profile WHERE id = 1")
    profile = cursor.fetchone()
    conn.close()
    
    if not profile:
        return {}
        
    return dict(profile)

@router.post("/profile")
def update_user_profile(profile: UserProfileUpdate):
    """Update user profile settings."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build dynamic update query
    fields = []
    values = []
    
    if profile.name is not None:
        fields.append("name = ?")
        values.append(profile.name)
    if profile.archetype is not None:
        fields.append("archetype = ?")
        values.append(profile.archetype)
    if profile.baseline_stress is not None:
        fields.append("baseline_stress = ?")
        values.append(profile.baseline_stress)
    if profile.baseline_energy is not None:
        fields.append("baseline_energy = ?")
        values.append(profile.baseline_energy)
    if profile.baseline_wealth is not None:
        fields.append("baseline_wealth = ?")
        values.append(profile.baseline_wealth)
    if profile.onboarding_completed is not None:
        fields.append("onboarding_completed = ?")
        values.append(profile.onboarding_completed)
        
    if not fields:
        conn.close()
        return {"message": "No fields to update"}
        
    values.append(1)  # For WHERE id = 1
    
    query = f"UPDATE user_profile SET {', '.join(fields)} WHERE id = ?"
    cursor.execute(query, tuple(values))
    conn.commit()
    conn.close()
    
    return {"message": "Profile updated successfully"}
