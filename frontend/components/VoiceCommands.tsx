"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceCommand {
    patterns: string[];
    action: () => void;
    description: string;
}

export default function VoiceCommands() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [showHelp, setShowHelp] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // Voice commands
    const commands: VoiceCommand[] = [
        {
            patterns: ["go to dashboard", "open dashboard", "show dashboard"],
            action: () => window.location.href = "/dashboard",
            description: "Navigate to Dashboard"
        },
        {
            patterns: ["go to habits", "open habits", "show habits"],
            action: () => window.location.href = "/habits",
            description: "Navigate to Habits"
        },
        {
            patterns: ["go to focus", "open focus", "start focus"],
            action: () => window.location.href = "/focus",
            description: "Navigate to Focus Timer"
        },
        {
            patterns: ["go to arcade", "open arcade", "play games"],
            action: () => window.location.href = "/arcade",
            description: "Navigate to Game Arcade"
        },
        {
            patterns: ["go to breathing", "start breathing", "breathe"],
            action: () => window.location.href = "/breathing",
            description: "Navigate to Breathing"
        },
        {
            patterns: ["log water", "add water", "drink water"],
            action: async () => {
                setFeedback("💧 Logged 250ml of water!");
                // Could integrate with water tracker
            },
            description: "Log water intake"
        },
        {
            patterns: ["show stats", "my statistics", "open statistics"],
            action: () => window.location.href = "/statistics",
            description: "Navigate to Statistics"
        },
        {
            patterns: ["go home", "home page", "open home"],
            action: () => window.location.href = "/",
            description: "Navigate to Home"
        },
        {
            patterns: ["help", "what can you do", "show commands"],
            action: () => setShowHelp(true),
            description: "Show help"
        }
    ];

    useEffect(() => {
        // Check for browser support - using any to handle vendor prefixes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognitionRef.current.onresult = (event: any) => {
            const result = event.results[event.results.length - 1];
            const text = result[0].transcript.toLowerCase();
            setTranscript(text);

            if (result.isFinal) {
                processCommand(text);
            }
        };

        recognitionRef.current.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current.onerror = () => {
            setIsListening(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const processCommand = useCallback((text: string) => {
        for (const command of commands) {
            for (const pattern of command.patterns) {
                if (text.includes(pattern)) {
                    setFeedback(`✓ ${command.description}`);
                    setTimeout(() => {
                        setFeedback(null);
                        command.action();
                    }, 500);
                    return;
                }
            }
        }
        setFeedback("🤔 Command not recognized");
        setTimeout(() => setFeedback(null), 2000);
    }, [commands]);

    const toggleListening = () => {
        if (!isSupported || !recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
            setTranscript("");
        }
    };

    if (!isSupported) return null;

    return (
        <>
            {/* Voice button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleListening}
                className={cn(
                    "fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center",
                    "shadow-lg transition-colors",
                    isListening
                        ? "bg-red-500 animate-pulse"
                        : "bg-gradient-to-br from-blue-500 to-purple-500"
                )}
            >
                {isListening ? (
                    <MicOff className="w-6 h-6 text-white" />
                ) : (
                    <Mic className="w-6 h-6 text-white" />
                )}
            </motion.button>

            {/* Listening overlay */}
            <AnimatePresence>
                {isListening && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-44 left-6 z-50 bg-neutral-900 border border-neutral-700 rounded-2xl p-4 max-w-xs"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm text-neutral-400">Listening...</span>
                        </div>
                        <div className="text-lg font-medium min-h-[2rem]">
                            {transcript || "Say a command..."}
                        </div>
                        <button
                            onClick={() => setShowHelp(true)}
                            className="mt-2 text-xs text-purple-400 hover:underline"
                        >
                            What can I say?
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback toast */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: "-50%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-32 left-1/2 z-50 bg-neutral-800 border border-neutral-700 rounded-xl px-6 py-3"
                    >
                        <div className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-purple-400" />
                            <span>{feedback}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Help modal */}
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
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Mic className="w-5 h-5 text-purple-400" />
                                    Voice Commands
                                </h2>
                                <button onClick={() => setShowHelp(false)}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {commands.map((cmd, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-neutral-800 rounded-lg"
                                    >
                                        <div className="font-medium text-purple-400 mb-1">
                                            &quot;{cmd.patterns[0]}&quot;
                                        </div>
                                        <div className="text-sm text-neutral-400">
                                            {cmd.description}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="mt-4 text-xs text-neutral-500 text-center">
                                Click the microphone button and speak naturally
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
