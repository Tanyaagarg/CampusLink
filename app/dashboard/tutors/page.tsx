"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, BookOpen, Star, GraduationCap, CheckCircle, MessageSquare } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import BecomeTutorModal from "@/components/modals/BecomeTutorModal";



function TutorsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tutors, setTutors] = useState<any[]>([]);

    const [deleteTutorId, setDeleteTutorId] = useState<string | null>(null);

    const fetchTutors = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("q", searchQuery);
            const res = await fetch(`/api/tutors?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setTutors(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTutors();
    }, [searchQuery]);

    const handleRequest = async (tutorProfileId: string, hasRequested: boolean) => {
        try {
            if (hasRequested) {
                // Withdraw
                await fetch("/api/tutors/request", {
                    method: "DELETE",
                    body: JSON.stringify({ tutorProfileId }),
                });
            } else {
                // Request
                await fetch("/api/tutors/request", {
                    method: "POST",
                    body: JSON.stringify({ tutorProfileId }),
                });
            }
            fetchTutors();
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTutorId) return; // Note: deleteTutorId in this context is just the userId of the owner (which matches user.id) or the profile ID. 
        // The API expects nothing for delete (uses session user), OR if we want an admin delete. 
        // Wait, DELETE /api/tutors deletes the CURRENT USER's profile.
        // So we don't strictly need an ID payload for self-delete, but for consistency if I passed userId to match logic. 
        // However, the API implementation I wrote: `await db.tutorProfile.delete({ where: { userId } });`. It ignores body usually or expects one?
        // Let's check API. `DELETE` function in `tutors/route.ts`... `const { ventureId }`... wait that was ventures.
        // For Tutors: `await db.tutorProfile.delete({ where: { userId } });`. It doesn't read body! ensuring security.
        // But wait, if I am the user, I just call DELETE.

        try {
            const res = await fetch("/api/tutors", {
                method: "DELETE",
            });
            if (res.ok) fetchTutors();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteTutorId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <BecomeTutorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTutors}
            />

            {/* Custom Delete Confirmation Modal */}
            {deleteTutorId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Stop Tutoring?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This will remove your tutor profile. You can always register again.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTutorId(null)}
                                className="flex-1 py-2 rounded-xl bg-[#181818] text-white font-medium hover:bg-[#222] transition-colors border border-[#333]"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-500 font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Find Tutors</h1>
                    <p className="text-gray-400">Get help from seniors who have aced your subjects.</p>
                </div>
                {/* Check if user is already a tutor? Ideally we hide this button if they are. 
                    The API returns `isOwner` logic. If `tutors` contains an item where `isOwner` is true, 
                    we can hide "Become a Tutor". 
                    But fetching all tutors to check this is okay for small scale. 
                */}
                {tutors.some(t => t.isOwner) ? (
                    <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl font-medium">
                        You are a Tutor
                    </div>
                ) : (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Become a Tutor</span>
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by subject (e.g. Maths, DSA)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#222] rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {tutors.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No tutors found.
                        </div>
                    )}
                    {tutors.map((tutor) => (
                        <motion.div
                            layout
                            key={tutor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-indigo-500/30 transition-all group hover:shadow-[0_0_30px_rgba(79,70,229,0.1)] flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <UserAvatar
                                        src={tutor.image}
                                        name={tutor.name}
                                        className="w-14 h-14"
                                    />
                                    <div>
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            {tutor.name}
                                            <CheckCircle className="w-4 h-4 text-blue-500" />
                                        </h3>
                                        <p className="text-xs text-gray-500">{tutor.year}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-lg font-bold text-white">₹{tutor.hourlyRate}</span>

                                </div>
                            </div>

                            <p className="text-sm text-gray-400 mb-4 italic line-clamp-2">"{tutor.bio || "Here to help you ace your exams!"}"</p>

                            <div className="space-y-3 mb-6 flex-1">
                                {tutor.subjects.map((sub: string) => (
                                    <div key={sub} className="flex items-center gap-2 p-2 rounded-lg bg-[#111] border border-[#333]">
                                        <BookOpen className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm text-gray-300">{sub}</span>
                                    </div>
                                ))}
                            </div>

                            {tutor.isOwner ? (
                                <button
                                    onClick={() => setDeleteTutorId(tutor.id)}
                                    className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-500 font-semibold border border-red-500/20 hover:bg-red-500/20 transition-colors"
                                >
                                    Stop Tutoring
                                </button>
                            ) : (
                                <div className="flex gap-2 w-full">
                                    <button
                                        onClick={() => router.push(`/dashboard/chat?userId=${tutor.userId}`)}
                                        className="p-2.5 rounded-xl bg-[#111] border border-[#333] text-gray-400 hover:text-white hover:bg-[#222] transition-colors"
                                        title="Message Tutor"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleRequest(tutor.id, tutor.hasRequested)}
                                        className={`flex-1 py-2.5 rounded-xl font-semibold border transition-colors ${tutor.hasRequested
                                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50"
                                            : "bg-[#111] hover:bg-white text-gray-300 hover:text-black border-[#333]"
                                            }`}
                                    >
                                        {tutor.hasRequested ? "Session Requested" : "Request Session"}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function TutorsPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <TutorsContent />
        </Suspense>
    );
}
