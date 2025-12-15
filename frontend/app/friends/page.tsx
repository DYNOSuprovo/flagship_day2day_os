"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, UserMinus, MessageCircle, Activity, Search, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Friend {
    user_id: string;
    username: string;
    avatar: string;
    level: number;
    xp: number;
    streak: number;
}

interface FriendRequest {
    from_user: string;
    to_user: string;
    username: string;
    avatar: string;
    level: number;
    status: string;
}

interface FriendActivity {
    user_id: string;
    username: string;
    avatar: string;
    action: string;
    timestamp: string;
}

type Tab = "friends" | "requests" | "find" | "activity";

export default function FriendsPage() {
    const [tab, setTab] = useState<Tab>("friends");
    const [friends, setFriends] = useState<Friend[]>([]);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [suggestions, setSuggestions] = useState<Friend[]>([]);
    const [activity, setActivity] = useState<FriendActivity[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [friendsRes, requestsRes, suggestionsRes, activityRes] = await Promise.all([
                fetch(`${API_URL}/friends/`),
                fetch(`${API_URL}/friends/requests`),
                fetch(`${API_URL}/friends/suggestions`),
                fetch(`${API_URL}/friends/activity`)
            ]);

            if (friendsRes.ok) {
                const data = await friendsRes.json();
                setFriends(data.friends || []);
            }
            if (requestsRes.ok) {
                const data = await requestsRes.json();
                setRequests(data.requests || []);
            }
            if (suggestionsRes.ok) {
                const data = await suggestionsRes.json();
                setSuggestions(data.suggestions || []);
            }
            if (activityRes.ok) {
                const data = await activityRes.json();
                setActivity(data.activities || []);
            }
        } catch (e) {
            console.error("Failed to fetch friends data:", e);
        }
        setLoading(false);
    };

    const sendRequest = async (userId: string) => {
        try {
            await fetch(`${API_URL}/friends/request/${userId}`, { method: "POST" });
            setSuggestions(prev => prev.filter(s => s.user_id !== userId));
        } catch (e) {
            console.error("Failed to send request:", e);
        }
    };

    const acceptRequest = async (userId: string) => {
        try {
            await fetch(`${API_URL}/friends/accept/${userId}`, { method: "POST" });
            await fetchData();
        } catch (e) {
            console.error("Failed to accept request:", e);
        }
    };

    const removeFriend = async (userId: string) => {
        try {
            await fetch(`${API_URL}/friends/${userId}`, { method: "DELETE" });
            setFriends(prev => prev.filter(f => f.user_id !== userId));
        } catch (e) {
            console.error("Failed to remove friend:", e);
        }
    };

    const filteredFriends = friends.filter(f =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neutral-950 text-white pb-32">
            {/* Header */}
            <div className="py-8 px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 mb-4">
                        <Users className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Friends</h1>
                    <p className="text-neutral-400">{friends.length} friends</p>
                </motion.div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-2 mb-6 px-6">
                {[
                    { id: "friends" as Tab, label: "Friends", icon: Users, count: friends.length },
                    { id: "requests" as Tab, label: "Requests", icon: UserPlus, count: requests.length },
                    { id: "find" as Tab, label: "Find", icon: Search },
                    { id: "activity" as Tab, label: "Activity", icon: Activity }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                            "px-3 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors text-sm",
                            tab === t.id
                                ? "bg-purple-500 text-white"
                                : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                        )}
                    >
                        <t.icon className="w-4 h-4" />
                        {t.label}
                        {t.count !== undefined && t.count > 0 && (
                            <span className="w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
                                {t.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="px-6 max-w-md mx-auto">
                {/* Friends Tab */}
                {tab === "friends" && (
                    <div className="space-y-3">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search friends..."
                                className="w-full pl-10 pr-4 py-3 bg-neutral-900 rounded-xl border border-neutral-800 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        {filteredFriends.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                {searchQuery ? "No friends found" : "No friends yet. Find some!"}
                            </div>
                        ) : (
                            filteredFriends.map((friend, i) => (
                                <motion.div
                                    key={friend.user_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                                        {friend.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{friend.username}</div>
                                        <div className="text-sm text-neutral-400">
                                            Level {friend.level} • 🔥 {friend.streak}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 bg-neutral-800 rounded-lg hover:bg-neutral-700">
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => removeFriend(friend.user_id)}
                                            className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 text-red-400"
                                        >
                                            <UserMinus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Requests Tab */}
                {tab === "requests" && (
                    <div className="space-y-3">
                        {requests.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                No pending requests
                            </div>
                        ) : (
                            requests.map((req, i) => (
                                <motion.div
                                    key={req.from_user}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                                        {req.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{req.username}</div>
                                        <div className="text-sm text-neutral-400">
                                            Level {req.level} wants to be friends
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => acceptRequest(req.from_user)}
                                            className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 text-green-400"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 text-red-400">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Find Tab */}
                {tab === "find" && (
                    <div className="space-y-3">
                        <h3 className="text-lg font-bold mb-4">Suggested Friends</h3>
                        {suggestions.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                No suggestions available
                            </div>
                        ) : (
                            suggestions.map((user, i) => (
                                <motion.div
                                    key={user.user_id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-2xl">
                                        {user.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{user.username}</div>
                                        <div className="text-sm text-neutral-400">
                                            Level {user.level}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => sendRequest(user.user_id)}
                                        className="px-4 py-2 bg-purple-500 rounded-lg font-medium flex items-center gap-2 hover:bg-purple-400"
                                    >
                                        <UserPlus className="w-4 h-4" /> Add
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}

                {/* Activity Tab */}
                {tab === "activity" && (
                    <div className="space-y-3">
                        {activity.length === 0 ? (
                            <div className="text-center py-12 text-neutral-500">
                                No recent activity
                            </div>
                        ) : (
                            activity.map((act, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-xl">
                                        {act.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium">{act.username}</span>
                                        <span className="text-neutral-400 ml-2">{act.action}</span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
