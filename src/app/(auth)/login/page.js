"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 min-h-[600px] md:min-h-[700px]">
        {/* Left Column (Visual Card) */}
        <div className="hidden md:flex flex-col justify-end p-10 rounded-[2.5rem] relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-700 to-black border border-white/5 shadow-2xl">
          {/* Subtle textured overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/80 pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400 shadow-[0_0_10px_2px_rgba(249,115,22,0.8)] animate-pulse"></span>
              <span className="text-xs font-mono tracking-widest text-orange-200 uppercase">System Initialization</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-tight text-white">
              Start operating your <span className="font-serif italic font-light text-orange-300">system</span>.
            </h1>
            <p className="text-sm text-orange-200/80 max-w-sm">
              Secure Access Protocol. Authenticate to enter the working ledger and manage your operations.
            </p>
          </div>
        </div>

        {/* Right Column (The Form) */}
        <div className="flex flex-col justify-center max-w-md mx-auto w-full md:px-8">
          <div className="mb-10 md:hidden flex flex-col items-center">
            <img src="/assets/logo.png" alt="Logo" className="w-12 h-12 mb-4 drop-shadow-lg" />
            <h2 className="text-2xl font-black tracking-tight">Working Ledger</h2>
          </div>

          <div className="space-y-2 mb-8 hidden md:block">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500">Enter your credentials to access your account.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400 font-mono text-sm"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400 font-mono text-sm"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-mono">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-b from-orange-400 to-orange-500 text-white font-bold rounded-xl md:rounded-full overflow-hidden transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_8px_30px_rgba(234,88,12,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),_0_12px_40px_rgba(234,88,12,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_8px_30px_rgba(234,88,12,0.3)] disabled:cursor-not-allowed"
              >
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none"></div>
                <span className="font-mono text-[10px] font-black tracking-widest text-orange-50 border border-white/30 bg-black/5 px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-orange-500 transition-colors duration-300">
                  [AUTH]
                </span>
                <span className="flex items-center gap-2 drop-shadow-sm text-sm">
                  {loading ? "Authenticating..." : "Sign In"}
                  {!loading && <span className="font-mono transition-transform duration-300 group-hover:translate-x-1">→</span>}
                </span>
              </button>
            </div>
          </form>

          <p className="mt-8 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-slate-500 hover:text-slate-800 transition-colors ml-1">
              Initialize System
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
