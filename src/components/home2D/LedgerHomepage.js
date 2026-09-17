"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LedgerHomepage() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const Section = ({ num, title, children, alternate = false, id = "" }) => (
    <section id={id} className={`relative border-t border-gray-200 py-24 md:py-32 ${alternate ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="absolute top-0 left-0 px-6 py-2 md:px-12 flex items-center gap-2 font-mono text-[10px] md:text-xs text-gray-400 tracking-widest">
        <span>{num}</span>
        <span className="text-gray-200">/</span>
        <span className="text-gray-900 font-semibold">{title}</span>
      </div>
      <div className="max-w-[1200px] mx-auto px-6">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* STICKY HEADER */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b border-gray-200 backdrop-blur-xl bg-white/80 ${scrolled ? 'translate-y-0 shadow-sm' : '-translate-y-full border-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tighter flex items-center gap-2">
            <img src="/assets/logo.png" alt="Working Ledger" className="h-6 w-auto" />
          </div>
          <Link href={user ? "/dashboard" : "/signup"} className="px-5 py-2 text-white bg-orange-600 hover:bg-orange-700 shadow-[0_4px_14px_0_rgba(234,88,12,0.4)] hover:shadow-[0_6px_25px_rgba(234,88,12,0.5)] hover:-translate-y-0.5 text-sm font-bold rounded-full transition-all">
            {user ? "Open Dashboard" : "Initialize Your System →"}
          </Link>
        </div>
      </nav>

      {/* COMPACT ENTRY POINT */}
      {user && (
        <div className="bg-gray-50 border-b border-gray-200 py-8 px-6 text-center">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-left mb-4 md:mb-0">
              <h1 className="text-lg font-bold text-gray-900">Welcome back. Continue your system.</h1>
              <p className="text-sm text-gray-500">Your dashboard is ready with your current milestone and next action.</p>
            </div>
            <Link href="/dashboard" className="px-6 py-2.5 bg-orange-600 text-white shadow-md text-sm font-bold rounded-full hover:bg-orange-700 transition-colors">
              Open Dashboard →
            </Link>
          </div>
        </div>
      )}

      {/* 0. HERO (WHITE & HIGH CONTRAST) */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 px-6 bg-white overflow-hidden">
        {/* Architectural Grid Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle,_#EA580C_0%,_transparent_60%)] opacity-[0.05] blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto w-full relative z-10 grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-7">
            <div className="inline-block px-3 py-1.5 mb-8 border border-gray-200 bg-gray-50 text-orange-600 font-mono text-xs font-bold tracking-widest uppercase shadow-sm">
              The Goal Operating System
            </div>
            
            <h1 className="text-5xl md:text-[80px] font-black text-gray-900 tracking-tighterer leading-[1.05] mb-6">
              Stop rebuilding your plan.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">Start evolving your system.</span>
            </h1>
            
            <p className="text-xl text-gray-500 mb-10 max-w-xl leading-[1.6] font-medium">
              Working Ledger turns your biggest long-term goal into a living operating system — one that tracks what you actually did, learns from it, and upgrades itself. No more restarting from zero.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-orange-600 text-white shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_40px_rgb(234,88,12,0.6)] hover:-translate-y-1 text-base font-bold rounded-full transition-all duration-200 flex items-center justify-center">
                Initialize Your System →
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-900 text-base font-bold rounded-full transition-all duration-200 flex items-center justify-center">
                See how it works
              </a>
            </div>
            <p className="mt-6 text-gray-400 font-mono text-[11px] font-bold tracking-wide">
              5-year goal engine · Versioned execution memory · $5/mo
            </p>
          </div>

          {/* Floating UI Graphic (Light Mode High Contrast) */}
          <div className="md:col-span-5 relative hidden md:block">
            <div className="bg-white border-2 border-gray-100 p-8 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rotate-1">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <div className="font-mono text-xs font-bold text-gray-400">SYSTEM_READOUT</div>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(234,88,12,0.5)] animate-pulse"></div>
              </div>
              
              {/* Native SVG Chart */}
              <div className="h-40 w-full relative mb-8">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <path d="M0,25 L400,25 M0,50 L400,50 M0,75 L400,75" stroke="#F3F4F6" strokeWidth="1" />
                  
                  <path d="M0,80 Q50,85 100,70 T200,50 T300,30 T400,10" fill="none" stroke="#EA580C" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
                  <path d="M0,80 L100,70 L200,60 L200,50 L300,40 L300,30 L400,20 L400,10" fill="none" stroke="#EA580C" strokeWidth="4" />
                  
                  {/* Ticks */}
                  <line x1="100" y1="70" x2="100" y2="85" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="100" y="100" fill="#6B7280" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V01</text>
                  
                  <line x1="200" y1="50" x2="200" y2="65" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="200" y="80" fill="#6B7280" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V02</text>
                  
                  <line x1="300" y1="30" x2="300" y2="45" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="300" y="60" fill="#6B7280" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V03</text>
                  
                  <circle cx="400" cy="10" r="6" fill="#EA580C" className="drop-shadow-md" />
                  <circle cx="400" cy="10" r="2" fill="white" />
                </svg>
              </div>

              <div className="flex flex-col gap-4 font-mono text-[12px] font-bold">
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-400">EXECUTION_VARIANCE</span>
                  <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded">-14%</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3">
                  <span className="text-gray-400">TRAJECTORY</span>
                  <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">COMPOUNDING</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 01 / PROBLEM */}
      <Section num="01" title="THE BUG" alternate={true}>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <div className="font-mono text-sm font-bold text-red-500 mb-6 tracking-widest uppercase">You've done this before</div>
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-gray-900">Every system you've tried has the same bug.</h2>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            You set a goal. You build a plan. You execute — for a while. Then life happens, momentum drops, and you rebuild everything from scratch. The plan resets. The lessons vanish. You're better at starting than any human alive. You've just never had a system smart enough to remember why you stopped.
          </p>
        </div>

        {/* Without vs With Diagrams */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* WITHOUT */}
          <div className="bg-white border-2 border-gray-100 shadow-sm p-8 rounded-xl">
            <h3 className="font-mono text-xs font-bold text-red-500 mb-8 border-b border-gray-100 pb-4">WITHOUT WORKING LEDGER</h3>
            <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible">
              <path d="M20,75 L80,50 L140,100 L200,40 L260,110 L320,75 Q360,30 320,20 Q280,10 260,110" fill="none" stroke="#F87171" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="20" cy="75" r="5" fill="#EF4444" />
              <circle cx="80" cy="50" r="5" fill="#EF4444" />
              <circle cx="140" cy="100" r="5" fill="#EF4444" />
              <circle cx="200" cy="40" r="5" fill="#EF4444" />
              <circle cx="260" cy="110" r="5" fill="#EF4444" />
              <circle cx="320" cy="75" r="5" fill="#EF4444" />
              
              <text x="20" y="95" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Goal</text>
              <text x="80" y="70" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Guesswork</text>
              <text x="140" y="120" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Burnout</text>
              <text x="200" y="30" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">New App</text>
              <text x="260" y="130" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Amnesia</text>
              <text x="320" y="95" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Zero</text>
            </svg>
          </div>

          {/* WITH */}
          <div className="bg-white border-2 border-orange-100 shadow-[0_8px_30px_rgb(234,88,12,0.06)] p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
            <h3 className="font-mono text-xs font-bold text-orange-600 mb-8 border-b border-orange-100 pb-4 relative z-10">WITH WORKING LEDGER</h3>
            <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible relative z-10">
              <path d="M20,120 L80,100 L140,80 L200,60 L260,40 L320,20 Q330,10 320,0 Q310,-10 300,0 Q290,10 320,20" fill="none" stroke="#EA580C" strokeWidth="3" />
              <circle cx="20" cy="120" r="5" fill="#EA580C" />
              <circle cx="80" cy="100" r="5" fill="#EA580C" />
              <circle cx="140" cy="80" r="5" fill="#EA580C" />
              <circle cx="200" cy="60" r="5" fill="#EA580C" />
              <circle cx="260" cy="40" r="5" fill="#EA580C" />
              <circle cx="320" cy="20" r="5" fill="#EA580C" />
              
              <text x="20" y="140" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Goal</text>
              <text x="80" y="120" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">System</text>
              <text x="140" y="100" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Execution</text>
              <text x="200" y="80" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Review</text>
              <text x="260" y="60" fill="#4B5563" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Evolution</text>
              <text x="320" y="40" fill="#EA580C" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Compounding</text>
            </svg>
          </div>
        </div>
      </Section>

      {/* 02 / REFRAME */}
      <Section num="02" title="THE MISSING LAYER">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 leading-[1.1] text-gray-900">Your goal isn't the system.<br/>The feedback loop is.</h2>
            <p className="text-xl text-gray-500 mb-6 leading-relaxed font-medium">
              A goal tells you the destination. A plan tells you the route. Neither tells you what to repeatedly do, whether it happened, what you learned, or what should change next. 
            </p>
            <p className="text-xl text-gray-900 font-bold">Working Ledger is the layer that was always missing.</p>
          </div>
          <div className="bg-gray-50 border-2 border-gray-100 p-10 rounded-xl shadow-sm">
            <ul className="space-y-6 font-mono text-sm font-bold">
              <li className="flex items-start gap-4">
                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded">01</span>
                <span className="text-gray-500">What should I repeatedly do?</span>
              </li>
              <li className="flex items-start gap-4 border-t border-gray-200 pt-6">
                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded">02</span>
                <span className="text-gray-500">Did it actually happen?</span>
              </li>
              <li className="flex items-start gap-4 border-t border-gray-200 pt-6">
                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded">03</span>
                <span className="text-gray-500">What did that teach me?</span>
              </li>
              <li className="flex items-start gap-4 border-t border-gray-200 pt-6">
                <span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded shadow-sm">04</span>
                <span className="text-gray-900 text-base">What changes next?</span>
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* 03 / MECHANISM */}
      <Section num="03" title="HOW IT WORKS" alternate={true} id="how-it-works">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 relative">
            <div className="sticky top-32">
              <h2 className="text-4xl font-black tracking-tighter mb-6 text-gray-900">Engineered for Reality.</h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                The architecture maps precisely to the reality of executing long-term objectives.
              </p>
              
              {/* Waterfall SVG */}
              <div className="bg-white border-2 border-gray-100 shadow-sm p-8 rounded-xl font-mono text-xs font-bold text-gray-500">
                <svg viewBox="0 0 200 200" className="w-full h-auto">
                  <text x="10" y="20" fill="#111827">5-YEAR GOAL</text>
                  <path d="M20,25 L20,60 L35,60" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="40" y="64" fill="#6B7280">YEARLY TARGET</text>
                  
                  <path d="M20,60 L20,100 L55,100" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="60" y="104" fill="#6B7280">QUARTERLY ROCK</text>

                  <path d="M20,100 L20,140 L75,140" fill="none" stroke="#D1D5DB" strokeWidth="2" />
                  <text x="80" y="144" fill="#6B7280">WEEKLY MILESTONE</text>

                  <path d="M20,140 L20,180 L95,180" fill="none" stroke="#EA580C" strokeWidth="3" />
                  <text x="100" y="184" fill="#EA580C">DAILY INPUTS</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-12">
            <div>
              <div className="font-mono text-xs font-bold text-orange-600 mb-2 bg-orange-50 inline-block px-2 py-1 rounded">01 / DEFINE THE DESTINATION</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 mt-4">Set your 5-year goal.</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Establish the baseline, target, unit, and deadline. This is the unmoving anchor of the entire system.</p>
            </div>
            <div className="border-t border-gray-200 pt-12">
              <div className="font-mono text-xs font-bold text-orange-600 mb-2 bg-orange-50 inline-block px-2 py-1 rounded">02 / BUILD THE ROADMAP</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 mt-4">Auto-decompose the timeline.</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Break the long-term objective into manageable blocks: Year → Quarter → Monthly Rocks → Weekly Milestones.</p>
            </div>
            <div className="border-t border-gray-200 pt-12">
              <div className="font-mono text-xs font-bold text-orange-600 mb-2 bg-orange-50 inline-block px-2 py-1 rounded">03 / EXECUTE & LOG REALITY</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 mt-4">Record what actually happened.</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Not what you intended. The system demands absolute truth in execution data to function correctly.</p>
            </div>
            <div className="border-t border-gray-200 pt-12">
              <div className="font-mono text-xs font-bold text-orange-600 mb-2 bg-orange-50 inline-block px-2 py-1 rounded">04 / INVESTIGATE, DON'T GUESS</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 mt-4">AI reviews your real data.</h3>
              <p className="text-gray-600 leading-relaxed text-lg">Discover bottlenecks, correlations, and patterns in your execution vs milestone progression.</p>
            </div>
            <div className="border-t border-gray-200 pt-12">
              <div className="font-mono text-xs font-bold text-orange-600 mb-2 bg-orange-50 inline-block px-2 py-1 rounded">05 / EVOLVE THE VERSION</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900 mt-4">Update an input. Archive the old.</h3>
              <p className="text-gray-600 leading-relaxed text-lg">The old version is archived, not erased. V1 → V2 → V3. You continuously iterate toward optimal yield.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 04 / DIFFERENTIATOR */}
      <Section num="04" title="THE MEMORY LAYER">
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-gray-900">Your system gets better because it remembers.</h2>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Most productivity tools show you today. Working Ledger preserves every version of the system that got you here. Nothing is overwritten. Every iteration becomes evidence for the next one.
          </p>
        </div>

        <div className="max-w-[600px] mx-auto space-y-4">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-gray-400 mb-3 uppercase">V01_BASELINE</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Input: 3x/week outreach</div>
              <div className="text-sm text-gray-500 font-medium">Result: 1.2x pipeline</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,25 L30,20 L60,25 L100,15" fill="none" stroke="#9CA3AF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="bg-white border-2 border-orange-200 shadow-[0_8px_30px_rgb(234,88,12,0.1)] p-6 rounded-xl flex items-center justify-between relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-l-xl"></div>
            <div className="pl-2">
              <div className="font-mono text-xs font-bold text-orange-600 mb-3 uppercase">V02_OPTIMIZED</div>
              <div className="text-sm font-bold text-gray-900 mb-1">Input: Daily outreach + follow-up cadence</div>
              <div className="text-sm text-gray-600 font-medium">Result: 2.8x pipeline</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,15 L30,10 L60,15 L100,5" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-gray-400 mb-3 uppercase">V03_COMPOUNDING</div>
              <div className="text-sm font-bold text-white mb-1">Input: Delegated outreach, owner reviews only</div>
              <div className="text-sm text-green-400 font-medium">Result: Trending to terminal velocity</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,5 L30,5 L60,2 L100,0" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </Section>

      {/* 05 / AI PROOF */}
      <Section num="05" title="INVESTIGATION" alternate={true}>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-gray-900">It doesn't cheer you on.<br/>It investigates you.</h2>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            Weekly and monthly reviews run against your actual logged data — not vibes. You get anomalies, correlations, and hypotheses. Then you decide what to change.
          </p>
        </div>

        <div className="max-w-[800px] mx-auto space-y-6">
          <div className="bg-white border-l-4 border-l-red-500 border border-gray-200 shadow-sm p-8 rounded-xl">
            <div className="font-mono text-xs font-bold text-red-500 mb-4 bg-red-50 inline-block px-2 py-1 rounded">OBSERVED_ANOMALY</div>
            <p className="text-base text-gray-900 font-medium">System execution variance is 14% below baseline moving average across primary drivers in the last 14 days.</p>
          </div>
          <div className="bg-white border-l-4 border-l-orange-500 border border-gray-200 shadow-sm p-8 rounded-xl">
            <div className="font-mono text-xs font-bold text-orange-600 mb-4 bg-orange-50 inline-block px-2 py-1 rounded">CORRELATED_PATTERN</div>
            <p className="text-base text-gray-900 font-medium">Periods of high input volatility correlate strongly with degraded milestone velocity and delayed outcomes.</p>
          </div>
          <div className="bg-gray-900 border-l-4 border-l-white border border-gray-800 shadow-lg p-8 rounded-xl">
            <div className="font-mono text-xs font-bold text-white mb-4 bg-white/10 inline-block px-2 py-1 rounded">SYNTHESIZED_HYPOTHESIS</div>
            <p className="text-base text-gray-300 font-medium">Stabilizing primary execution inputs may yield a non-linear acceleration in outcome generation. Recommend anchoring core parameters and archiving friction-heavy variables.</p>
          </div>
        </div>
      </Section>

      {/* 06 / ARCHITECTURE */}
      <Section num="06" title="ARCHITECTURE">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-gray-200 p-10 rounded-2xl relative group hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Strategic Layer</h3>
              <p className="text-gray-500 text-base font-medium">From 5-year vision down to this week's milestone.</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-10 rounded-2xl relative group hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Operating Layer</h3>
              <p className="text-gray-500 text-base font-medium">Daily inputs, targets, frequency, and weight — the levers you actually pull.</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-10 rounded-2xl relative group hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Investigation Layer</h3>
              <p className="text-gray-500 text-base font-medium">Weekly, monthly, quarterly AI reviews of real execution data.</p>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 p-10 rounded-2xl relative group hover:bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="relative z-10">
              <h3 className="font-black text-2xl mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">Memory Layer</h3>
              <p className="text-gray-500 text-base font-medium">Every result, every version, every decision — permanently timestamped.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 07 / PRICING */}
      <Section num="07" title="PRICING" alternate={true} id="pricing">
        <div className="max-w-[600px] mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-gray-900">One system. One price.<br/>No excuse to restart.</h2>
          
          <div className="bg-white border-2 border-orange-100 shadow-[0_20px_50px_-12px_rgba(234,88,12,0.15)] p-12 rounded-3xl mt-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <div className="flex items-baseline justify-center mb-4">
                <span className="text-[80px] leading-none font-black text-gray-900 tracking-tighter">$5</span>
                <span className="text-2xl text-gray-500 ml-2 font-mono font-bold">/mo</span>
              </div>
              <p className="text-gray-600 mb-10 text-base font-medium max-w-xs mx-auto">
                Less than the coffee that fuels the plan you'll abandon next month.
              </p>
              <Link href="/signup" className="block w-full py-5 bg-orange-600 text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_40px_rgb(234,88,12,0.6)] hover:-translate-y-1 transition-all">
                Start Building Your System
              </Link>
              <p className="mt-6 font-mono text-[12px] font-bold text-gray-400">Cancel anytime. Your version history stays yours.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* 08 / FAQ */}
      <Section num="08" title="FAQ">
        <div className="max-w-[800px] mx-auto space-y-10">
          <div className="border-b border-gray-200 pb-10">
            <h3 className="font-black text-2xl mb-4 text-gray-900">How is this different from Notion or Todoist?</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              Task managers reset every day. Workspace tools require you to build and maintain the logic yourself. Working Ledger is a pre-built operating system focused specifically on linking daily execution data to long-term milestone progression, and running automated investigation reviews on that data.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-10">
            <h3 className="font-black text-2xl mb-4 text-gray-900">Do I need to be technical to set this up?</h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              No. While the interface is designed to feel like a high-precision instrument, the actual setup process guides you step-by-step from your 5-year goal down to your daily inputs. If you can define what you want and what you need to do to get it, you can run the system.
            </p>
          </div>
        </div>
      </Section>

      {/* 09 / FINAL CTA */}
      <section className="py-32 px-6 bg-gray-900 text-center border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8">Start with the goal that actually matters.</h2>
          <p className="text-2xl text-gray-400 mb-12 font-medium">Not another plan. A system that remembers.</p>
          <Link href="/signup" className="inline-flex items-center px-10 py-5 bg-orange-600 text-white text-lg font-bold rounded-full shadow-[0_8px_30px_rgb(234,88,12,0.3)] hover:shadow-[0_8px_40px_rgb(234,88,12,0.6)] hover:-translate-y-1 transition-all">
            Initialize Your System →
          </Link>
        </div>
      </section>

      {/* 10 / FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <img src="/assets/logo.png" alt="Working Ledger Logo" className="h-6 w-auto grayscale opacity-50 hover:opacity-100 transition-opacity" />
            <span className="text-gray-400 font-mono text-xs font-bold">© 2026 Working Ledger. All rights reserved.</span>
          </div>
          <div className="flex gap-6 font-mono text-xs font-bold text-gray-400">
            <Link href="/terms" className="hover:text-orange-600 transition-colors">TERMS</Link>
            <Link href="/privacy" className="hover:text-orange-600 transition-colors">PRIVACY</Link>
            <Link href="/contact" className="hover:text-orange-600 transition-colors">CONTACT</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
