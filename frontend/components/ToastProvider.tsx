"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = (message: string, type: ToastType, duration = 4000) => {
        const id = `toast-${Date.now()}`;
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => removeToast(id), duration);
        }
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    const icons = {
        success: <CheckCircle className="w-5 h-5" />,
        error: <AlertCircle className="w-5 h-5" />,
        info: <Info className="w-5 h-5" />,
        warning: <AlertTriangle className="w-5 h-5" />
    };

    const colors = {
        success: "bg-emerald-500/20 border-emerald-500/50 text-emerald-400",
        error: "bg-red-500/20 border-red-500/50 text-red-400",
        info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
        warning: "bg-amber-500/20 border-amber-500/50 text-amber-400"
    };

    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 max-w-sm">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.9 }}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm",
                            colors[toast.type]
                        )}
                    >
                        {icons[toast.type]}
                        <span className="flex-1 text-sm text-white">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-white/10 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

// Global toast trigger for use outside React components
let globalAddToast: ((message: string, type: ToastType, duration?: number) => void) | null = null;

export function setGlobalToast(fn: typeof globalAddToast) {
    globalAddToast = fn;
}

export function toast(message: string, type: ToastType = "info", duration?: number) {
    globalAddToast?.(message, type, duration);
}

export function toastSuccess(message: string) {
    toast(message, "success");
}

export function toastError(message: string) {
    toast(message, "error");
}
