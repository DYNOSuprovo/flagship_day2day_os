"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StepAvatar } from '@/components/onboarding/StepAvatar';
import { StepBaselines } from '@/components/onboarding/StepBaselines';
import { StepOath } from '@/components/onboarding/StepOath';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [data, setData] = useState({
        archetype: null as string | null,
        baselines: {
            stress: 50,
            energy: 50,
            wealth: 50
        }
    });

    const steps = [
        { id: 'archetype', component: StepAvatar },
        { id: 'baselines', component: StepBaselines },
        { id: 'oath', component: StepOath }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(c => c - 1);
        }
    };

    const handleComplete = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    archetype: data.archetype,
                    baseline_stress: data.baselines.stress,
                    baseline_energy: data.baselines.energy,
                    baseline_wealth: data.baselines.wealth,
                    onboarding_completed: 1
                })
            });

            // Dramatic pause or animation could go here
            router.push('/dashboard');
        } catch (error) {
            console.error('Onboarding failed', error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col justify-center py-20">
            {/* Background Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
                {/* Progress Indicators */}
                <div className="flex justify-center gap-3 mb-12">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx <= currentStep ? 'w-12 bg-white' : 'w-4 bg-slate-700'
                                }`}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 0 && (
                            <StepAvatar
                                selected={data.archetype}
                                onSelect={(type) => setData({ ...data, archetype: type })}
                            />
                        )}
                        {currentStep === 1 && (
                            <StepBaselines
                                baselines={data.baselines}
                                onChange={(key, val) => setData({
                                    ...data,
                                    baselines: { ...data.baselines, [key]: val }
                                })}
                            />
                        )}
                        {currentStep === 2 && (
                            <StepOath
                                archetype={data.archetype || "Traveler"}
                                onComplete={handleComplete}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                <div className="fixed bottom-10 left-0 right-0 px-6">
                    <div className="container mx-auto max-w-4xl flex justify-between items-center">
                        <button
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            className={`p-4 rounded-full text-slate-400 hover:text-white transition-colors disabled:opacity-0`}
                        >
                            <ArrowLeft />
                        </button>

                        {currentStep < 2 && (
                            <button
                                onClick={handleNext}
                                disabled={currentStep === 0 && !data.archetype}
                                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold
                                    disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform
                                `}
                            >
                                Continue <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
