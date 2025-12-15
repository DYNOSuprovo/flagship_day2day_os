"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, Star, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
    rank: number;
    name: string;
    xp: number;
    level: number;
    streak: number;
    avatar: string;
    isCurrentUser?: boolean;
}

// Mock data - in production this would come from an API
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, name: "ZenMaster", xp: 15420, level: 45, streak: 128, avatar: "🧘" },
    { rank: 2, name: "FitnessPro", xp: 14250, level: 42, streak: 95, avatar: "💪" },
    { rank: 3, name: "MindfulOne", xp: 12800, level: 38, streak: 67, avatar: "🌟" },
    { rank: 4, name: "HealthyHero", xp: 11500, level: 35, streak: 54, avatar: "🦸" },
    { rank: 5, name: "WellnessWiz", xp: 10200, level: 32, streak: 42, avatar: "🧙" },
    { rank: 6, name: "You", xp: 8750, level: 28, streak: 21, avatar: "😎", isCurrentUser: true },
    { rank: 7, name: "BalanceSeeker", xp: 7900, level: 25, streak: 35, avatar: "⚖️" },
    { rank: 8, name: "EarlyBird", xp: 7100, level: 23, streak: 28, avatar: "🐦" },
    { rank: 9, name: "NightOwl", xp: 6500, level: 21, streak: 19, avatar: "🦉" },
    { rank: 10, name: "Rookie", xp: 5800, level: 18, streak: 14, avatar: "🌱" },
];

type LeaderboardTab = "global" | "weekly" | "friends";

export default function LeaderboardPage() {
    const [tab, setTab] = useState<LeaderboardTab>("global");
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_LEADERBOARD);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Medal className="w-6 h-6 text-amber-600" />;
            default: return <span className="w-6 text-center font-bold text-neutral-500">#{rank}</span>;
        }
    };

    const getRankBg = (rank: number, isCurrentUser?: boolean) => {
        if (isCurrentUser) return "bg-purple-500/10 border-purple-500/50";
        switch (rank) {
            case 1: return "bg-yellow-500/10 border-yellow-500/30";
            case 2: return "bg-gray-500/10 border-gray-500/30";
            case 3: return "bg-amber-500/10 border-amber-500/30";
            default: return "bg-neutral-900/50 border-neutral-800";
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
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 mb-4">
                        <Trophy className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
                    <p className="text-neutral-400">Compete with the community</p>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-8 px-6">
                {[
                    { id: "global" as LeaderboardTab, label: "Global", icon: Star },
                    { id: "weekly" as LeaderboardTab, label: "Weekly", icon: TrendingUp },
                    { id: "friends" as LeaderboardTab, label: "Friends", icon: Users }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            "px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors",
                            tab === t.id
                                ? "bg-purple-500 text-white"
                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Leaderboard */}
            <div className="px-6 max-w-md mx-auto">
                {/* Top 3 podium */}
                <div className="flex items-end justify-center gap-4 mb-8">
                    {/* 2nd place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 mb-2 rounded-full bg-gray-500/20 border-2 border-gray-500 flex items-center justify-center text-2xl mx-auto">
                            {leaderboard[1]?.avatar}
                        </div>
                        <div className="w-16 h-20 bg-gray-500/20 rounded-t-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400">2</span>
                        </div>
                        <div className="text-sm font-medium mt-1">{leaderboard[1]?.name}</div>
                        <div className="text-xs text-gray-400">{leaderboard[1]?.xp.toLocaleString()} XP</div>
                    </motion.div>

                    {/* 1st place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="w-20 h-20 mb-2 rounded-full bg-yellow-500/20 border-2 border-yellow-500 flex items-center justify-center text-3xl mx-auto relative">
                            {leaderboard[0]?.avatar}
                            <Crown className="absolute -top-4 w-8 h-8 text-yellow-400" />
                        </div>
                        <div className="w-20 h-28 bg-yellow-500/20 rounded-t-lg flex items-center justify-center">
                            <span className="text-3xl font-bold text-yellow-400">1</span>
                        </div>
                        <div className="text-sm font-medium mt-1">{leaderboard[0]?.name}</div>
                        <div className="text-xs text-yellow-400">{leaderboard[0]?.xp.toLocaleString()} XP</div>
                    </motion.div>

                    {/* 3rd place */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 mb-2 rounded-full bg-amber-600/20 border-2 border-amber-600 flex items-center justify-center text-2xl mx-auto">
                            {leaderboard[2]?.avatar}
                        </div>
                        <div className="w-16 h-16 bg-amber-600/20 rounded-t-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-amber-600">3</span>
                        </div>
                        <div className="text-sm font-medium mt-1">{leaderboard[2]?.name}</div>
                        <div className="text-xs text-amber-600">{leaderboard[2]?.xp.toLocaleString()} XP</div>
                    </motion.div>
                </div>

                {/* Rest of leaderboard */}
                <div className="space-y-2">
                    {leaderboard.slice(3).map((entry, i) => (
                        <motion.div
                            key={entry.rank}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.05 }}
                            className={cn(
                                "flex items-center gap-4 p-4 rounded-xl border",
                                getRankBg(entry.rank, entry.isCurrentUser)
                            )}
                        >
                            {getRankIcon(entry.rank)}

                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
                                {entry.avatar}
                            </div>

                            <div className="flex-1">
                                <div className="font-medium flex items-center gap-2">
                                    {entry.name}
                                    {entry.isCurrentUser && (
                                        <span className="text-xs bg-purple-500 px-2 py-0.5 rounded">You</span>
                                    )}
                                </div>
                                <div className="text-sm text-neutral-400">
                                    Level {entry.level} • 🔥 {entry.streak} day streak
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-bold">{entry.xp.toLocaleString()}</div>
                                <div className="text-xs text-neutral-500">XP</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Your rank card */}
                <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                    <div className="text-center">
                        <div className="text-sm text-purple-400 mb-1">Your Rank</div>
                        <div className="text-4xl font-bold">#6</div>
                        <div className="text-sm text-neutral-400 mt-1">1,450 XP to reach #5</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
