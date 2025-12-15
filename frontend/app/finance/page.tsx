"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    DollarSign,
    TrendingUp,
    ShieldCheck,
    Target,
    Sparkles,
    ArrowRight,
    PieChart,
    Activity
} from 'lucide-react';

function StatCard({ title, value, icon, color }: any) {
    const colorStyles: any = {
        emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", icon: "text-emerald-500", bar: "bg-emerald-500" },
        blue: { text: "text-blue-400", bg: "bg-blue-500/10", icon: "text-blue-500", bar: "bg-blue-500" },
        yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", icon: "text-yellow-500", bar: "bg-yellow-500" },
        red: { text: "text-red-400", bg: "bg-red-500/10", icon: "text-red-500", bar: "bg-red-500" },
    };

    const styles = colorStyles[color] || colorStyles.blue;

    return (
        <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                    <h3 className={`text-4xl font-bold text-white`}>
                        {value}
                    </h3>
                </div>
                <div className={`p-3 rounded-xl ${styles.bg}`}>
                    {icon}
                </div>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${styles.bar}`} style={{ width: '100%' }} />
            </div>
        </Card>
    );
}

export default function FinancePage() {
    const [income, setIncome] = useState('');
    const [expenses, setExpenses] = useState('');
    const [budget, setBudget] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!income || !expenses) return;

        setIsLoading(true);
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/finance/budget?income=${income}&expenses=${expenses}`);
            const data = await res.json();
            setBudget(data);
        } catch (error) {
            console.error("Failed to analyze budget", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getColorStyles = (color: string) => {
        const styles: any = {
            emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", icon: "text-emerald-500", bar: "bg-emerald-500" },
            blue: { text: "text-blue-400", bg: "bg-blue-500/10", icon: "text-blue-500", bar: "bg-blue-500" },
            yellow: { text: "text-yellow-400", bg: "bg-yellow-500/10", icon: "text-yellow-500", bar: "bg-yellow-500" },
            red: { text: "text-red-400", bg: "bg-red-500/10", icon: "text-red-500", bar: "bg-red-500" },
        };
        return styles[color] || styles.blue;
    };

    return (
        <div className="min-h-screen pb-20">
            {/* Hero Section */}
            <div className="relative py-20 px-6 text-center overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 rounded-full blur-[120px] -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-6 animate-fade-in-up">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI-Powered Wealth Management</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                        Smart Budgeting
                    </span>
                    <br />
                    <span className="text-white">Simplified</span>
                </h1>

                <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Plan your financial future with intelligent analysis and forecasting.
                </p>

                {/* Input Section */}
                <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-end gap-4">
                        <div className="flex-1 w-full">
                            <label className="block text-xs text-slate-400 font-medium mb-2 ml-1">Monthly Income</label>
                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-blue-500/50 transition-colors">
                                <DollarSign className="w-5 h-5 text-emerald-400" />
                                <input
                                    type="number"
                                    value={income}
                                    onChange={(e) => setIncome(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 placeholder:text-slate-600"
                                    placeholder="50000"
                                />
                            </div>
                        </div>

                        <div className="flex-1 w-full">
                            <label className="block text-xs text-slate-400 font-medium mb-2 ml-1">Monthly Expenses</label>
                            <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl px-4 py-3 border border-slate-700 focus-within:border-blue-500/50 transition-colors">
                                <DollarSign className="w-5 h-5 text-rose-400" />
                                <input
                                    type="number"
                                    value={expenses}
                                    onChange={(e) => setExpenses(e.target.value)}
                                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-white focus:ring-0 placeholder:text-slate-600"
                                    placeholder="30000"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleAnalyze}
                            isLoading={isLoading}
                            className="w-full md:w-auto h-[52px] px-8 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-blue-500/20"
                        >
                            Analyze
                        </Button>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            {budget && (
                <div className="container mx-auto px-6 max-w-6xl animate-slide-up">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Monthly Savings</p>
                                    <h3 className="text-4xl font-bold text-white">
                                        ₹{budget.savings.toLocaleString()}
                                    </h3>
                                </div>
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(budget.savings_rate * 2, 100)}%` }} />
                            </div>
                        </Card>

                        <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Savings Rate</p>
                                    <h3 className="text-4xl font-bold text-white">
                                        {budget.savings_rate}%
                                    </h3>
                                </div>
                                <div className="p-3 bg-blue-500/10 rounded-xl">
                                    <PieChart className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(budget.savings_rate, 100)}%` }} />
                            </div>
                        </Card>

                        <Card className="glass-panel-hover bg-slate-900/40 border-slate-800 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-slate-400 text-sm font-medium mb-1">Financial Health</p>
                                    <h3 className={`text-4xl font-bold ${getColorStyles(budget.status_color).text}`}>
                                        {budget.status}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-xl ${getColorStyles(budget.status_color).bg}`}>
                                    <ShieldCheck className={`w-6 h-6 ${getColorStyles(budget.status_color).icon}`} />
                                </div>
                            </div>
                            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${getColorStyles(budget.status_color).bar}`} style={{ width: '100%' }} />
                            </div>
                        </Card>
                    </div>

                    {/* Insight & Forecast Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* AI Insight */}
                        <Card className="lg:col-span-2 relative overflow-hidden border-0 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl" />
                            <div className="absolute inset-0 border border-white/10 rounded-xl" />

                            <div className="relative p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Sparkles className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">AI Financial Analysis</h3>
                                </div>

                                <p className="text-lg text-blue-50 leading-relaxed mb-8">
                                    {budget.recommendation}
                                </p>

                                <div className="flex gap-4">
                                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-blue-200">
                                        🎯 Goal: Save ₹{(budget.savings * 12).toLocaleString()}/yr
                                    </div>
                                    <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-blue-200">
                                        📈 Projected: ₹{budget.forecast[5].savings.toLocaleString()} in 6mo
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Forecast Chart */}
                        <Card className="glass-panel bg-slate-900/40 border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <Target className="w-5 h-5 text-cyan-400" />
                                    6-Month Forecast
                                </h3>
                            </div>

                            <div className="relative h-48 flex items-end justify-between gap-2 px-2">
                                {budget.forecast.map((item: any, idx: number) => (
                                    <div key={idx} className="flex-1 flex flex-col justify-end h-full group">
                                        <div
                                            className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg opacity-80 group-hover:opacity-100 transition-all duration-300 relative"
                                            style={{ height: `${(item.savings / budget.forecast[5].savings) * 80 + 10}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none z-10">
                                                ₹{item.savings.toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-center text-xs text-slate-500 mt-2">M{idx + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
