# How to Run the Holistic AI Lifestyle Advisor

## Prerequisites
- Python 3.10+ installed
- Node.js 18+ installed
- All dependencies installed

## Step 1: Setup Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your API keys:
- `GOOGLE_API_KEY`: Your Google/Gemini API key (already added: AIzaSyDp-mzHD9Nyk1T3xCPRyrc1RCiVLZzkNy8)
- `GROQ_API_KEY`: Your Groq API key (if you have one)

## Step 2: Install Backend Dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

## Step 3: Run Backend Server

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Backend will be available at**: `http://localhost:8000`
- API Docs (Swagger): `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Test the Orchestrator:
```bash
curl -X POST "http://localhost:8000/orchestrator/chat?query=I%20ate%20too%20much%20and%20spent%20too%20much"
```

## Step 4: Run Frontend (Optional)

```bash
cd frontend
npm install  # if not already done
npm run dev
```

**Frontend will be available at**: `http://localhost:3000`

## Step 5: Run MLflow UI (Optional)

In a separate terminal:
```bash
cd backend
mlflow ui
```

**MLflow UI will be available at**: `http://localhost:5000`

## Quick Test Commands

### Test API Endpoints:
```bash
# Health check
curl http://localhost:8000/health

# Diet plan
curl "http://localhost:8000/diet/plan?calories=2000&type=veg"

# Finance budget
curl "http://localhost:8000/finance/budget?income=50000&expenses=30000"

# Emotional guidance
curl "http://localhost:8000/emotional/guidance?mood=anxious"

# LangGraph orchestrator
curl -X POST "http://localhost:8000/orchestrator/chat?query=I%20feel%20sad%20and%20broke"

# MLOps - List experiments
curl http://localhost:8000/mlops/experiments
```

## Troubleshooting

### If port 8000 is busy:
```bash
uvicorn main:app --reload --port 8001
```

### If you get import errors:
```bash
cd backend
python -m pip install --upgrade -r requirements.txt
```

### If MLflow UI doesn't start:
```bash
python -m mlflow ui
```

## Docker (Alternative Method)

```bash
# From the root directory (d:/app/flagship)
docker-compose up
```

This will start:
- Backend on port 8000
- Frontend on port 3000
- PostgreSQL on port 5432
