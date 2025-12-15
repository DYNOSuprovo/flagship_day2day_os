"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, Trophy, Star } from "lucide-react";

interface Location {
    id: string;
    name: string;
    lat: number;
    lng: number;
    type: "milestone" | "achievement" | "goal";
    description: string;
    unlocked: boolean;
    xp: number;
}

const LOCATIONS: Location[] = [
    { id: "1", name: "Starting Point", lat: 0, lng: 0, type: "milestone", description: "Your journey begins", unlocked: true, xp: 0 },
    { id: "2", name: "First Habit", lat: 30, lng: 45, type: "milestone", description: "Completed first habit", unlocked: true, xp: 100 },
    { id: "3", name: "Week Warrior", lat: 45, lng: -30, type: "achievement", description: "7-day streak", unlocked: true, xp: 500 },
    { id: "4", name: "Focus Master", lat: -20, lng: 60, type: "goal", description: "100 focus sessions", unlocked: false, xp: 1000 },
    { id: "5", name: "Mindful Peak", lat: 60, lng: 120, type: "achievement", description: "30-day meditation", unlocked: false, xp: 2000 },
    { id: "6", name: "Summit", lat: 80, lng: -60, type: "milestone", description: "Level 50 reached", unlocked: false, xp: 5000 },
    { id: "7", name: "Zenith", lat: -45, lng: -90, type: "goal", description: "All habits mastered", unlocked: false, xp: 10000 },
];

export default function EarthJourneyPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [rotation, setRotation] = useState(0);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

    // Draw 3D-ish Earth
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;

        const draw = () => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const radius = Math.min(centerX, centerY) - 40;

            // Clear
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Stars background
            for (let i = 0; i < 100; i++) {
                const x = (Math.sin(i * 137.5 + rotation * 0.01) * 0.5 + 0.5) * canvas.width;
                const y = (Math.cos(i * 137.5) * 0.5 + 0.5) * canvas.height;
                // Use deterministic brightness based on index instead of Math.random()
                const brightness = ((i * 17) % 50 + 20) / 100;
                ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }

            // Earth glow
            const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 1.3);
            glowGradient.addColorStop(0, "rgba(59, 130, 246, 0.3)");
            glowGradient.addColorStop(1, "transparent");
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Earth sphere gradient
            const earthGradient = ctx.createRadialGradient(
                centerX - radius * 0.3, centerY - radius * 0.3, 0,
                centerX, centerY, radius
            );
            earthGradient.addColorStop(0, "#4ade80");
            earthGradient.addColorStop(0.3, "#22c55e");
            earthGradient.addColorStop(0.7, "#166534");
            earthGradient.addColorStop(1, "#052e16");

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = earthGradient;
            ctx.fill();

            // Ocean overlay
            const oceanGradient = ctx.createRadialGradient(
                centerX + radius * 0.2, centerY + radius * 0.2, 0,
                centerX, centerY, radius
            );
            oceanGradient.addColorStop(0, "rgba(59, 130, 246, 0.6)");
            oceanGradient.addColorStop(0.5, "rgba(37, 99, 235, 0.4)");
            oceanGradient.addColorStop(1, "rgba(30, 58, 138, 0.3)");

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.fillStyle = oceanGradient;
            ctx.fill();

            // Grid lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.lineWidth = 1;

            // Latitude lines
            for (let lat = -60; lat <= 60; lat += 30) {
                const y = centerY + (lat / 90) * radius;
                const xOffset = Math.sqrt(Math.max(0, radius * radius - (y - centerY) ** 2));
                ctx.beginPath();
                ctx.ellipse(centerX, y, xOffset, xOffset * 0.1, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Longitude lines
            for (let lng = 0; lng < 180; lng += 30) {
                const angle = (lng + rotation) * Math.PI / 180;
                const ellipseRadiusX = Math.abs(Math.cos(angle) * radius);
                if (ellipseRadiusX > 0) {
                    ctx.beginPath();
                    ctx.ellipse(centerX, centerY, ellipseRadiusX, radius, 0, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            // Draw location markers
            LOCATIONS.forEach(loc => {
                const adjustedLng = loc.lng + rotation;
                const x = centerX + Math.sin(adjustedLng * Math.PI / 180) * Math.cos(loc.lat * Math.PI / 180) * radius * 0.85;
                const y = centerY - Math.sin(loc.lat * Math.PI / 180) * radius * 0.85;

                // Only draw if on visible side
                if (Math.cos(adjustedLng * Math.PI / 180) > -0.2) {
                    const isHovered = hoveredPoint === loc.id;
                    const markerSize = isHovered ? 12 : 8;

                    // Glow
                    if (loc.unlocked) {
                        ctx.beginPath();
                        ctx.arc(x, y, markerSize + 4, 0, Math.PI * 2);
                        ctx.fillStyle = loc.type === "milestone" ? "rgba(234, 179, 8, 0.3)" :
                            loc.type === "achievement" ? "rgba(168, 85, 247, 0.3)" :
                                "rgba(59, 130, 246, 0.3)";
                        ctx.fill();
                    }

                    // Marker
                    ctx.beginPath();
                    ctx.arc(x, y, markerSize, 0, Math.PI * 2);
                    ctx.fillStyle = loc.unlocked
                        ? (loc.type === "milestone" ? "#eab308" :
                            loc.type === "achievement" ? "#a855f7" : "#3b82f6")
                        : "#525252";
                    ctx.fill();

                    // Inner dot
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, Math.PI * 2);
                    ctx.fillStyle = "#fff";
                    ctx.fill();
                }
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(animationId);
    }, [rotation, hoveredPoint]);

    // Auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(r => (r + 0.2) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const unlockedCount = LOCATIONS.filter(l => l.unlocked).length;
    const totalXP = LOCATIONS.filter(l => l.unlocked).reduce((sum, l) => sum + l.xp, 0);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Header */}
            <div className="py-8 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 mb-4">
                        <Globe className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Earth Journey</h1>
                    <p className="text-neutral-400">Your wellness voyage around the world</p>
                </motion.div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{unlockedCount}/{LOCATIONS.length}</div>
                    <div className="text-xs text-neutral-500">Locations</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{totalXP.toLocaleString()}</div>
                    <div className="text-xs text-neutral-500">XP Earned</div>
                </div>
            </div>

            {/* Globe */}
            <div className="flex justify-center px-6">
                <div className="relative">
                    <canvas
                        ref={canvasRef}
                        width={350}
                        height={350}
                        className="rounded-full"
                    />

                    {/* Rotation controls */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
                        <button
                            onClick={() => setRotation(r => r - 30)}
                            className="px-3 py-1 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700"
                        >
                            ← Rotate
                        </button>
                        <button
                            onClick={() => setRotation(r => r + 30)}
                            className="px-3 py-1 bg-neutral-800 rounded-lg text-sm hover:bg-neutral-700"
                        >
                            Rotate →
                        </button>
                    </div>
                </div>
            </div>

            {/* Location list */}
            <div className="px-6 mt-8">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-400" />
                    Destinations
                </h3>
                <div className="space-y-2">
                    {LOCATIONS.map(loc => (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-xl border flex items-center gap-4 ${loc.unlocked
                                ? "bg-neutral-900 border-neutral-800"
                                : "bg-neutral-950 border-neutral-900 opacity-50"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${loc.type === "milestone" ? "bg-yellow-500/20" :
                                loc.type === "achievement" ? "bg-purple-500/20" :
                                    "bg-blue-500/20"
                                }`}>
                                {loc.type === "milestone" ? <Star className="w-5 h-5 text-yellow-400" /> :
                                    loc.type === "achievement" ? <Trophy className="w-5 h-5 text-purple-400" /> :
                                        <MapPin className="w-5 h-5 text-blue-400" />}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium">{loc.name}</div>
                                <div className="text-sm text-neutral-400">{loc.description}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-green-400">+{loc.xp} XP</div>
                                {loc.unlocked && <div className="text-xs text-neutral-500">Unlocked</div>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
