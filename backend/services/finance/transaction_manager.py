import sqlite3
from datetime import datetime
from typing import List, Dict
from database import get_db_connection
from services.gamification.gamification_service import grant_xp

class TransactionManager:
    def add_transaction(self, amount: float, type: str, category: str, description: str) -> Dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        date = datetime.now().isoformat()
        
        cursor.execute(
            'INSERT INTO transactions (amount, type, category, description, date) VALUES (?, ?, ?, ?, ?)',
            (amount, type, category, description, date)
        )
        
        tx_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Gamification Trigger
        try:
            grant_xp(1, 20)  # Award 20 XP for tracking finances
            print(f"💰 XP Awarded for Transaction {tx_id}")
        except Exception as e:
            print(f"⚠️ Failed to award XP: {e}")

        
        return {
            "id": tx_id,
            "amount": amount,
            "type": type,
            "category": category,
            "description": description,
            "date": date
        }

    def get_transactions(self, limit: int = 20) -> List[Dict]:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM transactions ORDER BY date DESC LIMIT ?', (limit,))
        rows = cursor.fetchall()
        conn.close()
        
        return [dict(row) for row in rows]

    def get_summary(self) -> Dict:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Calculate totals
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='income'")
        total_income = cursor.fetchone()[0] or 0
        
        cursor.execute("SELECT SUM(amount) FROM transactions WHERE type='expense'")
        total_expenses = cursor.fetchone()[0] or 0
        
        conn.close()
        
        # Mock budget for now (could be stored in DB later)
        total_budget = 50000
        remaining_budget = total_budget - total_expenses
        
        savings = total_income - total_expenses
        savings_rate = (savings / total_income * 100) if total_income > 0 else 0
        
        return {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "remaining_budget": remaining_budget,
            "savings_rate": round(savings_rate, 1),
            "currency": "INR"
        }

# Global instance
transaction_manager = TransactionManager()
