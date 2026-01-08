"use client";

import { Suspense } from "react";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Camera, MapPin, Link as LinkIcon, Mail, Github, Linkedin, Edit2, Code, Zap, User as UserIcon, X, Save, Loader2, Trash2, Instagram, Phone } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";


interface UserProfile {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    branch: string | null;
    year: string | null;
    hostel: string | null;
    bio: string | null;
    banner: string | null;
    github: string | null;
    linkedin: string | null;
    instagram: string | null;
    phone: string | null;
    role: string;
    isOwner?: boolean;
    _count: {
        ventures: number;
        teamPosts: number;
        listings: number;
    }
    teamRequests?: any[];
    rideRequests?: any[];
    tutorRequests?: any[];
    teamPosts?: any[];
    hostedRides?: any[];
    listings?: any[];
    tutorProfile?: any;
    ventures?: any[];
}

function ProfileContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userId = searchParams.get("userId");

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        branch: "",
        year: "",
        hostel: "",
        bio: "",
        image: "",
        banner: "",
        github: "",
        linkedin: "",
        instagram: "",
        phone: ""
    });

    const [activityTab, setActivityTab] = useState<'active' | 'history'>('active');
    const [activityType, setActivityType] = useState<'requested' | 'offered'>('requested');

    useEffect(() => {
        if (user && !isEditing) {
            setFormData({
                name: user.name || "",
                branch: user.branch || "",
                year: user.year || "",
                hostel: user.hostel || "",
                bio: user.bio || "",
                image: user.image || "",
                banner: user.banner || "",
                github: user.github || "",
                linkedin: user.linkedin || "",
                instagram: user.instagram || "",
                phone: user.phone || ""
            });
        }
        // Force view for non-owners
        if (user && !user.isOwner) {
            setActivityType('offered');
            setActivityTab('active');
        }
    }, [user, isEditing]);

    const handleUpdateProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/me", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                const updated = await res.json();
                setUser(prev => prev ? { ...prev, ...updated } : updated);
                setIsEditing(false);
            } else {
                const errorText = await res.text();
                console.error("Update failed:", errorText);
                alert(`Failed to update profile: ${errorText}`);
            }
        } catch (error) {
            console.error("Update failed", error);
            alert("Update failed. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    const fetchUser = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        try {
            let url = "/api/user/me"; // Default to 'me'
            if (userId) {
                url = `/api/user/${userId}`; // If ID provided, use it
            }

            const res = await fetch(url, { cache: "no-store" });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                console.error("Profile fetch failed:", res.status);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            if (showLoading) setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser(true);

        // Poll for updates every 3 seconds for near real-time updates
        const interval = setInterval(() => {
            fetchUser(false);
        }, 3000);

        // Refetch when window gains focus (user comes back to tab)
        const onFocus = () => fetchUser(false);
        window.addEventListener("focus", onFocus);

        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", onFocus);
        };
    }, [fetchUser]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue"></div>
            </div>
        );
    }



    if (!user) return <div className="p-8 text-center text-gray-500">User not found</div>;

    return (
        <>
            <div className="max-w-7xl mx-auto">
                {/* Banner */}
                <div
                    className="h-60 rounded-t-3xl bg-gradient-to-r from-neon-blue via-purple-600 to-neon-green relative overflow-hidden bg-cover bg-center"
                    style={{ backgroundImage: user.banner ? `url(${user.banner})` : undefined }}
                >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
                    {user.isOwner && (
                        <button
                            onClick={() => {
                                console.log("Banner camera clicked");
                                setIsEditing(true);
                            }}
                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-black transition-all z-50 cursor-pointer"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Profile Info */}
                <div className="px-8 pb-8 -mt-20 relative z-20 bg-[#0a0a0a] mx-4 rounded-b-3xl border border-[#222] border-t-0 shadow-2xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                        <div className="flex items-end gap-6">
                            <div className="relative">
                                {user.image ? (
                                    <img src={user.image} alt={user.name || "User"} className="w-40 h-40 rounded-full border-4 border-[#0a0a0a] object-cover bg-black" />
                                ) : (
                                    <div className="w-40 h-40 rounded-full border-4 border-[#0a0a0a] bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-5xl font-bold text-white shadow-xl">
                                        {user.name?.[0]?.toUpperCase() || <UserIcon className="w-16 h-16" />}
                                    </div>
                                )}
                                {user.isOwner && (
                                    <button
                                        onClick={() => {
                                            console.log("Avatar camera clicked");
                                            setIsEditing(true);
                                        }}
                                        className="absolute bottom-2 right-2 p-2 bg-neon-green text-black rounded-full border-4 border-[#0a0a0a] hover:scale-110 transition-transform z-50 cursor-pointer"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="mb-2">
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    {user.name || "Unknown User"}
                                </h1>
                                <p className="text-gray-400 text-lg">
                                    {user.branch || "Computer Engineering"}
                                    {" '"}{user.year || "26"}
                                </p>
                                <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {user.hostel || "Thapar University, Patiala"}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mb-2">
                            {/* Only show Edit button if it's the current user's profile */}
                            {user.isOwner && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-all flex items-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit Profile
                                </button>
                            )}
                            {!user.isOwner && (
                                <button
                                    onClick={() => router.push(`/dashboard/chat?userId=${user.id}`)}
                                    className="px-6 py-2 rounded-xl bg-neon-blue text-white font-bold shadow-[0_0_20px_rgba(0,136,255,0.4)] hover:shadow-[0_0_30px_rgba(0,136,255,0.6)] transition-all flex items-center gap-2"
                                >
                                    <Mail className="w-4 h-4" /> Message
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {/* Left Column: About & Skills */}
                        <div className="md:col-span-2 space-y-8">
                            {user.bio && (
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" /> About
                                    </h2>
                                    <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                        {user.bio}
                                    </p>
                                </section>
                            )}



                            <section>
                                <div className="flex flex-col gap-4 mb-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-purple-500" /> Activity
                                        </h2>

                                        {/* Main Toggle: Requested vs Offered - Only for Owner */}
                                        {user.isOwner && (
                                            <div className="flex bg-[#111] p-1 rounded-lg border border-[#333]">
                                                <button
                                                    onClick={() => setActivityType('requested')}
                                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activityType === 'requested' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    Requested
                                                </button>
                                                <button
                                                    onClick={() => setActivityType('offered')}
                                                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activityType === 'offered' ? 'bg-[#222] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                                >
                                                    Offered
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sub Toggle: Active vs History - Only for Owner */}
                                    {user.isOwner && (
                                        <div className="flex justify-start border-b border-[#222]">
                                            <button
                                                onClick={() => setActivityTab('active')}
                                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activityTab === 'active' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                Active
                                            </button>
                                            <button
                                                onClick={() => setActivityTab('history')}
                                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activityTab === 'history' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                                            >
                                                History
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {/* Helper to filter requests - IIFE for inline logic */}
                                    {(() => {
                                        const isPast = (status: string, date?: string) => {
                                            if (status === 'REJECTED' || status === 'COMPLETED' || status === 'CLOSED' || status === 'SOLD') return true;
                                            if (date && new Date(date) < new Date()) return true;
                                            return false;
                                        };

                                        const filterItems = (items: any[], type: 'team' | 'ride' | 'tutor' | 'listing' | 'venture') => {
                                            if (!items) return [];
                                            return items.filter(item => {
                                                let past = false;
                                                // Check Date logic
                                                if (type === 'ride') { // Rides (Requests or Offered)
                                                    const date = item.ride ? item.ride.date : item.date; // Handle structure diff
                                                    past = isPast(item.status, date);
                                                } else if (type === 'venture') {
                                                    past = item.status === 'Closed';
                                                } else {
                                                    past = isPast(item.status);
                                                }
                                                return activityTab === 'history' ? past : !past;
                                            });
                                        };

                                        let content = null;

                                        if (activityType === 'requested') {
                                            // RENDER REQUESTS
                                            const activeTeamReqs = filterItems(user.teamRequests || [], 'team');
                                            const activeRideReqs = filterItems(user.rideRequests || [], 'ride');
                                            const activeTutorReqs = filterItems(user.tutorRequests || [], 'tutor');

                                            const hasReqs = activeTeamReqs.length > 0 || activeRideReqs.length > 0 || activeTutorReqs.length > 0;

                                            if (!hasReqs) {
                                                content = <div className="text-center text-gray-500 py-8">No {activityTab} requests found.</div>;
                                            } else {
                                                content = (
                                                    <>
                                                        {activeTeamReqs.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Applications</h3>
                                                                {activeTeamReqs.map((req: any) => (
                                                                    <div key={req.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{req.post.title}</div>
                                                                            <div className="text-xs text-gray-500 capitalize">{req.post.type} • {new Date(req.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${req.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{req.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeRideReqs.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ride Requests</h3>
                                                                {activeRideReqs.map((req: any) => (
                                                                    <div key={req.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{req.ride.from} → {req.ride.to}</div>
                                                                            <div className="text-xs text-gray-500">{new Date(req.ride.date).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${req.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{req.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeTutorReqs.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Requests</h3>
                                                                {activeTutorReqs.map((req: any) => (
                                                                    <div key={req.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{req.tutorProfile.user.name}</div>
                                                                            <div className="text-xs text-gray-500">{req.tutorProfile.subjects.join(", ")}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${req.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500' : req.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{req.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            }

                                        } else {
                                            // RENDER OFFERED (My Posts)
                                            const activeTeamPosts = filterItems(user.teamPosts || [], 'team');
                                            const activeHostedRides = filterItems(user.hostedRides || [], 'ride');
                                            const activeListings = filterItems(user.listings || [], 'listing');
                                            const activeVentures = filterItems(user.ventures || [], 'venture');

                                            // Tutor Profile is special - it's single and always "Active" if it exists
                                            const showTutorProfile = user.tutorProfile && activityTab === 'active';

                                            const hasOffers = activeTeamPosts.length > 0 || activeHostedRides.length > 0 || activeListings.length > 0 || activeVentures.length > 0 || showTutorProfile;

                                            if (!hasOffers) {
                                                content = <div className="text-center text-gray-500 py-8">No {activityTab} offers found.</div>;
                                            } else {
                                                content = (
                                                    <>
                                                        {activeTeamPosts.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Team Posts</h3>
                                                                {activeTeamPosts.map((post: any) => (
                                                                    <div key={post.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{post.title}</div>
                                                                            <div className="text-xs text-gray-500 capitalize">{post.type} • {new Date(post.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${post.status === 'OPEN' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{post.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeHostedRides.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rides Hosted</h3>
                                                                {activeHostedRides.map((ride: any) => (
                                                                    <div key={ride.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{ride.from} → {ride.to}</div>
                                                                            <div className="text-xs text-gray-500">{new Date(ride.date).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${ride.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{ride.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeListings.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Marketplace Listings</h3>
                                                                {activeListings.map((item: any) => (
                                                                    <div key={item.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{item.title}</div>
                                                                            <div className="text-xs text-gray-500">₹{item.price} • {new Date(item.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${item.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{item.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {activeVentures.length > 0 && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">My Ventures</h3>
                                                                {activeVentures.map((venture: any) => (
                                                                    <div key={venture.id} className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                        <div>
                                                                            <div className="text-white font-medium">{venture.name}</div>
                                                                            <div className="text-xs text-gray-500">{venture.category} • {new Date(venture.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                        <span className={`px-2 py-1 text-xs font-bold rounded ${venture.status === 'Open' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{venture.status}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {showTutorProfile && (
                                                            <div className="space-y-3">
                                                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tutor Profile</h3>
                                                                <div className="p-4 rounded-xl bg-[#111] border border-[#333] flex justify-between items-center">
                                                                    <div>
                                                                        <div className="text-white font-medium">Teaching: {user.tutorProfile.subjects.join(", ")}</div>
                                                                        <div className="text-xs text-gray-500">Rate: ₹{user.tutorProfile.hourlyRate}/hr</div>
                                                                    </div>
                                                                    <span className="px-2 py-1 text-xs font-bold rounded bg-green-500/10 text-green-500">ACTIVE</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            }
                                        }

                                        return (
                                            <div className="p-4 bg-[#111]/30 rounded-xl border border-[#222]">
                                                {content}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </section>
                        </div>

                        {/* Right Column: Contact */}
                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-[#111] border border-[#222]">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Contact</h3>
                                <div className="space-y-3">
                                    {user.email && (
                                        <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                            <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                                <Mail className="w-4 h-4 text-neon-blue" />
                                            </div>
                                            {user.email}
                                        </div>
                                    )}
                                    {user.phone && user.phone !== "NA" && (
                                        <div className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                            <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                                <Phone className="w-4 h-4 text-green-500" />
                                            </div>
                                            {user.phone}
                                        </div>
                                    )}
                                    {user.github && user.github !== "NA" && (
                                        <a href={user.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                            <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                                <Github className="w-4 h-4 text-white" />
                                            </div>
                                            GitHub
                                        </a>
                                    )}
                                    {user.linkedin && user.linkedin !== "NA" && (
                                        <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                            <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                                <Linkedin className="w-4 h-4 text-blue-500" />
                                            </div>
                                            LinkedIn
                                        </a>
                                    )}
                                    {user.instagram && user.instagram !== "NA" && (
                                        <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors cursor-pointer group">
                                            <div className="p-2 rounded-full bg-[#1a1a1a] group-hover:bg-[#222]">
                                                <Instagram className="w-4 h-4 text-pink-500" />
                                            </div>
                                            Instagram
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Dummy "Badges" Block for extra visual filler */}

                        </div>
                    </div>
                </div>

                {/* Edit Profile Modal */}
            </div>
            {
                isEditing && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="w-full max-w-2xl bg-[#0a0a0a] border border-[#222] rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <div className="p-6 border-b border-[#222] flex justify-between items-center sticky top-0 bg-[#0a0a0a] z-10 transition-colors">
                                <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Images */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image</label>
                                        <div className="flex flex-col gap-2">
                                            {formData.image && (
                                                <div className="relative w-fit">
                                                    <img src={formData.image} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-[#333]" />
                                                    <button
                                                        onClick={() => setFormData({ ...formData, image: "" })}
                                                        className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <UploadButton
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    console.log("Files: ", res);
                                                    if (res && res[0]) {
                                                        setFormData({ ...formData, image: res[0].url });
                                                    }
                                                }}
                                                onUploadError={(error: Error) => {
                                                    console.error(`Upload Error: ${error.message}`);
                                                }}
                                                appearance={{
                                                    button: "bg-neon-blue text-white hover:bg-neon-blue/80 w-full"
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Banner Image</label>
                                        <div className="flex flex-col gap-2">
                                            {formData.banner && (
                                                <div className="relative w-full">
                                                    <img src={formData.banner} alt="Banner" className="w-full h-16 object-cover rounded-lg border border-[#333]" />
                                                    <button
                                                        onClick={() => setFormData({ ...formData, banner: "" })}
                                                        className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
                                                        title="Remove Banner"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            )}
                                            <UploadButton
                                                endpoint="imageUploader"
                                                onClientUploadComplete={(res) => {
                                                    console.log("Files: ", res);
                                                    if (res && res[0]) {
                                                        setFormData({ ...formData, banner: res[0].url });
                                                    }
                                                }}
                                                onUploadError={(error: Error) => {
                                                    console.error(`Upload Error: ${error.message}`);
                                                }}
                                                appearance={{
                                                    button: "bg-neon-green text-black hover:bg-neon-green/80 w-full"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Basic Info */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Branch / Major</label>
                                        <input
                                            type="text"
                                            value={formData.branch}
                                            onChange={e => setFormData({ ...formData, branch: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="Computer Engineering"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Year / Batch</label>
                                        <input
                                            type="text"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="'26"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Hostel / Location</label>
                                    <input
                                        type="text"
                                        value={formData.hostel}
                                        onChange={e => setFormData({ ...formData, hostel: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Bio / About</label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none h-32 resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                {/* Social Links */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium text-white">Social Links</h3>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="Write NA if empty"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">GitHub Profile</label>
                                        <input
                                            type="text"
                                            value={formData.github}
                                            onChange={e => setFormData({ ...formData, github: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="Write NA if empty"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">LinkedIn Profile</label>
                                        <input
                                            type="text"
                                            value={formData.linkedin}
                                            onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="Write NA if empty"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">Instagram ID</label>
                                        <input
                                            type="text"
                                            value={formData.instagram}
                                            onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                                            className="w-full bg-[#111] border border-[#333] rounded-lg p-3 text-white focus:border-neon-blue outline-none"
                                            placeholder="Write NA if empty"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-[#222] flex justify-end gap-4 sticky bottom-0 bg-[#0a0a0a]">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateProfile}
                                    disabled={saving}
                                    className="px-6 py-2 rounded-lg bg-neon-blue text-white font-bold shadow-[0_0_15px_rgba(0,136,255,0.4)] hover:shadow-[0_0_25px_rgba(0,136,255,0.6)] transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading...</div>}>
            <ProfileContent />
        </Suspense>
    );
}
