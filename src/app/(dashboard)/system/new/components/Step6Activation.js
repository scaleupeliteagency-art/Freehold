"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import useToastStore from "@/lib/store/useToastStore";
import { supabase } from "@/lib/supabase/client";

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
      const { data: sysData, error: sysErr } = await supabase.from("systems").insert({
        user_id: userId,
        name: systemIdentity.name,
        description: systemIdentity.why,
        status: 'active'
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left py-12 px-8 bg-paper border border-divider">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold mb-4 tracking-tight uppercase text-ink">System is ready for activation</h2>
        <p className="text-base leading-relaxed max-w-xl mb-8 text-ink/70">
          You are about to lock in your North Star and initialize System Version 1.0. 
          Once activated, this system will become the central engine for your long-term execution.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <div className="bg-white border border-divider p-8 max-w-lg mb-12">
        <ul className="space-y-4 text-sm text-left">
          <li className="flex items-start gap-3">
            <span className="text-ochre mt-0.5 border border-divider px-1 font-mono text-[10px] leading-tight flex items-center justify-center h-4 w-4">✓</span>
            <div><strong className="uppercase text-[10px] tracking-widest block text-ink/50 mb-1">North Star</strong> <span className="font-serif text-lg">{goals.primary.name || 'Not defined'}</span></div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-ochre mt-0.5 border border-divider px-1 font-mono text-[10px] leading-tight flex items-center justify-center h-4 w-4">✓</span>
            <div><strong className="uppercase text-[10px] tracking-widest block text-ink/50 mb-1">Current Focus</strong> <span className="font-serif text-lg">Year {roadmap.year}, Q{roadmap.quarter}</span></div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-ochre mt-0.5 border border-divider px-1 font-mono text-[10px] leading-tight flex items-center justify-center h-4 w-4">✓</span>
            <div><strong className="uppercase text-[10px] tracking-widest block text-ink/50 mb-1">Execution</strong> <span className="font-serif text-lg">{roadmap.rocks?.length || 0} Rocks, {roadmap.rocks?.[0]?.milestones?.length || 4} Milestones</span></div>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-ochre mt-0.5 border border-divider px-1 font-mono text-[10px] leading-tight flex items-center justify-center h-4 w-4">✓</span>
            <div><strong className="uppercase text-[10px] tracking-widest block text-ink/50 mb-1">Inputs</strong> <span className="font-serif text-lg">{inputs?.length || 0} Daily/Weekly Protocols</span></div>
          </li>
        </ul>
      </div>

      <hr className="border-divider mb-8" />

      <div className="flex flex-col items-start gap-4">
        <button 
          onClick={handleActivate}
          disabled={isActivating}
          className="bg-ink border border-divider text-paper px-12 py-4 text-[10px] font-bold hover:bg-ink/80 transition-all disabled:opacity-50 flex items-center justify-center min-w-[250px] uppercase tracking-widest"
        >
          {isActivating ? "Writing to Ledger..." : "Activate System"}
        </button>
        
        {!isActivating && (
          <button 
            type="button"
            onClick={() => setStep(5)}
            className="text-[10px] uppercase tracking-widest font-bold text-ink/50 hover:text-ink transition-colors border border-transparent hover:border-divider px-4 py-2"
          >
            Wait, I need to change something
          </button>
        )}
      </div>
    </div>
  );
}
