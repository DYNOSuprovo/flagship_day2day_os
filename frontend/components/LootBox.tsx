"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "./Confetti";

interface LootItem {
    id: string;
    name: string;
    rarity: "common" | "rare" | "epic" | "legendary";
    type: "xp" | "badge" | "streak" | "cosmetic";
    value: number;
    icon: string;
    description: string;
}

const LOOT_TABLE: LootItem[] = [
    { id: "xp_small", name: "XP Boost", rarity: "common", type: "xp", value: 25, icon: "⚡", description: "+25 XP" },
    { id: "xp_medium", name: "XP Pack", rarity: "common", type: "xp", value: 50, icon: "✨", description: "+50 XP" },
    { id: "xp_large", name: "XP Chest", rarity: "rare", type: "xp", value: 100, icon: "💎", description: "+100 XP" },
    { id: "xp_mega", name: "XP Jackpot", rarity: "epic", type: "xp", value: 250, icon: "🏆", description: "+250 XP" },
    { id: "xp_ultra", name: "XP Treasure", rarity: "legendary", type: "xp", value: 500, icon: "👑", description: "+500 XP" },
    { id: "streak_shield", name: "Streak Shield", rarity: "rare", type: "streak", value: 1, icon: "🛡️", description: "Protects streak once" },
    { id: "streak_boost", name: "Streak Boost", rarity: "epic", type: "streak", value: 2, icon: "🔥", description: "+2 days to streak" },
    { id: "badge_star", name: "Star Badge", rarity: "rare", type: "badge", value: 1, icon: "⭐", description: "Cosmetic badge" },
    { id: "badge_crown", name: "Crown Badge", rarity: "legendary", type: "badge", value: 1, icon: "👑", description: "Premium badge" },
];

const RARITY_COLORS = {
    common: { bg: "from-gray-500 to-gray-600", border: "border-gray-500/50", text: "text-gray-300" },
    rare: { bg: "from-blue-500 to-blue-600", border: "border-blue-500/50", text: "text-blue-300" },
    epic: { bg: "from-purple-500 to-purple-600", border: "border-purple-500/50", text: "text-purple-300" },
    legendary: { bg: "from-yellow-500 to-amber-500", border: "border-yellow-500/50", text: "text-yellow-300" }
};

const RARITY_CHANCES = {
    common: 0.6,
    rare: 0.25,
    epic: 0.12,
    legendary: 0.03
};

interface LootBoxProps {
    isOpen: boolean;
    onClose: () => void;
    boxType?: "bronze" | "silver" | "gold";
}

export default function LootBox({ isOpen, onClose, boxType = "silver" }: LootBoxProps) {
    const [phase, setPhase] = useState<"closed" | "opening" | "reveal">("closed");
    const [reward, setReward] = useState<LootItem | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const rollLoot = useCallback(() => {
        const roll = Math.random();
        let rarity: LootItem["rarity"];

        if (roll < RARITY_CHANCES.legendary) {
            rarity = "legendary";
        } else if (roll < RARITY_CHANCES.legendary + RARITY_CHANCES.epic) {
            rarity = "epic";
        } else if (roll < RARITY_CHANCES.legendary + RARITY_CHANCES.epic + RARITY_CHANCES.rare) {
            rarity = "rare";
        } else {
            rarity = "common";
        }

        // Boost chances for gold boxes
        if (boxType === "gold" && rarity === "common") {
            rarity = Math.random() < 0.5 ? "rare" : "common";
        }

        const items = LOOT_TABLE.filter(i => i.rarity === rarity);
        return items[Math.floor(Math.random() * items.length)];
    }, [boxType]);

    const openBox = async () => {
        setPhase("opening");

        // Dramatic pause
        setTimeout(() => {
            const loot = rollLoot();
            setReward(loot);
            setPhase("reveal");

            if (loot.rarity === "epic" || loot.rarity === "legendary") {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
            }

            // Award XP if applicable
            if (loot.type === "xp") {
                fetch(`${API_URL}/gamification/add-xp`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount: loot.value,
                        source: "loot_box",
                        description: `Loot Box: ${loot.name}`
                    })
                }).catch(console.error);
            }
        }, 2000);
    };

    const handleClose = () => {
        setPhase("closed");
        setReward(null);
        onClose();
    };

    const boxColors = {
        bronze: "from-amber-700 to-amber-800",
        silver: "from-gray-400 to-gray-500",
        gold: "from-yellow-400 to-amber-500"
    };

    return (
        <>
            <Confetti trigger={showConfetti} particleCount={100} />

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-[100]"
                        onClick={handleClose}
                    >
                        <motion.div
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-sm w-full"
                        >
                            <button
                                onClick={handleClose}
                                className="absolute -top-4 -right-4 p-2 bg-neutral-800 rounded-full z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {phase === "closed" && (
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className="text-center"
                                >
                                    {/* Box visualization */}
                                    <motion.div
                                        whileHover={{ scale: 1.05, rotate: [-1, 1, -1] }}
                                        className={cn(
                                            "w-40 h-40 mx-auto mb-8 rounded-2xl flex items-center justify-center text-6xl",
                                            "bg-gradient-to-br shadow-2xl",
                                            boxColors[boxType]
                                        )}
                                    >
                                        <Gift className="w-20 h-20 text-white/90" />
                                    </motion.div>

                                    <h2 className="text-2xl font-bold mb-2 capitalize">{boxType} Loot Box</h2>
                                    <p className="text-neutral-400 mb-6">Tap to reveal your reward!</p>

                                    <button
                                        onClick={openBox}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold text-lg hover:from-purple-400 hover:to-pink-400 transition-all"
                                    >
                                        Open Box ✨
                                    </button>
                                </motion.div>
                            )}

                            {phase === "opening" && (
                                <motion.div className="text-center">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.2, 1, 1.3, 1],
                                            rotate: [0, -10, 10, -5, 5, 0]
                                        }}
                                        transition={{ duration: 2 }}
                                        className={cn(
                                            "w-40 h-40 mx-auto mb-8 rounded-2xl flex items-center justify-center text-6xl",
                                            "bg-gradient-to-br shadow-2xl",
                                            boxColors[boxType]
                                        )}
                                    >
                                        <motion.div
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 0.3, repeat: Infinity }}
                                        >
                                            <Sparkles className="w-20 h-20 text-white" />
                                        </motion.div>
                                    </motion.div>
                                    <p className="text-xl font-bold animate-pulse">Opening...</p>
                                </motion.div>
                            )}

                            {phase === "reveal" && reward && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: "spring", duration: 0.5 }}
                                    className="text-center"
                                >
                                    {/* Reward card */}
                                    <motion.div
                                        animate={{
                                            boxShadow: [
                                                `0 0 20px ${reward.rarity === "legendary" ? "#FBBF24" : reward.rarity === "epic" ? "#A855F7" : "#3B82F6"}40`,
                                                `0 0 40px ${reward.rarity === "legendary" ? "#FBBF24" : reward.rarity === "epic" ? "#A855F7" : "#3B82F6"}60`,
                                                `0 0 20px ${reward.rarity === "legendary" ? "#FBBF24" : reward.rarity === "epic" ? "#A855F7" : "#3B82F6"}40`
                                            ]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={cn(
                                            "p-8 rounded-2xl border-2 mb-6",
                                            `bg-gradient-to-br ${RARITY_COLORS[reward.rarity].bg}`,
                                            RARITY_COLORS[reward.rarity].border
                                        )}
                                    >
                                        <div className="text-6xl mb-4">{reward.icon}</div>
                                        <div className={cn("text-sm font-bold uppercase tracking-wider mb-1", RARITY_COLORS[reward.rarity].text)}>
                                            {reward.rarity}
                                        </div>
                                        <div className="text-2xl font-bold mb-2">{reward.name}</div>
                                        <div className="text-white/80">{reward.description}</div>
                                    </motion.div>

                                    <button
                                        onClick={handleClose}
                                        className="px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-neutral-200 transition-colors"
                                    >
                                        Claim Reward
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

// Hook for triggering loot box from anywhere
export function useLootBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [boxType, setBoxType] = useState<"bronze" | "silver" | "gold">("silver");

    const openLootBox = (type: "bronze" | "silver" | "gold" = "silver") => {
        setBoxType(type);
        setIsOpen(true);
    };

    const closeLootBox = () => {
        setIsOpen(false);
    };

    return { isOpen, boxType, openLootBox, closeLootBox };
}
