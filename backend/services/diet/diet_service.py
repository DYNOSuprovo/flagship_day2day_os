from fastapi import APIRouter, HTTPException
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
import chromadb
import os
from dotenv import load_dotenv
from .food_database import FoodDatabase, MealPlanner
from services.gamification.gamification_service import grant_xp

load_dotenv()

router = APIRouter()

# Initialize ChromaDB and Gemini lazily
def get_chroma_client():
    return chromadb.PersistentClient(path="./chroma_db")

def get_llm():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found")
        return None
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        api_key=api_key
    )

# Initialize food database and meal planner lazily
_food_db = None
_meal_planner = None

def get_meal_planner():
    global _food_db, _meal_planner
    if _meal_planner is None:
        try:
            _food_db = FoodDatabase()
            _meal_planner = MealPlanner(_food_db)
        except Exception as e:
            print(f"Warning: Could not load food database: {e}")
            return None
    return _meal_planner


def get_diet_rag_response(query: str, diet_type: str = "veg", health_conditions: list = None):
    """RAG-powered diet recommendations."""
    try:
        # Get diet collection
        chroma_client = get_chroma_client()
        diet_collection = chroma_client.get_collection("diet_knowledge")
        
        # Build search query
        search_query = f"{query} {diet_type}"
        if health_conditions:
            search_query += f" {' '.join(health_conditions)}"
        
        # Retrieve relevant documents
        results = diet_collection.query(
            query_texts=[search_query],
            n_results=5
        )
        
        # Extract context
        context = "\n\n".join(results["documents"][0]) if results["documents"] else "No relevant data found."
        
        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert Indian dietitian. Use the provided nutrition data to give personalized diet advice.
            Be specific about food items, portions, and timing. Consider the user's diet type and health conditions."""),
            ("user", """Context from nutrition database:
{context}

User Query: {query}
Diet Type: {diet_type}
Health Conditions: {health_conditions}

Provide a detailed, actionable diet plan or recommendation.""")
        ])
        
        # Generate response
        llm = get_llm()
        if not llm:
            raise ValueError("LLM not initialized")
        chain = prompt | llm
        response = chain.invoke({
            "context": context,
            "query": query,
            "diet_type": diet_type,
            "health_conditions": ", ".join(health_conditions) if health_conditions else "None"
        })
        
        return {
            "response": response.content,
            "sources": results["metadatas"][0] if results["metadatas"] else [],
            "retrieved_docs": len(results["documents"][0]) if results["documents"] else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG error: {str(e)}")


@router.post("/plan-rag")
def get_rag_diet_plan(
    query: str = "Give me a meal plan for weight loss",
    calories: int = 2000,
    diet_type: str = "veg",
    health_conditions: list[str] = None
):
    """Get RAG-powered diet plan with LLM generation."""
    enhanced_query = f"Create a {calories} calorie {diet_type} meal plan. {query}"
    result = get_diet_rag_response(enhanced_query, diet_type, health_conditions or [])
    
    return {
        "query": query,
        "calories": calories,
        "diet_type": diet_type,
        "plan": result["response"],
        "sources_used": result["sources"],
        "num_docs_retrieved": result["retrieved_docs"],
        "method": "RAG + Gemini LLM"
    }


@router.get("/plan")
def get_diet_plan(calories: int = 2000, type: str = "veg"):
    """Get a comprehensive diet plan using the Indian foods database."""
    try:
        # Use the meal planner if available
        meal_planner = get_meal_planner()
        if meal_planner:
            plan = meal_planner.generate_plan(calories, type)
            return plan
        else:
            # Fallback if database failed to load
            return {
                "plan_name": f"{calories} Cal {type} Plan",
                "total_calories": calories,
                "protein": int(calories * 0.3 / 4),
                "carbs": int(calories * 0.5 / 4),
                "fat": int(calories * 0.2 / 9),
                "meals": [
                    {"name": "Idli with Sambar", "calories": int(calories * 0.25), "protein": 15},
                    {"name": "Dal Rice with Roti", "calories": int(calories * 0.40), "protein": 25},
                    {"name": "Vegetable Curry with Roti", "calories": int(calories * 0.30), "protein": 20},
                ]
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating plan: {str(e)}")


# Meal logging
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MealLog(BaseModel):
    food_name: str
    calories: int
    protein: Optional[float] = 0
    carbs: Optional[float] = 0
    fat: Optional[float] = 0
    health_score: Optional[int] = 5
    meal_type: Optional[str] = "snack"  # breakfast, lunch, dinner, snack

# In-memory meal storage (in production, use database)
_logged_meals = []

@router.post("/log-meal")
def log_meal(meal: MealLog):
    """Log a consumed meal for tracking."""
    try:
        # Store the meal
        logged = {
            "id": len(_logged_meals) + 1,
            "food_name": meal.food_name,
            "calories": meal.calories,
            "protein": meal.protein,
            "carbs": meal.carbs,
            "fat": meal.fat,
            "health_score": meal.health_score,
            "meal_type": meal.meal_type,
            "logged_at": datetime.now().isoformat()
        }
        
        _logged_meals.append(logged)

        # Log activity for dashboard
        try:
            from services.dashboard.activity_tracker import log_activity
            log_activity(
                "meal_logged",
                f"Logged {meal.food_name} ({meal.calories} cal)",
                {"calories": meal.calories, "meal_type": meal.meal_type}
            )
        except Exception:
            pass  # Activity logging is optional

        # Gamification Trigger
        try:
            grant_xp(1, 15)  # Award 15 XP for logging a meal
            print(f"🥗 XP Awarded for Meal: {meal.food_name}")
        except Exception as e:
            print(f"⚠️ Failed to award XP for meal: {e}")
        
        return {
            "success": True,
            "meal": logged,
            "message": f"Logged {meal.food_name} successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error logging meal: {str(e)}")


@router.get("/logged-meals")
def get_logged_meals(limit: int = 20):
    """Get recently logged meals."""
    return {
        "meals": _logged_meals[-limit:][::-1],  # Most recent first
        "total": len(_logged_meals),
        "today_calories": sum(m["calories"] for m in _logged_meals if m["logged_at"].startswith(datetime.now().strftime("%Y-%m-%d")))
    }


@router.get("/daily-summary")
def get_daily_summary():
    """Get today's nutrition summary."""
    today = datetime.now().strftime("%Y-%m-%d")
    today_meals = [m for m in _logged_meals if m["logged_at"].startswith(today)]
    
    return {
        "date": today,
        "meals_count": len(today_meals),
        "total_calories": sum(m["calories"] for m in today_meals),
        "total_protein": sum(m["protein"] for m in today_meals),
        "total_carbs": sum(m["carbs"] for m in today_meals),
        "total_fat": sum(m["fat"] for m in today_meals),
        "meals": today_meals
    }
