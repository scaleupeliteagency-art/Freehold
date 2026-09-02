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
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-paper text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
        <img src="/assets/logo.png" alt="Logo" className="w-12 h-12 grayscale contrast-125 mb-8" />
        <h2 className="text-center text-3xl font-serif font-bold leading-9 tracking-tight text-ink uppercase">
          Working Ledger
        </h2>
        <div className="mt-2 text-center text-[10px] font-bold text-ink/50 uppercase tracking-widest">
          Secure Access Protocol
        </div>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="border border-divider bg-white p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-widest text-ink/70"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full border border-divider bg-paper py-2 px-3 text-ink shadow-none focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-[10px] font-bold uppercase tracking-widest text-ink/70"
                >
                  Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full border border-divider bg-paper py-2 px-3 text-ink shadow-none focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-paper bg-ochre p-3 font-mono">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center border border-ink bg-ink px-3 py-3 text-[10px] font-bold uppercase tracking-widest text-paper hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Sign In →"}
              </button>
            </div>
          </form>
        </div>

        <p className="mt-10 text-center text-xs text-ink/50 font-serif italic">
          Not a member?{" "}
          <Link
            href="/signup"
            className="font-sans font-bold text-[10px] uppercase tracking-widest text-ochre hover:text-ink transition-colors border-b border-ochre hover:border-ink pb-0.5 ml-1 not-italic"
          >
            Initialize
          </Link>
        </p>
      </div>
    </div>
  );
}
