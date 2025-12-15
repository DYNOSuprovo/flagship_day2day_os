"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "./Confetti";

interface WheelSegment {
    label: string;
    value: number;
    color: string;
    icon: string;
    type: "xp" | "streak_shield" | "bonus" | "mystery";
}

const WHEEL_SEGMENTS: WheelSegment[] = [
    { label: "+25 XP", value: 25, color: "#3B82F6", icon: "⚡", type: "xp" },
    { label: "+50 XP", value: 50, color: "#8B5CF6", icon: "✨", type: "xp" },
    { label: "+100 XP", value: 100, color: "#EC4899", icon: "🔥", type: "xp" },
    { label: "Streak Shield", value: 1, color: "#10B981", icon: "🛡️", type: "streak_shield" },
    { label: "+75 XP", value: 75, color: "#F59E0B", icon: "💎", type: "xp" },
    { label: "2x Bonus", value: 2, color: "#EF4444", icon: "🎯", type: "bonus" },
    { label: "+200 XP", value: 200, color: "#06B6D4", icon: "🚀", type: "xp" },
    { label: "Mystery", value: 0, color: "#6366F1", icon: "🎁", type: "mystery" },
];

export default function FortuneWheel() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<WheelSegment | null>(null);
    const [canSpin, setCanSpin] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        // Check if already spun today
        const saved = localStorage.getItem("lastWheelSpin");
        if (saved) {
            const today = new Date().toDateString();
            setCanSpin(saved !== today);
            setLastSpinDate(saved);
        }
    }, []);

    const spinWheel = async () => {
        if (isSpinning || !canSpin) return;

        setIsSpinning(true);
        setResult(null);

        // Random segment
        const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
        const segment = WHEEL_SEGMENTS[segmentIndex];

        // Calculate rotation (multiple full spins + landing on segment)
        const segmentAngle = 360 / WHEEL_SEGMENTS.length;
        const targetAngle = 360 - (segmentIndex * segmentAngle) - segmentAngle / 2;
        const fullSpins = 5 * 360; // 5 full rotations
        const newRotation = rotation + fullSpins + targetAngle + Math.random() * 20 - 10;

        setRotation(newRotation);

        // Wait for spin to complete
        setTimeout(async () => {
            setResult(segment);
            setIsSpinning(false);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 100);

            // Award XP
            if (segment.type === "xp" || segment.type === "mystery") {
                const xpAmount = segment.type === "mystery"
                    ? Math.floor(Math.random() * 150) + 50
                    : segment.value;

                try {
                    await fetch(`${API_URL}/gamification/add-xp`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount: xpAmount,
                            source: "fortune_wheel",
                            description: `Fortune Wheel: ${segment.label}`
                        })
                    });
                } catch (e) {
                    console.error("Failed to award XP:", e);
                }
            }

            // Mark as spun today
            const today = new Date().toDateString();
            localStorage.setItem("lastWheelSpin", today);
            setCanSpin(false);
            setLastSpinDate(today);
        }, 5000);
    };

    const segmentAngle = 360 / WHEEL_SEGMENTS.length;

    return (
        <>
            <Confetti trigger={showConfetti} particleCount={80} />

            {/* Floating Button */}
            <motion.button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-24 left-6 z-40 w-14 h-14 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30",
                    canSpin && "animate-pulse"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <Gift className="w-7 h-7 text-white" />
                {canSpin && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center text-[10px] font-bold text-black">
                        !
                    </span>
                )}
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[100]"
                        onClick={() => !isSpinning && setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative"
                        >
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute -top-4 -right-4 p-2 bg-neutral-800 rounded-full z-10"
                                disabled={isSpinning}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-1">🎡 Fortune Wheel</h2>
                                <p className="text-neutral-400 text-sm">
                                    {canSpin ? "Spin to win daily rewards!" : "Come back tomorrow for another spin!"}
                                </p>
                            </div>

                            {/* Wheel Container */}
                            <div className="relative w-80 h-80">
                                {/* Pointer */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                                    <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-yellow-400" />
                                </div>

                                {/* Wheel */}
                                <motion.div
                                    className="w-full h-full rounded-full relative overflow-hidden border-4 border-yellow-400"
                                    style={{ rotate: rotation }}
                                    transition={{ duration: 5, ease: [0.2, 0, 0.2, 1] }}
                                >
                                    {WHEEL_SEGMENTS.map((segment, i) => (
                                        <div
                                            key={i}
                                            className="absolute w-full h-full"
                                            style={{
                                                transform: `rotate(${i * segmentAngle}deg)`,
                                                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan(segmentAngle * Math.PI / 360)}% 0%)`
                                            }}
                                        >
                                            <div
                                                className="absolute inset-0 flex items-start justify-center pt-4"
                                                style={{
                                                    backgroundColor: segment.color,
                                                    transform: `rotate(${segmentAngle / 2}deg)`
                                                }}
                                            >
                                                <span className="text-2xl">{segment.icon}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Center */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center border-4 border-yellow-400">
                                        <Sparkles className="w-8 h-8 text-yellow-400" />
                                    </div>
                                </motion.div>
                            </div>

                            {/* Spin Button */}
                            <button
                                onClick={spinWheel}
                                disabled={isSpinning || !canSpin}
                                className={cn(
                                    "w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all",
                                    canSpin && !isSpinning
                                        ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-300 hover:to-orange-400"
                                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                )}
                            >
                                {isSpinning ? "Spinning..." : canSpin ? "🎰 SPIN!" : "Come back tomorrow!"}
                            </button>

                            {/* Result */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl text-center border border-purple-500/30"
                                    >
                                        <div className="text-3xl mb-2">{result.icon}</div>
                                        <div className="font-bold text-lg">{result.label}</div>
                                        <div className="text-sm text-neutral-400">Added to your account!</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
