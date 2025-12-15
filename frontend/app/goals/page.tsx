"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Target,
    Plus,
    Trash2,
    Calendar,
    TrendingUp,
    Check,
    X,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Goal {
    id: number;
    category: string;
    name: string;
    description?: string;
    target_value: number;
    current_value: number;
    unit: string;
    deadline?: string;
    progress: number;
    days_left?: number;
}

interface Template {
    category: string;
    name: string;
    unit: string;
    icon: string;
    suggested_target: number;
}

export default function GoalsPage() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [newGoal, setNewGoal] = useState({ target: 0, deadline: "" });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchGoals();
        fetchTemplates();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await fetch(`${API_URL}/goals/`);
            const data = await res.json();
            setGoals(data.goals || []);
        } catch (error) {
            console.error("Failed to fetch goals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await fetch(`${API_URL}/goals/templates`);
            const data = await res.json();
            setTemplates(data.templates || []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        }
    };

    const createGoal = async () => {
        if (!selectedTemplate) return;

        try {
            await fetch(`${API_URL}/goals/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    category: selectedTemplate.category,
                    name: selectedTemplate.name,
                    target_value: newGoal.target || selectedTemplate.suggested_target,
                    unit: selectedTemplate.unit,
                    deadline: newGoal.deadline || null
                })
            });
            setShowAddModal(false);
            setSelectedTemplate(null);
            setNewGoal({ target: 0, deadline: "" });
            fetchGoals();
        } catch (error) {
            console.error("Failed to create goal:", error);
        }
    };

    const updateProgress = async (goalId: number, newValue: number) => {
        try {
            await fetch(`${API_URL}/goals/${goalId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ current_value: newValue })
            });
            fetchGoals();
        } catch (error) {
            console.error("Failed to update goal:", error);
        }
    };

    const deleteGoal = async (goalId: number) => {
        try {
            await fetch(`${API_URL}/goals/${goalId}`, { method: "DELETE" });
            setGoals(goals.filter(g => g.id !== goalId));
        } catch (error) {
            console.error("Failed to delete goal:", error);
        }
    };

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            health: "emerald",
            finance: "blue",
            habits: "orange",
            focus: "indigo",
            mindfulness: "purple"
        };
        return colors[category] || "slate";
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-6 border border-indigo-500/20">
                        <Target className="text-indigo-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Goals</h1>
                    <p className="text-neutral-400 mb-6">Set, track, and achieve your targets</p>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        New Goal
                    </button>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-2xl">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Target className="w-8 h-8 animate-pulse text-indigo-400" />
                    </div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-4">🎯</div>
                        <p className="text-neutral-400">No active goals yet</p>
                        <p className="text-sm text-neutral-500">Create your first goal to get started!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {goals.map((goal, idx) => {
                            const color = getCategoryColor(goal.category);

                            return (
                                <motion.div
                                    key={goal.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={cn(
                                        "bg-neutral-900/50 rounded-2xl p-6 border border-neutral-800",
                                        "hover:border-neutral-700 transition-colors"
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{goal.name}</h3>
                                            <p className="text-sm text-neutral-500">{goal.category}</p>
                                        </div>
                                        <button
                                            onClick={() => deleteGoal(goal.id)}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-neutral-500 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-neutral-400">
                                                {goal.current_value} / {goal.target_value} {goal.unit}
                                            </span>
                                            <span className={`text-${color}-400 font-medium`}>
                                                {Math.round(goal.progress)}%
                                            </span>
                                        </div>
                                        <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${goal.progress}%` }}
                                                className={`h-full bg-${color}-500 rounded-full`}
                                            />
                                        </div>
                                    </div>

                                    {/* Quick Update */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                                            className="flex-1 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm font-medium transition-colors"
                                        >
                                            +1 {goal.unit}
                                        </button>
                                        {goal.days_left !== null && goal.days_left !== undefined && (
                                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                                <Calendar className="w-3 h-3" />
                                                {goal.days_left > 0 ? `${goal.days_left}d left` : "Due today"}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Goal Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">
                                    {selectedTemplate ? "Set Target" : "Choose Goal Type"}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedTemplate(null);
                                    }}
                                    className="p-2 hover:bg-neutral-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {!selectedTemplate ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {templates.map((template) => (
                                        <button
                                            key={template.name}
                                            onClick={() => {
                                                setSelectedTemplate(template);
                                                setNewGoal({ target: template.suggested_target, deadline: "" });
                                            }}
                                            className="p-4 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-left transition-colors"
                                        >
                                            <div className="text-2xl mb-2">{template.icon}</div>
                                            <div className="font-medium text-sm">{template.name}</div>
                                            <div className="text-xs text-neutral-500">{template.category}</div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <div className="text-4xl mb-2">{selectedTemplate.icon}</div>
                                        <div className="font-bold">{selectedTemplate.name}</div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-neutral-400 mb-2 block">Target</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={newGoal.target}
                                                onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                                                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            <span className="text-neutral-400">{selectedTemplate.unit}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-neutral-400 mb-2 block">Deadline (optional)</label>
                                        <input
                                            type="date"
                                            value={newGoal.deadline}
                                            onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setSelectedTemplate(null)}
                                            className="flex-1 py-3 bg-neutral-800 rounded-xl font-medium"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={createGoal}
                                            className="flex-1 py-3 bg-indigo-500 rounded-xl font-medium flex items-center justify-center gap-2"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Create Goal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
