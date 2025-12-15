"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, X, Loader2, ScanLine } from 'lucide-react';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface VisionUploadProps {
    onAnalyze: (data: any) => void;
    type: 'food' | 'receipt';
}

export default function VisionUpload({ onAnalyze, type }: VisionUploadProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Analyze
        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const endpoint = type === 'food'
                ? `${API_URL}/vision/analyze-food`
                : `${API_URL}/vision/analyze-receipt`;

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            // Handle both parsed JSON and raw string responses
            const parsedResult = data.raw ? JSON.parse(data.result) : data;
            onAnalyze(parsedResult);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
            setPreview(null);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20"
            >
                {isAnalyzing ? (
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                    <Camera className="w-5 h-5 mr-2" />
                )}
                {type === 'food' ? 'Scan Food' : 'Scan Receipt'}
            </Button>

            <AnimatePresence>
                {isAnalyzing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl flex flex-col items-center max-w-sm w-full mx-4 relative overflow-hidden">
                            {/* Scanning Animation */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent animate-scan" />

                            {preview && (
                                <div className="w-32 h-32 rounded-2xl overflow-hidden mb-6 border-2 border-indigo-500/50 relative">
                                    <img src={preview} alt="Scanning" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-2">Analyzing Image...</h3>
                            <p className="text-slate-400 text-center text-sm">
                                Our AI is identifying {type === 'food' ? 'ingredients and calories' : 'merchant and amount'}.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
