
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
    MapPin, Calendar, BookOpen, User as UserIcon,
    Github, Linkedin, Instagram, Phone, Mail
} from "lucide-react";
import Image from "next/image";

interface PublicProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    banner: string | null;
    branch: string | null;
    year: string | null;
    hostel: string | null;
    bio: string | null;
    role: string;
    github: string | null;
    linkedin: string | null;
    instagram: string | null;
    _count: {
        teamPosts: number;
        hostedRides: number;
        listings: number;
    }
}

export default function PublicProfilePage() {
    const params = useParams();
    const id = params.id as string;
    const [user, setUser] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            // If navigating to self, maybe redirect to /profile? keeping it simple for now.
            try {
                const res = await fetch(`/api/user/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    console.error("Failed to fetch user");
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-[#222]">
                <UserIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">User not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-[#0a0a0a] rounded-2xl border border-[#222] overflow-hidden relative">
                {/* Banner */}
                <div className="h-48 w-full relative bg-[#111]">
                    {user.banner ? (
                        <Image
                            src={user.banner}
                            alt="Banner"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-purple-900/20 to-blue-900/20" />
                    )}
                </div>

                <div className="px-8 pb-8">
                    <div className="flex justify-between items-end -mt-16 mb-6">
                        {/* Profile Image */}
                        <div className="relative">
                            <div className="w-32 h-32 rounded-2xl border-4 border-[#0a0a0a] bg-[#111] overflow-hidden relative">
                                {user.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name || "User"}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-[#1a1a1a]">
                                        <UserIcon className="w-12 h-12 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                            {/* Branch, Year, Hostel Tags */}
                            <div className="flex flex-wrap gap-2 text-sm">
                                {user.branch && (
                                    <span className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300">
                                        {user.branch}
                                    </span>
                                )}
                                {user.year && (
                                    <span className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300">
                                        {user.year} Year
                                    </span>
                                )}
                                {user.hostel && (
                                    <span className="px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-gray-300">
                                        {user.hostel}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        {user.bio && (
                            <div className="p-4 rounded-xl bg-[#111] border border-[#333]">
                                <p className="text-gray-300 leading-relaxed">
                                    {user.bio}
                                </p>
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="flex flex-wrap gap-6 pt-4 border-t border-[#222]">
                            {/* Always show email if available (public safe) */}
                            {user.email && (
                                <a href={`mailto:${user.email}`} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="text-sm">Email</span>
                                </a>
                            )}
                            {/* Optional Links */}
                            {user.github && user.github !== "NA" && (
                                <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                        <Github className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="text-sm">GitHub</span>
                                </a>
                            )}
                            {user.linkedin && user.linkedin !== "NA" && (
                                <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                        <Linkedin className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <span className="text-sm">LinkedIn</span>
                                </a>
                            )}
                            {user.instagram && user.instagram !== "NA" && (
                                <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                        <Instagram className="w-4 h-4 text-pink-500" />
                                    </div>
                                    <span className="text-sm">Instagram</span>
                                </a>
                            )}
                        </div>

                        {/* Stats Section */}
                        <section className="pt-6 border-t border-[#222]">
                            <h2 className="text-lg font-bold text-white mb-4">Community Contributions</h2>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-[#111] border border-[#333] text-center">
                                    <div className="text-2xl font-bold text-white">{user._count.teamPosts}</div>
                                    <div className="text-xs text-gray-500 uppercase mt-1">Team Posts</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#111] border border-[#333] text-center">
                                    <div className="text-2xl font-bold text-white">{user._count.hostedRides}</div>
                                    <div className="text-xs text-gray-500 uppercase mt-1">Rides Hosted</div>
                                </div>
                                <div className="p-4 rounded-xl bg-[#111] border border-[#333] text-center">
                                    <div className="text-2xl font-bold text-white">{user._count.listings}</div>
                                    <div className="text-xs text-gray-500 uppercase mt-1">Listings</div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
