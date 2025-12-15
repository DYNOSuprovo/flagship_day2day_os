"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Minus,
    Flame,
    Activity,
    Calendar,
    Target,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DayData {
    date: string;
    day_name: string;
    habits_completed: number;
    xp_earned: number;
}

interface ModuleData {
    sessions: number;
    trend: string;
    percentage: number;
}

interface StatsData {
    weekly_activity: DayData[];
    module_usage: Record<string, ModuleData>;
    streaks: { current: number; longest: number; this_week: number };
    totals: { habits_this_week: number; xp_this_week: number; average_daily_habits: number; average_daily_xp: number };
    life_score_history: { date: string; score: number }[];
    insights: { type: string; icon: string; text: string }[];
}

export default function StatisticsPage() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [heatmap, setHeatmap] = useState<{ date: string; intensity: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchStats();
        fetchHeatmap();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/stats/overview`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHeatmap = async () => {
        try {
            const res = await fetch(`${API_URL}/stats/heatmap`);
            const data = await res.json();
            setHeatmap(data.heatmap || []);
        } catch (error) {
            console.error("Failed to fetch heatmap:", error);
        }
    };

    const getIntensityColor = (intensity: number) => {
        const colors = [
            "bg-neutral-800",
            "bg-emerald-900",
            "bg-emerald-700",
            "bg-emerald-500",
            "bg-emerald-400"
        ];
        return colors[intensity] || colors[0];
    };

    const getTrendIcon = (trend: string) => {
        if (trend === "up") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        if (trend === "down") return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-neutral-400" />;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <BarChart3 className="w-8 h-8 animate-pulse text-emerald-400" />
            </div>
        );
    }

    if (!stats) return null;

    const maxHabits = Math.max(...stats.weekly_activity.map(d => d.habits_completed), 1);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
                        <BarChart3 className="text-emerald-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Statistics</h1>
                    <p className="text-neutral-400">Deep insights into your progress</p>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl">
                {/* Key Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Flame className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Current Streak</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.streaks.current}</div>
                        <div className="text-xs text-neutral-500">days</div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">XP This Week</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.totals.xp_this_week}</div>
                        <div className="text-xs text-neutral-500">~{stats.totals.average_daily_xp}/day</div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Target className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Habits Done</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.totals.habits_this_week}</div>
                        <div className="text-xs text-neutral-500">this week</div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Best Streak</span>
                        </div>
                        <div className="text-3xl font-bold">{stats.streaks.longest}</div>
                        <div className="text-xs text-neutral-500">days ever</div>
                    </div>
                </motion.div>

                {/* Weekly Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800 mb-8"
                >
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        Weekly Activity
                    </h3>

                    <div className="flex items-end justify-between gap-2 h-40">
                        {stats.weekly_activity.map((day, idx) => (
                            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.habits_completed / maxHabits) * 100}%` }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg min-h-[4px]"
                                    style={{ maxHeight: "100%" }}
                                />
                                <span className="text-xs text-neutral-500">{day.day_name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Insights */}
                {stats.insights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3 mb-8"
                    >
                        <h3 className="text-lg font-bold mb-4">AI Insights</h3>
                        {stats.insights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-start gap-3 p-4 rounded-xl border",
                                    insight.type === "positive" && "bg-emerald-500/10 border-emerald-500/30",
                                    insight.type === "warning" && "bg-orange-500/10 border-orange-500/30",
                                    insight.type === "achievement" && "bg-yellow-500/10 border-yellow-500/30",
                                    insight.type === "info" && "bg-blue-500/10 border-blue-500/30"
                                )}
                            >
                                <span className="text-xl">{insight.icon}</span>
                                <p className="text-sm text-neutral-300">{insight.text}</p>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Activity Heatmap */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800 mb-8"
                >
                    <h3 className="text-lg font-bold mb-6">Activity Heatmap</h3>
                    <div className="grid grid-cols-12 gap-1">
                        {heatmap.map((day, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "aspect-square rounded-sm transition-colors",
                                    getIntensityColor(day.intensity)
                                )}
                                title={`${day.date}: ${day.intensity} activities`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 text-xs text-neutral-500">
                        <span>Less</span>
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className={cn("w-3 h-3 rounded-sm", getIntensityColor(i))} />
                        ))}
                        <span>More</span>
                    </div>
                </motion.div>

                {/* Module Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800"
                >
                    <h3 className="text-lg font-bold mb-6">Module Usage</h3>
                    <div className="space-y-4">
                        {Object.entries(stats.module_usage).map(([module, data]) => (
                            <div key={module} className="flex items-center gap-4">
                                <div className="w-20 text-sm font-medium capitalize">{module}</div>
                                <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${data.percentage}%` }}
                                        transition={{ duration: 0.5 }}
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-20">
                                    {getTrendIcon(data.trend)}
                                    <span className="text-sm text-neutral-400">{data.sessions}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
