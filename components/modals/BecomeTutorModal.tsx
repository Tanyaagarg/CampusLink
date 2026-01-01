"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { BookOpen, GraduationCap, IndianRupee } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function BecomeTutorModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState("");
    const [bio, setBio] = useState(""); // Add bio field? API expects bio, schema has bio. 
    // The previous mockup didn't have bio input, adding it to match full implementation or defaulting.
    // Let's add it. or just reuse other fields? 
    // Schema: subjects[], bio?, hourlyRate. 
    // Mockup has: subjects, year/branch (which is User data, maybe we can accept it to verify/update profile but really user profile should hold this), rate.

    // For now, let's assume year/branch is read from User profile so we don't ask it here, or we ask to update. 
    // The previous modal had Year/Branch input. I'll remove it since it should come from User profile to avoid dupes/lies.
    // Instead I'll add "Bio"

    const [rate, setRate] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/tutors", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subjects: subjects.split(",").map(s => s.trim()).filter(Boolean),
                    rate,
                    bio // Optional
                }),
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
                setSubjects("");
                setRate("");
                setBio("");
            } else {
                console.error("Failed to register tutor");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Become a Tutor">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Subjects (comma separated)</label>
                    <div className="relative">
                        <BookOpen className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                        <input
                            required
                            type="text"
                            value={subjects}
                            onChange={(e) => setSubjects(e.target.value)}
                            placeholder="e.g. Data Structures, Calculus, Physics"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Hourly Rate (₹)</label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                        <input
                            required
                            type="number"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                            placeholder="e.g. 200"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Short Bio / Availability</label>
                    <textarea
                        rows={2}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="e.g. Available weekends only. Expert in Math."
                        className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-indigo-500/50"
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? "Registering..." : "Start Tutoring"}
                </button>
            </form>
        </Modal>
    );
}
