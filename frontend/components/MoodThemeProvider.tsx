"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    background: string;
}

interface MoodTheme {
    name: string;
    colors: ThemeColors;
    particles: string[];
    description: string;
}

const MOOD_THEMES: Record<string, MoodTheme> = {
    thriving: {
        name: "Thriving",
        colors: {
            primary: "#10B981",
            secondary: "#34D399",
            accent: "#6EE7B7",
            glow: "rgba(16, 185, 129, 0.3)",
            background: "from-emerald-500/10 to-teal-500/10"
        },
        particles: ["✨", "🌟", "💫", "⭐"],
        description: "You're on fire! Keep it up!"
    },
    positive: {
        name: "Positive",
        colors: {
            primary: "#3B82F6",
            secondary: "#60A5FA",
            accent: "#93C5FD",
            glow: "rgba(59, 130, 246, 0.3)",
            background: "from-blue-500/10 to-indigo-500/10"
        },
        particles: ["💙", "🌊", "❄️"],
        description: "Great progress! Keep pushing!"
    },
    neutral: {
        name: "Balanced",
        colors: {
            primary: "#8B5CF6",
            secondary: "#A78BFA",
            accent: "#C4B5FD",
            glow: "rgba(139, 92, 246, 0.3)",
            background: "from-purple-500/10 to-violet-500/10"
        },
        particles: ["💜", "🔮"],
        description: "Steady and stable. Room to grow!"
    },
    warning: {
        name: "Needs Attention",
        colors: {
            primary: "#F59E0B",
            secondary: "#FBBF24",
            accent: "#FCD34D",
            glow: "rgba(245, 158, 11, 0.3)",
            background: "from-amber-500/10 to-orange-500/10"
        },
        particles: ["⚡", "🌙"],
        description: "Time to refocus. You've got this!"
    },
    low: {
        name: "Recovery Mode",
        colors: {
            primary: "#EF4444",
            secondary: "#F87171",
            accent: "#FCA5A5",
            glow: "rgba(239, 68, 68, 0.3)",
            background: "from-red-500/10 to-rose-500/10"
        },
        particles: ["❤️", "🌹"],
        description: "Be gentle with yourself. Tomorrow is new!"
    }
};

function getMoodFromScore(score: number): string {
    if (score >= 80) return "thriving";
    if (score >= 60) return "positive";
    if (score >= 40) return "neutral";
    if (score >= 20) return "warning";
    return "low";
}

interface MoodThemeContextType {
    theme: MoodTheme;
    mood: string;
    lifeScore: number;
    updateLifeScore: (score: number) => void;
}

const MoodThemeContext = createContext<MoodThemeContextType | null>(null);

export function MoodThemeProvider({ children }: { children: ReactNode }) {
    const [lifeScore, setLifeScore] = useState(50);
    const [mood, setMood] = useState("neutral");
    const [theme, setTheme] = useState(MOOD_THEMES.neutral);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        // Fetch life score
        fetchLifeScore();

        // Update periodically
        const interval = setInterval(fetchLifeScore, 60000); // Every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const newMood = getMoodFromScore(lifeScore);
        setMood(newMood);
        setTheme(MOOD_THEMES[newMood]);

        // Apply CSS variables
        document.documentElement.style.setProperty("--mood-primary", MOOD_THEMES[newMood].colors.primary);
        document.documentElement.style.setProperty("--mood-secondary", MOOD_THEMES[newMood].colors.secondary);
        document.documentElement.style.setProperty("--mood-accent", MOOD_THEMES[newMood].colors.accent);
        document.documentElement.style.setProperty("--mood-glow", MOOD_THEMES[newMood].colors.glow);
    }, [lifeScore]);

    const fetchLifeScore = async () => {
        try {
            const res = await fetch(`${API_URL}/life/life-score`);
            const data = await res.json();
            setLifeScore(data.score || 50);
        } catch (error) {
            console.error("Failed to fetch life score:", error);
        }
    };

    const updateLifeScore = (score: number) => {
        setLifeScore(score);
    };

    return (
        <MoodThemeContext.Provider value={{ theme, mood, lifeScore, updateLifeScore }}>
            {/* Dynamic background gradient */}
            <div
                className="fixed inset-0 pointer-events-none transition-colors duration-1000"
                style={{
                    background: `radial-gradient(circle at 50% 0%, ${theme.colors.glow} 0%, transparent 50%)`
                }}
            />
            {children}
        </MoodThemeContext.Provider>
    );
}

export function useMoodTheme() {
    const context = useContext(MoodThemeContext);
    if (!context) {
        throw new Error("useMoodTheme must be used within MoodThemeProvider");
    }
    return context;
}

export { MOOD_THEMES };
