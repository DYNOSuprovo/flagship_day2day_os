import mlflow
import os
from datetime import datetime

# MLflow configuration
MLFLOW_TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "file:./mlruns")
mlflow.set_tracking_uri(MLFLOW_TRACKING_URI)

def start_experiment(experiment_name: str):
    """Start or get an MLflow experiment."""
    mlflow.set_experiment(experiment_name)
    return mlflow.start_run()

def log_diet_prediction(calories_predicted: int, user_feedback: str = None):
    """Log diet-related predictions and feedback."""
    with mlflow.start_run(run_name=f"diet_prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
        mlflow.log_param("calories_predicted", calories_predicted)
        mlflow.log_metric("user_satisfaction", 1 if user_feedback == "positive" else 0)
        mlflow.set_tag("domain", "diet")

def log_finance_prediction(budget_remaining: int, accuracy: float = None):
    """Log finance-related predictions."""
    with mlflow.start_run(run_name=f"finance_prediction_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
        mlflow.log_param("budget_remaining", budget_remaining)
        if accuracy:
            mlflow.log_metric("prediction_accuracy", accuracy)
        mlflow.set_tag("domain", "finance")

def log_model_metrics(model_name: str, metrics: dict):
    """Log general model metrics for explainable ML models."""
    with mlflow.start_run(run_name=f"{model_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
        for key, value in metrics.items():
            mlflow.log_metric(key, value)
        mlflow.set_tag("model", model_name)
