"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Users, Car, ShoppingBag, Coffee, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q")?.toLowerCase() || "";
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const getIcon = (type: string) => {
        switch (type) {
            case "team": return <Users className="w-5 h-5 text-neon-blue" />;
            case "ride": return <Car className="w-5 h-5 text-emerald-500" />;
            case "market": return <ShoppingBag className="w-5 h-5 text-purple-500" />;
            case "venture": return <Coffee className="w-5 h-5 text-orange-500" />;
            case "tutor": return <BookOpen className="w-5 h-5 text-indigo-500" />;
            case "user": return <Users className="w-5 h-5 text-pink-500" />;
            default: return <Search className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
                <p className="text-gray-400">
                    {loading ? (
                        <span>Searching for <span className="text-neon-blue">"{query}"</span>...</span>
                    ) : (
                        <span>Found {results.length} result{results.length !== 1 ? 's' : ''} for <span className="text-neon-blue">"{query}"</span></span>
                    )}
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-[#222]">
                    <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                    <p className="text-gray-500">Try searching for different keywords like "Ride", "Book", or "AI".</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* USERS SECTION */}
                    {results.filter(r => r.type === 'user').length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Users className="w-5 h-5 text-pink-500" /> People
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.filter(r => r.type === 'user').map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link href={`${item.link}`}>
                                            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:border-pink-500/30 hover:bg-[#111] transition-all group h-full">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#181818] border border-[#333] flex items-center justify-center overflow-hidden">
                                                        <Users className="w-6 h-6 text-pink-500" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-white group-hover:text-pink-500 transition-colors">{item.title}</h3>
                                                        <p className="text-xs text-gray-400">{item.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* OTHER CONTENT SECTION */}
                    {results.filter(r => r.type !== 'user').length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-neon-blue" /> Content
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {results.filter(r => r.type !== 'user').map((item, idx) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                    >
                                        <Link href={`${item.link}?q=${encodeURIComponent(query)}`}>
                                            <div className="p-4 rounded-xl bg-[#0a0a0a] border border-[#222] hover:border-neon-blue/30 hover:bg-[#111] transition-all group h-full">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 rounded-lg bg-[#181818] border border-[#333] group-hover:border-neon-blue/20 transition-colors">
                                                        {getIcon(item.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <h3 className="font-bold text-white group-hover:text-neon-blue transition-colors line-clamp-1">{item.title}</h3>
                                                            <span className="text-[10px] uppercase font-bold text-gray-600 bg-[#181818] px-2 py-0.5 rounded border border-[#333] whitespace-nowrap ml-2">
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-400 mb-2 line-clamp-2 min-h-[40px]">{item.desc}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {item.tags.map((tag: any, i: number) => (
                                                                <span key={i} className="text-xs text-gray-500 bg-[#151515] px-2 py-0.5 rounded border border-[#333]">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
                                                            <span>by {item.author}</span>
                                                            <span>•</span>
                                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-neon-blue opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 self-center" />
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-white p-8">Loading search...</div>}>
            <SearchResults />
        </Suspense>
    );
}
