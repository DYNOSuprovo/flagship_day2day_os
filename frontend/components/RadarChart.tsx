"use client";

import { motion } from "framer-motion";

interface RadarChartProps {
    data: { label: string; value: number; max: number; color: string }[];
    size?: number;
}

export default function RadarChart({ data, size = 300 }: RadarChartProps) {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;
    const levels = 5;

    // Calculate points for each data item
    const getPoint = (value: number, max: number, index: number) => {
        const angle = (Math.PI * 2 * index) / data.length - Math.PI / 2;
        const r = (value / max) * radius;
        return {
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r
        };
    };

    // Create polygon path
    const createPolygonPath = (points: { x: number; y: number }[]) => {
        return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
    };

    const dataPoints = data.map((d, i) => getPoint(d.value, d.max, i));

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                {/* Background circles */}
                {Array.from({ length: levels }).map((_, i) => (
                    <polygon
                        key={i}
                        points={data
                            .map((_, j) => {
                                const angle = (Math.PI * 2 * j) / data.length - Math.PI / 2;
                                const r = ((i + 1) / levels) * radius;
                                return `${centerX + Math.cos(angle) * r},${centerY + Math.sin(angle) * r}`;
                            })
                            .join(" ")}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                    />
                ))}

                {/* Axis lines */}
                {data.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={centerX + Math.cos(angle) * radius}
                            y2={centerY + Math.sin(angle) * radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1}
                        />
                    );
                })}

                {/* Data polygon */}
                <motion.path
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    d={createPolygonPath(dataPoints)}
                    fill="url(#radarGradient)"
                    fillOpacity={0.3}
                    stroke="url(#radarStroke)"
                    strokeWidth={2}
                />

                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#A855F7" />
                        <stop offset="100%" stopColor="#22C55E" />
                    </linearGradient>
                </defs>

                {/* Data points */}
                {dataPoints.map((point, i) => (
                    <motion.circle
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        cx={point.x}
                        cy={point.y}
                        r={5}
                        fill={data[i].color}
                        stroke="white"
                        strokeWidth={2}
                        className="cursor-pointer hover:r-6 transition-all"
                    />
                ))}

                {/* Labels */}
                {data.map((item, i) => {
                    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
                    const labelRadius = radius + 30;
                    const x = centerX + Math.cos(angle) * labelRadius;
                    const y = centerY + Math.sin(angle) * labelRadius;

                    return (
                        <g key={`label-${i}`}>
                            <text
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-neutral-400 text-xs font-medium"
                            >
                                {item.label}
                            </text>
                            <text
                                x={x}
                                y={y + 14}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white text-xs font-bold"
                            >
                                {Math.round((item.value / item.max) * 100)}%
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
