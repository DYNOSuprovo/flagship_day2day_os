from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
from database import get_db_connection
from datetime import datetime

router = APIRouter()

class DreamLog(BaseModel):
    description: str

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )

@router.post("/interpret")
async def interpret_dream(dream: DreamLog):
    """Interpret a dream using Jungian analysis."""
    try:
        llm = get_llm()
        if not llm:
            # Fallback if no API key
            return {
                "interpretation": "I sense this dream is significant, but I cannot connect to the cosmic consciousness (API Key missing).",
                "symbols": ["Unknown"],
                "theme": "Mystery"
            }

        prompt = f"""
        You are a mystical Dream Weaver and Jungian Analyst.
        Interpret the following dream: "{dream.description}"
        
        Provide a response in JSON format with:
        - "interpretation": A deep, mystical, yet psychological interpretation (max 3 sentences).
        - "symbols": A list of key symbols found in the dream.
        - "theme": The overarching emotional theme (e.g., "Transformation", "Anxiety").
        """
        
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.replace('```json', '').replace('```', '').strip()
        
        # Save to DB
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO activities (type, description, metadata, timestamp) VALUES (?, ?, ?, ?)",
            ("dream_log", dream.description, content, datetime.now().isoformat())
        )
        conn.commit()
        conn.close()
        
        import json
        return json.loads(content)

    except Exception as e:
        print(f"Dream Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
def get_dream_history():
    """Get past dreams."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT description, metadata, timestamp FROM activities WHERE type = 'dream_log' ORDER BY timestamp DESC LIMIT 10"
    )
    dreams = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return dreams
