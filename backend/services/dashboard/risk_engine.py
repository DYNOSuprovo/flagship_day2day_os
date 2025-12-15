from fastapi import APIRouter
from database import get_db_connection
from datetime import datetime, timedelta

router = APIRouter()

def calculate_burnout_risk():
    """Calculate burnout risk based on mood logs and activity."""
    # Simplified logic: Count negative mood logs in last 7 days
    conn = get_db_connection()
    cursor = conn.cursor()
    
    start_date = (datetime.now() - timedelta(days=7)).isoformat()
    cursor.execute("""
        SELECT count(*) as count 
        FROM activities 
        WHERE timestamp >= ? AND type = 'mood_log' AND (metadata LIKE '%stress%' OR metadata LIKE '%anxious%' OR metadata LIKE '%tired%')
    """, (start_date,))
    
    stress_count = cursor.fetchone()['count']
    conn.close()
    
    # Risk Score (0-100)
    # If > 5 stress logs in a week, risk is high
    risk_score = min(stress_count * 15, 100)
    
    return {
        "score": risk_score,
        "level": "High" if risk_score > 70 else "Medium" if risk_score > 30 else "Low",
        "prediction": "Risk of burnout in 2 weeks if stress continues." if risk_score > 70 else "Stable."
    }

def calculate_financial_risk():
    """Calculate financial vulnerability."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get last 30 days income vs expense
    start_date = (datetime.now() - timedelta(days=30)).isoformat()
    
    cursor.execute("SELECT sum(amount) as total FROM transactions WHERE date >= ? AND type = 'income'", (start_date,))
    income = cursor.fetchone()['total'] or 0
    
    cursor.execute("SELECT sum(amount) as total FROM transactions WHERE date >= ? AND type = 'expense'", (start_date,))
    expenses = cursor.fetchone()['total'] or 0
    
    conn.close()
    
    if income == 0:
        return {"score": 50, "level": "Unknown", "prediction": "No income data."}
        
    savings_rate = ((income - expenses) / income) * 100
    
    # Risk Score: Lower savings rate = Higher risk
    if savings_rate < 0:
        risk_score = 90
    elif savings_rate < 10:
        risk_score = 60
    elif savings_rate < 20:
        risk_score = 30
    else:
        risk_score = 10
        
    return {
        "score": risk_score,
        "level": "Critical" if risk_score > 80 else "Moderate" if risk_score > 40 else "Low",
        "prediction": "Savings depletion in 3 months." if risk_score > 80 else "Financial health is stable."
    }

@router.get("/analysis")
def get_risk_analysis():
    """Get comprehensive lifestyle risk analysis."""
    burnout = calculate_burnout_risk()
    financial = calculate_financial_risk()
    
    # Overall Risk
    avg_score = (burnout['score'] + financial['score']) / 2
    
    return {
        "overall_risk_score": round(avg_score),
        "risks": {
            "burnout": burnout,
            "financial": financial,
            "health": {"score": 20, "level": "Low", "prediction": "Stable based on recent activity."} # Placeholder
        }
    }
