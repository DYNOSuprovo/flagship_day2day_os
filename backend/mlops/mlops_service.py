from fastapi import APIRouter
from mlops.mlflow_config import log_diet_prediction, log_finance_prediction, log_model_metrics
import mlflow

router = APIRouter()

@router.get("/experiments")
def list_experiments():
    """List all MLflow experiments."""
    experiments = mlflow.search_experiments()
    return [{"id": exp.experiment_id, "name": exp.name} for exp in experiments]

@router.get("/runs/{experiment_id}")
def list_runs(experiment_id: str):
    """List all runs for a specific experiment."""
    runs = mlflow.search_runs(experiment_ids=[experiment_id])
    return runs.to_dict(orient="records")

@router.post("/log/diet")
def log_diet(calories: int, feedback: str = "neutral"):
    """Log diet prediction and user feedback."""
    log_diet_prediction(calories, feedback)
    return {"status": "logged", "domain": "diet"}

@router.post("/log/finance")
def log_finance(budget_remaining: int, accuracy: float = None):
    """Log finance prediction and accuracy."""
    log_finance_prediction(budget_remaining, accuracy)
    return {"status": "logged", "domain": "finance"}

@router.post("/log/model")
def log_model(model_name: str, metrics: dict):
    """Log general model metrics."""
    log_model_metrics(model_name, metrics)
    return {"status": "logged", "model": model_name}
