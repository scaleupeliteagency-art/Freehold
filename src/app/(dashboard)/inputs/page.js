"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export default function DailyInputsPage() {
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [context, setContext] = useState({
    currentRock: "Loading...",
    currentMilestone: "Loading...",
    milestoneProgress: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("*")
          .eq("status", "active")
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }

        const activeSystem = systems[0];
        setSystem(activeSystem);

        const { data: inputDefs } = await supabase
          .from("input_definitions")
          .select("*")
          .eq("system_id", activeSystem.id)
          .eq("active_status", true);

        if (inputDefs) {
          const formattedInputs = inputDefs.map(def => ({
            id: def.id,
            name: def.name,
            min: def.target_minimum || Math.floor((def.target || 10) * 0.5),
            normal: def.target_normal || def.target || 10,
            stretch: def.target_stretch || Math.floor((def.target || 10) * 1.5),
            actual: 0,
            unit: def.unit || "count",
          }));
          setInputs(formattedInputs);
        }

        const { data: milestones } = await supabase
          .from("weekly_milestones")
          .select("name, monthly_rocks(name)")
          .eq("status", "active")
          .limit(1);

        if (milestones && milestones.length > 0) {
          setContext({
            currentRock: milestones[0].monthly_rocks?.name || "Active Rock",
            currentMilestone: milestones[0].name,
            milestoneProgress: 0
          });
        } else {
          setContext({
            currentRock: "No Active Rock",
            currentMilestone: "No Active Milestone",
            milestoneProgress: 0
          });
        }
      } catch (err) {
        console.error("Error fetching inputs:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const updateInput = (id, amount) => {
    setInputs(current => current.map(inp => {
      if (inp.id === id) {
        const newActual = Math.max(0, inp.actual + amount);
        return { ...inp, actual: newActual };
      }
      return inp;
    }));
  };

  const getStatus = (actual, min, normal, stretch) => {
    if (actual >= stretch) return "STRETCH";
    if (actual >= normal) return "NORMAL";
    if (actual >= min) return "ACCEPTABLE";
    return "BELOW MINIMUM";
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Loading Ledger...</div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="max-w-2xl py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-8" />
        <p className="text-ink max-w-md">You need an active system to track daily inputs.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-3xl font-serif font-bold text-ink">Today</h1>
          <span className="text-sm font-semibold text-ink/70">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
        <hr className="border-divider mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Current Monthly Rock</h2>
            <p className="text-sm font-medium text-ink">{context.currentRock}</p>
          </div>
          <div>
            <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Current Weekly Milestone</h2>
            <p className="text-sm font-medium text-ink">{context.currentMilestone}</p>
          </div>
        </div>
      </div>

      <div>
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-divider">
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Input</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Min</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Normal</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Stretch</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Actual</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50">Status</th>
              <th className="py-4 font-normal text-[10px] uppercase tracking-widest text-ink/50 text-right">Record</th>
            </tr>
          </thead>
          <tbody>
            {inputs.map((input) => {
              const status = getStatus(input.actual, input.min, input.normal, input.stretch);
              let statusColor = "text-ink/50";
              if (status === "STRETCH") statusColor = "text-moss font-bold";
              else if (status === "NORMAL") statusColor = "text-ink font-bold";
              else if (status === "ACCEPTABLE") statusColor = "text-ochre font-bold";
              else if (status === "BELOW MINIMUM" && input.actual > 0) statusColor = "text-red-700 font-bold";

              return (
                <tr key={input.id} className="border-b border-divider/50 hover:bg-white/30 transition-colors">
                  <td className="py-4 font-semibold text-ink">{input.name}</td>
                  <td className="py-4 font-mono text-ink/70">{input.min}</td>
                  <td className="py-4 font-mono text-ink/70">{input.normal}</td>
                  <td className="py-4 font-mono text-ink/70">{input.stretch}</td>
                  <td className="py-4 font-mono text-ink font-bold text-lg">{input.actual}</td>
                  <td className={`py-4 text-[10px] uppercase tracking-widest ${statusColor}`}>{status}</td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => updateInput(input.id, -1)} className="w-8 h-8 flex items-center justify-center border border-divider text-ink hover:bg-white transition-colors">-</button>
                       <button onClick={() => updateInput(input.id, 1)} className="w-8 h-8 flex items-center justify-center bg-ink text-paper hover:bg-ink/80 transition-colors">+</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {inputs.length === 0 && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-ink/50 italic text-sm">No active inputs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
