"use client";

import { motion } from "framer-motion";

interface TreeOfLifeProps {
    level: number;
    xp: number;
}

export default function TreeOfLife({ level, xp }: TreeOfLifeProps) {
    // Tree grows with level
    const treeHeight = Math.min(100, 30 + level * 2);
    const branchCount = Math.min(8, Math.floor(level / 5) + 2);
    const leafDensity = Math.min(1, 0.3 + level * 0.02);
    const hasFlowers = level >= 20;
    const hasFruits = level >= 40;
    const hasGlow = level >= 60;

    // Color progression
    const getTrunkColor = () => {
        if (level >= 50) return "#8B4513";
        if (level >= 30) return "#A0522D";
        return "#6B4423";
    };

    const getLeafColor = () => {
        if (level >= 60) return "#00FF88";
        if (level >= 40) return "#22C55E";
        if (level >= 20) return "#4ADE80";
        return "#86EFAC";
    };

    return (
        <div className="relative w-full h-80 flex items-end justify-center">
            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-900/30 to-transparent" />

            {/* Glow effect for high levels */}
            {hasGlow && (
                <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-8 w-48 h-48 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${getLeafColor()}40 0%, transparent 70%)`,
                        filter: "blur(20px)"
                    }}
                />
            )}

            <svg viewBox="0 0 200 250" className="h-full relative">
                {/* Trunk */}
                <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                    d={`M100 250 Q100 ${250 - treeHeight * 0.5} 100 ${250 - treeHeight}`}
                    stroke={getTrunkColor()}
                    strokeWidth={8 + level * 0.2}
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Roots */}
                {level >= 10 && (
                    <>
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 1 }}
                            d="M100 250 Q80 260 60 255"
                            stroke={getTrunkColor()}
                            strokeWidth={4}
                            fill="none"
                        />
                        <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1, delay: 1.2 }}
                            d="M100 250 Q120 260 140 255"
                            stroke={getTrunkColor()}
                            strokeWidth={4}
                            fill="none"
                        />
                    </>
                )}

                {/* Branches */}
                {Array.from({ length: branchCount }).map((_, i) => {
                    const y = 250 - treeHeight + (i * treeHeight * 0.8) / branchCount;
                    const direction = i % 2 === 0 ? -1 : 1;
                    const length = 30 + (branchCount - i) * 8;

                    return (
                        <motion.path
                            key={i}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.8, delay: 0.5 + i * 0.2 }}
                            d={`M100 ${y} Q${100 + direction * length * 0.5} ${y - 10} ${100 + direction * length} ${y - 15}`}
                            stroke={getTrunkColor()}
                            strokeWidth={3}
                            fill="none"
                        />
                    );
                })}

                {/* Leaves (circles) */}
                {Array.from({ length: Math.floor(20 * leafDensity) }).map((_, i) => {
                    const angle = (i / 20) * Math.PI * 2;
                    const radius = 25 + Math.random() * 30;
                    const cx = 100 + Math.cos(angle) * radius;
                    const cy = 250 - treeHeight - 20 + Math.sin(angle) * radius * 0.6;
                    const size = 8 + Math.random() * 12;

                    return (
                        <motion.circle
                            key={`leaf-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: leafDensity }}
                            transition={{ duration: 0.5, delay: 1.5 + i * 0.05 }}
                            cx={cx}
                            cy={cy}
                            r={size}
                            fill={getLeafColor()}
                            style={{ filter: hasGlow ? "drop-shadow(0 0 4px #00FF88)" : undefined }}
                        />
                    );
                })}

                {/* Flowers */}
                {hasFlowers && Array.from({ length: 5 }).map((_, i) => {
                    const angle = (i / 5) * Math.PI * 2;
                    const radius = 35 + Math.random() * 20;
                    const cx = 100 + Math.cos(angle) * radius;
                    const cy = 250 - treeHeight - 25 + Math.sin(angle) * radius * 0.5;

                    return (
                        <motion.g key={`flower-${i}`}>
                            <motion.circle
                                initial={{ scale: 0 }}
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                                cx={cx}
                                cy={cy}
                                r={5}
                                fill="#EC4899"
                            />
                            <motion.circle
                                cx={cx}
                                cy={cy}
                                r={2}
                                fill="#FBBF24"
                            />
                        </motion.g>
                    );
                })}

                {/* Fruits */}
                {hasFruits && Array.from({ length: 3 }).map((_, i) => {
                    const angle = (i / 3) * Math.PI + 0.5;
                    const radius = 40;
                    const cx = 100 + Math.cos(angle) * radius;
                    const cy = 250 - treeHeight - 10 + Math.sin(angle) * radius * 0.4;

                    return (
                        <motion.circle
                            key={`fruit-${i}`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 2.5 + i * 0.2 }}
                            cx={cx}
                            cy={cy}
                            r={6}
                            fill="#EF4444"
                            style={{ filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))" }}
                        />
                    );
                })}
            </svg>

            {/* Level label */}
            <div className="absolute bottom-10 text-center">
                <div className="text-sm text-neutral-500">Level</div>
                <div className="text-2xl font-bold">{level}</div>
            </div>
        </div>
    );
}
