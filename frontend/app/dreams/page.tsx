"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DreamPage() {
    const [dream, setDream] = useState("");
    const [interpretation, setInterpretation] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleInterpret = async () => {
        if (!dream) return;
        setLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/dreams/interpret`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: dream }),
            });
            const data = await res.json();
            setInterpretation(data);
        } catch (error) {
            console.error("Dream error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pb-32 flex flex-col items-center relative overflow-hidden">
            {/* Mystical Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />

            {/* Stars (Simplified) */}
            <div className="absolute top-10 left-20 w-1 h-1 bg-white rounded-full opacity-50 animate-pulse" />
            <div className="absolute top-40 right-40 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse delay-700" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="z-10 w-full max-w-2xl mt-12"
            >
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 mb-6 border border-indigo-500/20">
                        <Moon className="text-indigo-400" size={32} />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-200">Dreamscape</h1>
                    <p className="text-slate-400">Unlock the secrets of your subconscious.</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-white/5 shadow-2xl">
                    <textarea
                        value={dream}
                        onChange={(e) => setDream(e.target.value)}
                        placeholder="I was flying over a golden city, but my wings were made of paper..."
                        className="w-full h-40 bg-transparent text-lg resize-none focus:outline-none placeholder:text-slate-600"
                    />

                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleInterpret}
                            disabled={loading || !dream}
                            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="animate-pulse">Consulting the Oracle...</span>
                            ) : (
                                <>
                                    <Sparkles size={18} />
                                    <span>Interpret Dream</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {interpretation && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 bg-indigo-950/30 border border-indigo-500/20 rounded-3xl p-8"
                    >
                        <div className="flex items-center gap-3 mb-4 text-indigo-300">
                            <BookOpen size={20} />
                            <span className="font-medium uppercase tracking-wider text-sm">Interpretation</span>
                        </div>
                        <p className="text-lg leading-relaxed text-indigo-100 mb-6">
                            {interpretation.interpretation}
                        </p>

                        <div className="flex flex-wrap gap-3">
                            {interpretation.symbols?.map((symbol: string, i: number) => (
                                <span key={i} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm">
                                    {symbol}
                                </span>
                            ))}
                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                                Theme: {interpretation.theme}
                            </span>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
