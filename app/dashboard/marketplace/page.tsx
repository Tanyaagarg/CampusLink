"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Filter, Tag, ShoppingBag, MessageSquare } from "lucide-react";
import CreateListingModal from "@/components/modals/CreateListingModal";
import { UserAvatar } from "@/components/UserAvatar";

const categories = ["All", "Books", "Electronics", "Supplies", "Furniture"];

function MarketplaceContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get("q") || "";
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [deleteListingId, setDeleteListingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeCategory !== "All") params.append("category", activeCategory);
            if (searchQuery) params.append("q", searchQuery);

            const res = await fetch(`/api/marketplace?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [activeCategory, searchQuery]);

    // Auto-refresh using a separate effect to avoid conflict with debounce
    useEffect(() => {
        const interval = setInterval(fetchProducts, 5000);
        return () => clearInterval(interval);
    }, [activeCategory, searchQuery]);

    // Refresh trigger
    const handleRefresh = () => {
        fetchProducts();
    };

    const confirmDelete = async () => {
        if (!deleteListingId) return;
        try {
            const res = await fetch("/api/marketplace", {
                method: "DELETE",
                body: JSON.stringify({ listingId: deleteListingId }),
            });
            if (res.ok) fetchProducts();
        } catch (error) {
            console.error(error);
        } finally {
            setDeleteListingId(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <CreateListingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleRefresh} />

            {/* Custom Delete Confirmation Modal */}
            {deleteListingId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-[#0a0a0a] border border-[#222] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-2">Delete Listing?</h3>
                        <p className="text-gray-400 mb-6 text-sm">
                            This will permanently remove your item from the marketplace.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteListingId(null)}
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
                    <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
                    <p className="text-gray-400">Buy and sell books, electronics, and hostel essentials.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
                >
                    <Plus className="w-5 h-5" />
                    <span>Sell Item</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-[#0a0a0a] border border-[#222]">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search for items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#111] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/50 transition-all placeholder:text-gray-600"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px - 4 py - 2 rounded - xl text - sm font - medium whitespace - nowrap transition - all border ${activeCategory === category
                                ? "bg-cyan-400/10 text-cyan-400 border-cyan-400/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                : "bg-[#111] text-gray-400 border-[#333] hover:border-gray-500 hover:text-white"
                                } `}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <AnimatePresence>
                    {products.length === 0 && !loading && (
                        <div className="col-span-full text-center py-20 text-gray-500">
                            No items found.
                        </div>
                    )}
                    {products.map((product) => (
                        <motion.div
                            key={product.id}
                            layout
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="group rounded-2xl bg-[#0a0a0a] border border-[#222] overflow-hidden hover:border-cyan-500/30 transition-all shadow-lg flex flex-col h-full"
                        >
                            {/* Image Placeholder */}
                            <div className={`h - 40 w - full bg - gradient - to - br ${product.gradient || "from-gray-800 to-gray-900"} opacity - 80 group - hover: opacity - 100 transition - opacity flex items - center justify - center relative`}>
                                {product.images && product.images.length > 0 ? (
                                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag className="text-white w-10 h-10 opacity-50" />
                                )}
                                <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/10 uppercase font-bold tracking-wide">
                                    {product.category}
                                </span>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-bold text-white line-clamp-1 flex-1 pr-2 group-hover:text-cyan-400 transition-colors">
                                        {product.title}
                                    </h3>

                                </div>

                                <p className="text-lg font-bold text-white mb-2">₹{product.price}</p>

                                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                                    <span>{product.condition}</span>
                                    <div className="flex items-center gap-2">
                                        <UserAvatar
                                            src={product.seller?.image}
                                            name={product.seller?.name}
                                            className="w-6 h-6 border border-[#222]"
                                        />
                                        <span className="text-xs text-gray-400 truncate w-32">{product.seller?.name || "Unknown"}</span>
                                    </div>
                                </div>

                                {product.isOwner ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteListingId(product.id);
                                        }}
                                        className="mt-auto w-full py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all"
                                    >
                                        Delete Item
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fetch("/api/chat", {
                                                method: "POST",
                                                body: JSON.stringify({ targetUserId: product.seller.id || product.sellerId })
                                            })
                                                .then(res => res.json())
                                                .then((data) => window.location.href = `/dashboard/chat?id=${data.id}`)
                                                .catch(err => console.error(err));
                                        }}
                                        className="mt-auto w-full py-1.5 rounded-lg bg-[#181818] border border-[#333] text-gray-400 text-xs font-bold hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-3 h-3" />
                                        Message Seller
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function MarketplacePage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading...</div>}>
            <MarketplaceContent />
        </Suspense>
    );
}
