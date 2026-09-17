"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import SystemContext from "./components/SystemContext";
import ExecutionBoard from "./components/ExecutionBoard";
import InputManagement from "./components/InputManagement";
import InputEvolution from "./components/InputEvolution";
import VersionHistoryModal from "./components/VersionHistoryModal";
import CloseDayModal from "./components/CloseDayModal";
import { Plus } from "lucide-react";

export default function DailyInputsPage() {
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState(null);
  const [context, setContext] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCloseDayOpen, setIsCloseDayOpen] = useState(false);
  const [editingInput, setEditingInput] = useState(null);
  const [viewingHistoryInput, setViewingHistoryInput] = useState(null);

  const fetchData = async () => {
    try {
      // 1. Fetch System
      const { data: systems } = await supabase
        .from("systems")
        .select(`
          *,
          north_star_goals(name),
          year_plans(
            year_number,
            status,
            quarters(
              objective,
              status,
              monthly_rocks(
                name,
                status,
                weekly_milestones(
                  id,
                  name,
                  status
                )
              )
            )
          )
        `)
        .in("status", ["active", "scheduled"])
        .limit(1);

      if (!systems || systems.length === 0) {
        setLoading(false);
        return;
      }

      let activeSystem = systems[0];
      const now = new Date();
      now.setHours(0,0,0,0);
      const startDate = new Date(activeSystem.start_date);
      startDate.setHours(0,0,0,0);

      if (activeSystem.status === "scheduled" && startDate <= now) {
        await supabase.from("systems").update({ status: "active" }).eq("id", activeSystem.id);
        activeSystem.status = "active";
      }

      setSystem(activeSystem);

      // Extract Context
      let ctx = { northStar: "", yearPlan: "", quarterObjective: "", currentRock: "", currentMilestone: "", milestoneId: null };
      if (activeSystem.north_star_goals && activeSystem.north_star_goals.length > 0) ctx.northStar = activeSystem.north_star_goals[0].name;
      
      const activeYear = activeSystem.year_plans?.find(y => y.status === "active") || activeSystem.year_plans?.[0];
      if (activeYear) {
        ctx.yearPlan = activeYear.year_number;
        const activeQuarter = activeYear.quarters?.find(q => q.status === "active") || activeYear.quarters?.[0];
        if (activeQuarter) {
          ctx.quarterObjective = activeQuarter.objective;
          const activeRock = activeQuarter.monthly_rocks?.find(r => r.status === "active") || activeQuarter.monthly_rocks?.[0];
          if (activeRock) {
            ctx.currentRock = activeRock.name;
            const activeMilestone = activeRock.weekly_milestones?.find(m => m.status === "active") || activeRock.weekly_milestones?.[0];
            if (activeMilestone) {
              ctx.currentMilestone = activeMilestone.name;
              ctx.milestoneId = activeMilestone.id;
            }
          }
        }
      }
      setContext(ctx);

      // 2. Fetch Inputs
      const { data: inputDefs } = await supabase
        .from("input_definitions")
        .select("*")
        .eq("system_id", activeSystem.id)
        .eq("status", "active");

      // 3. Fetch Today's Entries
      const todayStr = new Date().toISOString().split("T")[0];
      const { data: entries } = await supabase
        .from("daily_input_entries")
        .select("*")
        .in("input_definition_id", (inputDefs || []).map(i => i.id))
        .eq("date", todayStr);

      const formatted = (inputDefs || []).map(def => {
        const entry = entries?.find(e => e.input_definition_id === def.id);
        return {
          ...def,
          actual: entry ? entry.actual_value : 0,
          milestoneName: ctx.currentMilestone
        };
      });

      setInputs(formatted);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdateExecution = async (id, newValue) => {
    // Optimistic UI update
    setInputs(prev => prev.map(inp => inp.id === id ? { ...inp, actual: newValue } : inp));

    const todayStr = new Date().toISOString().split("T")[0];
    // Check if entry exists
    const { data: existing } = await supabase.from("daily_input_entries")
      .select("id")
      .eq("input_definition_id", id)
      .eq("date", todayStr)
      .single();

    if (existing) {
      await supabase.from("daily_input_entries").update({ actual_value: newValue, completed: true }).eq("id", existing.id);
    } else {
      await supabase.from("daily_input_entries").insert({
        input_definition_id: id,
        date: todayStr,
        actual_value: newValue,
        completed: true
      });
    }
  };

  const handleSaveInput = async (formData, editingInput, isStateChange = false) => {
    try {
      if (editingInput) {
        if (isStateChange) {
           await supabase.from("input_definitions").update({ status: formData.status, end_date: formData.status === "archived" ? new Date().toISOString() : null }).eq("id", editingInput.id);
        } else {
          await supabase.from("input_definitions").update({ status: "archived", end_date: new Date().toISOString() }).eq("id", editingInput.id);
          
          await supabase.from("input_definitions").insert({
            system_id: system.id,
            name: formData.name,
            description: formData.description,
            type: formData.type,
            target: formData.target,
            unit: formData.unit,
            frequency: formData.frequency,
            weight: formData.weight,
            version_group_id: editingInput.version_group_id || editingInput.id,
            previous_version_id: editingInput.id,
            change_reason: formData.change_reason,
            weekly_milestone_id: editingInput.weekly_milestone_id,
            status: "active"
          });
        }
      } else {
        await supabase.from("input_definitions").insert({
          system_id: system.id,
          name: formData.name,
          description: formData.description,
          type: formData.type,
          target: formData.target,
          unit: formData.unit,
          frequency: formData.frequency,
          weight: formData.weight,
          weekly_milestone_id: context?.milestoneId || null,
          status: "active"
        });
      }
      setIsManageOpen(false);
      setEditingInput(null);
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  const handleViewHistory = async (input) => {
    setViewingHistoryInput(input);
    setIsHistoryOpen(true);
    
    const groupId = input.version_group_id || input.id;
    const { data } = await supabase.from("input_definitions")
      .select("*")
      .eq("version_group_id", groupId)
      .neq("id", input.id)
      .order("created_at", { ascending: false });
      
    setHistoryData(data || []);
  };

  const calculateScore = () => {
    if (!inputs.length) return 0;
    let totalWeight = 0;
    let earnedWeight = 0;
    inputs.forEach(inp => {
      const weight = Number(inp.weight) || 10;
      totalWeight += weight;
      const progress = Math.min(1, (inp.actual || 0) / (inp.target || 1));
      earnedWeight += progress * weight;
    });
    return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="text-sm font-medium animate-pulse text-orange-500">Loading Dashboard...</div></div>;
  }

  if (!system) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Active System</h2>
        <hr className="border-gray-200 mb-8" />
        <p className="text-gray-600 max-w-md">You need an active system to track daily inputs.</p>
      </div>
    );
  }

  if (system.status === "scheduled") {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <div className="mb-10 bg-orange-50 border border-orange-100 rounded-2xl p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-2">System Scheduled</div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Awaiting Start Date</h2>
          <p className="text-sm text-gray-600 max-w-xl leading-relaxed mb-6">
            Your system is scheduled to start on <strong>{new Date(system.start_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong>. Daily inputs will be unlocked on that day.
          </p>
          <SystemContext context={context} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      {/* Header */}
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Daily Inputs</h1>
          <p className="text-sm font-medium text-gray-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          <p className="text-sm text-gray-500 mt-2">The actions you repeatedly perform to move your system forward.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setEditingInput(null); setIsManageOpen(true); }} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm">
            <Plus className="w-4 h-4" /> Add Input
          </button>
        </div>
      </div>

      <SystemContext context={context} />

      <ExecutionBoard 
        inputs={inputs} 
        onUpdate={handleUpdateExecution} 
        onEdit={(inp) => { setEditingInput(inp); setIsManageOpen(true); }}
        onViewHistory={handleViewHistory}
      />

      <InputEvolution 
        inputs={inputs} 
        onEdit={(inp) => { setEditingInput(inp); setIsManageOpen(true); }}
      />

      <div className="mt-16 text-center border-t border-gray-200 pt-10">
        <button onClick={() => setIsCloseDayOpen(true)} className="bg-gray-900 text-white px-12 py-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
          Close Day
        </button>
      </div>

      <InputManagement 
        isOpen={isManageOpen} 
        onClose={() => setIsManageOpen(false)} 
        editingInput={editingInput} 
        onSave={handleSaveInput}
        context={context}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        input={viewingHistoryInput}
        history={historyData}
      />

      <CloseDayModal
        isOpen={isCloseDayOpen}
        onClose={() => setIsCloseDayOpen(false)}
        score={calculateScore()}
        completedInputs={inputs.filter(i => (i.actual / (i.target || 1)) >= 1).length}
        totalInputs={inputs.length}
        onConfirm={({ note, outcomes }) => {
          setIsCloseDayOpen(false);
        }}
      />
    </div>
  );
}
