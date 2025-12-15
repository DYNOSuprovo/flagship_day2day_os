"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Minus, RotateCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const GLASS_SIZE = 250; // ml per glass
const DAILY_GOAL = 2000; // ml (8 glasses)

export default function WaterTrackerPage() {
    const [intake, setIntake] = useState(0);
    const [goal, setGoal] = useState(DAILY_GOAL);
    const [history, setHistory] = useState<{ time: string; amount: number }[]>([]);

    useEffect(() => {
        // Load today's data
        const today = new Date().toDateString();
        const saved = localStorage.getItem(`water_${today}`);
        if (saved) {
            const data = JSON.parse(saved);
            setIntake(data.intake || 0);
            setHistory(data.history || []);
        }
    }, []);

    useEffect(() => {
        // Save data
        const today = new Date().toDateString();
        localStorage.setItem(`water_${today}`, JSON.stringify({ intake, history }));
    }, [intake, history]);

    const addWater = (amount: number) => {
        const newIntake = Math.max(0, intake + amount);
        setIntake(newIntake);

        if (amount > 0) {
            setHistory(prev => [...prev, {
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                amount
            }]);
        }
    };

    const reset = () => {
        setIntake(0);
        setHistory([]);
    };

    const progress = Math.min(1, intake / goal);
    const glasses = Math.floor(intake / GLASS_SIZE);
    const remaining = Math.max(0, goal - intake);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Animated water background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                        height: `${progress * 100}%`,
                        background: "linear-gradient(to top, rgba(34, 211, 238, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)",
                        borderRadius: "50% 50% 0 0",
                        transform: "scaleX(1.5)"
                    }}
                />
            </div>

            {/* Hero */}
            <div className="relative py-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 mb-4 border border-cyan-500/20">
                        <Droplets className="text-cyan-400" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Hydration</h1>
                    <p className="text-neutral-400">Stay hydrated, stay healthy</p>
                </motion.div>
            </div>

            <div className="flex flex-col items-center px-6">
                {/* Water glass visualization */}
                <div className="relative w-44 h-64 mb-8">
                    {/* Glass container */}
                    <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-b-3xl overflow-hidden">
                        {/* Water fill */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${progress * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-500 to-blue-400"
                            style={{
                                borderRadius: progress > 0.9 ? "0" : "50% 50% 0 0"
                            }}
                        >
                            {/* Wave animation */}
                            <motion.div
                                animate={{ x: [-10, 10, -10] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute top-0 left-0 right-0 h-4 bg-white/20"
                                style={{
                                    borderRadius: "50%",
                                    transform: "translateY(-50%)"
                                }}
                            />
                        </motion.div>

                        {/* Glass marks */}
                        {[25, 50, 75].map(percent => (
                            <div
                                key={percent}
                                className="absolute left-2 right-2 border-t border-white/10"
                                style={{ bottom: `${percent}%` }}
                            >
                                <span className="absolute -right-8 text-xs text-neutral-500 -translate-y-1/2">
                                    {(goal * percent) / 100}ml
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Glass rim */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-48 h-4 bg-neutral-800 rounded-full border-2 border-cyan-500/30" />
                </div>

                {/* Stats */}
                <div className="text-center mb-8">
                    <div className="text-5xl font-bold text-cyan-400">{intake}</div>
                    <div className="text-neutral-400">of {goal} ml</div>
                    <div className="mt-2 text-sm text-neutral-500">
                        {glasses} glass{glasses !== 1 ? "es" : ""} • {remaining}ml to go
                    </div>
                </div>

                {/* Quick add buttons */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => addWater(-GLASS_SIZE)}
                        className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    >
                        <Minus className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => addWater(GLASS_SIZE)}
                        className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg shadow-cyan-500/30"
                    >
                        <Plus className="w-10 h-10" />
                    </button>

                    <button
                        onClick={reset}
                        className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* Preset amounts */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {[100, 200, 350, 500].map(amount => (
                        <button
                            key={amount}
                            onClick={() => addWater(amount)}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-sm transition-colors"
                        >
                            +{amount}ml
                        </button>
                    ))}
                </div>

                {/* Progress ring */}
                <div className="relative w-40 h-40 mb-8">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-neutral-800"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="url(#waterGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                        />
                        <defs>
                            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#22D3EE" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-3xl font-bold">{Math.round(progress * 100)}%</div>
                        <div className="text-xs text-neutral-400">of daily goal</div>
                    </div>
                </div>

                {/* Today's log */}
                {history.length > 0 && (
                    <div className="w-full max-w-sm">
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-cyan-400" />
                            Today&apos;s Log
                        </h3>
                        <div className="space-y-2">
                            {history.slice(-5).reverse().map((entry, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between py-2 px-3 bg-neutral-900 rounded-lg"
                                >
                                    <span className="text-sm text-neutral-400">{entry.time}</span>
                                    <span className="text-cyan-400">+{entry.amount}ml</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
