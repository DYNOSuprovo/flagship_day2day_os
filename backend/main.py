from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.diet import diet_service
from services.finance import finance_service
from services.emotional import emotional_service
from services.vision import vision_service
from services.orchestrator import orchestrator_service, memory_fusion
from services.dashboard import dashboard_service, risk_engine, life_score_service, nudges_service, statistics_service, report_service
from services.gamification import gamification_service, challenges_service, achievements_service
from services.user import user_service, goals_service, profile_service, capsule_service, friends_service
from services.dreams import dream_service
from services.habits import habits_service
from services import ml_predictions
from mlops import mlops_service

app = FastAPI(title="Holistic AI Lifestyle Advisor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_service.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(risk_engine.router, prefix="/risk", tags=["Risk Analysis"])
app.include_router(diet_service.router, prefix="/diet", tags=["Diet"])
app.include_router(finance_service.router, prefix="/finance", tags=["Finance"])
app.include_router(emotional_service.router, prefix="/emotional", tags=["Emotional"])
app.include_router(vision_service.router, prefix="/vision", tags=["Vision"])
app.include_router(gamification_service.router, prefix="/gamification", tags=["Gamification"])
app.include_router(user_service.router, prefix="/user", tags=["User Profile"])
app.include_router(orchestrator_service.router, prefix="/orchestrator", tags=["Orchestrator"])
app.include_router(memory_fusion.router, prefix="/memory-fusion", tags=["Memory Fusion"])
app.include_router(dream_service.router, prefix="/dreams", tags=["Dreams"])
app.include_router(habits_service.router, prefix="/habits", tags=["Habits"])
app.include_router(mlops_service.router, prefix="/mlops", tags=["MLOps"])
app.include_router(ml_predictions.router, prefix="/ml", tags=["ML Predictions"])
app.include_router(life_score_service.router, prefix="/life", tags=["Life Score"])
app.include_router(challenges_service.router, prefix="/challenges", tags=["Challenges"])
app.include_router(achievements_service.router, prefix="/achievements", tags=["Achievements"])
app.include_router(nudges_service.router, prefix="/nudges", tags=["Nudges"])
app.include_router(statistics_service.router, prefix="/stats", tags=["Statistics"])
app.include_router(goals_service.router, prefix="/goals", tags=["Goals"])
app.include_router(profile_service.router, prefix="/profile", tags=["Profile"])
app.include_router(report_service.router, prefix="/report", tags=["Reports"])
app.include_router(capsule_service.router, prefix="/capsule", tags=["Time Capsule"])
app.include_router(friends_service.router, prefix="/friends", tags=["Friends"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Holistic AI Lifestyle Advisor API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
