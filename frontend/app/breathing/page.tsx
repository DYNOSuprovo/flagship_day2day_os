"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const BREATHING_PATTERNS = [
    { name: "Calm (4-4-4-4)", inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    { name: "Relaxing (4-7-8)", inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    { name: "Energizing (4-4-4)", inhale: 4, hold1: 4, exhale: 4, hold2: 0 },
    { name: "Box Breathing (5-5-5-5)", inhale: 5, hold1: 5, exhale: 5, hold2: 5 },
    { name: "Deep Calm (6-0-6-0)", inhale: 6, hold1: 0, exhale: 6, hold2: 0 },
];

type BreathPhase = "inhale" | "hold1" | "exhale" | "hold2" | "idle";

export default function BreathingPage() {
    const [pattern, setPattern] = useState(BREATHING_PATTERNS[0]);
    const [phase, setPhase] = useState<BreathPhase>("idle");
    const [isActive, setIsActive] = useState(false);
    const [timer, setTimer] = useState(0);
    const [cycles, setCycles] = useState(0);
    const [showPatterns, setShowPatterns] = useState(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const phaseLabels: Record<BreathPhase, string> = {
        inhale: "Breathe In",
        hold1: "Hold",
        exhale: "Breathe Out",
        hold2: "Hold",
        idle: "Ready"
    };

    const phaseColors: Record<BreathPhase, string> = {
        inhale: "from-cyan-500 to-blue-500",
        hold1: "from-purple-500 to-pink-500",
        exhale: "from-emerald-500 to-teal-500",
        hold2: "from-amber-500 to-orange-500",
        idle: "from-neutral-500 to-neutral-600"
    };

    const getPhaseTime = (p: BreathPhase): number => {
        switch (p) {
            case "inhale": return pattern.inhale;
            case "hold1": return pattern.hold1;
            case "exhale": return pattern.exhale;
            case "hold2": return pattern.hold2;
            default: return 0;
        }
    };

    const getNextPhase = (current: BreathPhase): BreathPhase => {
        const sequence: BreathPhase[] = ["inhale", "hold1", "exhale", "hold2"];
        const idx = sequence.indexOf(current);

        // Skip phases with 0 duration
        let next = sequence[(idx + 1) % 4];
        while (getPhaseTime(next) === 0) {
            next = sequence[(sequence.indexOf(next) + 1) % 4];
        }

        return next;
    };

    useEffect(() => {
        if (!isActive) return;

        intervalRef.current = setInterval(() => {
            setTimer(prev => {
                const phaseTime = getPhaseTime(phase);
                if (prev >= phaseTime) {
                    const next = getNextPhase(phase);
                    setPhase(next);
                    if (next === "inhale") {
                        setCycles(c => c + 1);
                    }
                    return 0;
                }
                return prev + 0.1;
            });
        }, 100);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isActive, phase, pattern]);

    const start = () => {
        setPhase("inhale");
        setTimer(0);
        setIsActive(true);
    };

    const pause = () => setIsActive(false);

    const reset = () => {
        setIsActive(false);
        setPhase("idle");
        setTimer(0);
        setCycles(0);
    };

    const circleScale =
        phase === "inhale" ? 1 + (timer / pattern.inhale) * 0.5 :
            phase === "exhale" ? 1.5 - (timer / pattern.exhale) * 0.5 :
                phase === "hold1" || phase === "hold2" ? 1.5 :
                    1;

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32 relative overflow-hidden">
            {/* Ambient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-purple-500/5" />

            {/* Hero */}
            <div className="relative py-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-cyan-500/10 mb-4 border border-cyan-500/20">
                        <Wind className="text-cyan-400" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Breathing</h1>
                    <p className="text-neutral-400">Find your calm</p>
                </motion.div>
            </div>

            {/* Main breathing circle */}
            <div className="flex flex-col items-center justify-center px-6">
                <div className="relative w-72 h-72 flex items-center justify-center">
                    {/* Outer ring */}
                    <motion.div
                        animate={{ scale: circleScale, opacity: isActive ? 1 : 0.5 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "absolute w-full h-full rounded-full bg-gradient-to-br opacity-30",
                            phaseColors[phase]
                        )}
                    />

                    {/* Inner circle */}
                    <motion.div
                        animate={{ scale: circleScale * 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            "absolute w-[70%] h-[70%] rounded-full bg-gradient-to-br",
                            phaseColors[phase]
                        )}
                        style={{ filter: "blur(1px)" }}
                    />

                    {/* Center content */}
                    <div className="relative z-10 text-center">
                        <div className="text-3xl font-bold mb-1">
                            {phaseLabels[phase]}
                        </div>
                        {isActive && (
                            <div className="text-5xl font-mono">
                                {Math.ceil(getPhaseTime(phase) - timer)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {cycles > 0 && (
                    <div className="mt-6 text-center">
                        <div className="text-2xl font-bold">{cycles}</div>
                        <div className="text-sm text-neutral-400">cycles completed</div>
                    </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-4 mt-8">
                    {!isActive ? (
                        <button
                            onClick={start}
                            className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center hover:bg-cyan-400 transition-colors"
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

                {/* Pattern selector */}
                <div className="mt-10 w-full max-w-sm">
                    <button
                        onClick={() => setShowPatterns(!showPatterns)}
                        className="w-full py-3 px-4 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between"
                    >
                        <span className="text-sm text-neutral-400">Pattern</span>
                        <span className="font-medium">{pattern.name}</span>
                    </button>

                    {showPatterns && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
                        >
                            {BREATHING_PATTERNS.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setPattern(p);
                                        setShowPatterns(false);
                                        reset();
                                    }}
                                    className={cn(
                                        "w-full px-4 py-3 text-left hover:bg-neutral-800 transition-colors",
                                        pattern.name === p.name && "bg-cyan-500/10"
                                    )}
                                >
                                    {p.name}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </div>

                {/* Tips */}
                <div className="mt-8 text-center max-w-sm">
                    <p className="text-sm text-neutral-500">
                        💡 Breathe through your nose. Focus on the rhythm.
                        Let go of distracting thoughts.
                    </p>
                </div>
            </div>
        </div>
    );
}
