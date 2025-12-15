"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Settings,
    Volume2,
    VolumeX,
    Bell,
    BellOff,
    Moon,
    Sun,
    Palette,
    User,
    Shield,
    Trash2,
    RotateCcw,
    ChevronRight,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsState {
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    darkMode: boolean;
    accentColor: string;
}

const ACCENT_COLORS = [
    { id: "emerald", color: "#10b981", name: "Emerald" },
    { id: "blue", color: "#3b82f6", name: "Blue" },
    { id: "purple", color: "#8b5cf6", name: "Purple" },
    { id: "pink", color: "#ec4899", name: "Pink" },
    { id: "orange", color: "#f59e0b", name: "Orange" },
    { id: "cyan", color: "#06b6d4", name: "Cyan" },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsState>({
        soundEnabled: true,
        notificationsEnabled: true,
        darkMode: true,
        accentColor: "emerald"
    });

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem("appSettings");
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        localStorage.setItem("appSettings", JSON.stringify(newSettings));

        // Apply immediately if needed
        if (key === "soundEnabled" && value) {
            playSound("click");
        }
    };

    const playSound = (type: string) => {
        if (!settings.soundEnabled) return;
        // In production, would play actual sounds
        console.log(`Playing sound: ${type}`);
    };

    const resetSettings = () => {
        const defaults: SettingsState = {
            soundEnabled: true,
            notificationsEnabled: true,
            darkMode: true,
            accentColor: "emerald"
        };
        setSettings(defaults);
        localStorage.setItem("appSettings", JSON.stringify(defaults));
    };

    const clearAllData = async () => {
        if (confirm("This will clear all your progress and data. Are you sure?")) {
            localStorage.clear();
            // Could also call backend to clear data
            window.location.reload();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Hero */}
            <div className="relative py-16 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-slate-500/20 rounded-full blur-[120px] -z-10" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-500/10 mb-6 border border-slate-500/20">
                        <Settings className="text-slate-400" size={32} />
                    </div>

                    <h1 className="text-4xl font-bold mb-2">Settings</h1>
                    <p className="text-neutral-400">Customize your experience</p>
                </motion.div>
            </div>

            <div className="container mx-auto px-6 max-w-2xl">
                {/* Sound & Notifications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900/50 rounded-2xl border border-neutral-800 mb-6 overflow-hidden"
                >
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="font-bold text-white">Audio & Notifications</h3>
                    </div>

                    <div className="divide-y divide-neutral-800">
                        {/* Sound Toggle */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {settings.soundEnabled ? (
                                    <Volume2 className="w-5 h-5 text-emerald-400" />
                                ) : (
                                    <VolumeX className="w-5 h-5 text-neutral-500" />
                                )}
                                <div>
                                    <div className="font-medium">Sound Effects</div>
                                    <div className="text-xs text-neutral-500">Play sounds on actions</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    settings.soundEnabled ? "bg-emerald-500" : "bg-neutral-700"
                                )}
                            >
                                <motion.div
                                    animate={{ x: settings.soundEnabled ? 24 : 2 }}
                                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                />
                            </button>
                        </div>

                        {/* Notifications Toggle */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {settings.notificationsEnabled ? (
                                    <Bell className="w-5 h-5 text-purple-400" />
                                ) : (
                                    <BellOff className="w-5 h-5 text-neutral-500" />
                                )}
                                <div>
                                    <div className="font-medium">Notifications</div>
                                    <div className="text-xs text-neutral-500">Smart nudges and reminders</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSetting("notificationsEnabled", !settings.notificationsEnabled)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    settings.notificationsEnabled ? "bg-purple-500" : "bg-neutral-700"
                                )}
                            >
                                <motion.div
                                    animate={{ x: settings.notificationsEnabled ? 24 : 2 }}
                                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                />
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Appearance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-neutral-900/50 rounded-2xl border border-neutral-800 mb-6 overflow-hidden"
                >
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="font-bold text-white">Appearance</h3>
                    </div>

                    <div className="divide-y divide-neutral-800">
                        {/* Theme */}
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                {settings.darkMode ? (
                                    <Moon className="w-5 h-5 text-indigo-400" />
                                ) : (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                )}
                                <div>
                                    <div className="font-medium">Dark Mode</div>
                                    <div className="text-xs text-neutral-500">Use dark theme</div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateSetting("darkMode", !settings.darkMode)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-colors relative",
                                    settings.darkMode ? "bg-indigo-500" : "bg-neutral-700"
                                )}
                            >
                                <motion.div
                                    animate={{ x: settings.darkMode ? 24 : 2 }}
                                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                                />
                            </button>
                        </div>

                        {/* Accent Color */}
                        <div className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Palette className="w-5 h-5 text-pink-400" />
                                <div>
                                    <div className="font-medium">Accent Color</div>
                                    <div className="text-xs text-neutral-500">Choose your theme color</div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {ACCENT_COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        onClick={() => updateSetting("accentColor", color.id)}
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center transition-transform",
                                            settings.accentColor === color.id && "ring-2 ring-white ring-offset-2 ring-offset-neutral-950 scale-110"
                                        )}
                                        style={{ backgroundColor: color.color }}
                                        title={color.name}
                                    >
                                        {settings.accentColor === color.id && (
                                            <Check className="w-5 h-5 text-white" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Account */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-neutral-900/50 rounded-2xl border border-neutral-800 mb-6 overflow-hidden"
                >
                    <div className="p-4 border-b border-neutral-800">
                        <h3 className="font-bold text-white">Account</h3>
                    </div>

                    <div className="divide-y divide-neutral-800">
                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-blue-400" />
                                <div className="text-left">
                                    <div className="font-medium">Profile</div>
                                    <div className="text-xs text-neutral-500">Edit your information</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-500" />
                        </button>

                        <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-emerald-400" />
                                <div className="text-left">
                                    <div className="font-medium">Privacy</div>
                                    <div className="text-xs text-neutral-500">Data and privacy settings</div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-500" />
                        </button>
                    </div>
                </motion.div>

                {/* Danger Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-red-500/5 rounded-2xl border border-red-500/20 overflow-hidden"
                >
                    <div className="p-4 border-b border-red-500/20">
                        <h3 className="font-bold text-red-400">Danger Zone</h3>
                    </div>

                    <div className="divide-y divide-red-500/10">
                        <button
                            onClick={resetSettings}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <RotateCcw className="w-5 h-5 text-orange-400" />
                                <div className="text-left">
                                    <div className="font-medium">Reset Settings</div>
                                    <div className="text-xs text-neutral-500">Restore to defaults</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={clearAllData}
                            className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 className="w-5 h-5 text-red-400" />
                                <div className="text-left">
                                    <div className="font-medium text-red-400">Clear All Data</div>
                                    <div className="text-xs text-neutral-500">Delete all progress</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </motion.div>

                {/* Version */}
                <div className="text-center mt-8 text-neutral-600 text-sm">
                    <p>Flagship v2.0.0</p>
                    <p className="text-xs">Made with ❤️ for holistic wellness</p>
                </div>
            </div>
        </div>
    );
}
