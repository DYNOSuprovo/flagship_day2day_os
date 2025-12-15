"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import RecipeModal from '@/components/RecipeModal';
import VisionUpload from '@/components/VisionUpload';
import {
    Flame,
    Utensils,
    Leaf,
    ChefHat,
    Activity,
    Dumbbell,
    Sparkles,
    ArrowRight,
    Clock,
    Trophy,
    X,
    Loader2
} from 'lucide-react';

export default function DietPage() {
    const [calories, setCalories] = useState('2000');
    const [dietType, setDietType] = useState('veg');
    const [plan, setPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [scannedFood, setScannedFood] = useState<any>(null);
    const [isLogging, setIsLogging] = useState(false);

    const handleGeneratePlan = async () => {
        setIsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/diet/plan?calories=${calories}&type=${dietType}`);
            const data = await response.json();
            setPlan(data);
        } catch (error) {
            console.error("Failed to fetch diet plan", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewRecipe = (meal: any) => {
        setSelectedRecipe(meal);
        setIsModalOpen(true);
    };

    const handleScanResult = (data: any) => {
        setScannedFood(data);
    };

    const handleLogMeal = async () => {
        if (!scannedFood) return;

        setIsLogging(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/diet/log-meal`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    food_name: scannedFood.food_name,
                    calories: scannedFood.calories,
                    protein: scannedFood.protein || 0,
                    carbs: scannedFood.carbs || 0,
                    fat: scannedFood.fat || 0,
                    health_score: scannedFood.health_score || 5,
                    meal_type: 'snack'
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ ${data.message}`);
                setScannedFood(null);
            }
        } catch (error) {
            console.error("Failed to log meal", error);
            alert('Failed to log meal. Please try again.');
        } finally {
            setIsLogging(false);
        }
    };

    const handleQuickLog = async () => {
        const nameInput = document.getElementById('quick-food-name') as HTMLInputElement;
        const calInput = document.getElementById('quick-food-cal') as HTMLInputElement;

        const name = nameInput?.value;
        const cal = calInput?.value;

        if (!name || !cal) {
            alert("Please enter food name and calories");
            return;
        }

        setIsLogging(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/diet/log-meal`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    food_name: name,
                    calories: parseInt(cal),
                    protein: 0, carbs: 0, fat: 0, health_score: 5,
                    meal_type: 'snack'
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`✅ ${data.message}`);
                nameInput.value = '';
                calInput.value = '';
            }
        } catch (error) {
            console.error("Failed to quick log", error);
        } finally {
            setIsLogging(false);
        }
    };

    return (
        <div className="min-h-screen pb-20">
            <RecipeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                recipe={selectedRecipe}
            />

            {/* Scanned Food Modal */}
            {scannedFood && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl max-w-md w-full animate-fade-in-up">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">Food Detected! 📸</h3>
                            <button onClick={() => setScannedFood(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                            <h4 className="text-lg font-bold text-emerald-400 mb-1">{scannedFood.food_name}</h4>
                            <p className="text-slate-400 text-sm mb-4">Health Score: {scannedFood.health_score}/10</p>

                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <div className="text-xs text-slate-500">Calories</div>
                                    <div className="font-bold text-white">{scannedFood.calories}</div>
                                </div>
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <div className="text-xs text-slate-500">Protein</div>
                                    <div className="font-bold text-white">{scannedFood.protein}g</div>
                                </div>
                                <div className="bg-slate-800 p-2 rounded-lg">
                                    <div className="text-xs text-slate-500">Carbs</div>
                                    <div className="font-bold text-white">{scannedFood.carbs}g</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setScannedFood(null)} className="flex-1">Discard</Button>
                            <Button
                                onClick={handleLogMeal}
                                disabled={isLogging}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                {isLogging ? 'Logging...' : 'Log Meal'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative py-20 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6 animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI-Powered Nutrition</span>
                </div>

                <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
                        Smart Nutrition
                    </span>
                    <br />
                    <span className="text-white">For Peak Performance</span>
                </h1>

                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Generate personalized meal plans tailored to your specific caloric needs and dietary preferences in seconds.
                </p>

                {/* Control Bar */}
                <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 w-full md:w-auto flex items-center gap-4 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-emerald-500/50 transition-colors">
                            <Flame className="w-5 h-5 text-emerald-400" />
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 font-medium mb-1">Daily Target</label>
                                <input
                                    type="number"
                                    value={calories}
                                    onChange={(e) => setCalories(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 placeholder:text-slate-600"
                                    placeholder="2000"
                                />
                            </div>
                            <span className="text-sm text-slate-500 font-medium">kcal</span>
                        </div>

                        <div className="w-px h-12 bg-slate-700 hidden md:block" />

                        <div className="flex-1 w-full md:w-auto flex items-center gap-4 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-emerald-500/50 transition-colors">
                            <Leaf className="w-5 h-5 text-emerald-400" />
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 font-medium mb-1">Diet Preference</label>
                                <select
                                    value={dietType}
                                    onChange={(e) => setDietType(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 cursor-pointer [&>option]:bg-slate-900"
                                >
                                    <option value="veg">Vegetarian</option>
                                    <option value="non-veg">Non-Vegetarian</option>
                                    <option value="vegan">Vegan</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <VisionUpload type="food" onAnalyze={handleScanResult} />

                            <Button
                                onClick={handleGeneratePlan}
                                isLoading={isLoading}
                                className="flex-1 md:flex-none h-[44px] px-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Generate
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Log Section */}
            <div className="max-w-xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <div className="glass-panel p-4 rounded-xl border border-slate-700/50 flex items-center gap-3">
                    <Input
                        placeholder="Quick add (e.g., Apple)"
                        className="bg-slate-900/50 border-slate-700 text-white"
                        id="quick-food-name"
                    />
                    <Input
                        type="number"
                        placeholder="Cal"
                        className="bg-slate-900/50 border-slate-700 text-white w-24"
                        id="quick-food-cal"
                    />
                    <Button
                        variant="secondary"
                        onClick={() => {
                            const name = (document.getElementById('quick-food-name') as HTMLInputElement).value;
                            const cal = (document.getElementById('quick-food-cal') as HTMLInputElement).value;
                            if (name && cal) {
                                // Mock scan object to reuse logic
                                setScannedFood({ food_name: name, calories: parseInt(cal), protein: 0, carbs: 0, fat: 0, health_score: 5 });
                            }
                        }}
                    >
                        <Utensils className="w-4 h-4 mr-2" />
                        Log
                    </Button>
                </div>
            </div>


            {/* Results Section */}
            {
                plan && (
                    <div className="container mx-auto px-6 max-w-6xl animate-slide-up">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Total Calories</p>
                                        <h3 className="text-3xl font-bold text-white">{plan.total_calories}</h3>
                                    </div>
                                    <div className="p-3 bg-orange-500/10 rounded-xl">
                                        <Flame className="w-6 h-6 text-orange-500" />
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '100%' }} />
                                </div>
                            </Card>

                            <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Protein</p>
                                        <h3 className="text-3xl font-bold text-white">{plan.protein}g</h3>
                                    </div>
                                    <div className="p-3 bg-blue-500/10 rounded-xl">
                                        <Dumbbell className="w-6 h-6 text-blue-500" />
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: '30%' }} />
                                </div>
                            </Card>

                            <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-slate-400 text-sm font-medium mb-1">Nutrient Score</p>
                                        <h3 className="text-3xl font-bold text-white">98/100</h3>
                                    </div>
                                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                                        <Activity className="w-6 h-6 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }} />
                                </div>
                            </Card>
                        </div>

                        {/* Meals Grid */}
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <ChefHat className="w-6 h-6 text-emerald-400" />
                            Today's Menu
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {plan.meals && plan.meals.map((meal: any, idx: number) => (
                                <div
                                    key={idx}
                                    className="group relative bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2"
                                >
                                    {/* Image Placeholder Gradient */}
                                    <div className={`h-48 w-full bg-gradient-to-br ${idx === 0 ? 'from-orange-400/20 to-rose-500/20' :
                                        idx === 1 ? 'from-emerald-400/20 to-teal-500/20' :
                                            'from-indigo-400/20 to-purple-500/20'
                                        } flex items-center justify-center relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-transparent transition-colors duration-500" />
                                        <span className="text-6xl transform group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                                            {idx === 0 ? '🌅' : idx === 1 ? '☀️' : '🌙'}
                                        </span>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'bg-orange-500/10 text-orange-400' :
                                                idx === 1 ? 'bg-emerald-500/10 text-emerald-400' :
                                                    'bg-indigo-500/10 text-indigo-400'
                                                }`}>
                                                {idx === 0 ? 'Breakfast' : idx === 1 ? 'Lunch' : 'Dinner'}
                                            </span>
                                            <div className="flex items-center gap-1 text-slate-400 text-sm">
                                                <Flame className="w-3 h-3" />
                                                {meal.calories}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                            {meal.name}
                                        </h3>

                                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                            A delicious and nutritious option packed with essential nutrients to keep you energized.
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                                <Clock className="w-4 h-4 text-slate-500" />
                                                <span>20 mins</span>
                                            </div>
                                            <button
                                                onClick={() => handleViewRecipe(meal)}
                                                className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                                            >
                                                View Recipe →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
