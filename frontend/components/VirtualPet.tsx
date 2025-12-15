"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface VirtualPetProps {
    streak: number;
    xp: number;
    level: number;
}

// Pet evolution stages
const PET_STAGES = [
    { name: "Egg", emoji: "🥚", minLevel: 0, description: "Just hatched!" },
    { name: "Baby Blob", emoji: "🫧", minLevel: 2, description: "So tiny and cute!" },
    { name: "Sprout", emoji: "🌱", minLevel: 5, description: "Growing strong!" },
    { name: "Buddy", emoji: "🐣", minLevel: 10, description: "Your best friend!" },
    { name: "Explorer", emoji: "🦊", minLevel: 20, description: "Adventure awaits!" },
    { name: "Guardian", emoji: "🦁", minLevel: 35, description: "Brave protector!" },
    { name: "Spirit", emoji: "🐉", minLevel: 50, description: "Legendary status!" },
    { name: "Celestial", emoji: "🌟", minLevel: 75, description: "Divine power!" },
    { name: "Cosmic", emoji: "🌌", minLevel: 100, description: "Universe master!" }
];

const PET_MOODS = {
    happy: { emoji: "😊", message: "I'm so happy to see you!" },
    excited: { emoji: "🤩", message: "You're on fire today!" },
    sleepy: { emoji: "😴", message: "Zzz... wake me for habits..." },
    hungry: { emoji: "🥺", message: "Complete a habit to feed me!" },
    proud: { emoji: "😎", message: "That streak is AMAZING!" },
    worried: { emoji: "😟", message: "Don't forget your habits today!" }
};

export default function VirtualPet({ streak, xp, level }: VirtualPetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [petMessage, setPetMessage] = useState("");

    // Determine pet stage based on level
    const petStage = [...PET_STAGES].reverse().find(s => level >= s.minLevel) || PET_STAGES[0];

    // Determine mood based on streak and activity
    const getMood = () => {
        if (streak >= 7) return PET_MOODS.proud;
        if (streak >= 3) return PET_MOODS.excited;
        if (streak === 0) return PET_MOODS.worried;
        const hour = new Date().getHours();
        if (hour < 7 || hour > 22) return PET_MOODS.sleepy;
        return PET_MOODS.happy;
    };

    const mood = getMood();

    // Pet happiness percentage
    const happiness = Math.min(100, 50 + streak * 5 + (xp % 100) / 10);

    const handlePetClick = () => {
        setShowMessage(true);
        setPetMessage(mood.message);
        setTimeout(() => setShowMessage(false), 3000);
    };

    // Pet bounce animation
    const bounceVariants = {
        idle: {
            y: [0, -5, 0],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        },
        excited: {
            y: [0, -15, 0],
            rotate: [-5, 5, -5],
            transition: { duration: 0.5, repeat: Infinity }
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-40">
            {/* Speech Bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{
                    opacity: showMessage ? 1 : 0,
                    y: showMessage ? 0 : 10,
                    scale: showMessage ? 1 : 0.8
                }}
                className="absolute bottom-full right-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2 text-sm max-w-48"
            >
                <div className="text-white">{petMessage}</div>
                <div className="absolute bottom-0 right-4 translate-y-1/2 rotate-45 w-3 h-3 bg-neutral-800 border-r border-b border-neutral-700" />
            </motion.div>

            {/* Pet Container */}
            <motion.div
                onClick={handlePetClick}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer"
            >
                <motion.div
                    variants={bounceVariants}
                    animate={streak >= 5 ? "excited" : "idle"}
                    className="relative"
                >
                    {/* Glow effect */}
                    <div
                        className="absolute inset-0 rounded-full blur-xl"
                        style={{
                            background: `radial-gradient(circle, ${level >= 50 ? "rgba(147, 51, 234, 0.5)" :
                                    level >= 20 ? "rgba(59, 130, 246, 0.4)" :
                                        "rgba(16, 185, 129, 0.3)"
                                } 0%, transparent 70%)`,
                            transform: "scale(1.5)"
                        }}
                    />

                    {/* Pet */}
                    <div className="relative w-16 h-16 bg-neutral-800/80 backdrop-blur rounded-2xl border border-neutral-700 flex items-center justify-center text-3xl shadow-lg">
                        {petStage.emoji}

                        {/* Mood indicator */}
                        <span className="absolute -top-1 -right-1 text-lg">{mood.emoji}</span>

                        {/* Streak flames */}
                        {streak >= 3 && (
                            <motion.span
                                className="absolute -bottom-2 text-sm"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.5, repeat: Infinity }}
                            >
                                🔥
                            </motion.span>
                        )}
                    </div>
                </motion.div>

                {/* Level badge */}
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold border-2 border-neutral-900">
                    {level}
                </div>
            </motion.div>

            {/* Info tooltip on hover */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-14 bg-neutral-900 border border-neutral-700 rounded-xl p-3 pointer-events-none min-w-40"
            >
                <div className="font-bold mb-1">{petStage.name}</div>
                <div className="text-xs text-neutral-400 mb-2">{petStage.description}</div>

                {/* Happiness bar */}
                <div className="text-xs text-neutral-500 mb-1">Happiness</div>
                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${happiness}%` }}
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}
