"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { motion } from "framer-motion";

export default function LedgerHomepage() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const AdvancedButton = ({ href, children, monoText = "INIT", className = "" }) => (
    <Link href={href} className={`group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-b from-orange-400 to-orange-500 text-white font-bold rounded-full overflow-hidden transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_8px_30px_rgba(234,88,12,0.3)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.6),_0_12px_40px_rgba(234,88,12,0.4)] hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] ${className}`}>
      {/* Gloss reflection line */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-full pointer-events-none"></div>
      {/* Monospace Badge */}
      <span className="font-mono text-[10px] font-black tracking-widest text-orange-50 border border-white/30 bg-black/5 px-2 py-0.5 rounded-full group-hover:bg-white group-hover:text-orange-500 transition-colors duration-300">
        {monoText}
      </span>
      <span className="flex items-center gap-2 drop-shadow-sm">
        {children}
        <span className="font-mono transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );

  const Section = ({ num, title, children, alternate = false, id = "" }) => (
    <section id={id} className={`relative py-24 md:py-32 overflow-hidden ${alternate ? 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white' : 'bg-white'}`}>
      <div className="absolute top-0 left-0 px-6 py-4 md:px-12 flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-widest opacity-70">
        <span className="text-orange-400">{num}</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-500 font-semibold">{title}</span>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        {children}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* STICKY HEADER */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'backdrop-blur-xl bg-white/70 border-b border-orange-900/5 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-bold text-lg tracking-tighter flex items-center gap-2">
            <img src="/assets/logo.png" alt="Working Ledger" className="h-6 w-auto drop-shadow-sm" />
          </div>
          <Link href={user ? "/dashboard" : "/signup"} className="relative group overflow-hidden px-5 py-2.5 bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_4px_14px_rgba(234,88,12,0.25)] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),_0_6px_20px_rgba(234,88,12,0.35)] hover:-translate-y-0.5 text-sm font-bold rounded-full transition-all active:scale-95 flex items-center gap-2">
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full"></div>
            <span className="drop-shadow-sm">{user ? "Open Dashboard" : "Init System"}</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </nav>

      {/* COMPACT ENTRY POINT */}
      {user && (
        <div className="bg-orange-50/50 backdrop-blur-sm border-b border-orange-900/5 py-4 px-6 text-center pt-24">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-left mb-4 md:mb-0">
              <h1 className="text-base font-bold text-slate-800">Welcome back. Continue your system.</h1>
              <p className="text-sm text-slate-500">Your dashboard is ready with your current milestone and next action.</p>
            </div>
            <Link href="/dashboard" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors">
              Open Dashboard <span className="font-mono">→</span>
            </Link>
          </div>
        </div>
      )}

      {/* 0. HERO (SOFT SAAS GRADIENT) */}
      <section className="relative min-h-[95vh] flex items-center pt-32 pb-20 px-6 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-100/60 via-white to-white overflow-hidden">
        {/* Soft floating shapes */}
        <div className="absolute top-20 right-10 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/20 to-orange-100/10 rounded-full blur-[80px] pointer-events-none mix-blend-multiply"></div>
        <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-gradient-to-tr from-orange-200/30 to-transparent rounded-full blur-[60px] pointer-events-none mix-blend-multiply"></div>
        
        <div className="max-w-[1200px] mx-auto w-full relative z-10 grid md:grid-cols-12 gap-12 items-center">
          
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-white/60 backdrop-blur-md border border-white rounded-full shadow-sm text-orange-600 font-mono text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              The Goal Operating System
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-[76px] font-black text-slate-900 tracking-tighter leading-[1.05] mb-6">
              Stop rebuilding your plan.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-orange-600 to-orange-400 drop-shadow-sm">Start evolving your system.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 max-w-xl leading-[1.6] font-medium">
              Working Ledger turns your biggest long-term goal into a living operating system — one that tracks what you actually did, learns from it, and upgrades itself. No more restarting from zero.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <AdvancedButton href="/signup" className="w-full sm:w-auto text-base">Initialize Your System</AdvancedButton>
              <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-md text-slate-700 border border-slate-200/60 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 text-base font-bold rounded-full transition-all duration-300 flex items-center justify-center">
                See how it works
              </a>
            </div>
            <p className="mt-8 text-slate-400 font-mono text-[11px] font-bold tracking-wide flex items-center gap-3">
              <span>5-year goal engine</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Versioned execution memory</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>$5/mo</span>
            </p>
          </div>

          {/* Floating UI Graphic (Glassmorphism) */}
          <div className="md:col-span-5 relative mt-12 md:mt-0 transform scale-95 sm:scale-100 origin-top">
            <div className="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-orange-900/5 p-6 md:p-8 rounded-3xl transform rotate-1 hover:rotate-0 transition-transform duration-700">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-orange-900/5">
                <div className="font-mono text-[10px] font-bold text-slate-400 tracking-wider">SYSTEM_READOUT</div>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.6)] animate-pulse"></div>
              </div>
              
              {/* Native SVG Chart */}
              <div className="h-40 w-full relative mb-8">
                <svg viewBox="0 0 400 100" className="w-full h-full overflow-visible">
                  {/* Grid lines */}
                  <path d="M0,25 L400,25 M0,50 L400,50 M0,75 L400,75" stroke="#F1F5F9" strokeWidth="1" />
                  
                  <path d="M0,80 Q50,85 100,70 T200,50 T300,30 T400,10" fill="none" stroke="#FB923C" strokeWidth="3" strokeDasharray="6 6" className="opacity-40" />
                  <path d="M0,80 L100,70 L200,60 L200,50 L300,40 L300,30 L400,20 L400,10" fill="none" stroke="#F97316" strokeWidth="4" />
                  
                  {/* Ticks */}
                  <line x1="100" y1="70" x2="100" y2="85" stroke="#E2E8F0" strokeWidth="2" />
                  <text x="100" y="100" fill="#94A3B8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V01</text>
                  
                  <line x1="200" y1="50" x2="200" y2="65" stroke="#E2E8F0" strokeWidth="2" />
                  <text x="200" y="80" fill="#94A3B8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V02</text>
                  
                  <line x1="300" y1="30" x2="300" y2="45" stroke="#E2E8F0" strokeWidth="2" />
                  <text x="300" y="60" fill="#94A3B8" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">V03</text>
                  
                  <circle cx="400" cy="10" r="6" fill="#F97316" className="drop-shadow-md" />
                  <circle cx="400" cy="10" r="2" fill="white" />
                </svg>
              </div>

              <div className="flex flex-col gap-4 font-mono text-[11px] font-bold tracking-wide">
                <div className="flex justify-between border-t border-orange-900/5 pt-3">
                  <span className="text-slate-400">EXECUTION_VARIANCE</span>
                  <span className="text-red-500 bg-red-50/80 px-2.5 py-1 rounded-md">-14%</span>
                </div>
                <div className="flex justify-between border-t border-orange-900/5 pt-3">
                  <span className="text-slate-400">TRAJECTORY</span>
                  <span className="text-orange-600 bg-orange-50/80 px-2.5 py-1 rounded-md">COMPOUNDING</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 01 / PROBLEM */}
      <Section num="01" title="THE BUG" alternate={true}>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-red-50 border border-red-100 font-mono text-xs font-bold text-red-500 mb-6 tracking-widest uppercase">You've done this before</div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900">Every system you've tried has the same bug.</h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            You set a goal. You build a plan. You execute — for a while. Then life happens, momentum drops, and you rebuild everything from scratch. The plan resets. The lessons vanish. You're better at starting than any human alive. You've just never had a system smart enough to remember why you stopped.
          </p>
        </div>

        {/* Without vs With Diagrams */}
        <div className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
          {/* WITHOUT */}
          <div className="bg-white/60 backdrop-blur-lg border border-slate-200/60 shadow-xl shadow-slate-200/20 p-8 rounded-3xl">
            <h3 className="font-mono text-xs font-bold text-red-400 mb-8 pb-4 border-b border-slate-100 tracking-wide">WITHOUT WORKING LEDGER</h3>
            <div className="h-40 flex items-center">
              <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible">
                <path d="M20,75 L80,50 L140,100 L200,40 L260,110 L320,75 Q360,30 320,20 Q280,10 260,110" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeDasharray="6 6" />
                <circle cx="20" cy="75" r="5" fill="#EF4444" className="drop-shadow-sm" />
                <circle cx="80" cy="50" r="5" fill="#EF4444" className="drop-shadow-sm" />
                <circle cx="140" cy="100" r="5" fill="#EF4444" className="drop-shadow-sm" />
                <circle cx="200" cy="40" r="5" fill="#EF4444" className="drop-shadow-sm" />
                <circle cx="260" cy="110" r="5" fill="#EF4444" className="drop-shadow-sm" />
                <circle cx="320" cy="75" r="5" fill="#EF4444" className="drop-shadow-sm" />
                
                <text x="20" y="95" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Goal</text>
                <text x="80" y="70" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Guesswork</text>
                <text x="140" y="120" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Burnout</text>
                <text x="200" y="30" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">New App</text>
                <text x="260" y="130" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Amnesia</text>
                <text x="320" y="95" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Zero</text>
              </svg>
            </div>
          </div>

          {/* WITH */}
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-orange-900/10 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/10 rounded-full blur-[60px]"></div>
            <h3 className="font-mono text-xs font-bold text-orange-500 mb-8 pb-4 border-b border-orange-900/5 relative z-10 tracking-wide">WITH WORKING LEDGER</h3>
            <div className="h-40 flex items-center">
              <svg viewBox="0 0 400 150" className="w-full h-auto overflow-visible relative z-10">
                <path d="M20,120 L80,100 L140,80 L200,60 L260,40 L320,20 Q330,10 320,0 Q310,-10 300,0 Q290,10 320,20" fill="none" stroke="#F97316" strokeWidth="3" />
                <circle cx="20" cy="120" r="5" fill="#F97316" className="drop-shadow-sm" />
                <circle cx="80" cy="100" r="5" fill="#F97316" className="drop-shadow-sm" />
                <circle cx="140" cy="80" r="5" fill="#F97316" className="drop-shadow-sm" />
                <circle cx="200" cy="60" r="5" fill="#F97316" className="drop-shadow-sm" />
                <circle cx="260" cy="40" r="5" fill="#F97316" className="drop-shadow-sm" />
                <circle cx="320" cy="20" r="5" fill="#F97316" className="drop-shadow-sm" />
                
                <text x="20" y="140" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Goal</text>
                <text x="80" y="120" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">System</text>
                <text x="140" y="100" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Execution</text>
                <text x="200" y="80" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Review</text>
                <text x="260" y="60" fill="#64748B" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Evolution</text>
                <text x="320" y="40" fill="#F97316" fontSize="12" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Compounding</text>
              </svg>
            </div>
          </div>
        </div>
      </Section>

      {/* 02 / REFRAME */}
      <Section num="02" title="THE MISSING LAYER">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 leading-[1.1] text-slate-900">Your goal isn't the system.<br/>The feedback loop is.</h2>
            <p className="text-lg text-slate-500 mb-6 leading-relaxed font-medium">
              A goal tells you the destination. A plan tells you the route. Neither tells you what to repeatedly do, whether it happened, what you learned, or what should change next. 
            </p>
            <p className="text-lg text-slate-800 font-bold">Working Ledger is the layer that was always missing.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 p-10 rounded-3xl relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent rounded-3xl pointer-events-none"></div>
            <ul className="space-y-6 font-mono text-sm font-bold relative z-10">
              <li className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-50">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-orange-600 bg-orange-100 rounded-xl">01</span>
                <span className="text-slate-600">What should I repeatedly do?</span>
              </li>
              <li className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-50">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-orange-600 bg-orange-100 rounded-xl">02</span>
                <span className="text-slate-600">Did it actually happen?</span>
              </li>
              <li className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-sm shadow-slate-200/50 border border-slate-50">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-orange-600 bg-orange-100 rounded-xl">03</span>
                <span className="text-slate-600">What did that teach me?</span>
              </li>
              <li className="flex items-center gap-4 bg-white p-3 rounded-2xl shadow-md shadow-orange-900/5 border border-orange-100">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-white bg-orange-500 rounded-xl shadow-inner shadow-white/20">04</span>
                <span className="text-slate-900 text-base">What changes next?</span>
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
              <h2 className="text-4xl font-black tracking-tight mb-6 text-slate-900">Engineered for Reality.</h2>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 font-medium">
                The architecture maps precisely to the reality of executing long-term objectives.
              </p>
              
              {/* Waterfall SVG inside soft glass card */}
              <div className="bg-white/80 backdrop-blur-xl border border-white shadow-xl shadow-slate-200/50 p-10 rounded-3xl font-mono text-xs font-bold text-slate-400">
                <svg viewBox="0 0 200 200" className="w-full h-auto">
                  <text x="10" y="20" fill="#1E293B">5-YEAR GOAL</text>
                  <path d="M20,25 L20,60 L35,60" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="40" y="64" fill="#64748B">YEARLY TARGET</text>
                  
                  <path d="M20,60 L20,100 L55,100" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="60" y="104" fill="#64748B">QUARTERLY ROCK</text>

                  <path d="M20,100 L20,140 L75,140" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="80" y="144" fill="#64748B">WEEKLY MILESTONE</text>

                  <path d="M20,140 L20,180 L95,180" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <text x="100" y="184" fill="#F97316">DAILY INPUTS</text>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-8">
            {[
              {
                step: "01",
                label: "DEFINE THE DESTINATION",
                title: "Set your 5-year goal.",
                desc: "Establish the baseline, target, unit, and deadline. This is the unmoving anchor of the entire system."
              },
              {
                step: "02",
                label: "BUILD THE ROADMAP",
                title: "Auto-decompose the timeline.",
                desc: "Break the long-term objective into manageable blocks: Year → Quarter → Monthly Rocks → Weekly Milestones."
              },
              {
                step: "03",
                label: "EXECUTE & LOG REALITY",
                title: "Record what actually happened.",
                desc: "Not what you intended. The system demands absolute truth in execution data to function correctly."
              },
              {
                step: "04",
                label: "INVESTIGATE, DON'T GUESS",
                title: "AI reviews your real data.",
                desc: "Discover bottlenecks, correlations, and patterns in your execution vs milestone progression."
              },
              {
                step: "05",
                label: "EVOLVE THE VERSION",
                title: "Update an input. Archive the old.",
                desc: "The old version is archived, not erased. V1 → V2 → V3. You continuously iterate toward optimal yield."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-md border border-slate-100 p-8 rounded-3xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300">
                <div className="font-mono text-[10px] font-bold text-orange-600 mb-4 bg-orange-100/50 inline-block px-3 py-1.5 rounded-full tracking-wide">{item.step} / {item.label}</div>
                <h3 className="text-xl font-bold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* 04 / THE OPERATING LOOP (NEW SECTION) */}
      <Section num="04" title="THE OPERATING LOOP">
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900">Watch your system evolve.</h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            This is what it looks like to stop planning and start operating. A visual demonstration of autonomous behavior from executing daily inputs, running reviews, and watching the system compound.
          </p>
        </div>

        <div className="max-w-[1000px] mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-200/20 to-orange-50/20 rounded-[3rem] blur-3xl pointer-events-none"></div>
          
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-orange-900/10 rounded-[2.5rem] p-6 sm:p-10 md:p-14 relative flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-12 overflow-hidden">
            
            {/* Fake Mouse Cursor */}
            <motion.div
              className="absolute z-50 pointer-events-none drop-shadow-lg hidden md:block"
              initial={{ x: 50, y: 350, opacity: 0 }}
              animate={{ 
                x: [50, 360, 360, 200, 200, 50, 50, 50], 
                y: [350, 110, 110, 255, 255, 350, 350, 350],
                opacity: [0, 1, 1, 1, 1, 0, 0, 0],
                scale: [1, 1, 0.9, 1, 0.9, 1, 1, 1]
              }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.33202 2.0526C3.99283 1.76191 3.5 2.00346 3.5 2.45037V21.5496C3.5 21.9965 3.99283 22.2381 4.33202 21.9474L10.5843 16.5878H18.7368C19.1979 16.5878 19.4293 16.0305 19.1037 15.7049L4.33202 2.0526Z" fill="#1E293B" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            
            {/* Left side: Inputs & Reviews */}
            <div className="space-y-8 flex flex-col justify-center relative z-10">
              
              {/* Daily Inputs Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Daily Inputs</h4>
                    <p className="text-[10px] font-mono text-slate-400">TODAY'S EXECUTION</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <motion.div 
                      className="w-5 h-5 rounded-md border flex items-center justify-center shrink-0"
                      animate={{ 
                        backgroundColor: ["#FFFFFF", "#FFFFFF", "#F97316", "#F97316", "#F97316", "#F97316", "#F97316", "#FFFFFF"],
                        borderColor: ["#E2E8F0", "#E2E8F0", "#F97316", "#F97316", "#F97316", "#F97316", "#F97316", "#E2E8F0"]
                      }}
                      transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                    >
                      <motion.svg 
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        animate={{ opacity: [0, 0, 1, 1, 1, 1, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </motion.svg>
                    </motion.div>
                    <span className="text-sm font-medium text-slate-700">Outreach 5 Prospects</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                    <div className="w-5 h-5 rounded-md border border-slate-200 bg-white shrink-0"></div>
                    <span className="text-sm font-medium text-slate-400">Review PR #42</span>
                  </div>
                </div>
              </div>

              {/* Weekly Review Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-900/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-orange-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Weekly Review</h4>
                    <p className="text-[10px] font-mono text-slate-400">PENDING ANALYSIS</p>
                  </div>
                </div>
                
                <motion.button 
                  className="w-full bg-white text-slate-900 font-bold text-sm py-3 rounded-xl shadow-sm border border-transparent hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  animate={{ 
                    scale: [1, 1, 1, 1, 0.95, 1, 1, 1],
                    backgroundColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFF7ED", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
                    borderColor: ["transparent", "transparent", "transparent", "transparent", "#FED7AA", "transparent", "transparent", "transparent"]
                  }}
                  transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  Run Review
                </motion.button>
              </div>

            </div>

            {/* Right side: Evolution & Heatmap */}
            <div className="space-y-8 flex flex-col justify-center relative z-10">
              
              {/* Connector line graphic (hidden on mobile) */}
              <div className="absolute left-[-3rem] top-1/2 -translate-y-1/2 w-12 hidden md:flex items-center z-0">
                <motion.div 
                  className="w-full border-t-2 border-dashed border-orange-300"
                  animate={{ opacity: [0.2, 0.2, 0.2, 0.2, 0.2, 1, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                ></motion.div>
                <motion.div 
                  className="w-2.5 h-2.5 rounded-full bg-orange-500 absolute right-0 -mt-1 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                  animate={{ 
                    scale: [1, 1, 1, 1, 1, 1.5, 1.5, 1], 
                    opacity: [0.3, 0.3, 0.3, 0.3, 0.3, 1, 1, 0.3] 
                  }}
                  transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                ></motion.div>
              </div>

              {/* System Overview Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 rounded-full blur-2xl"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 border border-orange-100/50">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">System Overview</h4>
                      <div className="relative h-4 w-16">
                        <motion.p 
                          className="text-[10px] font-mono text-slate-400 absolute inset-0"
                          animate={{ opacity: [1, 1, 1, 1, 1, 0, 0, 1] }}
                          transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                        >
                          SYS_V01
                        </motion.p>
                        <motion.p 
                          className="text-[10px] font-mono text-orange-500 font-bold absolute inset-0"
                          animate={{ opacity: [0, 0, 0, 0, 0, 1, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                        >
                          SYS_V02
                        </motion.p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right relative w-10 h-8">
                    <motion.span 
                      className="text-sm font-black text-slate-700 absolute top-0 right-0"
                      animate={{ opacity: [1, 1, 1, 1, 1, 0, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                    >
                      35%
                    </motion.span>
                    <motion.span 
                      className="text-sm font-black text-orange-600 absolute top-0 right-0"
                      animate={{ opacity: [0, 0, 0, 0, 0, 1, 1, 0], scale: [0.8, 0.8, 0.8, 0.8, 0.8, 1.1, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                    >
                      55%
                    </motion.span>
                    <span className="text-[10px] text-slate-400 absolute bottom-0 right-0">Target</span>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full" 
                    animate={{ width: ['35%', '35%', '35%', '35%', '35%', '55%', '55%', '35%'] }}
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", times: [0, 0.15, 0.2, 0.35, 0.4, 0.5, 0.9, 1] }}
                  ></motion.div>
                </div>
              </div>

              {/* Execution Log (Heatmap) */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-200/50">
                <div className="flex justify-between items-center mb-5">
                  <h4 className="text-xs font-bold text-slate-800 tracking-wide">Execution Log</h4>
                  <span className="text-[10px] font-mono text-orange-500 bg-orange-50 px-2 py-1 rounded-md">LIVE</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {[...Array(5)].map((_, rowIndex) => (
                    <div key={rowIndex} className="flex gap-1.5 justify-between">
                      {[...Array(14)].map((_, colIndex) => {
                        // Pre-filled base activity
                        const baseFilled = (rowIndex * 14 + colIndex) % 7 === 0 || (rowIndex * 14 + colIndex) % 11 === 0;
                        // Blocks that will animate in at 50%
                        const animateIn = !baseFilled && ((rowIndex * 14 + colIndex) % 3 === 0);
                        
                        return (
                          <motion.div 
                            key={colIndex} 
                            className={`w-4 h-4 rounded-[3px] ${baseFilled ? 'bg-orange-200' : 'bg-slate-100'}`}
                            animate={animateIn ? { 
                              backgroundColor: ["#F1F5F9", "#F1F5F9", "#F1F5F9", "#F1F5F9", "#F1F5F9", "#F97316", "#F97316", "#F1F5F9"],
                              scale: [1, 1, 1, 1, 1, 1.1, 1, 1]
                            } : {}}
                            transition={animateIn ? { repeat: Infinity, duration: 8, times: [0, 0.15, 0.2, 0.35, 0.4, 0.5 + (colIndex*0.01), 0.9, 1] } : {}}
                          ></motion.div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </Section>

      {/* 05 / DIFFERENTIATOR (Memory Layer) */}
      <Section num="05" title="THE MEMORY LAYER" alternate={true}>
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900">Your system gets better because it remembers.</h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            Most productivity tools show you today. Working Ledger preserves every version of the system that got you here. Nothing is overwritten. Every iteration becomes evidence for the next one.
          </p>
        </div>

        <div className="max-w-[600px] mx-auto space-y-4">
          <div className="bg-white/50 backdrop-blur-sm border border-slate-100 p-6 rounded-2xl flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wide">V01_BASELINE</div>
              <div className="text-sm font-bold text-slate-800 mb-1">Input: 3x/week outreach</div>
              <div className="text-sm text-slate-500 font-medium">Result: 1.2x pipeline</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,25 L30,20 L60,25 L100,15" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div className="bg-white border border-orange-100 shadow-xl shadow-orange-900/5 p-6 rounded-2xl flex items-center justify-between relative transform scale-105 z-10">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-orange-500 rounded-l-2xl"></div>
            <div className="pl-3">
              <div className="font-mono text-[10px] font-bold text-orange-500 mb-3 uppercase tracking-wide">V02_OPTIMIZED</div>
              <div className="text-sm font-bold text-slate-900 mb-1">Input: Daily outreach + follow-up cadence</div>
              <div className="text-sm text-slate-600 font-medium">Result: 2.8x pipeline</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path d="M0,15 L30,10 L60,15 L100,5" fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm" />
              </svg>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between shadow-xl shadow-slate-900/10">
            <div>
              <div className="font-mono text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-wide">V03_COMPOUNDING</div>
              <div className="text-sm font-bold text-white mb-1">Input: Delegated outreach, owner reviews only</div>
              <div className="text-sm text-green-400 font-medium">Result: Trending to terminal velocity</div>
            </div>
            <div className="w-24 h-8">
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path d="M0,5 L30,5 L60,2 L100,0" fill="none" stroke="#4ADE80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_4px_rgba(74,222,128,0.3)]" />
              </svg>
            </div>
          </div>
        </div>
      </Section>

      {/* 06 / AI PROOF (INVESTIGATION) */}
      <Section num="06" title="INVESTIGATION">
        <div className="max-w-[800px] mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900">It doesn't cheer you on.<br/>It investigates you.</h2>
          <p className="text-lg text-slate-500 leading-relaxed font-medium">
            Weekly and monthly reviews run against your actual logged data — not vibes. You get anomalies, correlations, and hypotheses. Then you decide what to change.
          </p>
        </div>

        <div className="max-w-[800px] mx-auto space-y-6">
          <div className="bg-white/80 backdrop-blur-xl border border-red-100 shadow-lg shadow-slate-200/40 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-400"></div>
            <div className="font-mono text-[10px] font-bold text-red-500 mb-4 bg-red-50 inline-block px-3 py-1.5 rounded-full tracking-wide">OBSERVED_ANOMALY</div>
            <p className="text-base text-slate-800 font-medium">System execution variance is 14% below baseline moving average across primary drivers in the last 14 days.</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl border border-orange-100 shadow-lg shadow-slate-200/40 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-400"></div>
            <div className="font-mono text-[10px] font-bold text-orange-600 mb-4 bg-orange-50 inline-block px-3 py-1.5 rounded-full tracking-wide">CORRELATED_PATTERN</div>
            <p className="text-base text-slate-800 font-medium">Periods of high input volatility correlate strongly with degraded milestone velocity and delayed outcomes.</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 shadow-2xl shadow-slate-900/20 p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-white"></div>
            <div className="font-mono text-[10px] font-bold text-slate-100 mb-4 bg-white/10 inline-block px-3 py-1.5 rounded-full tracking-wide">SYNTHESIZED_HYPOTHESIS</div>
            <p className="text-base text-slate-300 font-medium leading-relaxed">Stabilizing primary execution inputs may yield a non-linear acceleration in outcome generation. Recommend anchoring core parameters and archiving friction-heavy variables.</p>
          </div>
        </div>
      </Section>

      {/* 07 / ARCHITECTURE */}
      <Section num="07" title="ARCHITECTURE" alternate={true}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/60 backdrop-blur-lg border border-slate-100 p-10 rounded-3xl group hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500">
            <h3 className="font-black text-2xl mb-3 text-slate-900 group-hover:text-orange-500 transition-colors">Strategic Layer</h3>
            <p className="text-slate-500 text-base font-medium">From 5-year vision down to this week's milestone.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-lg border border-slate-100 p-10 rounded-3xl group hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500">
            <h3 className="font-black text-2xl mb-3 text-slate-900 group-hover:text-orange-500 transition-colors">Operating Layer</h3>
            <p className="text-slate-500 text-base font-medium">Daily inputs, targets, frequency, and weight — the levers you actually pull.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-lg border border-slate-100 p-10 rounded-3xl group hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500">
            <h3 className="font-black text-2xl mb-3 text-slate-900 group-hover:text-orange-500 transition-colors">Investigation Layer</h3>
            <p className="text-slate-500 text-base font-medium">Weekly, monthly, quarterly AI reviews of real execution data.</p>
          </div>
          <div className="bg-white/60 backdrop-blur-lg border border-slate-100 p-10 rounded-3xl group hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-orange-900/5 transition-all duration-500">
            <h3 className="font-black text-2xl mb-3 text-slate-900 group-hover:text-orange-500 transition-colors">Memory Layer</h3>
            <p className="text-slate-500 text-base font-medium">Every result, every version, every decision — permanently timestamped.</p>
          </div>
        </div>
      </Section>

      {/* 08 / PRICING */}
      <Section num="08" title="PRICING" id="pricing">
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-slate-900">One system. One price.<br/>No excuse to restart.</h2>
          
          <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-orange-900/10 p-14 rounded-[3rem] mt-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-200/20 rounded-full blur-[80px]"></div>
            
            <div className="relative z-10">
              <div className="flex items-baseline justify-center mb-6">
                <span className="text-[90px] leading-none font-black text-slate-900 tracking-tighter drop-shadow-sm">$5</span>
                <span className="text-2xl text-slate-400 ml-2 font-mono font-bold">/mo</span>
              </div>
              <p className="text-slate-500 mb-10 text-lg font-medium max-w-sm mx-auto">
                Less than the coffee that fuels the plan you'll abandon next month.
              </p>
              <AdvancedButton href="/signup" className="px-10 py-5 text-lg w-full md:w-auto" monoText="DEPLOY">Initialize Your System</AdvancedButton>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200/60 py-12 px-6 pb-28 md:pb-12">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-3 mb-6 md:mb-0">
            <img src="/assets/logo.png" alt="Working Ledger Logo" className="h-6 w-auto grayscale opacity-40 hover:opacity-100 transition-opacity duration-300" />
            <span className="text-slate-400 font-mono text-[10px] font-bold tracking-wide">© 2026 Working Ledger. All rights reserved.</span>
          </div>
          <div className="flex gap-8 font-mono text-[10px] font-bold text-slate-400 tracking-widest">
            <Link href="/terms" className="hover:text-orange-500 transition-colors">TERMS</Link>
            <Link href="/privacy" className="hover:text-orange-500 transition-colors">PRIVACY</Link>
            <Link href="/contact" className="hover:text-orange-500 transition-colors">CONTACT</Link>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full z-50 md:hidden pb-safe backdrop-blur-xl bg-white/80 border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 leading-tight">$5/mo</span>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Goal Engine</span>
          </div>
          <Link href="/signup" className="flex-1 relative group overflow-hidden px-5 py-3.5 bg-gradient-to-b from-orange-400 to-orange-500 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),_0_4px_14px_rgba(234,88,12,0.25)] text-sm font-bold rounded-full transition-all active:scale-95 flex items-center justify-center gap-2">
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full"></div>
            <span className="drop-shadow-sm">Init System</span>
            <span className="font-mono transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

    </div>
  );
}
