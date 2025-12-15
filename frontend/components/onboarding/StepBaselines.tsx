"use client";

import { motion } from 'framer-motion';

interface StepBaselinesProps {
    baselines: {
        stress: number;
        energy: number;
        wealth: number;
    };
    onChange: (key: string, value: number) => void;
}

const sliders = [
    { key: 'energy', label: 'Energy Level', minLabel: 'Burnt Out', maxLabel: 'Limitless', color: 'accent-red-500' },
    { key: 'stress', label: 'Stress Level', minLabel: 'Zen', maxLabel: 'Panic', color: 'accent-blue-500' },
    { key: 'wealth', label: 'Financial Confidence', minLabel: 'Broke', maxLabel: 'Secure', color: 'accent-emerald-500' },
];

export const StepBaselines = ({ baselines, onChange }: StepBaselinesProps) => {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-2">Establish Baselines</h2>
            <p className="text-slate-400 text-center mb-10">Be honest. We build from here.</p>

            <div className="space-y-12">
                {sliders.map((slider) => (
                    <div key={slider.key} className="relative">
                        <div className="flex justify-between mb-4">
                            <label className="text-lg font-medium text-white">{slider.label}</label>
                            <span className="text-2xl font-bold text-white">
                                {(baselines as any)[slider.key]}%
                            </span>
                        </div>

                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={(baselines as any)[slider.key]}
                            onChange={(e) => onChange(slider.key, parseInt(e.target.value))}
                            className={`w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer ${slider.color}`}
                        />

                        <div className="flex justify-between mt-2 text-xs text-slate-500 uppercase tracking-widest font-semibold">
                            <span>{slider.minLabel}</span>
                            <span>{slider.maxLabel}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
