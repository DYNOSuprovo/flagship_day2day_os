"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Home, Trees, Factory, Store, Landmark, Coins, Zap, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Building {
    id: string;
    type: string;
    name: string;
    icon: string;
    level: number;
    x: number;
    y: number;
    color: string;
    income: number;
}

interface CityStats {
    coins: number;
    energy: number;
    population: number;
    happiness: number;
}

const BUILDING_TYPES = [
    { type: "house", name: "House", icon: "🏠", cost: 100, income: 5, color: "bg-blue-500" },
    { type: "shop", name: "Shop", icon: "🏪", cost: 250, income: 15, color: "bg-green-500" },
    { type: "factory", name: "Factory", icon: "🏭", cost: 500, income: 30, color: "bg-orange-500" },
    { type: "park", name: "Park", icon: "🌳", cost: 150, income: 2, color: "bg-emerald-500" },
    { type: "office", name: "Office", icon: "🏢", cost: 750, income: 50, color: "bg-purple-500" },
    { type: "monument", name: "Monument", icon: "🗽", cost: 2000, income: 100, color: "bg-yellow-500" }
];

const GRID_SIZE = 8;

export default function CityBuilderPage() {
    const [buildings, setBuildings] = useState<Building[]>([]);
    const [stats, setStats] = useState<CityStats>({ coins: 500, energy: 100, population: 0, happiness: 50 });
    const [selectedBuilding, setSelectedBuilding] = useState<typeof BUILDING_TYPES[0] | null>(null);
    const [showShop, setShowShop] = useState(false);

    // Load saved city
    useEffect(() => {
        const saved = localStorage.getItem("city_builder");
        if (saved) {
            const data = JSON.parse(saved);
            setBuildings(data.buildings || []);
            setStats(data.stats || { coins: 500, energy: 100, population: 0, happiness: 50 });
        }
    }, []);

    // Save city
    useEffect(() => {
        localStorage.setItem("city_builder", JSON.stringify({ buildings, stats }));
    }, [buildings, stats]);

    // Income ticker
    useEffect(() => {
        const interval = setInterval(() => {
            const income = buildings.reduce((sum, b) => sum + b.income, 0);
            if (income > 0) {
                setStats(prev => ({ ...prev, coins: prev.coins + Math.floor(income / 10) }));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [buildings]);

    const placeBuilding = (x: number, y: number) => {
        if (!selectedBuilding) return;

        // Check if cell is occupied
        if (buildings.some(b => b.x === x && b.y === y)) return;

        // Check if can afford
        if (stats.coins < selectedBuilding.cost) return;

        const newBuilding: Building = {
            id: `${Date.now()}`,
            type: selectedBuilding.type,
            name: selectedBuilding.name,
            icon: selectedBuilding.icon,
            level: 1,
            x,
            y,
            color: selectedBuilding.color,
            income: selectedBuilding.income
        };

        setBuildings(prev => [...prev, newBuilding]);
        setStats(prev => ({
            ...prev,
            coins: prev.coins - selectedBuilding.cost,
            population: prev.population + (selectedBuilding.type === "house" ? 10 : 0),
            happiness: prev.happiness + (selectedBuilding.type === "park" ? 5 : 0)
        }));
        setSelectedBuilding(null);
    };

    const upgradeBuilding = (id: string) => {
        const building = buildings.find(b => b.id === id);
        if (!building) return;

        const upgradeCost = building.level * 100;
        if (stats.coins < upgradeCost) return;

        setBuildings(prev => prev.map(b =>
            b.id === id ? { ...b, level: b.level + 1, income: b.income * 1.5 } : b
        ));
        setStats(prev => ({ ...prev, coins: prev.coins - upgradeCost }));
    };

    const totalIncome = buildings.reduce((sum, b) => sum + b.income, 0);

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Header */}
            <div className="py-6 px-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Building2 className="w-6 h-6 text-purple-400" />
                            Habit City
                        </h1>
                        <p className="text-neutral-400 text-sm">Build your wellness empire</p>
                    </div>
                    <button
                        onClick={() => setShowShop(true)}
                        className="px-4 py-2 bg-purple-500 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-400"
                    >
                        <Plus className="w-4 h-4" /> Build
                    </button>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="bg-neutral-900 rounded-xl p-3 text-center">
                        <Coins className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                        <div className="font-bold">{stats.coins}</div>
                        <div className="text-xs text-neutral-500">+{totalIncome}/10s</div>
                    </div>
                    <div className="bg-neutral-900 rounded-xl p-3 text-center">
                        <Zap className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                        <div className="font-bold">{stats.energy}</div>
                        <div className="text-xs text-neutral-500">Energy</div>
                    </div>
                    <div className="bg-neutral-900 rounded-xl p-3 text-center">
                        <Users className="w-5 h-5 text-green-400 mx-auto mb-1" />
                        <div className="font-bold">{stats.population}</div>
                        <div className="text-xs text-neutral-500">Pop</div>
                    </div>
                    <div className="bg-neutral-900 rounded-xl p-3 text-center">
                        <span className="text-xl">😊</span>
                        <div className="font-bold">{stats.happiness}%</div>
                        <div className="text-xs text-neutral-500">Happy</div>
                    </div>
                </div>
            </div>

            {/* City Grid */}
            <div className="px-6">
                <div
                    className="grid gap-1 p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/20 rounded-2xl border border-neutral-800"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                >
                    {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                        const x = i % GRID_SIZE;
                        const y = Math.floor(i / GRID_SIZE);
                        const building = buildings.find(b => b.x === x && b.y === y);

                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => building ? upgradeBuilding(building.id) : placeBuilding(x, y)}
                                className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center text-xl relative",
                                    building
                                        ? building.color
                                        : selectedBuilding
                                            ? "bg-neutral-800 border-2 border-dashed border-purple-500/50 hover:bg-neutral-700"
                                            : "bg-neutral-800/50 hover:bg-neutral-700/50"
                                )}
                            >
                                {building ? (
                                    <>
                                        <span>{building.icon}</span>
                                        {building.level > 1 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full text-xs font-bold flex items-center justify-center">
                                                {building.level}
                                            </span>
                                        )}
                                    </>
                                ) : selectedBuilding ? (
                                    <span className="opacity-30">{selectedBuilding.icon}</span>
                                ) : null}
                            </motion.button>
                        );
                    })}
                </div>

                {selectedBuilding && (
                    <div className="mt-4 p-3 bg-purple-500/20 border border-purple-500/50 rounded-xl text-center">
                        <span>Placing: {selectedBuilding.icon} {selectedBuilding.name}</span>
                        <button
                            onClick={() => setSelectedBuilding(null)}
                            className="ml-4 text-sm text-neutral-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {/* Building Shop Modal */}
            <AnimatePresence>
                {showShop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-end justify-center p-6 z-50"
                        onClick={() => setShowShop(false)}
                    >
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold mb-4">Build</h2>
                            <div className="grid grid-cols-2 gap-3">
                                {BUILDING_TYPES.map(type => (
                                    <button
                                        key={type.type}
                                        onClick={() => {
                                            if (stats.coins >= type.cost) {
                                                setSelectedBuilding(type);
                                                setShowShop(false);
                                            }
                                        }}
                                        disabled={stats.coins < type.cost}
                                        className={cn(
                                            "p-4 rounded-xl border flex flex-col items-center gap-2",
                                            stats.coins >= type.cost
                                                ? "bg-neutral-800 border-neutral-700 hover:border-purple-500"
                                                : "bg-neutral-900 border-neutral-800 opacity-50"
                                        )}
                                    >
                                        <span className="text-3xl">{type.icon}</span>
                                        <span className="font-medium">{type.name}</span>
                                        <span className="text-sm text-yellow-400 flex items-center gap-1">
                                            <Coins className="w-3 h-3" /> {type.cost}
                                        </span>
                                        <span className="text-xs text-green-400">+{type.income}/10s</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
