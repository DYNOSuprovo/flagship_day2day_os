import sys

services = [
    "services.diet.diet_service",
    "services.finance.finance_service",
    "services.emotional.emotional_service",
    "services.vision.vision_service",
    "services.orchestrator.orchestrator_service",
    "services.ml_predictions.ml_predictions",
    "mlops.mlops_service"
]

for service in services:
    try:
        __import__(service)
        print(f"OK: {service}")
    except Exception as e:
        print(f"FAILED: {service}")
        print(f"  Error: {e}")
        import traceback
        traceback.print_exc()
        print()
