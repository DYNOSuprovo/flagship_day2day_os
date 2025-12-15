# 🌟 Holistic AI Lifestyle Advisor

A comprehensive, AI-powered wellness platform that gamifies personal development across diet, emotional health, finance, habits, focus, and more.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [Project Structure](#project-structure)
6. [Backend Services](#backend-services)
7. [Frontend Pages](#frontend-pages)
8. [Components](#components)
9. [API Endpoints](#api-endpoints)
10. [Setup & Installation](#setup--installation)
11. [Environment Variables](#environment-variables)

---

## 🎯 Overview

The Holistic AI Lifestyle Advisor is a **full-stack wellness application** that combines:

- **AI-Powered Guidance**: Using Google Gemini LLM with RAG (Retrieval Augmented Generation)
- **Gamification**: XP system, levels, achievements, streaks, and leaderboards
- **Multi-Domain Wellness**: Diet, emotional health, finance, habits, focus, dreams
- **Interactive UI**: 3D avatars, visual effects, games, and immersive animations

### Key Highlights
- 🍽️ **Diet Planning**: AI-generated meal plans with Indian food database
- 🧘 **Emotional Wellness**: Bhagavad Gita-powered spiritual guidance
- 💰 **Finance Tracking**: Transaction analysis and budgeting
- ⏱️ **Focus & Productivity**: Pomodoro timer, focus sessions
- 🎮 **Gamification**: XP, levels, achievements, daily challenges
- 🏙️ **City Builder**: Build a virtual city based on habits
- 🌍 **Earth Journey**: 3D globe tracking wellness milestones

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Pages: 25+  │  Components: 50+  │  Visual Effects: 4+ │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            ↓ HTTP/REST                        │
├─────────────────────────────────────────────────────────────┤
│                      BACKEND (FastAPI)                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │ Services: Diet, Emotional, Finance, Habits, Gamification│ │
│  │ AI: LangChain + Gemini 2.0 + ChromaDB RAG               │ │
│  │ Storage: SQLite + ChromaDB Vector Store                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Wellness Modules

| Module | Description | AI-Powered |
|--------|-------------|------------|
| **Diet** | Meal planning, food scanning, nutrition tracking | ✅ Gemini + RAG |
| **Emotional** | Spiritual guidance from Bhagavad Gita | ✅ Gemini + RAG |
| **Finance** | Transaction categorization, budget analysis | ✅ Gemini |
| **Habits** | Habit tracking with streaks and XP rewards | ❌ |
| **Dreams** | Dream journaling with AI interpretation | ✅ Gemini |
| **Focus** | Timed focus sessions with XP rewards | ❌ |

### Gamification System

| Feature | Description |
|---------|-------------|
| **XP & Levels** | Earn XP for activities, level up to unlock rewards |
| **Achievements** | 18+ badges across multiple categories |
| **Daily Challenges** | Weekly rotating challenges with XP rewards |
| **Streaks** | Track consecutive days of activity |
| **Leaderboard** | Compete globally, weekly, or with friends |
| **Loot Boxes** | Mystery rewards for achievements |
| **Fortune Wheel** | Daily spin for bonus XP |

### Interactive Features

| Feature | Description |
|---------|-------------|
| **3D Avatar** | Animated male/female cyber-entities on home screen |
| **City Builder** | Build a city grid with habit-based buildings |
| **Earth Journey** | 3D rotating globe with milestone locations |
| **Arcade Games** | Flappy Bird, Snake, Memory match mini-games |
| **Voice Commands** | Hands-free navigation and control |
| **Virtual Pet** | Wellness-based digital companion |

### Visual Effects

- **Morphing Blobs**: Ambient background animation
- **Matrix Rain**: Falling characters effect
- **Starfield**: Parallax space background
- **Aurora Borealis**: Northern lights effect
- **Confetti**: Celebration particles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe JavaScript |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **Three.js / Canvas** | 3D graphics and effects |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Python web framework |
| **LangChain** | LLM orchestration |
| **Google Gemini 2.0** | Large Language Model |
| **ChromaDB** | Vector database for RAG |
| **SQLite** | Persistent data storage |
| **Pydantic** | Data validation |

### AI/ML
| Technology | Purpose |
|------------|---------|
| **RAG Pipeline** | Retrieval Augmented Generation |
| **Embeddings** | Sentence-transformers for similarity |
| **Vision AI** | Food recognition from images |

---

## 📁 Project Structure

```
flagship/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── database.py             # SQLite setup
│   ├── services/
│   │   ├── diet/               # Diet planning & food database
│   │   ├── emotional/          # Spiritual guidance AI
│   │   ├── finance/            # Transaction analysis
│   │   ├── habits/             # Habit tracking
│   │   ├── dreams/             # Dream journaling
│   │   ├── gamification/       # XP, levels, achievements
│   │   ├── dashboard/          # Life score, statistics
│   │   ├── user/               # Profile, goals, friends
│   │   ├── vision/             # Image analysis
│   │   ├── ml_predictions/     # ML model predictions
│   │   └── orchestrator/       # LangGraph agents
│   ├── chroma_db/              # Vector store data
│   └── data/                   # SQLite databases
│
├── frontend/
│   ├── app/                    # Next.js pages (25+)
│   │   ├── page.tsx            # Home page with 3D avatar
│   │   ├── dashboard/          # Main dashboard
│   │   ├── diet/               # Diet planning
│   │   ├── emotional/          # Gita AI chat
│   │   ├── finance/            # Finance tracker
│   │   ├── habits/             # Habit management
│   │   ├── focus/              # Focus timer
│   │   ├── dreams/             # Dream journal
│   │   ├── arcade/             # Mini-games
│   │   ├── city/               # City builder
│   │   ├── journey/            # 3D Earth globe
│   │   ├── friends/            # Social features
│   │   └── ... (15+ more)
│   └── components/             # Reusable components (50+)
│       ├── FloatingDock.tsx    # Navigation dock
│       ├── HomeAvatar.tsx      # 3D avatar
│       ├── GamificationWidget  # XP display
│       ├── VoiceCommands.tsx   # Speech recognition
│       ├── games/              # Mini-game components
│       └── ui/                 # Base UI components
│
├── data/
│   ├── indian_foods.json       # 500+ Indian food items
│   ├── bhagavad_gita_full.txt  # Scripture for RAG
│   └── sample_medical_report   # Medical report samples
│
└── docker-compose.yml          # Container orchestration
```

---

## 🔧 Backend Services

### 1. Diet Service (`/diet`)
- `GET /diet/plan` - Generate personalized meal plan
- `POST /diet/plan-rag` - AI-powered diet recommendations
- `POST /diet/log-meal` - Log consumed meals
- `GET /diet/logged-meals` - Get meal history
- `GET /diet/daily-summary` - Today's nutrition summary

### 2. Emotional Service (`/emotional`)
- `POST /emotional/guidance-rag` - Bhagavad Gita AI guidance
- `GET /emotional/guidance` - Quick spiritual tips

### 3. Finance Service (`/finance`)
- `POST /finance/analyze` - Analyze transaction text
- `GET /finance/transactions` - Transaction history
- `GET /finance/summary` - Financial summary

### 4. Habits Service (`/habits`)
- `GET /habits/` - List all habits
- `POST /habits/` - Create new habit
- `POST /habits/{id}/complete` - Mark habit complete
- `DELETE /habits/{id}` - Delete habit

### 5. Gamification Service (`/gamification`)
- `GET /gamification/status` - Current XP, level, streak
- `POST /gamification/award-xp` - Award XP points
- `GET /achievements/` - List all achievements
- `GET /challenges/` - Active challenges

### 6. Dashboard Service (`/dashboard`)
- `GET /dashboard/` - Aggregated dashboard data
- `GET /life-score/` - Unified wellness score
- `GET /statistics/` - Activity statistics
- `GET /nudges/` - Smart suggestions

### 7. User Service (`/user`)
- `GET /profile/` - User profile
- `GET /goals/` - User goals
- `GET /friends/` - Friend list
- `POST /friends/request` - Send friend request

---

## 📱 Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | 3D avatar, welcome screen, morphing blobs |
| `/dashboard` | Dashboard | Life score, quick stats, smart nudges |
| `/diet` | Diet | Meal planning, food scanning |
| `/emotional` | Emotional | Bhagavad Gita AI chat |
| `/finance` | Finance | Transaction analysis |
| `/habits` | Habits | Habit tracking with streaks |
| `/focus` | Focus | Timed focus sessions |
| `/dreams` | Dreams | Dream journaling |
| `/pomodoro` | Pomodoro | Pomodoro timer |
| `/water` | Water | Hydration tracking |
| `/breathing` | Breathing | Guided breathing exercises |
| `/arcade` | Arcade | Mini-games hub |
| `/city` | City Builder | Virtual city based on habits |
| `/journey` | Journey | 3D Earth with milestones |
| `/friends` | Friends | Social features |
| `/leaderboard` | Leaderboard | XP rankings |
| `/achievements` | Achievements | Badge collection |
| `/challenges` | Challenges | Weekly challenges |
| `/statistics` | Statistics | Activity analytics |
| `/profile` | Profile | User profile & stats |
| `/settings` | Settings | App preferences |
| `/capsule` | Time Capsule | Future message storage |
| `/recap` | Recap | Daily summary |
| `/report` | Report | Weekly wellness report |
| `/goals` | Goals | Goal setting |
| `/onboarding` | Onboarding | New user setup |

---

## 🧩 Components

### Core Components
| Component | Purpose |
|-----------|---------|
| `FloatingDock` | Bottom navigation with 25+ links |
| `HomeAvatar` | 3D animated avatar (Titan/Valkyire) |
| `WelcomeScreen` | Cinematic entry screen |
| `GamificationWidget` | XP bar and level display |
| `LifeScoreWidget` | Unified wellness score |
| `SmartNudges` | AI-powered suggestions |

### Visual Effects
| Component | Effect |
|-----------|--------|
| `MorphingBlobs` | Ambient animated blobs |
| `MatrixRain` | Falling green characters |
| `Starfield` | Parallax star background |
| `AuroraBorealis` | Northern lights |
| `Confetti` | Celebration particles |
| `StreakFire` | Fire animation for streaks |

### Interactive
| Component | Feature |
|-----------|---------|
| `VoiceCommands` | Speech recognition navigation |
| `KeyboardShortcuts` | Hotkey navigation |
| `FortuneWheel` | Daily spin reward |
| `LootBox` | Mystery reward animation |
| `VirtualPet` | Digital companion |
| `OracleInterface` | AI wisdom interface |

### Games
| Component | Game |
|-----------|------|
| `FlappyGame` | Flappy bird clone |
| `SnakeGame` | Classic snake game |
| `MemoryGame` | Card matching game |

---

## 🔐 Environment Variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY=your_google_gemini_api_key

# Optional
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.10+
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/flagship.git
cd flagship

# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Access the App
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| **Frontend Pages** | 25+ |
| **Backend Services** | 11 |
| **API Endpoints** | 40+ |
| **Components** | 50+ |
| **Visual Effects** | 5 |
| **Mini-Games** | 3 |
| **Achievements** | 18 |
| **Food Database Items** | 500+ |

---

## 🎨 Design Philosophy

1. **Gamification First**: Every action earns XP and contributes to progress
2. **Visual Delight**: Premium animations and effects throughout
3. **AI-Powered**: Smart suggestions and personalized guidance
4. **Holistic Wellness**: Mind, body, spirit, and finance integration
5. **Indian Context**: Indian food database and Bhagavad Gita wisdom

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

**Built with ❤️ for holistic wellness**
