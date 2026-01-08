"use client";

import Modal from "@/components/ui/Modal";
import { Coffee, ShoppingBag, Clock, MapPin, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    venture: any;
}

export default function VentureCatalogModal({ isOpen, onClose, venture }: Props) {
    if (!venture) return null;

    const handleMessage = () => {
        fetch("/api/chat", {
            method: "POST",
            body: JSON.stringify({ targetUserId: venture.ownerId })
        })
            .then(res => res.json())
            .then((data) => window.location.href = `/dashboard/chat?id=${data.id}`)
            .catch(err => console.error(err));
    };

    // Use custom catalog if available, otherwise fallback (for old data)
    const catalog = venture.catalog && Array.isArray(venture.catalog) ? venture.catalog : [];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={venture.name}>
            <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${venture.status === "Open"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                }`}>
                                {venture.status}
                            </span>
                            <span className="text-xs text-gray-500">• {venture.category}</span>
                            {venture.hostel && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    • <MapPin className="w-3 h-3" /> {venture.hostel}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{venture.description}</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-black shadow-lg">
                        {venture.category === "Food & Beverages" ? <Coffee className="w-6 h-6" /> : <ShoppingBag className="w-6 h-6" />}
                    </div>
                </div>

                {/* Catalog / Menu Section */}
                <div className="max-h-[50vh] overflow-y-auto pr-2">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 sticky top-0 bg-[#0a0a0a] py-2 z-10 border-b border-[#222]">
                        <ShoppingBag className="w-4 h-4 text-amber-500" />
                        Menu / Catalog
                    </h3>

                    {catalog.length > 0 ? (
                        <div className="space-y-6">
                            {catalog.map((group: any, gIndex: number) => (
                                <div key={gIndex}>
                                    <h4 className="text-xs font-bold text-amber-500 mb-2 uppercase tracking-wider">{group.name}</h4>
                                    <div className="space-y-2">
                                        {group.items && group.items.map((item: any, iIndex: number) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: iIndex * 0.05 }}
                                                key={iIndex}
                                                className="flex justify-between items-center p-2 rounded-lg bg-[#181818] border border-[#333] hover:border-amber-500/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {item.image && (
                                                        <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-[#222]">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-300">{item.name}</span>
                                                </div>
                                                <span className="text-sm font-bold text-white max-w-[20%] text-right truncate pl-2">{item.price}</span>
                                            </motion.div>
                                        ))}
                                        {(!group.items || group.items.length === 0) && (
                                            <p className="text-[10px] text-gray-600 italic">No items in this category.</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No catalog items listed.
                        </div>
                    )}
                </div>

                {/* Timing & Contact */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Timing
                        </p>
                        <p className="text-sm font-medium text-white">{venture.timing || "Contact for details"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" /> Contact
                        </p>
                        <p className="text-sm font-medium text-white">{venture.contact || "Not provided"}</p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleMessage}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-[1.02]"
                >
                    <MessageCircle className="w-5 h-5" />
                    Message Business
                </button>
            </div>
        </Modal>
    );
}
