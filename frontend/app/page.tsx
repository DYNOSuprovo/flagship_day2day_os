"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { TiltCard } from '@/components/TiltCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen'; // Assuming WelcomeScreen is in components

export default function Home() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onEnter={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="container mx-auto px-4 pt-8 pb-32 max-w-7xl"
        >
          {/* Hero Section */}
          <div className="text-center mb-20 pt-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-pulse-glow">
                  Elevate Your Life
                </span>
                <br />
                <span className="text-white">With AI Wisdom</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed"
            >
              Your personal AI ecosystem for holistic growth.
              Seamlessly integrating Diet, Finance, and Emotional wellness.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center gap-4"
            >
              <Link href="/dashboard">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-white text-black hover:bg-slate-200 border-none shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.5)] transition-shadow">
                  Get Started
                </Button>
              </Link>
              <Link href="/emotional">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-slate-700 text-slate-300 hover:bg-slate-800">
                  Talk to AI
                </Button>
              </Link>
            </motion.div>
            {/* 3D Avatar Section */}
            {/* HomeAvatar component is removed from here as per the instruction's provided code snippet */}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 h-auto md:h-[700px]">

            {/* Emotional - Tall Card */}
            <div className="md:row-span-2 h-full">
              <Link href="/emotional" className="block h-full">
                <TiltCard className="h-full">
                  <div className="h-full glass-panel rounded-3xl p-8 relative overflow-hidden border-t border-white/10 group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/30"></div>
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center text-5xl mb-8 group-hover:rotate-12 transition-transform shadow-lg shadow-purple-500/20">
                        🧘
                      </div>
                      <h2 className="text-4xl font-bold text-white mb-4">Emotional<br />Wellness</h2>
                      <p className="text-purple-100/80 mb-auto text-lg leading-relaxed">Find clarity with guidance rooted in the Bhagavad Gita.</p>
                      <div className="mt-8 flex items-center text-white font-bold text-lg group-hover:translate-x-2 transition-transform">
                        Start Chat <span className="ml-2">→</span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </div>

            {/* Diet - Wide/Square Card */}
            <div className="h-full">
              <Link href="/diet" className="block h-full">
                <TiltCard className="h-full">
                  <div className="h-full glass-panel rounded-3xl p-8 relative overflow-hidden border-t border-white/10 group">
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mb-10 transition-all group-hover:bg-emerald-500/20"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
                          🥗
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">AI PLAN</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Diet & Nutrition</h2>
                      <p className="text-slate-200 text-lg">Personalized meal plans & food analysis.</p>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </div>

            {/* Finance - Wide/Square Card */}
            <div className="h-full">
              <Link href="/finance" className="block h-full">
                <TiltCard className="h-full">
                  <div className="h-full glass-panel rounded-3xl p-8 relative overflow-hidden border-t border-white/10 group">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-10 -mt-10 transition-all group-hover:bg-blue-500/20"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/20">
                          💰
                        </div>
                        <span className="bg-blue-500/20 text-blue-200 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">TRACKER</span>
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Finance Tracker</h2>
                      <p className="text-slate-200 text-lg">Smart budgeting & expense forecasting.</p>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </div>

            {/* Dashboard - Wide Card Spanning 2 Cols */}
            <div className="md:col-span-2 h-full">
              <Link href="/dashboard" className="block h-full">
                <TiltCard className="h-full">
                  <div className="h-full glass-panel rounded-3xl p-8 relative overflow-hidden border-t border-white/10 flex items-center group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
                    <div className="relative z-10 flex-1 pr-8">
                      <h2 className="text-3xl font-bold text-white mb-2">Your Dashboard</h2>
                      <p className="text-slate-200 text-lg">Track your progress across all domains in one unified view.</p>
                    </div>
                    <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/20">
                      📊
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </div>

          </div>
        </motion.div>
      )}
    </>
  );
}
