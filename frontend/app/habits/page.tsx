"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Plus, X, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Habit {
    id: number;
    name: string;
    description: string;
    icon: string;
    color: string;
    streak: number;
    completed: boolean;
}

export default function HabitsPage() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHabitName, setNewHabitName] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const fetchHabits = async () => {
        try {
            const res = await fetch(`${API_URL}/habits/`);
            const data = await res.json();
            setHabits(data.habits || []);
        } catch (error) {
            console.error("Failed to fetch habits:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/habits/stats`);
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    useEffect(() => {
        fetchHabits();
        fetchStats();
    }, []);

    const toggleHabit = async (id: number) => {
        setHabits(habits.map(h =>
            h.id === id ? { ...h, completed: !h.completed } : h
        ));

        try {
            const res = await fetch(`${API_URL}/habits/${id}/toggle`, { method: "POST" });
            const data = await res.json();
            setHabits(habits.map(h =>
                h.id === id ? { ...h, completed: data.completed, streak: data.streak } : h
            ));
            fetchStats();
        } catch (error) {
            console.error("Failed to toggle habit:", error);
            fetchHabits();
        }
    };

    const addHabit = async () => {
        if (!newHabitName.trim()) return;

        setIsAdding(true);
        try {
            const res = await fetch(`${API_URL}/habits/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newHabitName })
            });
            const data = await res.json();

            if (data.success) {
                setHabits([data.habit, ...habits]);
                setNewHabitName("");
                setShowAddModal(false);
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to add habit:", error);
        } finally {
            setIsAdding(false);
        }
    };

    const completedCount = habits.filter(h => h.completed).length;
    const totalCount = habits.length;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 pb-32 flex flex-col items-center relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl mt-12"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-6 border border-orange-500/20">
                        <Flame className="text-orange-500" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Habit Forge</h1>
                    <p className="text-neutral-400">Consistency is the key to mastery.</p>
                </div>

                {/* Progress Ring */}
                <div className="flex justify-center mb-8">
                    <div className="relative w-32 h-32">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                                cx="64" cy="64" r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-neutral-800"
                            />
                            <circle
                                cx="64" cy="64" r="56"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeDasharray={`${2 * Math.PI * 56}`}
                                strokeDashoffset={`${2 * Math.PI * 56 * (1 - (totalCount > 0 ? completedCount / totalCount : 0))}`}
                                strokeLinecap="round"
                                className="text-orange-500 transition-all duration-500"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold">{completedCount}/{totalCount}</span>
                            <span className="text-xs text-neutral-500">Today</span>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                {stats && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-neutral-900/50 rounded-xl p-4 text-center border border-neutral-800">
                            <div className="text-2xl font-bold text-orange-400">{stats.completed_this_week}</div>
                            <div className="text-xs text-neutral-500">This Week</div>
                        </div>
                        <div className="bg-neutral-900/50 rounded-xl p-4 text-center border border-neutral-800">
                            <div className="text-2xl font-bold text-emerald-400">{stats.completion_rate}%</div>
                            <div className="text-xs text-neutral-500">Today&apos;s Rate</div>
                        </div>
                        <div className="bg-neutral-900/50 rounded-xl p-4 text-center border border-neutral-800">
                            <div className="text-2xl font-bold text-blue-400">{stats.best_streak}</div>
                            <div className="text-xs text-neutral-500">Best Streak</div>
                        </div>
                    </div>
                )}

                {/* Habits Grid */}
                <div className="grid gap-4 mb-12">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-500" />
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No habits yet. Start by adding one!</p>
                        </div>
                    ) : (
                        habits.map((habit) => (
                            <motion.div
                                key={habit.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    "group flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer",
                                    habit.completed
                                        ? "bg-orange-500/10 border-orange-500/50"
                                        : "bg-neutral-900 border-white/5 hover:border-white/10"
                                )}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border transition-colors",
                                        habit.completed
                                            ? "bg-orange-500 border-orange-500 text-white"
                                            : "border-neutral-700 group-hover:border-neutral-500"
                                    )}>
                                        {habit.completed ? <Check size={18} /> : <span className="text-lg">{habit.icon}</span>}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-medium text-lg", habit.completed && "text-orange-100")}>{habit.name}</h3>
                                        <p className="text-sm text-neutral-500 flex items-center gap-1">
                                            <Flame size={12} className={habit.streak > 0 ? "text-orange-500" : "text-neutral-600"} />
                                            {habit.streak} day streak
                                        </p>
                                    </div>
                                </div>
                                {habit.streak >= 7 && (
                                    <div className="px-2 py-1 bg-orange-500/20 rounded-full text-xs text-orange-400 font-medium">
                                        🔥 On Fire!
                                    </div>
                                )}
                            </motion.div>
                        ))
                    )}

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 p-6 rounded-2xl border border-dashed border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add New Habit</span>
                    </button>
                </div>

                {/* Heatmap Placeholder */}
                <div className="bg-neutral-900/50 rounded-3xl p-8 border border-white/5">
                    <h3 className="text-lg font-medium mb-6">Consistency Map</h3>
                    <div className="grid grid-cols-12 gap-2">
                        {Array.from({ length: 84 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "aspect-square rounded-md transition-colors",
                                    Math.random() > 0.7 ? "bg-orange-500/80" :
                                        Math.random() > 0.4 ? "bg-orange-500/40" : "bg-neutral-800"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Add Habit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl max-w-md w-full"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">New Habit</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={newHabitName}
                                onChange={e => setNewHabitName(e.target.value)}
                                placeholder="e.g., Morning Meditation"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 mb-4"
                                autoFocus
                                onKeyDown={e => e.key === "Enter" && addHabit()}
                            />

                            <button
                                onClick={addHabit}
                                disabled={isAdding || !newHabitName.trim()}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 disabled:text-neutral-500 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
                                {isAdding ? "Adding..." : "Add Habit"}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
