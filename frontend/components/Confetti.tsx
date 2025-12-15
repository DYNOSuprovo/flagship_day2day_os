"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
    particleCount?: number;
}

const COLORS = ["#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#3b82f6", "#06b6d4"];

export default function Confetti({ trigger, duration = 3000, particleCount = 50 }: ConfettiProps) {
    const [particles, setParticles] = useState<any[]>([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);

            const newParticles = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                size: Math.random() * 10 + 5,
                delay: Math.random() * 0.5,
                rotation: Math.random() * 360,
                type: Math.random() > 0.5 ? "circle" : "square"
            }));

            setParticles(newParticles);

            setTimeout(() => {
                setIsActive(false);
                setParticles([]);
            }, duration);
        }
    }, [trigger, duration, particleCount, isActive]);

    return (
        <AnimatePresence>
            {isActive && (
                <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
                    {particles.map((particle) => (
                        <motion.div
                            key={particle.id}
                            initial={{
                                x: `${particle.x}vw`,
                                y: -20,
                                rotate: 0,
                                scale: 1,
                                opacity: 1
                            }}
                            animate={{
                                y: "110vh",
                                rotate: particle.rotation + 720,
                                scale: [1, 1.2, 0.8, 1],
                                opacity: [1, 1, 0.8, 0]
                            }}
                            transition={{
                                duration: 2 + Math.random(),
                                delay: particle.delay,
                                ease: "easeIn"
                            }}
                            style={{
                                position: "absolute",
                                width: particle.size,
                                height: particle.size,
                                backgroundColor: particle.color,
                                borderRadius: particle.type === "circle" ? "50%" : "2px",
                                boxShadow: `0 0 10px ${particle.color}40`
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    );
}

// Hook to trigger confetti
export function useConfetti() {
    const [showConfetti, setShowConfetti] = useState(false);

    const celebrate = () => {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 100);
    };

    return { showConfetti, celebrate, Confetti: () => <Confetti trigger={showConfetti} /> };
}
