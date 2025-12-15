"use client";

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    LayoutDashboard,
    Utensils,
    Wallet,
    Heart,
    Menu,
    X,
    Target,
    Moon,
    LayoutGrid,
    Trophy,
    BarChart3,
    Medal,
    Settings,
    User,
    Crosshair,
    Calendar,
    Clock,
    Wind,
    Coffee,
    Droplets,
    Gamepad2,
    Crown,
    Building2,
    Globe,
    Users,
    Sparkles,
    Briefcase,
    Activity,
    Layers,
    PieChart
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Configuration ---

type NavItem = {
    title: string;
    icon: React.ReactNode;
    href: string;
};

type NavGroup = {
    title: string;
    icon: React.ReactNode;
    items: NavItem[];
};

type DockItem = NavItem | NavGroup;

function isGroup(item: DockItem): item is NavGroup {
    return (item as NavGroup).items !== undefined;
}

export const FloatingDock = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false); // Mobile menu state

    // --- Navigation Data Organized ---
    const navStructure: DockItem[] = [
        { title: "Home", icon: <Home className="h-full w-full text-neutral-300" />, href: "/" },
        { title: "Dashboard", icon: <LayoutDashboard className="h-full w-full text-neutral-300" />, href: "/dashboard" },

        // Group 1: Wellness (Physical & Mental)
        {
            title: "Wellness",
            icon: <Activity className="h-full w-full text-emerald-400" />,
            items: [
                { title: "Diet", icon: <Utensils className="h-full w-full text-neutral-300" />, href: "/diet" },
                { title: "Emotional", icon: <Heart className="h-full w-full text-neutral-300" />, href: "/emotional" },
                { title: "Breathing", icon: <Wind className="h-full w-full text-neutral-300" />, href: "/breathing" },
                { title: "Water", icon: <Droplets className="h-full w-full text-neutral-300" />, href: "/water" },
                { title: "Dreams", icon: <Moon className="h-full w-full text-neutral-300" />, href: "/dreams" },
            ]
        },

        // Group 2: Productivity (Work & Habits)
        {
            title: "Growth",
            icon: <Briefcase className="h-full w-full text-amber-400" />,
            items: [
                { title: "Focus", icon: <Target className="h-full w-full text-neutral-300" />, href: "/focus" },
                { title: "Habits", icon: <LayoutGrid className="h-full w-full text-neutral-300" />, href: "/habits" },
                { title: "Goals", icon: <Crosshair className="h-full w-full text-neutral-300" />, href: "/goals" },
                { title: "Pomodoro", icon: <Coffee className="h-full w-full text-neutral-300" />, href: "/pomodoro" },
                { title: "Finance", icon: <Wallet className="h-full w-full text-neutral-300" />, href: "/finance" },
            ]
        },

        // Group 3: Social & World
        {
            title: "Community",
            icon: <Globe className="h-full w-full text-blue-400" />,
            items: [
                { title: "City", icon: <Building2 className="h-full w-full text-neutral-300" />, href: "/city" },
                { title: "Journey", icon: <Globe className="h-full w-full text-neutral-300" />, href: "/journey" },
                { title: "Friends", icon: <Users className="h-full w-full text-neutral-300" />, href: "/friends" },
                { title: "Leaderboard", icon: <Crown className="h-full w-full text-neutral-300" />, href: "/leaderboard" },
                { title: "Capsule", icon: <Clock className="h-full w-full text-neutral-300" />, href: "/capsule" },
            ]
        },

        // Group 4: Arcade
        {
            title: "Play",
            icon: <Gamepad2 className="h-full w-full text-fuchsia-400" />,
            items: [
                { title: "Arcade", icon: <Gamepad2 className="h-full w-full text-neutral-300" />, href: "/arcade" },
                { title: "Challenges", icon: <Trophy className="h-full w-full text-neutral-300" />, href: "/challenges" },
                { title: "Achievements", icon: <Medal className="h-full w-full text-neutral-300" />, href: "/achievements" },
            ]
        },

        // Group 5: Data
        {
            title: "Insights",
            icon: <PieChart className="h-full w-full text-violet-400" />,
            items: [
                { title: "Statistics", icon: <BarChart3 className="h-full w-full text-neutral-300" />, href: "/statistics" },
                { title: "Report", icon: <Calendar className="h-full w-full text-neutral-300" />, href: "/report" },
            ]
        },

        { title: "Profile", icon: <User className="h-full w-full text-neutral-300" />, href: "/profile" },
        { title: "Settings", icon: <Settings className="h-full w-full text-neutral-300" />, href: "/settings" },
    ];

    const mouseX = useMotionValue(Infinity);

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-14 w-14 rounded-full bg-slate-900/90 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white shadow-2xl"
                >
                    {isOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu Overlay - Flattened for simplicity on Mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="md:hidden fixed bottom-24 right-6 left-6 z-40 bg-slate-900/95 border border-white/10 backdrop-blur-3xl rounded-3xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto"
                    >
                        <div className="flex flex-col gap-6">
                            {navStructure.map((item, idx) => {
                                if (isGroup(item)) {
                                    return (
                                        <div key={idx} className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-2">{item.title}</h3>
                                            <div className="grid grid-cols-2 gap-2">
                                                {item.items.map(sub => (
                                                    <MobileNavLink key={sub.href} item={sub} pathname={pathname} setIsOpen={setIsOpen} />
                                                ))}
                                            </div>
                                        </div>
                                    )
                                }
                                return <MobileNavLink key={item.href} item={item} pathname={pathname} setIsOpen={setIsOpen} />
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Dock - Liquid Glass Effect */}
            <motion.div
                onMouseMove={(e) => mouseX.set(e.pageX)}
                onMouseLeave={() => mouseX.set(Infinity)}
                className="hidden md:flex fixed bottom-10 left-1/2 -translate-x-1/2 h-20 items-end gap-3 rounded-3xl px-6 pb-4 z-50 shadow-2xl"
                style={{
                    background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.8))',
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 20px 50px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 40px rgba(0,0,0,0.2)',
                }}
            >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 40%, transparent 100%)'
                    }}
                />

                {navStructure.map((item, index) => {
                    if (isGroup(item)) {
                        return <GroupIconContainer key={index} mouseX={mouseX} group={item} pathname={pathname} />;
                    }
                    return <IconContainer key={item.href} mouseX={mouseX} item={item} isActive={pathname === item.href} />;
                })}
            </motion.div>
        </>
    );
};

// --- Sub Components ---

const MobileNavLink = ({ item, pathname, setIsOpen }: { item: NavItem, pathname: string, setIsOpen: (val: boolean) => void }) => (
    <Link
        href={item.href}
        onClick={() => setIsOpen(false)}
        className={cn(
            "flex items-center gap-3 p-3 rounded-xl transition-all",
            pathname === item.href ? "bg-white/10 text-white shadow-lg border border-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"
        )}
    >
        <div className="h-5 w-5">{item.icon}</div>
        <span className="font-medium text-sm">{item.title}</span>
    </Link>
);


function IconContainer({
    mouseX,
    item,
    isActive,
}: {
    mouseX: any;
    item: NavItem;
    isActive: boolean;
}) {
    const ref = useRef<HTMLDivElement>(null);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthTransform = useTransform(distance, [-150, 0, 150], [50, 90, 50]);
    const heightTransform = useTransform(distance, [-150, 0, 150], [50, 90, 50]);
    // const iconScale = useTransform(distance, [-150, 0, 150], [1, 1.4, 1]); 

    const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
    const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link href={item.href}>
            <motion.div
                ref={ref}
                style={{ width, height }}
                className={cn(
                    "aspect-square rounded-full flex items-center justify-center relative group transition-all duration-300",
                    isActive ? "bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.15)] border border-white/20" : "bg-slate-800/50 border border-white/5 hover:bg-slate-700/80"
                )}
            >
                <motion.div
                    className="h-full w-full p-2.5 flex items-center justify-center"
                    // style={{ scale: iconScale }} // Optional: Scale icon separately
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {item.icon}
                </motion.div>

                {/* Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-white/10 pointer-events-none shadow-xl backdrop-blur-md translate-y-2 group-hover:translate-y-0">
                    {item.title}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/90 rotate-45 border-br border-white/10"></div>
                </div>

                {/* Active Dot */}
                {isActive && (
                    <motion.div layoutId="activeDot" className="absolute -bottom-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                )}
            </motion.div>
        </Link>
    );
}


function GroupIconContainer({
    mouseX,
    group,
    pathname
}: {
    mouseX: any;
    group: NavGroup;
    pathname: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const distance = useTransform(mouseX, (val: number) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthTransform = useTransform(distance, [-150, 0, 150], [50, 90, 50]);
    const heightTransform = useTransform(distance, [-150, 0, 150], [50, 90, 50]);

    const width = useSpring(widthTransform, { mass: 0.1, stiffness: 150, damping: 12 });
    const height = useSpring(heightTransform, { mass: 0.1, stiffness: 150, damping: 12 });

    const isActive = group.items.some(item => item.href === pathname);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* The Stack/Popup menu */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
                        exit={{ opacity: 0, y: 10, scale: 0.9, x: '-50%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute bottom-full left-1/2 mb-4 p-2 bg-slate-800/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[160px] z-50 origin-bottom"
                    >
                        <div className="text-xs font-bold text-slate-400 px-3 py-2 uppercase tracking-wide border-b border-white/5 mb-1 flex items-center gap-2">
                            {group.icon}
                            {group.title}
                        </div>
                        {group.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group/item",
                                    pathname === item.href ? "bg-white/15 text-white shadow-inner" : "text-slate-300 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                <div className="w-5 h-5 flex items-center justify-center opacity-70 group-hover/item:opacity-100 transition-opacity">
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.title}</span>
                                {pathname === item.href && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />}
                            </Link>
                        ))}
                        {/* Little arrow pointing down */}
                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-800/90 rotate-45 border-r border-b border-white/10" />
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                ref={ref}
                style={{ width, height }}
                className={cn(
                    "aspect-square rounded-full flex items-center justify-center relative transition-all duration-300 cursor-pointer z-40",
                    isActive || isHovered ? "bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/25" : "bg-slate-800/50 border border-white/5 hover:bg-slate-700/80"
                )}
            >
                <div className="relative w-full h-full flex items-center justify-center p-2.5">
                    {/* Stack effect icons (subtle background icons) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-75 translate-y-[-2px]">
                        <div className="w-full h-full border-2 border-current rounded-full opacity-20" />
                    </div>

                    <motion.div
                        className="h-full w-full flex items-center justify-center"
                        animate={{ rotate: isHovered ? [0, -10, 10, 0] : 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {group.icon}
                    </motion.div>
                </div>

                {/* Tooltip (only when NOT hovered, because menu replaces it) */}
                {!isHovered && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900/90 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap border border-white/10 pointer-events-none shadow-xl backdrop-blur-md translate-y-2 group-hover:translate-y-0">
                        {group.title}
                    </div>
                )}

                {/* Active Indicator for Group */}
                {isActive && (
                    <div className="absolute -bottom-2 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                )}
            </motion.div>
        </div>
    );
}
