"use client";

import { motion } from 'framer-motion';

interface StepAvatarProps {
    onSelect: (archetype: string) => void;
    selected: string | null;
}

const archetypes = [
    {
        id: 'monk',
        title: 'The Monk',
        description: 'Focus, Discipline, Mindfulness',
        color: 'from-amber-500 to-orange-600',
        icon: '🧘'
    },
    {
        id: 'beast',
        title: 'The Beast',
        description: 'Strength, Health, Vitality',
        color: 'from-red-500 to-rose-600',
        icon: '💪'
    },
    {
        id: 'emperor',
        title: 'The Emperor',
        description: 'Wealth, Strategy, Control',
        color: 'from-emerald-500 to-green-600',
        icon: '👑'
    },
    {
        id: 'creator',
        title: 'The Creator',
        description: 'Balance, Creativity, Growth',
        color: 'from-blue-500 to-indigo-600',
        icon: '✨'
    }
];

export const StepAvatar = ({ onSelect, selected }: StepAvatarProps) => {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-white mb-8">Choose Your Archetype</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {archetypes.map((type) => (
                    <motion.div
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(type.id)}
                        className={`
                            relative overflow-hidden cursor-pointer rounded-2xl p-6 border-2 transition-all duration-300
                            ${selected === type.id
                                ? 'border-white bg-slate-800/80 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                                : 'border-white/10 bg-slate-900/40 hover:border-white/30 hover:bg-slate-800/60'}
                        `}
                    >
                        {/* Background Gradient */}
                        <div className={`
                            absolute -right-12 -top-12 w-48 h-48 rounded-full blur-[60px] opacity-20 bg-gradient-to-br ${type.color}
                        `} />

                        <div className="relative z-10 flex items-start gap-4">
                            <div className={`
                                w-16 h-16 rounded-xl flex items-center justify-center text-4xl bg-gradient-to-br ${type.color} shadow-lg
                            `}>
                                {type.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">{type.title}</h3>
                                <p className="text-slate-400 text-sm">{type.description}</p>
                            </div>
                        </div>

                        {selected === type.id && (
                            <motion.div
                                layoutId="selection-ring"
                                className="absolute inset-0 border-2 border-white/50 rounded-2xl pointer-events-none"
                            />
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
