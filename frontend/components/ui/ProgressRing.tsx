"use client";

import React, { useEffect, useState } from 'react';

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    color: string;
    backgroundColor?: string;
    label?: string;
    value?: string;
    icon?: React.ReactNode;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 12,
    color,
    backgroundColor = 'rgba(255,255,255,0.1)',
    label,
    value,
    icon
}: ProgressRingProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    useEffect(() => {
        // Delay to trigger animation after mount
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);
        return () => clearTimeout(timer);
    }, [progress]);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedProgress / 100) * circumference;
    const center = size / 2;

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress Ring */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                        transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                />
            </svg>
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {icon && <div className="mb-1">{icon}</div>}
                {value && <span className="text-2xl font-bold text-white">{value}</span>}
            </div>
            {label && (
                <span className="mt-2 text-sm font-medium text-slate-400">{label}</span>
            )}
        </div>
    );
}

interface ConcentricRingsProps {
    rings: {
        progress: number;
        color: string;
        label: string;
        value: string;
    }[];
    size?: number;
}

export function ConcentricRings({ rings, size = 280 }: ConcentricRingsProps) {
    const [animatedRings, setAnimatedRings] = useState(rings.map(r => ({ ...r, progress: 0 })));
    const [animatedPercent, setAnimatedPercent] = useState(0);

    useEffect(() => {
        // Staggered animation for each ring
        rings.forEach((ring, index) => {
            const timer = setTimeout(() => {
                setAnimatedRings(prev => {
                    const updated = [...prev];
                    updated[index] = { ...ring };
                    return updated;
                });
            }, 200 + (index * 150)); // Stagger by 150ms per ring
            return () => clearTimeout(timer);
        });

        // Animate center percentage
        const avgProgress = Math.round(rings.reduce((acc, r) => acc + r.progress, 0) / rings.length);
        const duration = 1500;
        const steps = 60;
        const increment = avgProgress / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += increment;
            if (current >= avgProgress) {
                setAnimatedPercent(avgProgress);
                clearInterval(interval);
            } else {
                setAnimatedPercent(Math.round(current));
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [rings]);

    const strokeWidth = 18;
    const gap = 8;
    const center = size / 2;

    return (
        <div className="relative">
            <svg width={size} height={size} className="transform -rotate-90">
                {animatedRings.map((ring, index) => {
                    const radius = center - (strokeWidth / 2) - (index * (strokeWidth + gap));
                    const circumference = radius * 2 * Math.PI;
                    const offset = circumference - (ring.progress / 100) * circumference;

                    return (
                        <React.Fragment key={index}>
                            {/* Background */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth={strokeWidth}
                                fill="none"
                            />
                            {/* Progress */}
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                stroke={ring.color}
                                strokeWidth={strokeWidth}
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                style={{
                                    transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                        </React.Fragment>
                    );
                })}
            </svg>

            {/* Center Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white tabular-nums">
                    {animatedPercent}%
                </span>
                <span className="text-sm text-slate-400">Overall</span>
            </div>
        </div>
    );
}

interface RingLegendProps {
    rings: {
        color: string;
        label: string;
        value: string;
        progress: number;
    }[];
}

export function RingLegend({ rings }: RingLegendProps) {
    const [animatedProgress, setAnimatedProgress] = useState(rings.map(() => 0));

    useEffect(() => {
        // Staggered animation for legend bars
        rings.forEach((ring, index) => {
            const timer = setTimeout(() => {
                setAnimatedProgress(prev => {
                    const updated = [...prev];
                    updated[index] = ring.progress;
                    return updated;
                });
            }, 500 + (index * 200)); // Start after rings, stagger by 200ms
        });
    }, [rings]);

    return (
        <div className="flex flex-col gap-4 mt-6">
            {rings.map((ring, index) => (
                <div key={index} className="flex items-center gap-3">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: ring.color }}
                    />
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-300">{ring.label}</span>
                            <span className="text-sm font-bold text-white">{ring.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${animatedProgress[index]}%`,
                                    backgroundColor: ring.color,
                                    transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
