"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Headphones, Coffee, CloudRain, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const AMBIENCE_TRACKS = [
    { id: "rain", name: "Rainy Day", icon: CloudRain, color: "text-blue-400", url: "https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-1253.mp3" },
    { id: "cafe", name: "Coffee Shop", icon: Coffee, color: "text-amber-600", url: "https://assets.mixkit.co/sfx/preview/mixkit-restaurant-crowd-talking-ambience-440.mp3" },
    { id: "white", name: "White Noise", icon: Wind, color: "text-gray-400", url: "https://assets.mixkit.co/sfx/preview/mixkit-white-noise-1256.mp3" },
];

export default function FocusPage() {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<"focus" | "break">("focus");
    const [activeAmbience, setActiveAmbience] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
            // Award XP for completing a focus session
            awardFocusXP();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const awardFocusXP = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            await fetch(`${API_URL}/gamification/add-xp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: mode === "focus" ? 50 : 10,
                    activity_type: "focus_complete",
                    description: `Completed ${mode === "focus" ? "25-min Focus" : "5-min Break"} session`
                })
            });
        } catch (error) {
            console.error("Failed to award XP:", error);
        }
    };


    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === "focus" ? 25 * 60 : 5 * 60);
    };

    const switchMode = (newMode: "focus" | "break") => {
        setMode(newMode);
        setIsActive(false);
        setTimeLeft(newMode === "focus" ? 25 * 60 : 5 * 60);
    };

    const toggleAmbience = (trackId: string) => {
        if (activeAmbience === trackId) {
            // Stop
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
            setActiveAmbience(null);
        } else {
            // Play new
            if (audioRef.current) {
                audioRef.current.pause();
            }
            const track = AMBIENCE_TRACKS.find((t) => t.id === trackId);
            if (track) {
                const audio = new Audio(track.url);
                audio.loop = true;
                audio.play();
                audioRef.current = audio;
                setActiveAmbience(trackId);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = mode === "focus"
        ? ((25 * 60 - timeLeft) / (25 * 60)) * 100
        : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-8 pb-32 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Glow */}
            <div className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000",
                mode === "focus" ? "bg-indigo-500" : "bg-emerald-500"
            )} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-2 tracking-tight">Focus Mode</h1>
                    <p className="text-neutral-400">Enter the flow state.</p>
                </div>

                {/* Timer Circle */}
                <div className="relative w-80 h-80 mx-auto mb-12 flex items-center justify-center">
                    {/* SVG Ring */}
                    <svg className="absolute w-full h-full -rotate-90">
                        <circle
                            cx="160"
                            cy="160"
                            r="150"
                            className="stroke-neutral-800 fill-none"
                            strokeWidth="8"
                        />
                        <circle
                            cx="160"
                            cy="160"
                            r="150"
                            className={cn(
                                "fill-none transition-all duration-1000",
                                mode === "focus" ? "stroke-indigo-500" : "stroke-emerald-500"
                            )}
                            strokeWidth="8"
                            strokeDasharray="942" // 2 * pi * 150
                            strokeDashoffset={942 - (942 * progress) / 100}
                            strokeLinecap="round"
                        />
                    </svg>

                    {/* Time Display */}
                    <div className="text-center z-10">
                        <div className="text-7xl font-mono font-bold tracking-tighter mb-2">
                            {formatTime(timeLeft)}
                        </div>
                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => switchMode("focus")}
                                className={cn("text-sm font-medium transition-colors", mode === "focus" ? "text-white" : "text-neutral-500")}
                            >
                                Focus
                            </button>
                            <button
                                onClick={() => switchMode("break")}
                                className={cn("text-sm font-medium transition-colors", mode === "break" ? "text-white" : "text-neutral-500")}
                            >
                                Break
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6 mb-16">
                    <button
                        onClick={toggleTimer}
                        className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95"
                    >
                        {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-16 h-16 rounded-full bg-neutral-800 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    >
                        <RotateCcw size={24} />
                    </button>
                </div>

                {/* Ambience Selector */}
                <div className="bg-neutral-900/50 backdrop-blur-md rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-neutral-400">
                        <Headphones size={18} />
                        <span className="text-sm font-medium">Soundscapes</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {AMBIENCE_TRACKS.map((track) => (
                            <button
                                key={track.id}
                                onClick={() => toggleAmbience(track.id)}
                                className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-xl transition-all border",
                                    activeAmbience === track.id
                                        ? "bg-neutral-800 border-indigo-500/50"
                                        : "bg-neutral-900/50 border-transparent hover:bg-neutral-800"
                                )}
                            >
                                <track.icon size={24} className={track.color} />
                                <span className="text-xs font-medium text-neutral-300">{track.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
