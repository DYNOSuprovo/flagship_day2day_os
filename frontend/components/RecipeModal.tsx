"use client";

import { X, Clock, Flame, ChefHat, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface RecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    recipe: any;
}

export default function RecipeModal({ isOpen, onClose, recipe }: RecipeModalProps) {
    if (!isOpen || !recipe) return null;

    // Mock data for ingredients and instructions since backend doesn't provide them yet
    const mockIngredients = [
        "1 cup Basmati Rice",
        "2 cups Water",
        "1 tbsp Ghee",
        "1 tsp Cumin Seeds",
        "Salt to taste",
        "Mixed Vegetables (Carrots, Peas, Beans)"
    ];

    const mockInstructions = [
        "Rinse the rice thoroughly and soak for 20 minutes.",
        "Heat ghee in a pot and add cumin seeds.",
        "Add mixed vegetables and sauté for 2-3 minutes.",
        "Add the soaked rice and water. Season with salt.",
        "Cover and cook on low heat for 15 minutes until rice is fluffy.",
        "Garnish with coriander leaves and serve hot."
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Header Image Area */}
                <div className="h-48 bg-gradient-to-r from-emerald-600 to-teal-600 relative flex items-center justify-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-6xl">🥗</div>
                </div>

                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">{recipe.name}</h2>
                            <div className="flex gap-4 text-slate-400 text-sm">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>20 mins</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Flame className="w-4 h-4" />
                                    <span>{recipe.calories} kcal</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-bold border border-emerald-500/20">
                            Healthy Choice
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <ChefHat className="w-5 h-5 text-emerald-400" />
                                Ingredients
                            </h3>
                            <ul className="space-y-3">
                                {mockIngredients.map((ing, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                        {ing}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                Instructions
                            </h3>
                            <ol className="space-y-4">
                                {mockInstructions.map((inst, idx) => (
                                    <li key={idx} className="flex gap-4 text-slate-300 text-sm">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center text-xs font-bold border border-slate-700">
                                            {idx + 1}
                                        </span>
                                        <p className="pt-0.5">{inst}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-3">
                        <Button variant="secondary" onClick={onClose}>
                            Close
                        </Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                            Save to Favorites
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
