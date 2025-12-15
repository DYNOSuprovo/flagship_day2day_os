"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Command, X } from "lucide-react";

interface Shortcut {
    key: string;
    description: string;
    action: () => void;
}

export default function KeyboardShortcuts() {
    const router = useRouter();
    const [showHelp, setShowHelp] = useState(false);

    const shortcuts: Shortcut[] = [
        { key: "g d", description: "Go to Dashboard", action: () => router.push("/dashboard") },
        { key: "g h", description: "Go to Habits", action: () => router.push("/habits") },
        { key: "g f", description: "Go to Focus", action: () => router.push("/focus") },
        { key: "g e", description: "Go to Emotional", action: () => router.push("/emotional") },
        { key: "g m", description: "Go to Diet (Meals)", action: () => router.push("/diet") },
        { key: "g $", description: "Go to Finance", action: () => router.push("/finance") },
        { key: "g c", description: "Go to Challenges", action: () => router.push("/challenges") },
        { key: "g a", description: "Go to Achievements", action: () => router.push("/achievements") },
        { key: "g s", description: "Go to Statistics", action: () => router.push("/statistics") },
        { key: "g p", description: "Go to Profile", action: () => router.push("/profile") },
        { key: "g g", description: "Go to Goals", action: () => router.push("/goals") },
        { key: "g r", description: "Go to Weekly Report", action: () => router.push("/report") },
        { key: "?", description: "Show keyboard shortcuts", action: () => setShowHelp(true) },
        { key: "Esc", description: "Close dialogs", action: () => setShowHelp(false) },
    ];

    const [buffer, setBuffer] = useState<string[]>([]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger if typing in input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }

        const key = e.key.toLowerCase();

        // Handle escape
        if (e.key === "Escape") {
            setShowHelp(false);
            setBuffer([]);
            return;
        }

        // Handle ? for help
        if (e.key === "?" && !e.shiftKey) {
            e.preventDefault();
            setShowHelp(prev => !prev);
            return;
        }

        // Build buffer for multi-key shortcuts
        const newBuffer = [...buffer, key].slice(-2);
        setBuffer(newBuffer);

        // Check for matches
        const combo = newBuffer.join(" ");
        const shortcut = shortcuts.find(s => s.key.toLowerCase() === combo);

        if (shortcut) {
            e.preventDefault();
            shortcut.action();
            setBuffer([]);
        }

        // Clear buffer after timeout
        setTimeout(() => setBuffer([]), 1000);
    }, [buffer, router]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <>
            {/* Command indicator */}
            {buffer.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 flex items-center gap-2"
                >
                    <Command className="w-4 h-4 text-neutral-400" />
                    <span className="font-mono text-sm">{buffer.join(" ")}</span>
                    <span className="text-neutral-500">...</span>
                </motion.div>
            )}

            {/* Help Modal */}
            <AnimatePresence>
                {showHelp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-[100]"
                        onClick={() => setShowHelp(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-neutral-900 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                        <Command className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Keyboard Shortcuts</h2>
                                        <p className="text-sm text-neutral-500">Power user navigation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowHelp(false)}
                                    className="p-2 hover:bg-neutral-800 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3">Navigation</div>
                                {shortcuts.filter(s => s.key.startsWith("g")).map((shortcut) => (
                                    <div
                                        key={shortcut.key}
                                        className="flex items-center justify-between py-2 px-3 hover:bg-neutral-800 rounded-lg"
                                    >
                                        <span className="text-sm text-neutral-300">{shortcut.description}</span>
                                        <kbd className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs font-mono">
                                            {shortcut.key}
                                        </kbd>
                                    </div>
                                ))}

                                <div className="text-xs text-neutral-500 uppercase tracking-wider mb-3 mt-6">General</div>
                                {shortcuts.filter(s => !s.key.startsWith("g")).map((shortcut) => (
                                    <div
                                        key={shortcut.key}
                                        className="flex items-center justify-between py-2 px-3 hover:bg-neutral-800 rounded-lg"
                                    >
                                        <span className="text-sm text-neutral-300">{shortcut.description}</span>
                                        <kbd className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs font-mono">
                                            {shortcut.key}
                                        </kbd>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-neutral-500 mt-6 text-center">
                                Press <kbd className="px-1 bg-neutral-800 rounded">?</kbd> anywhere to toggle this help
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
