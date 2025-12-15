"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface StreakFireProps {
    streak: number;
    size?: "sm" | "md" | "lg";
}

export default function StreakFire({ streak, size = "md" }: StreakFireProps) {
    const [flames, setFlames] = useState<number[]>([]);

    // Fire intensity based on streak
    const intensity = Math.min(streak / 7, 1); // Max at 7-day streak
    const flameCount = Math.floor(3 + intensity * 7);

    useEffect(() => {
        setFlames(Array.from({ length: flameCount }, (_, i) => i));
    }, [flameCount]);

    if (streak < 1) return null;

    const sizeConfig = {
        sm: { width: 40, height: 50, fontSize: "text-sm" },
        md: { width: 60, height: 75, fontSize: "text-base" },
        lg: { width: 80, height: 100, fontSize: "text-lg" }
    };

    const config = sizeConfig[size];

    // Color gradient based on streak
    const getFireColor = () => {
        if (streak >= 30) return { inner: "#00FFFF", outer: "#0088FF" }; // Blue fire (legendary)
        if (streak >= 14) return { inner: "#9333EA", outer: "#A855F7" }; // Purple fire (epic)
        if (streak >= 7) return { inner: "#FBBF24", outer: "#F97316" };  // Golden fire (rare)
        return { inner: "#FCD34D", outer: "#EF4444" }; // Normal fire
    };

    const colors = getFireColor();

    return (
        <div className="relative flex flex-col items-center">
            {/* Fire container */}
            <div
                className="relative"
                style={{ width: config.width, height: config.height }}
            >
                {/* Glow effect */}
                <div
                    className="absolute inset-0 blur-xl rounded-full opacity-50"
                    style={{
                        background: `radial-gradient(circle, ${colors.inner} 0%, transparent 70%)`,
                        transform: "scale(1.5)"
                    }}
                />

                {/* Individual flames */}
                {flames.map((i) => {
                    const delay = i * 0.1;
                    const xOffset = (Math.random() - 0.5) * 20;
                    const heightVariation = 0.7 + Math.random() * 0.3;

                    return (
                        <motion.div
                            key={i}
                            className="absolute bottom-0 left-1/2"
                            style={{
                                width: config.width * 0.4,
                                height: config.height * heightVariation,
                                marginLeft: xOffset - config.width * 0.2,
                                background: `linear-gradient(to top, ${colors.outer} 0%, ${colors.inner} 50%, transparent 100%)`,
                                borderRadius: "50% 50% 20% 20%",
                                transformOrigin: "bottom center",
                                filter: "blur(1px)"
                            }}
                            animate={{
                                scaleY: [1, 1.2, 0.9, 1.1, 1],
                                scaleX: [1, 0.9, 1.1, 0.95, 1],
                                opacity: [0.8, 1, 0.9, 1, 0.8],
                                rotate: [-5, 5, -3, 4, -5]
                            }}
                            transition={{
                                duration: 0.5 + Math.random() * 0.3,
                                repeat: Infinity,
                                delay,
                                ease: "easeInOut"
                            }}
                        />
                    );
                })}

                {/* Core flame */}
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2"
                    style={{
                        width: config.width * 0.5,
                        height: config.height * 0.8,
                        background: `linear-gradient(to top, ${colors.outer} 0%, ${colors.inner} 40%, white 90%, transparent 100%)`,
                        borderRadius: "50% 50% 20% 20%",
                        filter: "blur(2px)"
                    }}
                    animate={{
                        scaleY: [1, 1.15, 0.95, 1.1, 1],
                        scaleX: [1, 0.95, 1.05, 0.97, 1]
                    }}
                    transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Sparks */}
                {streak >= 3 && Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                        key={`spark-${i}`}
                        className="absolute rounded-full"
                        style={{
                            width: 4,
                            height: 4,
                            backgroundColor: colors.inner,
                            left: "50%",
                            bottom: "50%",
                            boxShadow: `0 0 6px ${colors.inner}`
                        }}
                        animate={{
                            y: [0, -config.height * 0.8],
                            x: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 40],
                            opacity: [1, 0],
                            scale: [1, 0.5]
                        }}
                        transition={{
                            duration: 1 + Math.random() * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>

            {/* Streak number */}
            <motion.div
                className={`mt-2 font-bold ${config.fontSize} flex items-center gap-1`}
                style={{ color: colors.inner }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
            >
                <span>{streak}</span>
                <span className="text-xs opacity-70">day{streak !== 1 ? "s" : ""}</span>
            </motion.div>

            {/* Streak tier badge */}
            {streak >= 7 && (
                <div
                    className="mt-1 text-xs px-2 py-0.5 rounded-full"
                    style={{
                        backgroundColor: `${colors.inner}20`,
                        color: colors.inner,
                        border: `1px solid ${colors.inner}40`
                    }}
                >
                    {streak >= 30 ? "🔥 LEGENDARY" : streak >= 14 ? "⚡ EPIC" : "✨ ON FIRE"}
                </div>
            )}
        </div>
    );
}
