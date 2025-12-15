import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path("app.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with tables."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Transactions Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL
    )
    ''')

    # Activities Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT,
        timestamp TEXT NOT NULL,
        metadata TEXT
    )
    ''')

    # Meals Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        calories INTEGER,
        protein INTEGER,
        carbs INTEGER,
        fat INTEGER,
        image_path TEXT,
        date TEXT NOT NULL
    )
    ''')

    # User Stats Table (Gamification)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak_current INTEGER DEFAULT 0,
        streak_longest INTEGER DEFAULT 0,
        last_activity_date TEXT
    )
    ''')

    # Mood Logs Table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS mood_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mood TEXT NOT NULL,
        intensity INTEGER DEFAULT 5,
        note TEXT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
    ''')

    # User Profile Table (Onboarding data)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT,
        archetype TEXT,
        baseline_stress INTEGER DEFAULT 50,
        baseline_energy INTEGER DEFAULT 50,
        baseline_wealth INTEGER DEFAULT 50,
        onboarding_completed INTEGER DEFAULT 0
    )
    ''')
    
    # Initialize user stats if not exists
    cursor.execute('INSERT OR IGNORE INTO user_stats (id, xp, level) VALUES (1, 0, 1)')
    # Initialize user profile if not exists
    cursor.execute('INSERT OR IGNORE INTO user_profile (id, onboarding_completed) VALUES (1, 0)')

    conn.commit()
    conn.close()
    print("Database initialized successfully.")

# Run initialization on import
init_db()
