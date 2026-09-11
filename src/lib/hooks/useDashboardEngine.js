"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useDashboardEngine() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    system: null,
    goals: [],
    quarter: null,
    rocks: [],
    inputs: [],
    health: null,
    bottleneck: null,
    actions: [],
    isFrozen: false,
    nextReviewDate: null
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("*")
          .in("status", ["active", "scheduled"])
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }

        let system = systems[0];
        
        const now = new Date();
        const startDate = new Date(system.start_date);
        startDate.setHours(0,0,0,0);
        now.setHours(0,0,0,0);

        if (system.status === 'scheduled' && startDate <= now) {
            await supabase.from("systems").update({ status: 'active' }).eq('id', system.id);
            system.status = 'active';
        }

        // 2. Fetch North Star Goals
        const { data: goals, error: goalsErr } = await supabase
          .from("north_star_goals")
          .select("*")
          .eq("system_id", system.id);
          
        if (goalsErr) throw goalsErr;

        // 3. Fetch Current Quarter & Rocks (using join via year_plans)
        const { data: quarters } = await supabase
          .from("quarters")
          .select("*, year_plans!inner(system_id), monthly_rocks(*, weekly_milestones(*))")
          .eq("year_plans.system_id", system.id)
          .eq("status", "active")
          .limit(1);

        const quarter = quarters?.[0] || null;
        const rocks = quarter?.monthly_rocks || [];

        // 4. Fetch Active Inputs
        const { data: inputs } = await supabase
          .from("input_definitions")
          .select("*")
          .eq("system_id", system.id)
          .eq("active_status", true);

        // 5. Fetch Daily Input Entries for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: entries } = await supabase
          .from("daily_input_entries")
          .select("*")
          .gte("date", thirtyDaysAgo.toISOString().split('T')[0]);

        // 6. Fetch Results
        const { data: resultDefs } = await supabase
          .from("result_definitions")
          .select("*, result_records(*)")
          .eq("system_id", system.id);

        // --- CALCULATIONS FOR COMMAND CENTER ---

        const now = new Date();
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        const daysRemainingYear = Math.max(0, Math.floor((endOfYear - now) / (1000 * 60 * 60 * 24)));
        
        const endOfQuarter = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 3, 0);
        const daysRemainingQuarter = Math.max(0, Math.floor((endOfQuarter - now) / (1000 * 60 * 60 * 24)));

        // 7. Calculate real health and consistency
        let score = 100;
        let consistency = "100%";
        let bottleneckInput = null;

        if (inputs && inputs.length > 0) {
          const createdDate = new Date(system.created_at);
          const daysSinceCreation = Math.max(1, Math.floor((now - createdDate) / (1000 * 60 * 60 * 24)));
          const daysToCheck = Math.min(30, daysSinceCreation);

          const totalExpected = inputs.length * daysToCheck;
          const actualCompleted = entries ? entries.filter(e => e.completed || (e.actual_value !== null && e.actual_value >= (inputs.find(i => i.id === e.input_definition_id)?.target || 0))).length : 0;
          
          if (totalExpected > 0 && daysToCheck > 1) {
            const rawConsistency = (actualCompleted / totalExpected) * 100;
            consistency = `${Math.round(rawConsistency)}%`;
            score = Math.round(rawConsistency * 0.8 + 20);
          } else {
            consistency = "N/A (New)";
            score = 100;
          }

          if (daysToCheck > 3) {
            const inputScores = inputs.map(inp => {
              const inpEntries = entries?.filter(e => e.input_definition_id === inp.id) || [];
              const success = inpEntries.filter(e => e.completed || (e.actual_value >= inp.target)).length;
              return { ...inp, successRate: success / daysToCheck };
            }).sort((a, b) => a.successRate - b.successRate);
            
            if (inputScores.length > 0 && inputScores[0].successRate < 0.7) {
              bottleneckInput = inputScores[0];
            }
          }
        }

        const health = inputs && inputs.length > 0 ? {
          score: score > 100 ? 100 : score,
          status: score >= 80 ? "HEALTHY" : score >= 50 ? "AT RISK" : "CRITICAL",
          metrics: {
            "Input consistency": `${consistency} / 25`,
            "Milestone health": "N/A / 25",
            "Rock health": "N/A / 20",
            "Review consistency": "N/A / 10",
            "Goal trajectory": "N/A / 15",
            "System stability": "N/A / 5"
          }
        } : null;

        // Current Constraint
        const constraint = bottleneckInput ? {
          name: bottleneckInput.name,
          consistency: `${Math.round(bottleneckInput.successRate * 100)}% consistency`,
          evidence: [
            "0 completed required occurrences (approx)",
            `Minimum requirement: ${bottleneckInput.target || 1}`,
            "Connected to active Rock (AT RISK)"
          ]
        } : null;

        // Today's Priority
        let priority = null;
        if (inputs && inputs.length > 0) {
           const worstInput = bottleneckInput || inputs[0];
           priority = {
             action: `Complete minimum ${worstInput.name} requirement.`,
             remaining: `Requires execution today.`,
             rock: rocks[0]?.name || "Active Rock",
             reason: `${worstInput.name} is currently below minimum requirements.`
           };
        }

        // Next Actions
        const actions = [];
        if (inputs && inputs.length === 0) {
           actions.push({ priority: "HIGH", text: "Configure Daily Inputs", reason: "System has no execution layer." });
        } else if (bottleneckInput) {
           actions.push({ priority: "HIGH", text: `Complete minimum ${bottleneckInput.name}`, reason: `${bottleneckInput.name} consistency is too low.` });
        }
        if (resultDefs && resultDefs.length === 0) {
           actions.push({ priority: "MEDIUM", text: "Record missing result data", reason: "Outcome tracking is empty." });
        }

        // Check if system is frozen (review overdue)
        const isFrozen = system.is_frozen === true || 
          (system.next_review_date && new Date(system.next_review_date) < new Date());

        setData({
          system,
          daysRemainingYear,
          daysRemainingQuarter,
          goals: goals || [],
          quarter,
          rocks,
          inputs: inputs || [],
          entries: entries || [],
          results: resultDefs || [],
          health,
          constraint,
          priority,
          actions,
          isFrozen,
          nextReviewDate: system.next_review_date || null
        });

      } catch (err) {
        console.error("Dashboard Engine Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return { loading, ...data };
}
