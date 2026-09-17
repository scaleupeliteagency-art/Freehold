"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Plus, ArrowRight, Activity, Target, Calendar } from "lucide-react";

export default function SystemOverviewPage() {
  const [system, setSystem] = useState(null);
  const [northStar, setNorthStar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    setIsRescheduling(true);
    try {
      const { error } = await supabase
        .from("systems")
        .update({ start_date: rescheduleDate })
        .eq("id", system.id);
      
      if (error) throw error;
      
      setSystem({ ...system, start_date: rescheduleDate });
    } catch (err) {
      console.error("Error rescheduling:", err);
    } finally {
      setIsRescheduling(false);
    }
  };

  useEffect(() => {
    async function fetchSystem() {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        // If not logged in, we might just have no user data, but let's query systems anyway
        // RLS will handle the filtering if they are logged in.
        
        // Fetch the active or scheduled system
        const { data: systems, error } = await supabase
          .from("systems")
          .select("*")
          .in("status", ["active", "scheduled"])
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (systems && systems.length > 0) {
          const activeSys = systems.find(s => s.status === "active");
          const targetSystem = activeSys || systems[0];
          setSystem(targetSystem);
          
          // Fetch its north star goals
          const { data: goals } = await supabase
            .from("north_star_goals")
            .select("*")
            .eq("system_id", targetSystem.id)
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
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // EMPTY STATE: No active system found
  if (!system) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] animate-in fade-in zoom-in-95 duration-500 p-8 w-full mx-auto text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">No Active System</h2>
        <div className="w-12 h-1 bg-gray-200 rounded-full mb-6" />
        <p className="max-w-md text-gray-500 mb-8 leading-relaxed">
          You currently have zero active systems. Initialize your long-term operating system to start tracking your North Star goals, milestones, and daily inputs.
        </p>
        <Link 
          href="/system/new" 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-sm hover:bg-orange-700 transition-colors"
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
    <div className="p-8 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">System Overview</h1>
          <p className="text-gray-500">Your core operating architecture.</p>
        </div>
      </div>

      {system.status === "scheduled" && (
        <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-orange-600" />
              System is Scheduled
            </h3>
            <p className="text-orange-700">
              This system is scheduled to start on {system.start_date ? new Date(system.start_date).toLocaleDateString() : "a future date"}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="date" 
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="px-3 py-2 border border-orange-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button 
              onClick={handleReschedule}
              disabled={!rescheduleDate || isRescheduling}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isRescheduling ? "Updating..." : "Reschedule"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{system.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${system.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                  {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">Phase: {system.current_phase || 'Execution'}</span>
              </div>
            </div>
          </div>
          
          <Link href="/system/settings" className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            Configure
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">The Why</h3>
        <p className="text-lg text-gray-700 italic border-l-4 border-orange-200 pl-4 py-1">
          "{system.why || system.description || 'No reason specified'}"
        </p>
      </div>

      {northStar && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-1">North Star Goal</h3>
              <div className="text-xl font-semibold text-gray-900">{northStar.name}</div>
            </div>
            {northStar.deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                <Calendar className="w-4 h-4" />
                {new Date(northStar.deadline).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium text-gray-700">
              <span>Progress</span>
              <span className="text-orange-600">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className="bg-orange-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{northStar.starting_value} {northStar.unit}</span>
              <span>{northStar.target_value} {northStar.unit}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex justify-end mt-8">
        <Link href="/inputs" className="text-sm font-medium text-orange-600 flex items-center gap-2 hover:text-orange-700 transition-colors">
          View Daily Inputs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

