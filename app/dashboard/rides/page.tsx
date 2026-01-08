"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MapPin, Calendar, Clock, Car, Bike, ArrowRight, MessageCircle } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import CreateRideModal from "@/components/modals/CreateRideModal";



function RideSharingContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rides, setRides] = useState<any[]>([]);

    const [deleteRideId, setDeleteRideId] = useState<string | null>(null);

    const fetchRides = async () => {
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append("q", searchQuery);
            const res = await fetch(`/api/rides?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setRides(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchRides();
        const interval = setInterval(fetchRides, 5000);
        return () => clearInterval(interval);
    }, [searchQuery]);

    const handleRequest = async (rideId: string, hasRequested: boolean) => {
        try {
            if (hasRequested) {
                // Withdraw
                await fetch("/api/rides/request", {
                    method: "DELETE",
                    body: JSON.stringify({ rideId }),
                });
            } else {
                // Request
                await fetch("/api/rides/request", {
                    method: "POST",
                    body: JSON.stringify({ rideId }),
                });
            }
            fetchRides();
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDelete = async () => {
        if (!deleteRideId) return;
        try {
            const res = await fetch("/api/rides", {
                method: "DELETE",
                body: JSON.stringify({ rideId: deleteRideId }),
            });
            if (res.ok) fetchRides();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteRideId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <CreateRideModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchRides}
            />

            {/* Custom Delete Confirmation Modal */}
            {deleteRideId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Delete Ride?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This will remove your ride offer correctly.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteRideId(null)}
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
                    <h1 className="text-3xl font-bold text-white mb-2">Ride Sharing</h1>
                    <p className="text-gray-400">Share rides, save money, and reduce carbon footprint.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-neon-green to-emerald-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Offer Ride</span>
                </button>
            </div>

            <div className="flex gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222]">
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search destination (e.g. Chandigarh)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/50 transition-all placeholder:text-gray-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {rides.length === 0 && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No rides found. Be the first to offer one!
                        </div>
                    )}
                    {rides.map((ride) => (
                        <motion.div
                            key={ride.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group p-6 rounded-2xl bg-[#0a0a0a] border border-[#222] hover:border-neon-green/30 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.05)] flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <UserAvatar
                                        src={ride.host?.image}
                                        name={ride.host?.name}
                                        className="w-10 h-10 border border-[#222]"
                                    />
                                    <div>
                                        <h3 className="text-sm font-bold text-white mb-0.5">{ride.host?.name || "Unknown"}</h3>
                                        <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                            {ride.type === "Car" ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                                            {ride.vehicle}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-white">₹{ride.price}</span>
                            </div>

                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-gray-500 mb-1">From</p>
                                    <p className="text-sm font-bold text-white truncate">{ride.from}</p>
                                </div>
                                <ArrowRight className="text-gray-600 w-4 h-4" />
                                <div className="flex-1 text-center">
                                    <p className="text-xs text-gray-500 mb-1">To</p>
                                    <p className="text-sm font-bold text-white truncate">{ride.to}</p>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-[#222]">
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> {new Date(ride.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {ride.time}
                                    </div>
                                </div>

                                {ride.isOwner ? (
                                    <button
                                        onClick={() => setDeleteRideId(ride.id)}
                                        className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                fetch("/api/chat", {
                                                    method: "POST",
                                                    body: JSON.stringify({ targetUserId: ride.hostId })
                                                })
                                                    .then(res => res.json())
                                                    .then((data) => window.location.href = `/dashboard/chat?id=${data.id}`)
                                                    .catch(err => console.error(err));
                                            }}
                                            className="p-2 rounded-lg bg-[#181818] border border-[#333] text-gray-400 hover:text-white hover:border-gray-500 transition-all"
                                            title="Message Host"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleRequest(ride.id, ride.hasRequested)}
                                            className={`text-xs font-bold transition-colors ${ride.hasRequested
                                                ? "text-neon-green hover:text-red-400"
                                                : "text-neon-green hover:text-white"
                                                }`}
                                        >
                                            {ride.hasRequested ? "Booked (Cancel)" : `Book Seat (${ride.seats} left)`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function RideSharingPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <RideSharingContent />
        </Suspense>
    );
}
