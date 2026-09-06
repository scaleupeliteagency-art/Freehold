"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Plus, ArrowRight, Activity, Target, Calendar } from "lucide-react";

export default function SystemOverviewPage() {
  const [system, setSystem] = useState(null);
  const [northStar, setNorthStar] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSystem() {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        // If not logged in, we might just have no user data, but let's query systems anyway
        // RLS will handle the filtering if they are logged in.
        
        // Fetch the active system
        const { data: systems, error } = await supabase
          .from("systems")
          .select("*")
          .eq("status", "ACTIVE")
          .limit(1);

        if (error) throw error;

        if (systems && systems.length > 0) {
          setSystem(systems[0]);
          
          // Fetch its north star goals
          const { data: goals } = await supabase
            .from("north_star_goals")
            .select("*")
            .eq("system_id", systems[0].id)
            .limit(1);
            
          if (goals && goals.length > 0) {
            setNorthStar(goals[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching system:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSystem();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-paper">
        <div className="w-8 h-8 border-4 border-divider border-t-text-ochre animate-spin" />
      </div>
    );
  }

  // EMPTY STATE: No active system found
  if (!system) {
    return (
      <div className="flex flex-col items-start justify-center min-h-[calc(100vh-150px)] animate-in fade-in zoom-in-95 duration-500 bg-paper text-ink p-8 max-w-5xl mx-auto">
        <div className="w-16 h-16 border border-divider flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-text-ochre" />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">No Active System</h2>
        <hr className="border-divider w-full mb-4" />
        <p className="max-w-md mb-8 leading-relaxed">
          You currently have zero active systems. Initialize your long-term operating system to start tracking your North Star goals, milestones, and daily inputs.
        </p>
        <Link 
          href="/system/new" 
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-paper border border-divider text-ink font-bold transition-all hover:bg-text-ochre hover:text-paper"
        >
          <Plus className="w-5 h-5" />
          Initialize New System
        </Link>
      </div>
    );
  }

  // ACTIVE SYSTEM CARD
  
  // Calculate progress safely
  let progress = 0;
  if (northStar && northStar.target_value && northStar.starting_value !== undefined) {
    const total = Math.abs(northStar.target_value - northStar.starting_value);
    const current = Math.abs((northStar.current_value || 0) - northStar.starting_value);
    if (total > 0) {
      progress = Math.min(100, Math.max(0, (current / total) * 100));
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 bg-paper text-ink min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 uppercase">System Overview</h1>
          <p className="text-ink">MASTER LEDGER: Your core operating architecture.</p>
        </div>
      </div>
      
      <hr className="border-divider mb-8" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-divider flex items-center justify-center">
            <Target className="w-6 h-6 text-text-ochre" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{system.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-divider">
                ACTIVE
              </span>
              <span className="text-sm">Phase: {system.current_phase || 'Execution'}</span>
            </div>
          </div>
        </div>
        
        <Link href="/system/settings" className="border border-divider px-4 py-2 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-colors uppercase">
          Configure
        </Link>
      </div>

      <hr className="border-divider mb-8" />

      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-2 uppercase tracking-widest text-text-ochre">The Why</h3>
        <p className="text-lg font-medium italic border-l-2 border-text-ochre pl-4">
          "{system.why || 'No reason specified'}"
        </p>
      </div>

      <hr className="border-divider mb-8" />

      {northStar && (
        <div className="mb-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest mb-1 text-text-ochre">North Star Goal</h3>
              <div className="text-xl font-bold">{northStar.name}</div>
            </div>
            {northStar.deadline && (
              <div className="flex items-center gap-2 text-sm border border-divider px-3 py-1">
                <Calendar className="w-4 h-4" />
                {new Date(northStar.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm uppercase">
              <span>Progress</span>
              <span className="font-mono font-bold text-text-ochre">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-paper border border-divider h-3">
              <div 
                className="bg-text-ochre h-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono mt-1">
              <span>{northStar.starting_value} {northStar.unit}</span>
              <span>{northStar.target_value} {northStar.unit}</span>
            </div>
          </div>
        </div>
      )}

      <hr className="border-divider mb-4" />
      
      <div className="flex justify-end">
        <Link href="/inputs" className="text-sm font-semibold text-text-ochre flex items-center gap-2 hover:underline uppercase p-2 border border-divider">
          View Daily Inputs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

