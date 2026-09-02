"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // 1. Sign up user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Since we created a trigger/RLS policy in our DB that only allows users to insert 
    // their profile when user_id matches, we can create the profile directly here, 
    // or let a Postgres function trigger handle it.
    // For now, let's explicitly insert a profile if the user session exists.
    if (data?.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          { user_id: data.user.id, name: fullName }
        ]);
        
      if (profileError && profileError.code !== '23505') { // Ignore unique violation if trigger already created it
        console.error("Error creating profile:", profileError);
      }
    }

    setSuccess(true);
    setLoading(false);
    
    // Automatically redirect after a short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center px-6 py-12 lg:px-8 bg-paper text-ink">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col items-center">
        <img src="/assets/logo.png" alt="Logo" className="w-12 h-12 grayscale contrast-125 mb-8" />
        <h2 className="text-center text-3xl font-serif font-bold leading-9 tracking-tight text-ink uppercase">
          Working Ledger
        </h2>
        <div className="mt-2 text-center text-[10px] font-bold text-ink/50 uppercase tracking-widest">
          Initialization Protocol
        </div>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-sm">
        {success ? (
          <div className="border border-ochre bg-white p-8">
            <h3 className="text-sm font-serif font-bold text-ink mb-2 uppercase">Initialization Complete</h3>
            <p className="text-xs text-ink/70 font-mono">Redirecting to operations...</p>
          </div>
        ) : (
          <div className="border border-divider bg-white p-8">
            <form className="space-y-6" onSubmit={handleSignup}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-[10px] font-bold uppercase tracking-widest text-ink/70"
                >
                  Commander Name
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full border border-divider bg-paper py-2 px-3 text-ink shadow-none focus:outline-none focus:border-ink transition-colors font-mono text-sm"
                  />
                </div>
              </div>

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
                <label
                  htmlFor="password"
                  className="block text-[10px] font-bold uppercase tracking-widest text-ink/70"
                >
                  Secure Passkey
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
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
                  {loading ? "Initializing..." : "Initialize →"}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-ink/50 font-serif italic">
          Already active?{" "}
          <Link
            href="/login"
            className="font-sans font-bold text-[10px] uppercase tracking-widest text-ochre hover:text-ink transition-colors border-b border-ochre hover:border-ink pb-0.5 ml-1 not-italic"
          >
            Access System
          </Link>
        </p>
      </div>
    </div>
  );
}
