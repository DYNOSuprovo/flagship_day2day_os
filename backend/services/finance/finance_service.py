from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from .transaction_manager import transaction_manager

router = APIRouter()

class TransactionRequest(BaseModel):
    amount: float
    type: str  # 'income' or 'expense'
    category: str
    description: str

@router.post("/transaction")
def add_transaction(request: TransactionRequest):
    """Add a new financial transaction."""
    try:
        tx = transaction_manager.add_transaction(
            request.amount, request.type, request.category, request.description
        )
        return {"success": True, "transaction": tx}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transactions")
def get_transactions(limit: int = 20):
    """Get recent transactions."""
    return transaction_manager.get_transactions(limit)

@router.get("/summary")
def get_finance_summary():
    """Get current financial summary."""
    return transaction_manager.get_summary()

# Legacy endpoint wrapper for backward compatibility if needed, 
# but we encourage using /summary
@router.get("/budget")
def analyze_budget(income: float, expenses: float):
    """Analyze budget based on income and expenses."""
    savings = income - expenses
    savings_rate = (savings / income * 100) if income > 0 else 0
    
    # Determine Status
    if savings_rate >= 20:
        status = "Excellent"
        color = "emerald"
    elif savings_rate >= 10:
        status = "Good"
        color = "blue"
    elif savings_rate > 0:
        status = "Fair"
        color = "yellow"
    else:
        status = "Needs Improvement"
        color = "red"

    # Generate Forecast (Simple Projection)
    forecast = []
    current_savings = 0
    for i in range(1, 7):
        current_savings += savings
        forecast.append({
            "month": f"Month {i}",
            "savings": current_savings
        })

    # Generate Recommendation (Rule-based for speed/reliability)
    if status == "Excellent":
        recommendation = "Great job! Consider investing your surplus in diversified assets like mutual funds or stocks to beat inflation."
    elif status == "Good":
        recommendation = "You're on the right track. Try to increase your savings rate to 20% by optimizing discretionary spending."
    elif status == "Fair":
        recommendation = "You have some savings, but there's room for improvement. Review your subscriptions and dining out expenses."
    else:
        recommendation = "Critical: Your expenses are too high. Create a strict budget immediately and cut non-essential costs."

    return {
        "savings": savings,
        "savings_rate": round(savings_rate, 1),
        "status": status,
        "status_color": color,
        "recommendation": recommendation,
        "forecast": forecast,
        "remaining": savings # For backward compatibility if needed
    }
