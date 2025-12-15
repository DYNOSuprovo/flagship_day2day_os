"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Flame, Sparkles, Clock, ChevronRight, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "@/components/Confetti";

interface Challenge {
    id: string;
    name: string;
    description: string;
    icon: string;
    target: number;
    progress: number;
    percentage: number;
    completed: boolean;
    xp_reward: number;
    color: string;
    category: string;
}

export default function ChallengesPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [weekInfo, setWeekInfo] = useState({ start: "", end: "", totalXp: 0 });
    const [showConfetti, setShowConfetti] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await fetch(`${API_URL}/challenges/weekly`);
            const data = await res.json();
            setChallenges(data.challenges || []);
            setWeekInfo({
                start: data.week_start,
                end: data.week_end,
                totalXp: data.total_xp_available
            });
        } catch (error) {
            console.error("Failed to fetch challenges:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
            indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", bar: "bg-indigo-500" },
            orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", bar: "bg-orange-500" },
            emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500" },
            purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400", bar: "bg-purple-500" },
            amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", bar: "bg-amber-500" },
        };
        return colors[color] || colors.indigo;
    };

    const completedCount = challenges.filter(c => c.completed).length;
    const totalXpEarned = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.xp_reward, 0);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            <Confetti trigger={showConfetti} />

            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-6 border border-indigo-500/20">
                        <Trophy className="text-indigo-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Weekly Challenges</h1>
                    <p className="text-neutral-400 mb-6">Complete challenges to earn bonus XP</p>

                    {/* Stats */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-400" />
                            <span className="text-neutral-300">{completedCount}/{challenges.length} Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span className="text-neutral-300">{weekInfo.totalXp} XP Available</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Challenges Grid */}
            <div className="container mx-auto px-6 max-w-2xl">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                            <Sparkles className="w-8 h-8 text-indigo-400" />
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {challenges.map((challenge, idx) => {
                            const colors = getColorClasses(challenge.color);

                            return (
                                <motion.div
                                    key={challenge.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={cn(
                                        "relative overflow-hidden rounded-2xl border p-6 transition-all",
                                        challenge.completed
                                            ? "bg-emerald-500/5 border-emerald-500/30"
                                            : `${colors.bg} ${colors.border}`
                                    )}
                                >
                                    {/* Completed Badge */}
                                    {challenge.completed && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            <Star className="w-3 h-3" fill="currentColor" />
                                            Complete
                                        </div>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center text-2xl",
                                            challenge.completed ? "bg-emerald-500/20" : colors.bg
                                        )}>
                                            {challenge.icon}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{challenge.name}</h3>
                                                <span className={cn(
                                                    "text-xs px-2 py-0.5 rounded-full",
                                                    colors.bg, colors.text
                                                )}>
                                                    +{challenge.xp_reward} XP
                                                </span>
                                            </div>

                                            <p className="text-neutral-400 text-sm mb-4">{challenge.description}</p>

                                            {/* Progress Bar */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-500">Progress</span>
                                                    <span className={challenge.completed ? "text-emerald-400" : colors.text}>
                                                        {challenge.progress}/{challenge.target}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${challenge.percentage}%` }}
                                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                                        className={cn(
                                                            "h-full rounded-full",
                                                            challenge.completed ? "bg-emerald-500" : colors.bar
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Card */}
                {!isLoading && completedCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6 text-center"
                    >
                        <div className="text-3xl mb-2">🏆</div>
                        <h3 className="text-xl font-bold mb-1">
                            {completedCount === challenges.length ? "All Challenges Complete!" : "Great Progress!"}
                        </h3>
                        <p className="text-neutral-400">
                            You&apos;ve earned <span className="text-yellow-400 font-bold">{totalXpEarned} XP</span> from challenges this week
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
