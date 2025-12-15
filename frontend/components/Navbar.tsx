"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from './ui/Button';

export const Navbar = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Diet', path: '/diet' },
        { name: 'Finance', path: '/finance' },
        { name: 'Emotional', path: '/emotional' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/10 bg-slate-900/30 backdrop-blur-2xl shadow-2xl supports-[backdrop-filter]:bg-slate-900/30">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/30">
                        🧠
                    </div>
                    <h1 className="text-xl font-bold text-gradient-primary hidden sm:block">
                        AI Lifestyle
                    </h1>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <Link key={item.path} href={item.path}>
                            <Button
                                variant={isActive(item.path) ? 'primary' : 'ghost'}
                                size="sm"
                                className={`rounded-full transition-all duration-300 ${isActive(item.path)
                                        ? 'px-8 shadow-lg shadow-purple-500/25 bg-gradient-to-r from-purple-600 to-pink-600 border-none'
                                        : 'px-4 text-slate-400 hover:text-white hover:bg-transparent font-medium'
                                    }`}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <div className="md:hidden">
                    <Button variant="ghost" size="sm" className="text-white">☰</Button>
                </div>
            </div>
        </header>
    );
};
