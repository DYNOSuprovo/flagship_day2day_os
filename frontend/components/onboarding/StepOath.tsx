"use client";

import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';

interface StepOathProps {
    onComplete: () => void;
    archetype: string;
}

export const StepOath = ({ onComplete, archetype }: StepOathProps) => {
    return (
        <div className="w-full max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">The Oath</h2>

            <div className="bg-slate-900/50 p-8 rounded-2xl border border-white/10 mb-10 backdrop-blur-sm">
                <p className="text-xl text-slate-300 italic mb-6 leading-relaxed">
                    "I accept the path of <span className="text-white font-bold uppercase">{archetype}</span>.
                    I commit to transforming my body, sharpening my mind, and mastering my resources.
                    I release my old self to make way for the new."
                </p>
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <p className="text-slate-400 mb-6 text-sm uppercase tracking-widest">Type to Confirm</p>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onComplete}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full text-lg font-bold tracking-wide overflow-hidden"
            >
                <span className="relative z-10">I ACCEPT</span>
                <Fingerprint className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />

                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>
        </div>
    );
};
