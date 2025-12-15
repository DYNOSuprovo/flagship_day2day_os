"use client";

import { Card } from '@/components/ui/Card';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConcentricRings, RingLegend } from '@/components/ui/ProgressRing';
import { GamificationWidget } from '@/components/GamificationWidget';
import LifeScoreWidget from '@/components/LifeScoreWidget';
import SmartNudges from '@/components/SmartNudges';
import {
    Activity,
    Wallet,
    Heart,
    Sparkles,
    ArrowUpRight,
    Zap,
    Target,
    Brain,
    Utensils,
    TrendingUp
} from 'lucide-react';

interface DashboardData {
    metrics: {
        weight_progress: { current: number; goal: number; unit: string; status: string; };
        budget: { remaining: number; total: number; spent: number; currency: string; };
        habit_streak: { current: number; longest: number; unit: string; encouragement: string; };
    };
    recent_activity: Array<{ id: string; type: string; description: string; icon: string; timestamp: string; }>;
    ai_insight: { message: string; confidence: number; tags: string[]; };
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');

        const fetchDashboard = async () => {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const response = await fetch(`${API_URL}/dashboard/overview`);
                if (!response.ok) throw new Error('Network response was not ok');
                const dashboardData = await response.json();
                setData(dashboardData);
            } catch (err) {
                console.error('Dashboard fetch error, using mock data:', err);
                setData({
                    metrics: {
                        weight_progress: { current: 75.5, goal: 70, unit: 'kg', status: 'on_track' },
                        budget: { remaining: 12500, total: 50000, spent: 37500, currency: 'INR' },
                        habit_streak: { current: 12, longest: 21, unit: 'days', encouragement: 'Unstoppable!' }
                    },
                    recent_activity: [],
                    ai_insight: {
                        message: "Your neural patterns indicate high focus. Capitalize on this momentum.",
                        confidence: 0.95,
                        tags: ["Productivity", "Focus", "Flow"]
                    }
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (isLoading || !data) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                <p className="text-slate-400 animate-pulse">Loading System...</p>
            </div>
        </div>
    );

    // Calculate ring progress values
    const weightProgress = Math.max(0, Math.min(100,
        100 - ((data.metrics.weight_progress.current - data.metrics.weight_progress.goal) / data.metrics.weight_progress.goal * 100)
    ));
    const budgetProgress = (data.metrics.budget.remaining / data.metrics.budget.total) * 100;
    const habitProgress = (data.metrics.habit_streak.current / data.metrics.habit_streak.longest) * 100;

    const rings = [
        {
            progress: Math.min(weightProgress, 100),
            color: '#10b981',
            label: 'Health',
            value: `${data.metrics.weight_progress.current} kg`
        },
        {
            progress: Math.min(budgetProgress, 100),
            color: '#3b82f6',
            label: 'Wealth',
            value: `₹${(data.metrics.budget.remaining / 1000).toFixed(1)}k`
        },
        {
            progress: Math.min(habitProgress, 100),
            color: '#a855f7',
            label: 'Mind',
            value: `${data.metrics.habit_streak.current} days`
        },
    ];

    return (
        <div className="container mx-auto px-6 max-w-7xl py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-400 mb-2 font-medium"
                    >
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-white tracking-tight"
                    >
                        {greeting}, <span className="text-emerald-400">Traveler</span>
                    </motion.h1>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-300"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-medium">System Online</span>
                </motion.div>
            </div>

            {/* Gamification Widget + Life Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <GamificationWidget />
                <LifeScoreWidget />
            </div>

            {/* Smart Nudges */}
            <SmartNudges />

            {/* Main Content - Apple Fitness Style */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

                {/* Circular Rings Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card glass className="p-8 flex flex-col items-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] -ml-40 -mt-40" />
                        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-[80px] -mr-20 -mb-20" />

                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-2 relative z-10">
                            <Activity className="w-5 h-5 text-emerald-400" />
                            Life Balance
                        </h2>

                        {/* Concentric Rings */}
                        <div className="relative z-10 mb-6">
                            <ConcentricRings rings={rings} size={280} />
                        </div>

                        {/* Ring Legend */}
                        <div className="w-full max-w-xs relative z-10">
                            <RingLegend rings={rings} />
                        </div>
                    </Card>
                </motion.div>

                {/* AI Insight Card - NEW BOLD DESIGN */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card glass className="p-0 h-full flex flex-col overflow-hidden">
                        {/* Gradient Header */}
                        <div className="px-8 py-6 bg-gradient-to-r from-emerald-600/20 via-teal-600/10 to-transparent border-b border-slate-700/50">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-400/30">
                                    <Brain className="w-8 h-8 text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Daily Synthesis</h2>
                                    <p className="text-sm text-emerald-400/80">AI-powered insights for you</p>
                                </div>
                            </div>
                        </div>

                        {/* Quote Section */}
                        <div className="flex-1 px-8 py-8">
                            <div className="text-5xl text-emerald-500/30 font-serif mb-2">"</div>
                            <p className="text-xl text-white leading-relaxed font-light px-4 -mt-6">
                                {data.ai_insight.message}
                            </p>
                            <div className="text-5xl text-emerald-500/30 font-serif text-right mt-2">"</div>
                        </div>

                        {/* Tags Row */}
                        <div className="px-8 pb-6">
                            <div className="flex flex-wrap gap-3">
                                {data.ai_insight.tags.map((tag, i) => (
                                    <span key={i} className="px-5 py-2.5 rounded-full bg-slate-800 border border-slate-600 text-sm font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-yellow-400" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats Footer - Full Width */}
                        <div className="grid grid-cols-3 border-t border-slate-700/50">
                            <div className="p-6 text-center border-r border-slate-700/50 bg-emerald-500/5">
                                <div className="text-4xl font-black text-emerald-400">{data.metrics.habit_streak.current}</div>
                                <div className="text-sm text-slate-400 mt-2 font-medium">Day Streak</div>
                            </div>
                            <div className="p-6 text-center border-r border-slate-700/50 bg-blue-500/5">
                                <div className="text-4xl font-black text-blue-400">
                                    {Math.round((data.metrics.budget.remaining / data.metrics.budget.total) * 100)}%
                                </div>
                                <div className="text-sm text-slate-400 mt-2 font-medium">Budget Left</div>
                            </div>
                            <div className="p-6 text-center bg-purple-500/5">
                                <div className="text-4xl font-black text-purple-400">
                                    {(data.ai_insight.confidence * 100).toFixed(0)}%
                                </div>
                                <div className="text-sm text-slate-400 mt-2 font-medium">AI Confidence</div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* Quick Actions Row - LARGER SIZE */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
            >
                <QuickActionCard
                    icon={<Utensils className="w-8 h-8" />}
                    label="Diet Plan"
                    description="Meal planning & tracking"
                    href="/diet"
                    color="emerald"
                />
                <QuickActionCard
                    icon={<Wallet className="w-8 h-8" />}
                    label="Finance"
                    description="Budget & expenses"
                    href="/finance"
                    color="blue"
                />
                <QuickActionCard
                    icon={<Heart className="w-8 h-8" />}
                    label="Emotional"
                    description="Mental wellness"
                    href="/emotional"
                    color="rose"
                />
                <QuickActionCard
                    icon={<Target className="w-8 h-8" />}
                    label="Habits"
                    description="Daily routines"
                    href="/habits"
                    color="purple"
                />
            </motion.div>

            {/* Activity Feed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <Card glass className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <div className="p-2 bg-slate-800 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                            Recent Activity
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs text-slate-400">Live</span>
                        </div>
                    </div>

                    {data.recent_activity.length > 0 ? (
                        <div className="space-y-2">
                            {data.recent_activity.slice(0, 5).map((activity, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 hover:border-slate-600/50 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                        <span className="text-2xl">{activity.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-white">{activity.description}</p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-slate-600" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
                                <Sparkles className="w-8 h-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No activity yet</p>
                            <p className="text-slate-600 text-sm mt-1">Start your day to see activity here</p>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
}

function QuickActionCard({ icon, label, description, href, color }: { icon: React.ReactNode; label: string; description?: string; href: string; color: string }) {
    const borderColors: Record<string, string> = {
        emerald: "border-emerald-500/50 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20",
        blue: "border-blue-500/50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20",
        rose: "border-rose-500/50 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-500/20",
        purple: "border-purple-500/50 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20",
    };

    const iconColors: Record<string, string> = {
        emerald: "text-emerald-400 bg-emerald-500/15 border-emerald-500/40",
        blue: "text-blue-400 bg-blue-500/15 border-blue-500/40",
        rose: "text-rose-400 bg-rose-500/15 border-rose-500/40",
        purple: "text-purple-400 bg-purple-500/15 border-purple-500/40",
    };

    return (
        <Link href={href}>
            <div className={`p-8 flex flex-col items-center gap-4 group transition-all duration-300 cursor-pointer rounded-3xl bg-slate-900/80 border-2 ${borderColors[color]}`}>
                <div className={`p-5 rounded-2xl border-2 ${iconColors[color]} group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                </div>
                <div className="text-center">
                    <span className="text-base font-bold text-white block">{label}</span>
                    {description && <span className="text-xs text-slate-500 mt-1 block">{description}</span>}
                </div>
                <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-white transition-colors" />
            </div>
        </Link>
    );
}

