"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Sparkles, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "@/components/Confetti";

interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    xp: number;
    unlocked: boolean;
    unlocked_at?: string;
}

export default function AchievementsPage() {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ unlocked: 0, total: 0, percentage: 0 });
    const [showConfetti, setShowConfetti] = useState(false);
    const [filter, setFilter] = useState<string>("all");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchAchievements();
        checkForNew();
    }, []);

    const fetchAchievements = async () => {
        try {
            const res = await fetch(`${API_URL}/achievements/`);
            const data = await res.json();
            setAchievements(data.achievements || []);
            setStats({
                unlocked: data.unlocked_count,
                total: data.total_count,
                percentage: data.completion_percentage
            });
        } catch (error) {
            console.error("Failed to fetch achievements:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const checkForNew = async () => {
        try {
            const res = await fetch(`${API_URL}/achievements/check`);
            const data = await res.json();
            if (data.newly_unlocked?.length > 0) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
                fetchAchievements();
            }
        } catch (error) {
            console.error("Failed to check achievements:", error);
        }
    };

    const categories = ["all", ...new Set(achievements.map(a => a.category))];

    const filteredAchievements = filter === "all"
        ? achievements
        : achievements.filter(a => a.category === filter);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            habits: "orange",
            focus: "indigo",
            diet: "emerald",
            progress: "purple",
            special: "yellow"
        };
        return colors[category] || "slate";
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            <Confetti trigger={showConfetti} particleCount={100} />

            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/10 mb-6 border border-yellow-500/20">
                        <Trophy className="text-yellow-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Achievements</h1>
                    <p className="text-neutral-400 mb-8">Collect badges and unlock rewards</p>

                    {/* Progress */}
                    <div className="max-w-xs mx-auto">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-neutral-400">Progress</span>
                            <span className="text-yellow-400 font-medium">{stats.unlocked}/{stats.total}</span>
                        </div>
                        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-neutral-500 mt-2">{stats.percentage}% Complete</p>
                    </div>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-4xl">
                {/* Category Filter */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={cn(
                                "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                                filter === cat
                                    ? "bg-yellow-500 text-black"
                                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                            )}
                        >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Achievements Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Sparkles className="w-8 h-8 animate-pulse text-yellow-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredAchievements.map((ach, idx) => {
                            const color = getCategoryColor(ach.category);

                            return (
                                <motion.div
                                    key={ach.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "relative p-5 rounded-2xl border transition-all",
                                        ach.unlocked
                                            ? `bg-${color}-500/10 border-${color}-500/30`
                                            : "bg-neutral-900/50 border-neutral-800 opacity-60"
                                    )}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
                                            ach.unlocked
                                                ? `bg-${color}-500/20`
                                                : "bg-neutral-800"
                                        )}>
                                            {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-neutral-600" />}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={cn(
                                                    "font-bold",
                                                    ach.unlocked ? "text-white" : "text-neutral-500"
                                                )}>
                                                    {ach.name}
                                                </h3>
                                                {ach.unlocked && (
                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                )}
                                            </div>
                                            <p className="text-sm text-neutral-500 mb-2">{ach.description}</p>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full",
                                                    `bg-${color}-500/20 text-${color}-400`
                                                )}>
                                                    {ach.category}
                                                </span>
                                                {ach.xp > 0 && (
                                                    <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        +{ach.xp} XP
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {ach.unlocked && ach.unlocked_at && (
                                        <div className="absolute top-3 right-3 text-[10px] text-neutral-500">
                                            {new Date(ach.unlocked_at).toLocaleDateString()}
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
