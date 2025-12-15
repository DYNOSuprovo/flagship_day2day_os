"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Bird, Apple, Brain, Sparkles } from "lucide-react";
import FlappyGame from "@/components/games/FlappyGame";
import SnakeGame from "@/components/games/SnakeGame";
import MemoryGame from "@/components/games/MemoryGame";
import { cn } from "@/lib/utils";

type GameType = "flappy" | "snake" | "memory" | null;

const GAMES = [
    {
        id: "flappy" as GameType,
        name: "Focus Flappy",
        description: "Tap to fly through pipes",
        icon: Bird,
        color: "from-sky-500 to-blue-500",
        xpRange: "10-50 XP"
    },
    {
        id: "snake" as GameType,
        name: "Habit Snake",
        description: "Eat habits, grow longer",
        icon: Apple,
        color: "from-green-500 to-emerald-500",
        xpRange: "5-30 XP"
    },
    {
        id: "memory" as GameType,
        name: "Memory Match",
        description: "Match wellness cards",
        icon: Brain,
        color: "from-purple-500 to-pink-500",
        xpRange: "25 XP"
    }
];

export default function ArcadePage() {
    const [selectedGame, setSelectedGame] = useState<GameType>(null);
    const [totalXP, setTotalXP] = useState(0);

    const handleGameEnd = async (xp: number) => {
        setTotalXP(prev => prev + xp);

        // Award XP
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/gamification/add-xp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: xp,
                    source: "arcade",
                    description: `Game reward`
                })
            });
        } catch (e) {
            console.error("Failed to award XP:", e);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-12 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
                        <Gamepad2 className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Game Arcade</h1>
                    <p className="text-neutral-400">Play games, earn XP!</p>

                    {totalXP > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-full"
                        >
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-400 font-bold">+{totalXP} XP earned this session</span>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {!selectedGame ? (
                /* Game Selection */
                <div className="px-6 max-w-2xl mx-auto">
                    <div className="grid gap-4">
                        {GAMES.map((game, i) => (
                            <motion.button
                                key={game.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedGame(game.id)}
                                className={cn(
                                    "p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50",
                                    "hover:border-neutral-700 transition-all text-left",
                                    "flex items-center gap-4"
                                )}
                            >
                                <div className={cn(
                                    "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br",
                                    game.color
                                )}>
                                    <game.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{game.name}</h3>
                                    <p className="text-neutral-400 text-sm">{game.description}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-green-400 font-bold">{game.xpRange}</div>
                                    <div className="text-neutral-500 text-xs">per game</div>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Coming Soon */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold mb-4 text-neutral-500">Coming Soon</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {["XP Clicker", "Wellness Wordle", "Quiz Master", "Streak Defender"].map((game, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/50 opacity-50"
                                >
                                    <div className="text-2xl mb-2">🔒</div>
                                    <div className="font-medium">{game}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Game View */
                <div className="px-6">
                    <button
                        onClick={() => setSelectedGame(null)}
                        className="mb-6 px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors"
                    >
                        ← Back to Arcade
                    </button>

                    <div className="flex justify-center">
                        {selectedGame === "flappy" && <FlappyGame onGameEnd={handleGameEnd} />}
                        {selectedGame === "snake" && <SnakeGame onGameEnd={handleGameEnd} />}
                        {selectedGame === "memory" && <MemoryGame onGameEnd={handleGameEnd} />}
                    </div>
                </div>
            )}
        </div>
    );
}
