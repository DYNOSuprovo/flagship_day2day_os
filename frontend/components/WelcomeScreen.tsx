"use client";

import { motion } from 'framer-motion';
import HomeAvatar from './HomeAvatar';
import { ArrowRight, Terminal } from 'lucide-react';

export default function WelcomeScreen({ onEnter }: { onEnter: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-between overflow-hidden"
        >
            {/* Solid Background - Ensures nothing bleeds through */}
            <div className="absolute inset-0 bg-slate-950" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-80" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

            {/* Ambient Glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />

            {/* 3D Avatar Section */}
            <div className="relative z-10 flex-1 w-full max-w-4xl flex items-center justify-center pt-8">
                <HomeAvatar />
            </div>

            {/* Bottom Content - Title & Button */}
            <div className="relative z-20 text-center pb-24 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col items-center"
                >
                    {/* System Badge */}
                    <div className="flex items-center gap-2 text-emerald-400 mb-6 tracking-[0.3em] text-[10px] font-mono uppercase bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/30">
                        <Terminal size={10} />
                        <span>System Online</span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tight">
                        FLAGSHIP
                    </h1>
                </motion.div>

                {/* CTA Button */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.8 }}
                    onClick={onEnter}
                    className="group relative px-10 py-4 bg-white text-slate-900 rounded-lg font-bold text-lg flex items-center gap-3 mx-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                    <span>INITIALIZE</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
            </div>
        </motion.div>
    );
}

