"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PomodoroSettings {
    workMinutes: number;
    shortBreakMinutes: number;
    longBreakMinutes: number;
    sessionsUntilLongBreak: number;
}

type PomodoroPhase = "work" | "shortBreak" | "longBreak" | "idle";

export default function PomodoroPage() {
    const [settings, setSettings] = useState<PomodoroSettings>({
        workMinutes: 25,
        shortBreakMinutes: 5,
        longBreakMinutes: 15,
        sessionsUntilLongBreak: 4
    });

    const [phase, setPhase] = useState<PomodoroPhase>("idle");
    const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [sessionsCompleted, setSessions] = useState(0);
    const [totalFocusTime, setTotalFocusTime] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const phaseConfig = {
        work: {
            label: "Focus Time",
            color: "from-red-500 to-orange-500",
            bgColor: "bg-red-500/10",
            duration: settings.workMinutes * 60
        },
        shortBreak: {
            label: "Short Break",
            color: "from-emerald-500 to-teal-500",
            bgColor: "bg-emerald-500/10",
            duration: settings.shortBreakMinutes * 60
        },
        longBreak: {
            label: "Long Break",
            color: "from-blue-500 to-purple-500",
            bgColor: "bg-blue-500/10",
            duration: settings.longBreakMinutes * 60
        },
        idle: {
            label: "Ready",
            color: "from-neutral-500 to-neutral-600",
            bgColor: "bg-neutral-500/10",
            duration: settings.workMinutes * 60
        }
    };

    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handlePhaseComplete();
                    return 0;
                }

                // Track focus time
                if (phase === "work") {
                    setTotalFocusTime(t => t + 1);
                }

                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, phase]);

    const handlePhaseComplete = async () => {
        setIsActive(false);

        if (phase === "work") {
            const newSessions = sessionsCompleted + 1;
            setSessions(newSessions);

            // Award XP for completing a pomodoro
            try {
                await fetch(`${API_URL}/gamification/add-xp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: 25,
                        source: "pomodoro",
                        description: "Completed a focus session"
                    })
                });
            } catch (e) {
                console.error("Failed to award XP:", e);
            }

            // Determine next break type
            if (newSessions % settings.sessionsUntilLongBreak === 0) {
                setPhase("longBreak");
                setTimeLeft(settings.longBreakMinutes * 60);
            } else {
                setPhase("shortBreak");
                setTimeLeft(settings.shortBreakMinutes * 60);
            }
        } else {
            setPhase("work");
            setTimeLeft(settings.workMinutes * 60);
        }

        // Play notification sound
        if (typeof window !== "undefined" && "Notification" in window) {
            new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleicJRafS3LN0KxdXptbbpSwGCk+jz9yrPAoJM5vO2L5uMSFSl8bVnkIZGz2WxtCjTR4IP4q7yaRXKBgvhrTAomowKi1+rruib0A0N3umsqqdZ0g0L3GhsKSOb1Y+OXaepsZ+TkZBP3KaoIJUUlJVfZyXdlNYY2iDnIxfTWNyd5CGel5YdH97goh+dXBvZGx1eIF+fH11bWZqbnZ9fn16cWpoa3J5fX97dnBpZ2xze39+endwamhtdHp+f3x3cGtpbHR5fn98d3BramxzeH5/fHdwamptdHl+f3x2cGpqbXR5fn98dnBqam10eX5/fXZwamptdHl+f3x2cGpqbXR5fn98dnBqam10eX5/fHZwamptdHl+f3x2cGpqbXR5fn98dnBqam10eX5/fHZwamptc3l+f3x2cGpqbXR5fn98dnBqam10eX5/fHZwamptdHl+").play();
        }
    };

    const start = () => {
        if (phase === "idle") {
            setPhase("work");
            setTimeLeft(settings.workMinutes * 60);
        }
        setIsActive(true);
    };

    const pause = () => setIsActive(false);

    const reset = () => {
        setIsActive(false);
        setPhase("idle");
        setTimeLeft(settings.workMinutes * 60);
    };

    const skipPhase = () => {
        handlePhaseComplete();
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const progress = 1 - timeLeft / phaseConfig[phase].duration;

    return (
        <div className={cn(
            "min-h-screen text-white pb-32 transition-colors duration-500",
            phaseConfig[phase].bgColor,
            "bg-neutral-950"
        )}>
            {/* Hero */}
            <div className="relative py-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-4 border border-red-500/20">
                        <Coffee className="text-red-400" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Pomodoro</h1>
                    <p className="text-neutral-400">{phaseConfig[phase].label}</p>
                </motion.div>
            </div>

            <div className="flex flex-col items-center px-6">
                {/* Timer circle */}
                <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* Background circle */}
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className="text-neutral-800"
                        />
                        <motion.circle
                            cx="50%"
                            cy="50%"
                            r="45%"
                            fill="none"
                            stroke="url(#gradient)"
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 45}`}
                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress)}`}
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" className={phase === "work" ? "text-red-500" : phase === "shortBreak" ? "text-emerald-500" : "text-blue-500"} stopColor="currentColor" />
                                <stop offset="100%" className={phase === "work" ? "text-orange-500" : phase === "shortBreak" ? "text-teal-500" : "text-purple-500"} stopColor="currentColor" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Time display */}
                    <div className="text-center">
                        <div className="text-6xl font-mono font-bold tracking-tight">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="text-sm text-neutral-400 mt-2">
                            Session {sessionsCompleted + 1}
                        </div>
                    </div>
                </div>

                {/* Session indicators */}
                <div className="flex gap-2 mt-6">
                    {Array.from({ length: settings.sessionsUntilLongBreak }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-3 h-3 rounded-full transition-colors",
                                i < sessionsCompleted % settings.sessionsUntilLongBreak
                                    ? "bg-red-500"
                                    : "bg-neutral-700"
                            )}
                        />
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4 mt-8">
                    {!isActive ? (
                        <button
                            onClick={start}
                            className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-400 transition-colors"
                        >
                            <Play className="w-8 h-8 text-white ml-1" />
                        </button>
                    ) : (
                        <button
                            onClick={pause}
                            className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center hover:bg-amber-400 transition-colors"
                        >
                            <Pause className="w-8 h-8 text-white" />
                        </button>
                    )}

                    <button
                        onClick={reset}
                        className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>

                {/* Skip button */}
                {phase !== "idle" && (
                    <button
                        onClick={skipPhase}
                        className="mt-4 text-sm text-neutral-500 hover:text-white transition-colors"
                    >
                        Skip {phase === "work" ? "to break" : "break"}
                    </button>
                )}

                {/* Stats */}
                <div className="mt-10 grid grid-cols-2 gap-6 text-center">
                    <div>
                        <div className="text-3xl font-bold">{sessionsCompleted}</div>
                        <div className="text-sm text-neutral-400">Sessions</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold">
                            {Math.floor(totalFocusTime / 60)}m
                        </div>
                        <div className="text-sm text-neutral-400">Focus Time</div>
                    </div>
                </div>

                {/* XP reward info */}
                <div className="mt-8 px-4 py-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-center">
                    <span className="text-purple-400">+25 XP</span>
                    <span className="text-neutral-400 text-sm ml-2">per completed session</span>
                </div>
            </div>
        </div>
    );
}
