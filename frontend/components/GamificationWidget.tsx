"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';

interface GamificationStats {
    level: number;
    xp: number;
    next_level_xp: number;
    progress: number;
    title: string;
}

export const GamificationWidget = () => {
    const [stats, setStats] = useState<GamificationStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/gamification/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch gamification stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return null;
    if (!stats) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full mb-8 relative group"
        >
            {/* Liquid Glass Container */}
            <div className="relative overflow-hidden rounded-3xl p-6 backdrop-blur-xl bg-slate-900/40 border border-white/10 shadow-2xl">

                {/* Background Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] group-hover:bg-purple-500/30 transition-colors duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] group-hover:bg-emerald-500/30 transition-colors duration-700" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">

                    {/* Level Badge */}
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/20">
                                <span className="text-4xl font-black text-white">{stats.level}</span>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 border border-yellow-200">
                                <Star className="w-3 h-3 fill-yellow-900" />
                                <span>LVL</span>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                {stats.title}
                                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                            </h3>
                            <span className="text-slate-400 text-sm">Keep logging to reach the next level!</span>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div className="flex-1 w-full md:max-w-xl">
                        <div className="flex justify-between text-sm mb-2 font-medium">
                            <span className="text-indigo-300">XP Progress</span>
                            <span className="text-white">{stats.xp} / <span className="text-slate-500">{stats.next_level_xp} XP</span></span>
                        </div>

                        <div className="h-6 bg-slate-800/50 rounded-full p-1 border border-white/5 relative overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.5)] relative overflow-hidden"
                            >
                                {/* Shimmer Effect */}
                                <motion.div
                                    animate={{ x: ["-100%", "200%"] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                                />
                            </motion.div>
                        </div>

                        <p className="text-right text-xs text-slate-500 mt-2">
                            {Math.round(stats.next_level_xp - stats.xp)} XP to next level
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
