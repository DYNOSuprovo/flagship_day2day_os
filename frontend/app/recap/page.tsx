"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Sparkles,
    Trophy,
    Flame,
    Utensils,
    Target,
    TrendingUp,
    Calendar,
    ChevronRight,
    Star
} from "lucide-react";
import Link from "next/link";

interface RecapData {
    date: string;
    day_of_week: string;
    life_score: {
        total_score: number;
        status: string;
        status_color: string;
        breakdown: Record<string, any>;
    };
    highlights: Array<{ type: string; text: string; icon: string }>;
    stats: {
        diet?: { meals_logged: number; total_calories: number };
        habits?: { completed: number; total: number; rate: number };
        progress?: { level: number; xp: number; xp_today: number };
    };
    message: string;
}

export default function RecapPage() {
    const [recap, setRecap] = useState<RecapData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRecap();
    }, []);

    const fetchRecap = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/life/daily-recap`);
            const data = await res.json();
            setRecap(data);
        } catch (error) {
            console.error("Failed to fetch recap:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-teal-500";
        if (score >= 60) return "from-blue-500 to-cyan-500";
        if (score >= 40) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-rose-500";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Sparkles className="w-8 h-8 text-purple-500" />
                </motion.div>
            </div>
        );
    }

    if (!recap) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
                <p>Failed to load recap</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-lg mx-auto"
                >
                    <div className="flex items-center justify-center gap-2 text-purple-400 mb-4">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{recap.day_of_week}, {recap.date}</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Daily Recap</h1>
                    <p className="text-neutral-400 mb-8">Your journey today</p>

                    {/* Life Score Circle */}
                    <div className="relative w-48 h-48 mx-auto mb-8">
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="96" cy="96" r="88"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-neutral-800"
                            />
                            <circle
                                cx="96" cy="96" r="88"
                                stroke="url(#scoreGradient)"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 88}`}
                                strokeDashoffset={`${2 * Math.PI * 88 * (1 - recap.life_score.total_score / 100)}`}
                                strokeLinecap="round"
                                className="transition-all duration-1000"
                            />
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="text-5xl font-bold"
                            >
                                {recap.life_score.total_score}
                            </motion.span>
                            <span className={`text-sm font-medium text-${recap.life_score.status_color}-400`}>
                                {recap.life_score.status}
                            </span>
                        </div>
                    </div>

                    <p className="text-lg text-neutral-300">{recap.message}</p>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="container mx-auto px-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 gap-4 mb-8"
                >
                    {/* Diet */}
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-emerald-400 mb-3">
                            <Utensils className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Nutrition</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">{recap.stats.diet?.meals_logged || 0}</div>
                        <div className="text-sm text-neutral-500">meals logged</div>
                        <div className="text-xs text-neutral-600 mt-1">
                            {recap.stats.diet?.total_calories || 0} calories
                        </div>
                    </div>

                    {/* Habits */}
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-orange-400 mb-3">
                            <Flame className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Habits</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                            {recap.stats.habits?.completed || 0}/{recap.stats.habits?.total || 0}
                        </div>
                        <div className="text-sm text-neutral-500">completed</div>
                        <div className="text-xs text-neutral-600 mt-1">
                            {recap.stats.habits?.rate || 0}% success rate
                        </div>
                    </div>

                    {/* XP */}
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-purple-400 mb-3">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">+{recap.stats.progress?.xp_today || 0}</div>
                        <div className="text-sm text-neutral-500">XP earned</div>
                        <div className="text-xs text-neutral-600 mt-1">
                            Level {recap.stats.progress?.level || 1}
                        </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-cyan-400 mb-3">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Balance</span>
                        </div>
                        <div className="space-y-2">
                            {Object.entries(recap.life_score.breakdown).map(([key, value]: [string, any]) => (
                                <div key={key} className="flex items-center justify-between text-xs">
                                    <span className="text-neutral-400">{value.icon} {value.label}</span>
                                    <span className="font-medium">{value.score}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Highlights */}
                {recap.highlights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Highlights
                        </h3>
                        <div className="space-y-3">
                            {recap.highlights.map((highlight, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4"
                                >
                                    <span className="text-2xl">{highlight.icon}</span>
                                    <span className="font-medium">{highlight.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition-colors"
                    >
                        <span>Continue to Dashboard</span>
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
