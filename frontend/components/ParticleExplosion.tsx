"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
    size: number;
    velocityX: number;
    velocityY: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    shape: "circle" | "star" | "square" | "triangle";
}

interface ParticleExplosionProps {
    trigger: boolean;
    x?: number;
    y?: number;
    particleCount?: number;
    colors?: string[];
    spread?: number;
    onComplete?: () => void;
}

const SHAPES = ["circle", "star", "square", "triangle"] as const;

export default function ParticleExplosion({
    trigger,
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    particleCount = 30,
    colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"],
    spread = 200,
    onComplete
}: ParticleExplosionProps) {
    const [particles, setParticles] = useState<Particle[]>([]);

    const createParticles = useCallback(() => {
        const newParticles: Particle[] = [];

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const velocity = 5 + Math.random() * 10;

            newParticles.push({
                id: Date.now() + i,
                x,
                y,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 8 + Math.random() * 12,
                velocityX: Math.cos(angle) * velocity,
                velocityY: Math.sin(angle) * velocity,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20,
                opacity: 1,
                shape: SHAPES[Math.floor(Math.random() * SHAPES.length)]
            });
        }

        setParticles(newParticles);

        // Cleanup after animation
        setTimeout(() => {
            setParticles([]);
            onComplete?.();
        }, 2000);
    }, [x, y, particleCount, colors, onComplete]);

    useEffect(() => {
        if (trigger) {
            createParticles();
        }
    }, [trigger, createParticles]);

    useEffect(() => {
        if (particles.length === 0) return;

        const interval = setInterval(() => {
            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.velocityX,
                    y: p.y + p.velocityY + 2, // gravity
                    velocityX: p.velocityX * 0.98,
                    velocityY: p.velocityY * 0.98 + 0.5,
                    rotation: p.rotation + p.rotationSpeed,
                    opacity: p.opacity - 0.02
                })).filter(p => p.opacity > 0)
            );
        }, 16);

        return () => clearInterval(interval);
    }, [particles.length]);

    const renderShape = (particle: Particle) => {
        switch (particle.shape) {
            case "star":
                return (
                    <svg viewBox="0 0 24 24" fill={particle.color} width={particle.size} height={particle.size}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                );
            case "square":
                return (
                    <div
                        style={{
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            borderRadius: 2
                        }}
                    />
                );
            case "triangle":
                return (
                    <div
                        style={{
                            width: 0,
                            height: 0,
                            borderLeft: `${particle.size / 2}px solid transparent`,
                            borderRight: `${particle.size / 2}px solid transparent`,
                            borderBottom: `${particle.size}px solid ${particle.color}`
                        }}
                    />
                );
            default:
                return (
                    <div
                        style={{
                            width: particle.size,
                            height: particle.size,
                            backgroundColor: particle.color,
                            borderRadius: "50%"
                        }}
                    />
                );
        }
    };

    return (
        <div className="fixed inset-0 pointer-events-none z-[200]">
            <AnimatePresence>
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        style={{
                            position: "absolute",
                            left: particle.x,
                            top: particle.y,
                            transform: `rotate(${particle.rotation}deg)`,
                            opacity: particle.opacity
                        }}
                    >
                        {renderShape(particle)}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Global explosion trigger hook
let globalTrigger: ((x?: number, y?: number) => void) | null = null;

export function useParticleExplosion() {
    const [trigger, setTrigger] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const explode = useCallback((x?: number, y?: number) => {
        setPosition({
            x: x ?? window.innerWidth / 2,
            y: y ?? window.innerHeight / 2
        });
        setTrigger(true);
        setTimeout(() => setTrigger(false), 100);
    }, []);

    useEffect(() => {
        globalTrigger = explode;
        return () => { globalTrigger = null; };
    }, [explode]);

    return { trigger, position, explode };
}

export function triggerGlobalExplosion(x?: number, y?: number) {
    globalTrigger?.(x, y);
}
