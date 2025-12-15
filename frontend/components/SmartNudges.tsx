"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Nudge {
    type: string;
    priority: string;
    icon: string;
    title: string;
    message: string;
    action?: { label: string; href: string };
    color: string;
}

export default function SmartNudges() {
    const [nudges, setNudges] = useState<Nudge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchNudges();
        // Refresh every 5 minutes
        const interval = setInterval(fetchNudges, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchNudges = async () => {
        try {
            const res = await fetch(`${API_URL}/nudges/`);
            const data = await res.json();
            setNudges(data.nudges || []);
        } catch (error) {
            console.error("Failed to fetch nudges:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const dismissNudge = (idx: number) => {
        setDismissed(prev => new Set(prev).add(`${nudges[idx].type}-${nudges[idx].title}`));
    };

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; border: string; icon: string }> = {
            amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "text-amber-400" },
            emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "text-emerald-400" },
            indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", icon: "text-indigo-400" },
            purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", icon: "text-purple-400" },
            orange: { bg: "bg-orange-500/10", border: "border-orange-500/30", icon: "text-orange-400" },
            yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: "text-yellow-400" },
        };
        return colors[color] || colors.indigo;
    };

    const visibleNudges = nudges.filter(n => !dismissed.has(`${n.type}-${n.title}`));

    if (isLoading || visibleNudges.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Smart Nudges</h3>
                <span className="text-xs text-neutral-500">({visibleNudges.length})</span>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {visibleNudges.slice(0, 3).map((nudge, idx) => {
                        const colors = getColorClasses(nudge.color);

                        return (
                            <motion.div
                                key={`${nudge.type}-${nudge.title}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20, height: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "relative p-4 rounded-xl border",
                                    colors.bg,
                                    colors.border
                                )}
                            >
                                <button
                                    onClick={() => dismissNudge(idx)}
                                    className="absolute top-2 right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-4 h-4 text-neutral-500" />
                                </button>

                                <div className="flex items-start gap-3 pr-6">
                                    <span className="text-2xl">{nudge.icon}</span>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-white text-sm mb-1">{nudge.title}</h4>
                                        <p className="text-xs text-neutral-400 mb-2">{nudge.message}</p>

                                        {nudge.action && (
                                            <Link
                                                href={nudge.action.href}
                                                className={cn(
                                                    "inline-flex items-center gap-1 text-xs font-medium transition-colors",
                                                    colors.icon
                                                )}
                                            >
                                                {nudge.action.label}
                                                <ChevronRight className="w-3 h-3" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {nudge.priority === "high" && (
                                    <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
