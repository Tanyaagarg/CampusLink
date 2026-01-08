"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, MapPin, Users, Calendar, Briefcase, GraduationCap, X, MessageSquare, Trash2 } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import CreateTeamPostModal from "@/components/modals/CreateTeamPostModal";

// Mock Data for Team Posts
// Mock removed, fetching from API


const categories = ["All", "Hackathon", "Startup", "Research", "Project"];

function TeamFinderContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [posts, setPosts] = useState<any[]>([]);

    // Delete Confirmation State
    const [deletePostId, setDeletePostId] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const params = new URLSearchParams();
                if (activeCategory !== "All") params.append("category", activeCategory);
                if (searchQuery) params.append("q", searchQuery);

                const res = await fetch(`/api/team-finder?${params.toString()}`);
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data);
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchPosts();

        const interval = setInterval(fetchPosts, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [activeCategory, searchQuery]);

    const refreshPosts = async () => {
        try {
            const params = new URLSearchParams();
            if (activeCategory !== "All") params.append("category", activeCategory);
            if (searchQuery) params.append("q", searchQuery);

            const res = await fetch(`/api/team-finder?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error(error);
        }
    };


    // Handle Delete Post Trigger
    const handleDeleteClick = (postId: string) => {
        setDeletePostId(postId);
    }

    // Confirm Delete
    const confirmDelete = async () => {
        if (!deletePostId) return;

        try {
            const res = await fetch("/api/team-finder", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: deletePostId }),
            });

            if (res.ok) {
                refreshPosts();
                setDeletePostId(null);
            } else {
                console.error("Failed to delete post");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Handle Request
    const handleRequest = async (postId: string, isRequested: boolean) => {
        try {
            if (isRequested) {
                // Withdraw
                await fetch("/api/team-finder/request", {
                    method: "DELETE",
                    body: JSON.stringify({ postId }),
                });
            } else {
                // Request
                await fetch("/api/team-finder/request", {
                    method: "POST",
                    body: JSON.stringify({ postId }),
                });
            }
            refreshPosts(); // Refresh UI
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Replacement for Modal import if simple Modal is used, passing children */}
            <CreateTeamPostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={refreshPosts}
            />

            {/* Custom Delete Confirmation Modal */}
            {deletePostId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Delete Post?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This action cannot be undone. This will permanently remove your post from the team finder.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletePostId(null)}
                                className="flex-1 py-2 rounded-xl bg-[#181818] text-white font-medium hover:bg-[#222] transition-colors border border-[#333]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                            >
                                Delete
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 font-orbitron tracking-wider">Find Teammates</h1>
                    <p className="text-gray-400">Collaborate on hackathons, startups, and research projects.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-green text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,162,255,0.4)] transition-all transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create Post</span>
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by skills, title, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px - 4 py - 2 rounded - xl text - sm font - medium whitespace - nowrap transition - all border ${activeCategory === category
                                ? "bg-neon-blue/10 text-neon-blue border-neon-blue/50 shadow-[0_0_10px_rgba(0,136,255,0.2)]"
                                : "bg-[#111] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white"
                                } `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {posts.map((post) => (
                        <motion.div
                            key={post.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative p-6 rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-neon-blue/30 transition-all hover:shadow-[0_0_20px_rgba(0,243,255,0.05)] flex flex-col h-full"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <UserAvatar
                                        src={post.author.image}
                                        name={post.author.name}
                                        className="w-10 h-10 border border-[#222]"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-white">{post.author.name}</h3>
                                        <p className="text-xs text-gray-400">{post.author.branch} • {post.author.year}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-[#111] border border-[#333] text-gray-400">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="mb-4 flex-1">
                                <div className="mb-2">
                                    <span className={`text - [10px] font - bold uppercase tracking - wider px - 2 py - 0.5 rounded border ${post.type === "Hackathon" ? "text-blue-400 border-blue-400/20 bg-blue-400/10" :
                                        post.type === "Startup" ? "text-green-400 border-green-400/20 bg-green-400/10" :
                                            "text-purple-400 border-purple-400/20 bg-purple-400/10"
                                        } `}>
                                        {post.type}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors cursor-pointer">
                                    {post.title}
                                </h2>
                                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                                    {post.description}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag: string) => (
                                        <span key={tag} className="px-2 py-1 text-xs rounded-lg bg-[#111] border border-[#333] text-gray-300">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Footer */}
                            {/* Footer */}
                            <div className="mt-auto border-t border-[#222] pt-4 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-semibold">Looking For</span>
                                    <span className="text-xs text-neon-green font-medium">{post.lookingFor}</span>
                                </div>
                                {post.isOwner ? (
                                    <button
                                        onClick={() => handleDeleteClick(post.id)}
                                        className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Delete Post
                                    </button>
                                ) : (
                                    (() => {
                                        const isRequested = post.requests && post.requests.length > 0;
                                        return (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/dashboard/chat?userId=${post.author.id}`)}
                                                    className="p-2 rounded-lg bg-[#222] text-white hover:bg-[#333] transition-colors border border-[#333]"
                                                    title="Message Author"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleRequest(post.id, isRequested)}
                                                    className={`px - 4 py - 2 rounded - lg text - xs font - medium border transition - colors ${isRequested
                                                        ? "bg-neon-blue/20 text-neon-blue border-neon-blue/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50"
                                                        : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                                                        } `}
                                                >
                                                    {isRequested ? "Request Sent (Withdraw)" : "Request to Join"}
                                                </button>
                                            </div>
                                        );
                                    })()
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {
                posts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                    </div>
                )
            }
        </div >
    );
}

export default function TeamFinderPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <TeamFinderContent />
        </Suspense>
    );
}
