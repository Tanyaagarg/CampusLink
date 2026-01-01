"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Coffee, ShoppingBag, Clock, ExternalLink, MapPin, Trash2, MessageSquare } from "lucide-react";
import RegisterVentureModal from "@/components/modals/RegisterVentureModal";
import VentureCatalogModal from "@/components/modals/VentureCatalogModal";



function VenturesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [selectedVenture, setSelectedVenture] = useState<any>(null);
    const [editingVenture, setEditingVenture] = useState<any>(null); // New state for editing
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [deleteVentureId, setDeleteVentureId] = useState<string | null>(null);
    const [ventures, setVentures] = useState<any[]>([]);


    const fetchVentures = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("q", searchQuery);
            const res = await fetch(`/api/ventures?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setVentures(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchVentures();
    }, [searchQuery]);

    const confirmDelete = async () => {
        if (!deleteVentureId) return;
        try {
            const res = await fetch("/api/ventures", {
                method: "DELETE",
                body: JSON.stringify({ ventureId: deleteVentureId }),
            });
            if (res.ok) fetchVentures();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteVentureId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Register Modal */}
            <RegisterVentureModal
                isOpen={isRegisterOpen}
                onClose={() => setIsRegisterOpen(false)}
                onSuccess={fetchVentures}
            />

            {/* Edit Modal */}
            {editingVenture && (
                <RegisterVentureModal
                    isOpen={!!editingVenture}
                    onClose={() => setEditingVenture(null)}
                    onSuccess={fetchVentures}
                    ventureToEdit={editingVenture}
                />
            )}

            <VentureCatalogModal
                isOpen={!!selectedVenture}
                onClose={() => setSelectedVenture(null)}
                venture={selectedVenture}
            />

            {/* Custom Delete Confirmation Modal */}
            {deleteVentureId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Delete Venture?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This will permanently remove your business listing.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteVentureId(null)}
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

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Campus Ventures</h1>
                    <p className="text-gray-400">Support small businesses run by your fellow students.</p>
                </div>
                <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Register Business</span>
                </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, hostel, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {ventures.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No ventures found.
                        </div>
                    )}
                    {ventures.map((venture) => (
                        <motion.div
                            layout
                            key={venture.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-amber-500/30 transition-all flex flex-col h-full"
                        >
                            {/* Header / Banner */}
                            <div
                                className={`h-24 relative bg-gradient-to-r from-orange-500 to-amber-500 group-hover:opacity-100 transition-opacity p-6 flex justify-between items-start bg-cover bg-center`}
                                style={venture.logo ? { backgroundImage: `url(${venture.logo})` } : {}}
                            >
                                <div className={`absolute inset-0 bg-black/40 ${venture.logo ? 'block' : 'hidden'}`} />
                                <div className="relative z-10 p-2 bg-black/20 backdrop-blur-md rounded-lg text-white">
                                    {venture.category === "Food & Beverages" ? <Coffee className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                                </div>
                                <span className={`relative z-10 px-3 py-1 text-[10px] font-bold uppercase rounded-full border bg-black/40 backdrop-blur-md ${venture.status === "Open" ? "text-green-400 border-green-400/50" : "text-red-400 border-red-400/50"
                                    }`}>
                                    {venture.status}
                                </span>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-2">{venture.name}</h2>
                                <p className="text-sm text-gray-400 mb-6 flex-1">{venture.description}</p>

                                <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {venture.timing || "Anytime"}
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {venture.hostel || "Campus"}
                                    </span>
                                </div>

                                <div className="mt-auto space-y-3">
                                    <button
                                        onClick={() => setSelectedVenture(venture)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111] hover:bg-[#181818] border border-[#333] text-gray-200 font-medium transition-all group-hover:border-amber-500/30 group-hover:text-amber-500"
                                    >
                                        View Catalog <ExternalLink className="w-4 h-4" />
                                    </button>

                                    {venture.isOwner ? (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    const newStatus = venture.status === "Open" ? "Closed" : "Open";
                                                    await fetch("/api/ventures", {
                                                        method: "PUT",
                                                        body: JSON.stringify({ ventureId: venture.id, status: newStatus }),
                                                    });
                                                    fetchVentures();
                                                }}
                                                className={`flex-1 py-3 rounded-xl border font-bold text-xs transition-all ${venture.status === "Open"
                                                    ? "bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20"
                                                    : "bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20"
                                                    }`}
                                            >
                                                {venture.status === "Open" ? "Close" : "Open"}
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditingVenture(venture);
                                                }}
                                                className="flex-1 py-3 rounded-xl bg-[#181818] border border-[#333] hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20 text-gray-400 font-bold text-xs transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteVentureId(venture.id);
                                                }}
                                                className="px-4 py-3 rounded-xl bg-[#181818] border border-[#333] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-gray-400 font-bold text-xs transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/dashboard/chat?userId=${venture.ownerId}`);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#333] text-gray-400 hover:text-white font-medium transition-all"
                                        >
                                            <MessageSquare className="w-4 h-4" /> Message {venture.owner?.name?.split(" ")[0] || "Owner"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function VenturesPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <VenturesContent />
        </Suspense>
    );
}
