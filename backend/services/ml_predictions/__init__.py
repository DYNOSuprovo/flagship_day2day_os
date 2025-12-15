from fastapi import APIRouter, HTTPException
import joblib
import numpy as np
from pathlib import Path

router = APIRouter()

# Load models (if they exist)
try:
    diet_model = joblib.load("./models/diet_adherence_model.pkl")
    habit_model = joblib.load("./models/habit_success_predictor.pkl")
    models_loaded = True
except:
    diet_model = None
    habit_model = None
    models_loaded = False


@router.post("/predict-weight-loss")
def predict_weight_loss(
    calorie_deficit: int = 300,
    protein_grams: int = 80,
    fiber_grams: int = 25,
    steps_per_day: int = 7000,
    sleep_hours: float = 7.5
):
    """Predict weight loss based on diet adherence."""
    if not diet_model:
        return {
            "error": "Model not trained yet. Run: python scripts/train_models.py",
            "fallback_estimate": calorie_deficit * 0.005  # Simple fallback
        }
    
    # Prepare features
    features = np.array([[
        calorie_deficit,
        protein_grams,
        fiber_grams,
        steps_per_day,
        sleep_hours
    ]])
    
    # Predict
    prediction = diet_model.predict(features)[0]
    
    return {
        "predicted_weight_loss_kg_per_month": round(prediction, 2),
        "inputs": {
            "calorie_deficit": calorie_deficit,
            "protein_grams": protein_grams,
            "fiber_grams": fiber_grams,
            "steps_per_day": steps_per_day,
            "sleep_hours": sleep_hours
        },
        "explanation": f"Based on your {calorie_deficit} cal deficit, {protein_grams}g protein, and {steps_per_day} steps, you can expect to lose ~{round(prediction, 1)}kg this month.",
        "model": "LinearRegression trained on synthetic data"
    }


@router.post("/predict-habit-success")
def predict_habit_success(
    streak_length: int = 5,
    time_of_day: int = 22,
    weekday: int = 2,
    stress_level: int = 3,
    previous_success_rate: float = 0.7
):
    """Predict probability of habit success."""
    if not habit_model:
        return {
            "error": "Model not trained yet. Run: python scripts/train_models.py",
            "fallback_probability": 0.5
        }
    
    # Prepare features
    features = np.array([[
        streak_length,
        time_of_day,
        weekday,
        stress_level,
        previous_success_rate
    ]])
    
    # Predict
    prediction = habit_model.predict(features)[0]
    probability = habit_model.predict_proba(features)[0][1]
    
    return {
        "success_prediction": bool(prediction),
        "success_probability": round(probability, 3),
        "inputs": {
            "streak_length": streak_length,
            "time_of_day": time_of_day,
            "weekday": weekday,
            "stress_level": stress_level,
            "previous_success_rate": previous_success_rate
        },
        "advice": "Try starting your habit before 10pm - evening habits have higher success rates!" if time_of_day > 22 else "Great timing!",
        "model": "RandomForest trained on synthetic data"
    }


@router.get("/models-status")
def models_status():
    """Check if ML models are loaded."""
    return {
        "diet_model_loaded": diet_model is not None,
        "habit_model_loaded": habit_model is not None,
        "models_directory": str(Path("./models").absolute()),
        "instructions": "Run 'python scripts/train_models.py' to train models"
    }
