"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Calendar,
    Trophy,
    Flame,
    Sparkles,
    Target,
    Utensils,
    Edit3,
    Check,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileData {
    name: string;
    bio: string;
    avatar_style: string;
    joined_at: string;
    days_since_joined: number;
    stats: {
        total_xp: number;
        level: number;
        total_habits_completed: number;
        longest_streak: number;
        meals_logged: number;
        achievements_unlocked: number;
        challenges_completed: number;
        days_active: number;
    };
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editBio, setEditBio] = useState("");

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/`);
            const data = await res.json();
            setProfile(data);
            setEditName(data.name);
            setEditBio(data.bio);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            await fetch(`${API_URL}/profile/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editName, bio: editBio })
            });
            setProfile(prev => prev ? { ...prev, name: editName, bio: editBio } : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to save profile:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-950">
                <User className="w-8 h-8 animate-pulse text-blue-400" />
            </div>
        );
    }

    if (!profile) return null;

    const stats = [
        { label: "Level", value: profile.stats.level, icon: <Sparkles className="w-5 h-5" />, color: "purple" },
        { label: "Total XP", value: profile.stats.total_xp.toLocaleString(), icon: <Target className="w-5 h-5" />, color: "yellow" },
        { label: "Habits Done", value: profile.stats.total_habits_completed, icon: <Check className="w-5 h-5" />, color: "emerald" },
        { label: "Days Active", value: profile.stats.days_active, icon: <Flame className="w-5 h-5" />, color: "orange" },
        { label: "Achievements", value: profile.stats.achievements_unlocked, icon: <Trophy className="w-5 h-5" />, color: "yellow" },
        { label: "Meals Logged", value: profile.stats.meals_logged, icon: <Utensils className="w-5 h-5" />, color: "emerald" },
    ];

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Avatar */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                        <div className={cn(
                            "w-full h-full rounded-full flex items-center justify-center text-5xl",
                            "bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-blue-500/30"
                        )}>
                            {profile.avatar_style === "valkyrie" ? "👸" : "🧙"}
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold border-4 border-neutral-950">
                            {profile.stats.level}
                        </div>
                    </div>

                    {/* Name & Bio */}
                    {isEditing ? (
                        <div className="max-w-sm mx-auto space-y-4">
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-center resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={2}
                            />
                            <div className="flex justify-center gap-3">
                                <button
                                    onClick={saveProfile}
                                    className="px-6 py-2 bg-blue-500 rounded-xl font-medium flex items-center gap-2"
                                >
                                    <Check className="w-4 h-4" /> Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 bg-neutral-700 rounded-xl font-medium flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <h1 className="text-3xl font-bold">{profile.name}</h1>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <Edit3 className="w-4 h-4 text-neutral-400" />
                                </button>
                            </div>
                            <p className="text-neutral-400 mb-4">{profile.bio}</p>
                        </>
                    )}

                    {/* Joined */}
                    <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {profile.days_since_joined} days ago</span>
                    </div>
                </motion.div>
            </div>

            {/* Stats Grid */}
            <div className="container mx-auto px-6 max-w-2xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
                >
                    {stats.map((stat, idx) => (
                        <div
                            key={stat.label}
                            className={cn(
                                "bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800",
                                "hover:border-neutral-700 transition-colors"
                            )}
                        >
                            <div className={`text-${stat.color}-400 mb-2`}>
                                {stat.icon}
                            </div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-neutral-500">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* XP Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-6 border border-purple-500/20"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-lg">Level {profile.stats.level}</h3>
                            <p className="text-sm text-neutral-400">
                                {profile.stats.total_xp.toLocaleString()} total XP earned
                            </p>
                        </div>
                        <div className="text-4xl">🏆</div>
                    </div>

                    <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(profile.stats.total_xp % 1000) / 10}%` }}
                            transition={{ duration: 1 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 text-right">
                        {1000 - (profile.stats.total_xp % 1000)} XP to next level
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
