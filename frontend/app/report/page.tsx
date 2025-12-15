"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Flame,
    Trophy,
    Sparkles,
    Target,
    TrendingUp,
    Utensils,
    ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ReportData {
    period: { start: string; end: string; week_number: number };
    habits: { completed: number; total: number; rate: number; best_day: string | null };
    xp: { earned: number; level_gained: boolean; end_level: number };
    meals: { logged: number; avg_calories: number };
    challenges: { completed: number; in_progress: number };
    achievements: { unlocked: string[] };
    life_score: { average: number; trend: string };
    highlights: { icon: string; text: string }[];
    areas_to_improve: { icon: string; text: string }[];
}

export default function WeeklyReportPage() {
    const [report, setReport] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        try {
            const res = await fetch(`${API_URL}/report/weekly`);
            const data = await res.json();
            setReport(data);
        } catch (error) {
            console.error("Failed to fetch report:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <Calendar className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>
        );
    }

    if (!report) return null;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-6 border border-cyan-500/20">
                        <Calendar className="text-cyan-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Weekly Report</h1>
                    <p className="text-neutral-400 mb-2">Week {report.period.week_number}</p>
                    <p className="text-sm text-neutral-500">
                        {formatDate(report.period.start)} - {formatDate(report.period.end)}
                    </p>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-2xl">
                {/* Life Score */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl p-8 border border-cyan-500/20 mb-8 text-center"
                >
                    <p className="text-sm text-cyan-400 mb-2 uppercase tracking-wider">Average Life Score</p>
                    <div className="text-6xl font-bold mb-2">{report.life_score.average}</div>
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                        <TrendingUp className="w-4 h-4" />
                        <span>Trending {report.life_score.trend}</span>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 gap-4 mb-8"
                >
                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-orange-400 mb-2">
                            <Flame className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Habits</span>
                        </div>
                        <div className="text-3xl font-bold">{report.habits.rate}%</div>
                        <div className="text-xs text-neutral-500">
                            {report.habits.completed} of {report.habits.total} completed
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-purple-400 mb-2">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">XP Earned</span>
                        </div>
                        <div className="text-3xl font-bold">+{report.xp.earned}</div>
                        <div className="text-xs text-neutral-500">Level {report.xp.end_level}</div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            <Utensils className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Meals</span>
                        </div>
                        <div className="text-3xl font-bold">{report.meals.logged}</div>
                        <div className="text-xs text-neutral-500">
                            {report.meals.avg_calories > 0 ? `~${report.meals.avg_calories} cal/meal` : "logged"}
                        </div>
                    </div>

                    <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800">
                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                            <Trophy className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase">Challenges</span>
                        </div>
                        <div className="text-3xl font-bold">{report.challenges.completed}</div>
                        <div className="text-xs text-neutral-500">
                            {report.challenges.in_progress} in progress
                        </div>
                    </div>
                </motion.div>

                {/* Highlights */}
                {report.highlights.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span className="text-yellow-400">✨</span>
                            This Week&apos;s Highlights
                        </h3>
                        <div className="space-y-3">
                            {report.highlights.map((highlight, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
                                >
                                    <span className="text-xl">{highlight.icon}</span>
                                    <span className="text-sm">{highlight.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Areas to Improve */}
                {report.areas_to_improve.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-8"
                    >
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <span className="text-blue-400">💡</span>
                            Focus Areas
                        </h3>
                        <div className="space-y-3">
                            {report.areas_to_improve.map((area, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                                >
                                    <span className="text-xl">{area.icon}</span>
                                    <span className="text-sm">{area.text}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Achievements */}
                {report.achievements.unlocked.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mb-8"
                    >
                        <h3 className="font-bold mb-4">🏆 New Achievements</h3>
                        <div className="flex flex-wrap gap-2">
                            {report.achievements.unlocked.map((ach, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                                >
                                    {ach}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-center"
                >
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition-colors"
                    >
                        <span>Continue Your Journey</span>
                        <ChevronRight className="w-5 h-5" />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
