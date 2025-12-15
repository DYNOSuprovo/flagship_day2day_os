"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Clock } from "lucide-react";

const CARDS = [
    { id: 1, emoji: "🏃", tip: "Daily exercise" },
    { id: 2, emoji: "💧", tip: "Stay hydrated" },
    { id: 3, emoji: "😴", tip: "Quality sleep" },
    { id: 4, emoji: "🥗", tip: "Eat healthy" },
    { id: 5, emoji: "🧘", tip: "Meditation" },
    { id: 6, emoji: "📚", tip: "Keep learning" },
    { id: 7, emoji: "🌳", tip: "Nature walks" },
    { id: 8, emoji: "💪", tip: "Stay active" }
];

interface Card {
    id: number;
    emoji: string;
    tip: string;
    uniqueId: string;
    isFlipped: boolean;
    isMatched: boolean;
}

interface MemoryGameProps {
    onGameEnd?: (score: number) => void;
}

export default function MemoryGame({ onGameEnd }: MemoryGameProps) {
    const [gameState, setGameState] = useState<"idle" | "playing" | "won">("idle");
    const [cards, setCards] = useState<Card[]>([]);
    const [flippedCards, setFlippedCards] = useState<string[]>([]);
    const [moves, setMoves] = useState(0);
    const [matches, setMatches] = useState(0);
    const [timer, setTimer] = useState(0);
    const [highScore, setHighScore] = useState(999);
    const [showTip, setShowTip] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("memory_high_score");
        if (saved) setHighScore(parseInt(saved));
    }, []);

    const shuffleCards = () => {
        const doubled = [...CARDS, ...CARDS].map((card, index) => ({
            ...card,
            uniqueId: `${card.id}-${index}`,
            isFlipped: false,
            isMatched: false
        }));

        // Fisher-Yates shuffle
        for (let i = doubled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
        }

        return doubled;
    };

    const startGame = () => {
        setCards(shuffleCards());
        setGameState("playing");
        setFlippedCards([]);
        setMoves(0);
        setMatches(0);
        setTimer(0);
        setShowTip(null);
    };

    // Timer
    useEffect(() => {
        if (gameState !== "playing") return;

        const interval = setInterval(() => {
            setTimer(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState]);

    const handleCardClick = (uniqueId: string) => {
        if (gameState !== "playing") return;
        if (flippedCards.length >= 2) return;
        if (flippedCards.includes(uniqueId)) return;

        const card = cards.find(c => c.uniqueId === uniqueId);
        if (!card || card.isMatched) return;

        const newFlipped = [...flippedCards, uniqueId];
        setFlippedCards(newFlipped);

        // Flip the card
        setCards(current =>
            current.map(c =>
                c.uniqueId === uniqueId ? { ...c, isFlipped: true } : c
            )
        );

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);

            const [first, second] = newFlipped;
            const card1 = cards.find(c => c.uniqueId === first);
            const card2 = cards.find(c => c.uniqueId === second);

            if (card1 && card2 && card1.id === card2.id) {
                // Match!
                setMatches(m => m + 1);
                setShowTip(card1.tip);
                setTimeout(() => setShowTip(null), 2000);

                setCards(current =>
                    current.map(c =>
                        c.id === card1.id ? { ...c, isMatched: true } : c
                    )
                );
                setFlippedCards([]);

                // Check win
                if (matches + 1 === CARDS.length) {
                    setGameState("won");
                    if (moves + 1 < highScore) {
                        setHighScore(moves + 1);
                        localStorage.setItem("memory_high_score", (moves + 1).toString());
                    }
                    onGameEnd?.(25);
                }
            } else {
                // No match - flip back
                setTimeout(() => {
                    setCards(current =>
                        current.map(c =>
                            newFlipped.includes(c.uniqueId) && !c.isMatched
                                ? { ...c, isFlipped: false }
                                : c
                        )
                    );
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-6 text-lg">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-neutral-400" />
                    <span>{formatTime(timer)}</span>
                </div>
                <div>
                    <span className="text-neutral-400">Moves: </span>
                    <span className="font-bold">{moves}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-yellow-500">{highScore === 999 ? "-" : highScore}</span>
                </div>
            </div>

            {/* Tip display */}
            <AnimatePresence>
                {showTip && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400"
                    >
                        ✨ {showTip}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Game grid */}
            <div className="relative">
                <div className="grid grid-cols-4 gap-2 p-4 bg-neutral-900 rounded-xl border-4 border-neutral-700">
                    {cards.map(card => (
                        <motion.button
                            key={card.uniqueId}
                            onClick={() => handleCardClick(card.uniqueId)}
                            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`
                                w-16 h-16 rounded-lg font-bold text-2xl transition-all duration-300
                                ${card.isFlipped || card.isMatched
                                    ? "bg-purple-500"
                                    : "bg-neutral-700 hover:bg-neutral-600"
                                }
                                ${card.isMatched ? "opacity-50" : ""}
                            `}
                            style={{
                                transform: card.isFlipped || card.isMatched ? "rotateY(180deg)" : "rotateY(0deg)",
                                transformStyle: "preserve-3d"
                            }}
                        >
                            {card.isFlipped || card.isMatched ? card.emoji : "?"}
                        </motion.button>
                    ))}
                </div>

                {/* Overlays */}
                {gameState === "idle" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl">
                        <div className="text-4xl mb-4">🧠</div>
                        <div className="text-white text-xl font-bold mb-2">Memory Match</div>
                        <div className="text-white/70 text-sm mb-4">Find matching wellness tips!</div>
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-purple-500 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-400"
                        >
                            <Play className="w-5 h-5" /> Start
                        </button>
                    </div>
                )}

                {gameState === "won" && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-xl">
                        <div className="text-4xl mb-4">🎉</div>
                        <div className="text-white text-xl font-bold mb-2">You Won!</div>
                        <div className="text-neutral-400 mb-4">
                            {moves} moves in {formatTime(timer)}
                        </div>
                        <div className="text-green-400 text-sm mb-4">+25 XP earned!</div>
                        <button
                            onClick={startGame}
                            className="px-6 py-3 bg-purple-500 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-400"
                        >
                            <RotateCcw className="w-5 h-5" /> Play Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
