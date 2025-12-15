"use client";

import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceCommander } from '@/hooks/useVoiceCommander';
import { useMatrixSound } from '@/hooks/useMatrixSound';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';

export default function OracleInterface() {
    const router = useRouter();
    const [lastAction, setLastAction] = useState('');
    const { playClick, playActivate } = useMatrixSound();

    const commands = useMemo(() => [
        {
            command: 'go to dashboard',
            action: () => { router.push('/dashboard'); setLastAction('Navigating to Dashboard...'); }
        },
        {
            command: 'go to focus',
            action: () => { router.push('/focus'); setLastAction('Initiating Focus Mode...'); }
        },
        {
            command: 'go to dreams',
            action: () => { router.push('/dreams'); setLastAction('Opening Dream Journal...'); }
        },
        {
            command: 'go to habits',
            action: () => { router.push('/habits'); setLastAction('Tracking Habits...'); }
        },
        {
            command: 'activate god mode',
            action: () => { setLastAction('God Mode Activated (Visual Only)'); }
        }
    ], [router]);

    const { isListening, transcript, startListening, stopListening } = useVoiceCommander(commands);

    const handleToggle = () => {
        if (isListening) {
            stopListening();
            playClick();
        } else {
            startListening();
            playActivate();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {(isListening || lastAction) && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-black/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl max-w-xs text-right"
                    >
                        {isListening && (
                            <div className="flex items-center justify-end gap-2 text-emerald-400 mb-1">
                                <span className="text-xs font-mono animate-pulse">LISTENING...</span>
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            </div>
                        )}
                        {transcript && <p className="text-white font-mono text-sm">"{transcript}"</p>}
                        {lastAction && <p className="text-emerald-400 font-mono text-xs mt-2">Command: {lastAction}</p>}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleToggle}
                className={`p-4 rounded-full transition-all duration-300 shadow-lg ${isListening
                    ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-500 hover:bg-emerald-500/30'
                    } border backdrop-blur-sm group`}
            >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />}
            </button>
        </div>
    );
}
