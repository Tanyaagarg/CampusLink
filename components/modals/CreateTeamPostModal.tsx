"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Users, Code, Zap, ChevronDown, Check } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateTeamPostModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState("");
    const [type, setType] = useState("Project");

    // Project Type state
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

    // Role state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState("Frontend Developer");

    const projectTypes = [
        "Semester Project",
        "Final Year Project (Capstone)",
        "Hackathon Team",
        "Startup / Venture",
        "Research Paper",
        "Open Source Contribution",
        "Coding Competition",
        "App Development",
        "Web Development",
        "Machine Learning Model",
        "Hardware / IoT Project",
        "Community / Club Event",
        "Study Group",
        "Freelance Gig",
        "Other"
    ];

    const roles = [
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Mobile App Developer",
        "DevOps Engineer",
        "Cloud Architect",
        "Data Scientist",
        "Machine Learning Engineer",
        "AI Researcher",
        "UI/UX Designer",
        "Embedded Systems Engineer",
        "IoT Specialist",
        "Blockchain Developer",
        "Cyber Security Analyst",
        "Game Developer",
        "QA / Automation Engineer",
        "Database Administrator",
        "Site Reliability Engineer (SRE)",
        "Network Engineer",
        "Product Manager (Tech)"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/team-finder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    lookingFor: selectedRole,
                    tags: skills.split(",").map(s => s.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
                // Reset form
                setTitle("");
                setDescription("");
                setSkills("");
                setType("Project");
            } else {
                console.error("Failed to create post");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Team Post">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project Title</label>
                    <div className="relative">
                        <Zap className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. AI-Powered Study Buddy"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Project Type</label>
                    <div className="relative">
                        <div className="relative">
                            <Zap className="absolute left-3 top-2.5 text-gray-600 w-5 h-5 z-10" />
                            <button
                                type="button"
                                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white hover:border-neon-blue/50 focus:border-neon-blue/50 flex items-center justify-between transition-colors"
                            >
                                <span className="truncate">{type}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTypeDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isTypeDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsTypeDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#181818] border border-[#333] rounded-xl shadow-xl max-h-[200px] overflow-y-auto z-20 custom-scrollbar">
                                        {projectTypes.map((t) => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => {
                                                    setType(t);
                                                    setIsTypeDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-[#222] text-sm text-gray-300 hover:text-white flex items-center justify-between transition-colors"
                                            >
                                                <span>{t}</span>
                                                {type === t && <Check className="w-4 h-4 text-neon-blue" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Looking For (Role)</label>
                    <div className="relative">
                        <div className="relative">
                            <Users className="absolute left-3 top-2.5 text-gray-600 w-5 h-5 z-10" />
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white hover:border-neon-blue/50 focus:border-neon-blue/50 flex items-center justify-between transition-colors"
                            >
                                <span className="truncate">{selectedRole}</span>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#181818] border border-[#333] rounded-xl shadow-xl max-h-[200px] overflow-y-auto z-20 custom-scrollbar">
                                        {roles.map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedRole(role);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-[#222] text-sm text-gray-300 hover:text-white flex items-center justify-between transition-colors"
                                            >
                                                <span>{role}</span>
                                                {selectedRole === role && <Check className="w-4 h-4 text-neon-blue" />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Required Skills (comma separated)</label>
                    <div className="relative">
                        <Code className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                        <input
                            required
                            type="text"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. React, Python, Figma"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                        required
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell us about your project idea..."
                        className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50"
                    />
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-neon-blue to-cyan-500 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,136,255,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                    {loading ? "Posting..." : "Create Post"}
                </button>
            </form>
        </Modal>
    );
}
