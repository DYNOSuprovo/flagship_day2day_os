import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

class TestHealthEndpoints:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()
        assert "Holistic AI Lifestyle Advisor" in response.json()["message"]
    
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


class TestDietService:
    def test_get_diet_plan_default(self):
        response = client.get("/diet/plan")
        assert response.status_code == 200
        data = response.json()
        assert "calories" in data
        assert "type" in data
        assert "plan" in data
        assert isinstance(data["plan"], list)
    
    def test_get_diet_plan_custom(self):
        response = client.get("/diet/plan?calories=1800&type=non-veg")
        assert response.status_code == 200
        data = response.json()
        assert data["calories"] == 1800
        assert data["type"] == "non-veg"


class TestFinanceService:
    def test_get_budget_positive(self):
        response = client.get("/finance/budget?income=50000&expenses=30000")
        assert response.status_code == 200
        data = response.json()
        assert data["savings"] == 20000
        assert data["remaining"] == 20000
        assert data["status"] == "Excellent"  # 40% savings rate = Excellent
        assert "recommendation" in data
    
    def test_get_budget_negative(self):
        response = client.get("/finance/budget?income=30000&expenses=50000")
        assert response.status_code == 200
        data = response.json()
        assert data["remaining"] == -20000
        assert data["status"] == "Needs Improvement"
        assert "Critical" in data["recommendation"]


class TestEmotionalService:
    def test_emotional_guidance_sad(self):
        response = client.get("/emotional/guidance?mood=sad")
        assert response.status_code == 200
        data = response.json()
        assert "guidance" in data
        assert "action" in data
        assert "Gita" in data["guidance"]
    
    def test_emotional_guidance_anxious(self):
        response = client.get("/emotional/guidance?mood=anxious")
        assert response.status_code == 200
        data = response.json()
        assert "Gita" in data["guidance"]


class TestVisionService:
    def test_analyze_food_image(self):
        response = client.post("/vision/analyze?image_type=food")
        assert response.status_code == 200
        data = response.json()
        assert data["type"] == "food"
        assert "result" in data


class TestOrchestratorService:
    def test_chat_orchestrator_diet(self):
        response = client.post("/orchestrator/chat?query=I want to eat healthy food")
        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "detected_domains" in data
        assert "diet" in data["detected_domains"]
        assert "response" in data
    
    def test_chat_orchestrator_finance(self):
        response = client.post("/orchestrator/chat?query=I spent too much money")
        assert response.status_code == 200
        data = response.json()
        assert "finance" in data["detected_domains"]
    
    def test_chat_orchestrator_emotional(self):
        response = client.post("/orchestrator/chat?query=I feel anxious and stressed")
        assert response.status_code == 200
        data = response.json()
        assert "emotional" in data["detected_domains"]
    
    def test_chat_orchestrator_multi_domain(self):
        response = client.post("/orchestrator/chat?query=I ate too much junk food and spent all my money and now I feel sad")
        assert response.status_code == 200
        data = response.json()
        # Should detect multiple domains
        assert len(data["detected_domains"]) > 1
        assert "diet" in data["detected_domains"]
        assert "finance" in data["detected_domains"]
        assert "emotional" in data["detected_domains"]


class TestMLOpsService:
    def test_list_experiments(self):
        response = client.get("/mlops/experiments")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_log_diet_prediction(self):
        response = client.post("/mlops/log/diet?calories=1800&feedback=positive")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"
        assert data["domain"] == "diet"
    
    def test_log_finance_prediction(self):
        response = client.post("/mlops/log/finance?budget_remaining=5000&accuracy=0.85")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"
        assert data["domain"] == "finance"
    
    def test_log_model_metrics(self):
        metrics = {"accuracy": 0.92, "precision": 0.88, "recall": 0.90}
        response = client.post("/mlops/log/model?model_name=diet_predictor", json=metrics)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "logged"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
