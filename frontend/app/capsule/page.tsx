"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    Plus,
    Lock,
    Unlock,
    Gift,
    Sparkles,
    X,
    Calendar,
    Heart,
    Send
} from "lucide-react";
import { cn } from "@/lib/utils";
import Confetti from "@/components/Confetti";

interface TimeCapsule {
    id: string;
    message: string;
    mood: string;
    open_date: string;
    created_at: string;
    days_until: number;
    is_openable: boolean;
    opened_at?: string;
}

interface Prompt {
    emoji: string;
    prompt: string;
}

const MOOD_OPTIONS = [
    { emoji: "😊", label: "Happy", value: "happy" },
    { emoji: "😌", label: "Calm", value: "calm" },
    { emoji: "🔥", label: "Motivated", value: "motivated" },
    { emoji: "💭", label: "Reflective", value: "reflective" },
    { emoji: "💪", label: "Determined", value: "determined" },
    { emoji: "🙏", label: "Grateful", value: "grateful" },
];

export default function TimeCapsulePage() {
    const [capsules, setCapsules] = useState<{
        locked: TimeCapsule[];
        unlockable: TimeCapsule[];
        opened: TimeCapsule[];
    }>({ locked: [], unlockable: [], opened: [] });
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [openedCapsule, setOpenedCapsule] = useState<TimeCapsule | null>(null);

    const [newCapsule, setNewCapsule] = useState({
        message: "",
        mood: "happy",
        openDate: "",
        preset: ""
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchCapsules();
        fetchPrompts();
    }, []);

    const fetchCapsules = async () => {
        try {
            const res = await fetch(`${API_URL}/capsule/`);
            const data = await res.json();
            setCapsules({
                locked: data.locked || [],
                unlockable: data.unlockable || [],
                opened: data.opened || []
            });
        } catch (error) {
            console.error("Failed to fetch capsules:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPrompts = async () => {
        try {
            const res = await fetch(`${API_URL}/capsule/prompts`);
            const data = await res.json();
            setPrompts(data.prompts || []);
        } catch (error) {
            console.error("Failed to fetch prompts:", error);
        }
    };

    const createCapsule = async () => {
        if (!newCapsule.message || !newCapsule.openDate) return;

        try {
            await fetch(`${API_URL}/capsule/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newCapsule.message,
                    mood: newCapsule.mood,
                    open_date: newCapsule.openDate,
                    tags: []
                })
            });
            setShowCreate(false);
            setNewCapsule({ message: "", mood: "happy", openDate: "", preset: "" });
            fetchCapsules();
        } catch (error) {
            console.error("Failed to create capsule:", error);
        }
    };

    const openCapsule = async (capsuleId: string) => {
        try {
            const res = await fetch(`${API_URL}/capsule/${capsuleId}/open`, {
                method: "POST"
            });
            const data = await res.json();

            if (data.success) {
                setOpenedCapsule(data.capsule);
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 100);
                fetchCapsules();
            }
        } catch (error) {
            console.error("Failed to open capsule:", error);
        }
    };

    const setPreset = (days: number, label: string) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        setNewCapsule({ ...newCapsule, openDate: date.toISOString().split("T")[0], preset: label });
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            <Confetti trigger={showConfetti} particleCount={100} />

            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-pink-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 mb-6 border border-pink-500/20">
                        <Clock className="text-pink-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Time Capsule</h1>
                    <p className="text-neutral-400 mb-6">Send messages to your future self</p>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 bg-pink-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-pink-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Capsule
                    </button>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-2xl">
                {/* Unlockable Section */}
                {capsules.unlockable.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-400">
                            <Gift className="w-5 h-5" />
                            Ready to Open! ({capsules.unlockable.length})
                        </h3>
                        <div className="space-y-3">
                            {capsules.unlockable.map(capsule => (
                                <div
                                    key={capsule.id}
                                    className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Unlock className="w-5 h-5 text-yellow-400" />
                                            <div>
                                                <div className="text-sm text-neutral-400">
                                                    Created {new Date(capsule.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => openCapsule(capsule.id)}
                                            className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                                        >
                                            Open ✨
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Locked Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-pink-400" />
                        Sealed Capsules ({capsules.locked.length})
                    </h3>

                    {capsules.locked.length === 0 ? (
                        <div className="text-center py-12 text-neutral-500">
                            <div className="text-4xl mb-4">💌</div>
                            <p>No sealed capsules yet</p>
                            <p className="text-sm">Create one to send a message to future you!</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {capsules.locked.map((capsule, idx) => (
                                <motion.div
                                    key={capsule.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center text-xl">
                                            🔒
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm">
                                                    {MOOD_OPTIONS.find(m => m.value === capsule.mood)?.emoji || "💭"}
                                                </span>
                                                <span className="text-neutral-400 text-sm">
                                                    Opens {capsule.open_date}
                                                </span>
                                            </div>
                                            <div className="text-xs text-neutral-500">
                                                {capsule.days_until} day{capsule.days_until !== 1 ? "s" : ""} remaining
                                            </div>
                                            <div className="mt-2 h-1 bg-neutral-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500"
                                                    style={{
                                                        width: `${Math.max(5, 100 - (capsule.days_until / 30) * 100)}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Opened History */}
                {capsules.opened.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8"
                    >
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-400">
                            <Sparkles className="w-5 h-5" />
                            Memory Lane
                        </h3>
                        <div className="space-y-3">
                            {capsules.opened.slice(-5).map(capsule => (
                                <div
                                    key={capsule.id}
                                    className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                                >
                                    <p className="text-sm mb-2">{capsule.message}</p>
                                    <div className="text-xs text-neutral-500">
                                        Written {new Date(capsule.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
                        onClick={() => setShowCreate(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">Create Time Capsule</h2>
                                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-neutral-800 rounded-lg">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Prompts */}
                            <div className="mb-4">
                                <label className="text-sm text-neutral-400 mb-2 block">Need inspiration?</label>
                                <div className="flex flex-wrap gap-2">
                                    {prompts.slice(0, 4).map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setNewCapsule({ ...newCapsule, message: prompt.prompt })}
                                            className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-full transition-colors"
                                        >
                                            {prompt.emoji} {prompt.prompt.slice(0, 20)}...
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Message */}
                            <div className="mb-4">
                                <label className="text-sm text-neutral-400 mb-2 block">Your message</label>
                                <textarea
                                    value={newCapsule.message}
                                    onChange={(e) => setNewCapsule({ ...newCapsule, message: e.target.value })}
                                    placeholder="Dear future me..."
                                    rows={4}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            {/* Mood */}
                            <div className="mb-4">
                                <label className="text-sm text-neutral-400 mb-2 block">Current mood</label>
                                <div className="flex flex-wrap gap-2">
                                    {MOOD_OPTIONS.map(mood => (
                                        <button
                                            key={mood.value}
                                            onClick={() => setNewCapsule({ ...newCapsule, mood: mood.value })}
                                            className={cn(
                                                "px-3 py-2 rounded-lg transition-all",
                                                newCapsule.mood === mood.value
                                                    ? "bg-pink-500 text-white"
                                                    : "bg-neutral-800 hover:bg-neutral-700"
                                            )}
                                        >
                                            {mood.emoji} {mood.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Open Date */}
                            <div className="mb-6">
                                <label className="text-sm text-neutral-400 mb-2 block">Open date</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                        { days: 7, label: "1 week" },
                                        { days: 30, label: "1 month" },
                                        { days: 90, label: "3 months" },
                                        { days: 365, label: "1 year" }
                                    ].map(preset => (
                                        <button
                                            key={preset.days}
                                            onClick={() => setPreset(preset.days, preset.label)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-sm",
                                                newCapsule.preset === preset.label
                                                    ? "bg-pink-500 text-white"
                                                    : "bg-neutral-800 hover:bg-neutral-700"
                                            )}
                                        >
                                            {preset.label}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="date"
                                    value={newCapsule.openDate}
                                    onChange={(e) => setNewCapsule({ ...newCapsule, openDate: e.target.value, preset: "" })}
                                    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>

                            <button
                                onClick={createCapsule}
                                disabled={!newCapsule.message || !newCapsule.openDate}
                                className={cn(
                                    "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2",
                                    newCapsule.message && newCapsule.openDate
                                        ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400"
                                        : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                )}
                            >
                                <Send className="w-5 h-5" />
                                Seal Capsule
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Opened Capsule Modal */}
            <AnimatePresence>
                {openedCapsule && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50"
                        onClick={() => setOpenedCapsule(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, rotateY: 180 }}
                            animate={{ scale: 1, rotateY: 0 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl p-8 w-full max-w-md text-center border border-purple-500/30"
                        >
                            <div className="text-6xl mb-4">💌</div>
                            <h3 className="text-xl font-bold mb-2">Message from the Past</h3>
                            <p className="text-neutral-300 mb-4">{openedCapsule.message}</p>
                            <div className="text-sm text-neutral-400 mb-6">
                                Written on {new Date(openedCapsule.created_at).toLocaleDateString()}
                            </div>
                            <button
                                onClick={() => setOpenedCapsule(null)}
                                className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
