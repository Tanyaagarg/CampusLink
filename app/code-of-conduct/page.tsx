"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Users, MessageSquare, AlertTriangle } from "lucide-react";

export default function CodeOfConductPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-gray-300 relative overflow-hidden font-sans selection:bg-neon-blue/20 selection:text-neon-blue">
            {/* Background Glow */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/10 rounded-full blur-[100px] pointers-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
                <Link
                    href="/"
                    className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Login
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-8">
                        <div className="w-12 h-12 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-neon-blue" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">Student Code of Conduct</h1>
                            <p className="text-gray-400">Guidelines for a safe and respectful community at CampusLink</p>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <Users className="w-5 h-5 text-neon-green" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-3">1. Respect & Inclusivity</h2>
                                    <p className="leading-relaxed">
                                        CampusLink is a diverse community. We expect all members to treat each other with dignity and respect.
                                        Harassment, discrimination, hate speech, or bullying of any kind is strictly prohibited.
                                        This includes behavior based on race, religion, gender, disability, or any other personal characteristic.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <MessageSquare className="w-5 h-5 text-neon-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-3">2. Authentic Communication</h2>
                                    <p className="leading-relaxed">
                                        Be honest and authentic in your interactions. Do not impersonate others or spread misinformation.
                                        When using the Marketplace or Rides features, ensure your listings and requests are genuine and accurate.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <Shield className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-3">3. Safety & Privacy</h2>
                                    <p className="leading-relaxed">
                                        Protect your own privacy and respect the privacy of others. Do not share sensitive personal information
                                        (like passwords or financial details) in public channels. Report any suspicious activity or
                                        behavior that makes you feel unsafe immediately to the administration.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-start gap-4">
                                <div className="mt-1">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-white mb-3">4. Zero Tolerance Policy</h2>
                                    <p className="leading-relaxed">
                                        Any violation of this Code of Conduct may result in immediate suspension or permanent ban from the platform.
                                        We reserve the right to remove content or users that threaten the safety and well-being of our community.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
                        <p>
                            By using CampusLink, you agree to abide by these guidelines.
                            Let's build a great community together.
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
