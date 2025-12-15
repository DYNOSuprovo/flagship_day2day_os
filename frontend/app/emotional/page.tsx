"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import {
    Heart,
    MessageCircle,
    Send,
    Sparkles,
    Bot,
    User,
    Loader2
} from 'lucide-react';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function EmotionalPage() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', content: 'Namaste. I am here to listen and offer guidance from the wisdom of the Bhagavad Gita. How are you feeling today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMessage = query;
        setQuery('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/emotional/guidance-rag`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mood: userMessage,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            const guidance = data.guidance || "I'm sorry, I couldn't understand that.";

            setMessages(prev => [...prev, { role: 'ai', content: guidance }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: "I'm having trouble connecting to my inner wisdom right now. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 flex flex-col">
            {/* Hero Section */}
            <div className="relative py-12 px-6 text-center overflow-hidden shrink-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6 animate-fade-in-up">
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-medium">AI Spiritual Guide</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                        Inner Peace
                    </span>
                    <br />
                    <span className="text-white">Through Ancient Wisdom</span>
                </h1>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 container mx-auto px-4 max-w-5xl h-[600px] mb-8 animate-slide-up">
                <Card className="h-full flex flex-col glass-panel bg-slate-900/40 border-slate-800 overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Gita Wisdom AI</h3>
                            <div className="flex items-center gap-2 text-xs text-emerald-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                            >
                                {msg.role === 'ai' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                                        <Bot className="w-4 h-4 text-purple-400" />
                                    </div>
                                )}

                                <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-5 shadow-lg ${msg.role === 'user'
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none'
                                    : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-tl-none'
                                    }`}>
                                    <p className="leading-relaxed text-lg">{msg.content}</p>
                                </div>

                                {msg.role === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-4 h-4 text-pink-400" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 justify-start animate-fade-in-up">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 mt-1">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                </div>
                                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                                    <span className="text-slate-400 text-sm">Consulting the scriptures...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
                        <div className="flex gap-3 max-w-4xl mx-auto">
                            <div className="flex-1 relative">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Share your feelings or ask for guidance..."
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={isLoading}
                                    className="w-full bg-slate-800/50 border border-slate-700 text-white placeholder:text-slate-500 rounded-xl px-4 py-4 pr-12 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                                />
                                <MessageCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            </div>
                            <Button
                                onClick={handleSend}
                                isLoading={isLoading}
                                className="h-auto px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-500/20"
                            >
                                <Send className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
