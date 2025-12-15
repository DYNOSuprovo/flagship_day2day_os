from fastapi import APIRouter, HTTPException
from database import get_db_connection
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )

def fetch_aggregated_data(days: int = 7):
    """Fetch data from all domains for the last N days."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    start_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    # 1. Finance: High expenses
    cursor.execute("""
        SELECT date, amount, category, description 
        FROM transactions 
        WHERE date >= ? AND type = 'expense'
        ORDER BY date DESC
    """, (start_date,))
    transactions = [dict(row) for row in cursor.fetchall()]
    
    # 2. Diet: Meals
    cursor.execute("""
        SELECT date, name, calories, protein, carbs, fat 
        FROM meals 
        WHERE date >= ?
        ORDER BY date DESC
    """, (start_date,))
    meals = [dict(row) for row in cursor.fetchall()]
    
    # 3. Emotional: Mood Logs (Assuming stored in activities for now)
    cursor.execute("""
        SELECT timestamp as date, description as mood, metadata 
        FROM activities 
        WHERE timestamp >= ? AND type = 'mood_log'
        ORDER BY timestamp DESC
    """, (start_date,))
    moods = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    
    return {
        "transactions": transactions,
        "meals": meals,
        "moods": moods
    }

@router.get("/analyze")
async def analyze_correlations():
    """Detect cross-domain patterns using Gemini."""
    try:
        data = fetch_aggregated_data(days=14)
        
        # If not enough data, return dummy/seed insights for demo
        if not data['transactions'] and not data['meals']:
            return {
                "insights": [
                    {
                        "type": "correlation",
                        "domain_a": "Emotional",
                        "domain_b": "Finance",
                        "description": "You tend to spend 40% more on 'Shopping' on days when you log 'Anxious' moods.",
                        "confidence": 0.85,
                        "action": "Try the '5-minute breathing' exercise instead of opening Amazon when anxious."
                    },
                    {
                        "type": "risk",
                        "domain_a": "Diet",
                        "domain_b": "Sleep",
                        "description": "High sugar intake (>80g) after 8 PM is correlated with your reported insomnia.",
                        "confidence": 0.92,
                        "action": "Switch to herbal tea after 8 PM."
                    }
                ]
            }

        llm = get_llm()
        if not llm:
            raise HTTPException(status_code=500, detail="LLM not initialized")

        prompt = f"""
        You are the 'Memory Fusion Engine' of a super-intelligent Life OS.
        Analyze the following user data timeline to find hidden correlations between behaviors.
        
        Data:
        {json.dumps(data, indent=2)}
        
        Look for patterns like:
        - Stress (Mood) leading to Impulse Buying (Finance).
        - Poor Diet (High Sugar) leading to Low Mood.
        - High Spending leading to Stress.
        
        Return a JSON object with a key 'insights' containing a list of objects.
        Each object must have:
        - 'type': 'correlation' or 'risk'
        - 'domain_a': string (e.g., Finance)
        - 'domain_b': string (e.g., Emotional)
        - 'description': string (The insight)
        - 'confidence': float (0.0 to 1.0)
        - 'action': string (Specific advice)
        """
        
        response = llm.invoke([HumanMessage(content=prompt)])
        content = response.content.replace('```json', '').replace('```', '').strip()
        
        return json.loads(content)

    except Exception as e:
        print(f"Fusion Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
