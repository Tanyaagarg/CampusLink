"use client";

import { motion } from "framer-motion";
import { Users, Car, ShoppingBag, Coffee, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

const cards = [
    {
        title: "Find Teammates",
        description: "Connect with others for hackathons and competitions.",
        icon: Users,
        href: "/dashboard/team-finder",
        color: "from-neon-blue to-cyan-500",
    },
    {
        title: "Ride Sharing",
        description: "Share rides to hometowns or nearby cities.",
        icon: Car,
        href: "/dashboard/rides",
        color: "from-neon-green to-emerald-500",
    },
    {
        title: "Marketplace",
        description: "Buy and sell books, gadgets, and more.",
        icon: ShoppingBag,
        href: "/dashboard/marketplace",
        color: "from-cyan-400 to-blue-500",
    },
    {
        title: "Find Tutors",
        description: "Get help with subjects or teach others.",
        icon: BookOpen,
        href: "/dashboard/tutors",
        color: "from-teal-400 to-emerald-500",
    },
    {
        title: "Campus Ventures",
        description: "Support student small businesses and food stalls.",
        icon: Coffee,
        href: "/dashboard/ventures",
        color: "from-blue-400 to-neon-blue",
    },
];

export default function DashboardPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome to CampusLink</h1>
                <p className="text-gray-400">Your central hub for everything Thapar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link
                            href={card.href}
                            className="group relative block p-6 rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-neon-blue/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,243,255,0.1)] overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                                    <card.icon className="w-6 h-6" />
                                </div>
                                <div className={`p-2 rounded-full bg-[#111] text-gray-400 group-hover:text-white transition-colors`}>
                                    <card.icon className="w-4 h-4" /> {/* Fallback icon or decoration */}
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-sm text-gray-400 mb-6 group-hover:text-gray-300">
                                {card.description}
                            </p>

                            <div className="flex items-center text-sm font-medium text-neon-blue mt-auto">
                                Explore <ArrowRight className="w-4 h-4 ml-2" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
