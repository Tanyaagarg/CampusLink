"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { GraduationCap, Building2, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [hostel, setHostel] = useState("");
  const [branch, setBranch] = useState("");
  const [error, setError] = useState("");

  // Remove pre-fill logic to satisfy user request
  // useEffect(() => {
  //   const savedHostel = localStorage.getItem("cl_hostel");
  //   const savedBranch = localStorage.getItem("cl_branch");
  //   if (savedHostel) setHostel(savedHostel);
  //   if (savedBranch) setBranch(savedBranch);
  // }, []);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hostel || !branch) {
      setError("Please enter your Hostel and Year/Branch to continue.");
      return;
    }

    // Save onboarding details to local storage (optional, kept for session persistence elsewhere)
    localStorage.setItem("cl_hostel", hostel);
    localStorage.setItem("cl_branch", branch);

    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050505] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-blue/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[100px]" />

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setError("")}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#111] border border-red-500/30 p-6 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.2)] max-w-sm w-full text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500 w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Missing Details</h3>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <button
                onClick={() => setError("")}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Okay, got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 neon-border"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            whileHover={{ rotate: 12, scale: 1.1 }}
            className="w-14 h-14 bg-gradient-to-tr from-neon-blue to-neon-green rounded-full flex items-center justify-center mb-4 shadow-lg shadow-neon-blue/20 cursor-pointer"
          >
            <GraduationCap className="text-white w-7 h-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-green mb-1 tracking-tight">
            CampusLink
          </h1>
          <p className="text-gray-400 text-xs font-medium">
            Thapar University's Exclusive Student Platform
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="text-center text-sm text-gray-300 mb-6">
            Sign in with your <span className="font-bold text-white">@thapar.edu</span> Google Account
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="hostel" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Hostel</label>
              <div className="relative group">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors w-5 h-5" />
                <input
                  id="hostel"
                  name="hostel"
                  type="text"
                  placeholder="e.g. Hostel J"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  autoComplete="on"
                  className="w-full bg-white/10 border border-dark-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="branch" className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Year / Branch</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-blue transition-colors w-5 h-5" />
                <input
                  id="branch"
                  name="branch"
                  type="text"
                  placeholder="e.g. 3rd Year CSE"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  autoComplete="on"
                  className="w-full bg-white/10 border border-dark-border rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full border font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-all group mt-6 bg-[#1a1a1a] hover:bg-[#222] border-gray-700 hover:border-gray-500 text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          By continuing, you agree to the <Link href="/code-of-conduct" className="underline hover:text-gray-300">Student Code of Conduct</Link>.
        </p>
      </motion.div>
    </main>
  );
}
