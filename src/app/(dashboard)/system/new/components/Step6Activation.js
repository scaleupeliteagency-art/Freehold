"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import useToastStore from "@/lib/store/useToastStore";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2 } from "lucide-react";

export default function Step6Activation() {
  const { systemIdentity, goals, roadmap, inputs, resetSystem, setStep } = useSystemCreationStore();
  const { addToast } = useToastStore();
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();

  const handleActivate = async () => {
    setIsActivating(true);
    addToast("Writing system to ledger...", "info");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast("You must be logged in to activate a system. Draft saved.", "error");
        setIsActivating(false);
        router.push("/login");
        return;
      }

      const userId = user.id;

      // 1. Archive existing active systems for this user
      await supabase.from("systems").update({ status: 'archived' }).eq('user_id', userId).eq('status', 'active');

      // 2. Insert new system
      const reviewDate = new Date(startDate);
      reviewDate.setDate(reviewDate.getDate() + 7); // First review due 7 days after start
      
      const now = new Date();
      now.setHours(0,0,0,0);
      const start = new Date(startDate);
      start.setHours(0,0,0,0);
      const initialStatus = start > now ? 'scheduled' : 'active';

      const { data: sysData, error: sysErr } = await supabase.from("systems").insert({
        user_id: userId,
        name: systemIdentity.name,
        why: systemIdentity.why,
        description: systemIdentity.why,
        status: initialStatus,
        start_date: new Date(startDate).toISOString(),
        next_review_date: reviewDate.toISOString(),
        is_frozen: false
      }).select().single();
      
      if (sysErr) throw sysErr;
      const systemId = sysData.id;

      // 3. Insert North Star Goal
      const { error: goalErr } = await supabase.from("north_star_goals").insert({
        system_id: systemId,
        name: goals.primary.name,
        outcome: goals.primary.description,
        starting_value: goals.primary.baseline ? Number(goals.primary.baseline) : null,
        target_value: goals.primary.target ? Number(goals.primary.target) : null,
        unit: goals.primary.unit,
        deadline: goals.primary.deadline ? new Date(goals.primary.deadline).toISOString() : null,
        success_definition: goals.primary.successCriteria
      });
      if (goalErr) throw goalErr;

      // 4. Insert Year Plan
      const { data: yearData, error: yearErr } = await supabase.from("year_plans").insert({
        system_id: systemId,
        year_number: roadmap.year,
        status: 'active'
      }).select().single();
      
      if (yearErr) throw yearErr;

      // 5. Insert Quarter
      const { data: quarterData, error: quarterErr } = await supabase.from("quarters").insert({
        year_plan_id: yearData.id,
        quarter_number: roadmap.quarter,
        objective: roadmap.quarterlyObjective?.name || 'Quarterly Objective',
        status: 'active'
      }).select().single();

      if (quarterErr) throw quarterErr;

      // 6. Insert Rocks & Milestones
      if (roadmap.rocks && roadmap.rocks.length > 0) {
        for (const rock of roadmap.rocks) {
          if (!rock.name) continue;
          
          const { data: rockData, error: rockErr } = await supabase.from("monthly_rocks").insert({
            quarter_id: quarterData.id,
            name: rock.name,
            description: rock.description,
            deadline: rock.deadline ? rock.deadline : null,
            status: 'active'
          }).select().single();

          if (!rockErr && rockData && rock.milestones && rock.milestones.length > 0) {
            const milestoneInserts = rock.milestones.filter(m => m.name).map((m, i) => ({
              monthly_rock_id: rockData.id,
              name: m.name,
              week_number: i + 1,
              status: 'pending'
            }));
            
            if (milestoneInserts.length > 0) {
              await supabase.from("weekly_milestones").insert(milestoneInserts);
            }
          }
        }
      }

      // 7. Insert Input Definitions
      if (inputs && inputs.length > 0) {
        const inputInserts = inputs.filter(inp => inp.name).map(inp => ({
          system_id: systemId,
          name: inp.name,
          target: inp.normalTarget ? Number(inp.normalTarget) : null,
          frequency: inp.frequency || 'DAILY',
          active_status: true
        }));
        
        if (inputInserts.length > 0) {
          await supabase.from("input_definitions").insert(inputInserts);
        }
      }

      // 8. Insert initial System Version
      await supabase.from("system_versions").insert({
        system_id: systemId,
        version_number: '1.0',
        description: 'Initial system activation',
        snapshot: { identity: systemIdentity, goals, roadmap, inputs }
      });
      
      resetSystem();
      addToast("System activated successfully!", "success");
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to activate system:", error);
      addToast("Failed to save system: " + error.message, "error");
      setIsActivating(false);
    }
  };

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left py-10 px-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">System is ready for activation</h2>
        <p className="text-sm leading-relaxed max-w-xl mb-8 text-gray-500">
          You are about to lock in your North Star and initialize System Version 1.0. 
          Once activated, this system will become the central engine for your long-term execution.
        </p>
      </div>

      <div className="mb-8 p-6 rounded-xl border border-gray-200 bg-gray-50 max-w-lg">
        <label className="block text-sm font-semibold text-gray-900 mb-1">System Start Date</label>
        <p className="text-sm text-gray-500 mb-4">Set the official date when tracking begins for this system.</p>
        <input 
          type="date" 
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all text-gray-900"
        />
      </div>

      <hr className="border-gray-100 mb-8" />

      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-lg mb-10 shadow-sm">
        <ul className="space-y-5 text-sm text-left">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            <div><strong className="text-xs font-semibold text-gray-500 block mb-1">North Star</strong> <span className="font-semibold text-gray-900 text-base">{goals.primary.name || 'Not defined'}</span></div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            <div><strong className="text-xs font-semibold text-gray-500 block mb-1">Current Focus</strong> <span className="font-semibold text-gray-900 text-base">Year {roadmap.year}, Q{roadmap.quarter}</span></div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            <div><strong className="text-xs font-semibold text-gray-500 block mb-1">Execution</strong> <span className="font-semibold text-gray-900 text-base">{roadmap.rocks?.length || 0} Rocks, {roadmap.rocks?.[0]?.milestones?.length || 4} Milestones</span></div>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
            <div><strong className="text-xs font-semibold text-gray-500 block mb-1">Inputs</strong> <span className="font-semibold text-gray-900 text-base">{inputs?.length || 0} Daily/Weekly Protocols</span></div>
          </li>
        </ul>
      </div>

      <hr className="border-gray-100 mb-8" />

      <div className="flex flex-col items-start gap-4">
        <button 
          onClick={handleActivate}
          disabled={isActivating}
          className="rounded-lg font-medium px-8 py-3.5 transition-colors bg-orange-600 text-white hover:bg-orange-700 shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[250px]"
        >
          {isActivating ? "Writing to Ledger..." : "Activate System"}
        </button>
        
        {!isActivating && (
          <button 
            type="button"
            onClick={() => setStep(5)}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-4 py-2"
          >
            Wait, I need to change something
          </button>
        )}
      </div>
    </div>
  );
}
