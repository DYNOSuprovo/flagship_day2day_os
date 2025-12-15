"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface LifeScoreData {
    total_score: number;
    status: string;
    status_color: string;
    trend: string;
    breakdown: Record<string, { score: number; label: string; icon: string; color: string }>;
}

export default function LifeScoreWidget() {
    const [data, setData] = useState<LifeScoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLifeScore();
    }, []);

    const fetchLifeScore = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const res = await fetch(`${API_URL}/life/life-score`);
            const result = await res.json();
            setData(result);
        } catch (error) {
            console.error("Failed to fetch life score:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (color: string) => {
        const colors: Record<string, string> = {
            emerald: "text-emerald-400",
            blue: "text-blue-400",
            yellow: "text-yellow-400",
            red: "text-red-400"
        };
        return colors[color] || "text-white";
    };

    const getGradient = (score: number) => {
        if (score >= 80) return "from-emerald-500 to-teal-500";
        if (score >= 60) return "from-blue-500 to-cyan-500";
        if (score >= 40) return "from-yellow-500 to-orange-500";
        return "from-red-500 to-rose-500";
    };

    const TrendIcon = data?.trend === "up" ? TrendingUp : data?.trend === "down" ? TrendingDown : Minus;

    if (isLoading) {
        return (
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-slate-800 rounded-xl" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-md border border-slate-700 rounded-2xl p-6"
        >
            {/* Glow Effect */}
            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${getGradient(data.total_score)} opacity-20 blur-3xl rounded-full`} />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-sm font-medium text-slate-400 mb-1">Life Score</h3>
                        <div className="flex items-baseline gap-2">
                            <motion.span
                                key={data.total_score}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-4xl font-bold text-white"
                            >
                                {data.total_score}
                            </motion.span>
                            <span className="text-slate-500">/100</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className={`flex items-center gap-1 ${getStatusColor(data.status_color)}`}>
                            <TrendIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">{data.status}</span>
                        </div>
                    </div>
                </div>

                {/* Progress Ring */}
                <div className="relative w-24 h-24 mx-auto my-4">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="transparent"
                            className="text-slate-800"
                        />
                        <motion.circle
                            cx="48" cy="48" r="40"
                            stroke="url(#lifeScoreGradient)"
                            strokeWidth="6"
                            fill="transparent"
                            strokeLinecap="round"
                            initial={{ strokeDasharray: `${2 * Math.PI * 40}`, strokeDashoffset: `${2 * Math.PI * 40}` }}
                            animate={{ strokeDashoffset: `${2 * Math.PI * 40 * (1 - data.total_score / 100)}` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="lifeScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#8b5cf6" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-4 gap-2 mt-4">
                    {Object.entries(data.breakdown).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <div className="text-lg mb-1">{value.icon}</div>
                            <div className="text-xs font-medium text-white">{value.score}</div>
                            <div className="text-[10px] text-slate-500">{value.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
