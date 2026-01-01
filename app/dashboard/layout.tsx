"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Car,
    ShoppingBag,
    BookOpen,
    Coffee,
    MessageCircle,
    Bell,
    User,
    GraduationCap,
    LogOut,
    Search,
    Menu,
    X,
    ArrowRight
} from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { NotificationProvider, useNotifications } from "@/components/providers/NotificationContext";

const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Team Finder", href: "/dashboard/team-finder" },
    { icon: Car, label: "Ride Sharing", href: "/dashboard/rides" },
    { icon: ShoppingBag, label: "Marketplace", href: "/dashboard/marketplace" },
    { icon: BookOpen, label: "Tutors", href: "/dashboard/tutors" },
    { icon: Coffee, label: "Ventures", href: "/dashboard/ventures" },
    { icon: MessageCircle, label: "Chat", href: "/dashboard/chat" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: User, label: "Profile", href: "/dashboard/profile" },
];

function Sidebar() {
    const pathname = usePathname();
    const { unreadCount, chatUnreadCount } = useNotifications();

    return (
        <aside className="w-64 border-r border-[#222] flex flex-col glass-panel md:relative absolute z-50 h-full hidden md:flex">
            <div className="p-6 flex items-center gap-3 group cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-tr from-neon-blue to-neon-green rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,162,255,0.3)] group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="text-white w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                </div>
                <div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-green font-orbitron tracking-wider">
                        CampusLink
                    </h1>
                    <p className="text-[10px] text-gray-500">Thapar University</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-neon-blue/10 text-neon-blue border border-neon-blue/20"
                                    : "text-gray-400 hover:text-white hover:bg-[#111]"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-neon-blue" : "group-hover:text-neon-blue")} />
                            <span className="font-medium text-sm">{item.label}</span>

                            {/* Unread Badge for Notifications */}
                            {item.label === "Notifications" && unreadCount > 0 && (
                                <span className="ml-auto bg-neon-blue text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {unreadCount}
                                </span>
                            )}

                            {/* Unread Badge for Chat */}
                            {item.label === "Chat" && chatUnreadCount > 0 && (
                                <span className="ml-auto bg-neon-blue text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {chatUnreadCount}
                                </span>
                            )}

                            {isActive && item.label !== "Notifications" && item.label !== "Chat" && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-blue shadow-[0_0_5px_#00f3ff]" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-[#222] space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#111] border border-[#222]">
                    <UserAvatar
                        name="Tanya Garg"
                        className="w-8 h-8"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">TANYA GARG</p>
                        <p className="text-xs text-gray-500 truncate">tgarg_be23@thapar.edu</p>
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex items-center gap-2 px-2 text-xs font-medium text-red-500 hover:text-red-400 transition-colors group w-full"
                >
                    <LogOut className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <NotificationProvider>
            <div className="flex h-screen bg-[#050505] text-gray-100 overflow-hidden font-outfit">
                <Sidebar />

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Top Bar - Search */}
                    <header className="h-16 border-b border-[#222] flex items-center px-8 bg-[#050505]/50 backdrop-blur-md sticky top-0 z-40">
                        <div className="w-full max-w-2xl relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        const query = (e.target as HTMLInputElement).value;
                                        if (query.trim()) {
                                            window.location.href = `/dashboard/search?q=${encodeURIComponent(query)}`;
                                        }
                                    }
                                }}
                                className="block w-full pl-10 pr-3 py-2 border border-[#222] rounded-lg leading-5 bg-[#0a0a0a] text-gray-300 placeholder-gray-500 focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 sm:text-sm transition-all shadow-inner"
                                placeholder="Search everything... (Press Enter)"
                            />
                        </div>
                    </header>

                    <div className="flex-1 overflow-y-auto p-8">
                        {children}
                    </div>
                </main>
            </div>
        </NotificationProvider>
    );
}
