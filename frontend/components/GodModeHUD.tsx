"use client";

import { motion } from "framer-motion";
import { Activity, Brain, DollarSign, Zap, Shield, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricProps {
    label: string;
    value: string;
    trend: "up" | "down" | "stable";
    color: string;
    icon: any;
}

const Metric = ({ label, value, trend, color, icon: Icon }: MetricProps) => (
    <div className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded-lg backdrop-blur-sm hover:border-white/20 transition-colors group">
        <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-md bg-opacity-10", color.replace("text-", "bg-"))}>
                <Icon size={16} className={color} />
            </div>
            <div>
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 font-mono">{label}</div>
                <div className="text-lg font-bold font-mono group-hover:text-white transition-colors">{value}</div>
            </div>
        </div>
        <div className={cn("text-xs font-mono", trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-neutral-500")}>
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "■"}
        </div>
    </div>
);

export default function GodModeHUD() {
    // Mock Data - In real app, fetch from backend
    const los = 78; // Life Optimization Score

    return (
        <div className="w-full mb-8">
            {/* Top Bar - LOS Score */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Crosshair className="text-emerald-500 animate-spin-slow" size={20} />
                    <h2 className="text-sm font-mono text-emerald-500 tracking-[0.2em] uppercase">God Mode Active</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase">System Status</div>
                        <div className="text-xs text-emerald-500 font-mono">OPTIMAL</div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="text-right">
                        <div className="text-[10px] text-neutral-500 font-mono uppercase">L.O.S.</div>
                        <div className="text-2xl font-bold text-white font-mono leading-none">{los}<span className="text-sm text-neutral-600">/100</span></div>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric
                    label="Financial Velocity"
                    value="$2,450/mo"
                    trend="up"
                    color="text-emerald-400"
                    icon={DollarSign}
                />
                <Metric
                    label="Cognitive Load"
                    value="45%"
                    trend="stable"
                    color="text-blue-400"
                    icon={Brain}
                />
                <Metric
                    label="Physical Output"
                    value="850 kcal"
                    trend="up"
                    color="text-orange-400"
                    icon={Zap}
                />
                <Metric
                    label="Risk Shield"
                    value="98%"
                    trend="stable"
                    color="text-purple-400"
                    icon={Shield}
                />
            </div>

            {/* Decorative Lines */}
            <div className="mt-4 flex items-center gap-1 opacity-30">
                <div className="h-[2px] w-full bg-emerald-500/50" />
                <div className="h-[2px] w-4 bg-emerald-500" />
                <div className="h-[2px] w-2 bg-emerald-500" />
            </div>
        </div>
    );
}
