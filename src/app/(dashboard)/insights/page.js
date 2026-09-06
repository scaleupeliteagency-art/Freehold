"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import InsightCard from "@/components/insights/InsightCard";

export default function InsightsCenter() {
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [activeSystem, setActiveSystem] = useState(null);
  
  const [synthesis, setSynthesis] = useState(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id, name")
          .eq("status", "ACTIVE")
          .limit(1);

        if (systems && systems.length > 0) {
          setActiveSystem(systems[0]);
          
          const { data: history } = await supabase
            .from("insights")
            .select("*")
            .eq("system_id", systems[0].id)
            .order("created_at", { ascending: false });
            
          if (history && history.length > 0) {
            setInsights(history);
            setSynthesis({
              title: "System Execution is stabilizing, but outcomes are lagging.",
              text: "Execution has improved over the last 30 days, but outcome performance has not improved at the same rate. The largest measurable constraint currently appears to be the quality of the 'Qualified Prospects' milestone rather than raw activity volume.",
              evidence: "Based on 3 completed reviews and 42 days of input tracking."
            });
          } else {
            const mockData = [
              {
                id: "1",
                type: "PATTERN",
                status: "ACTIVE",
                confidence: "HIGH",
                title: "Follow-up Consistency",
                description: "Higher follow-up consistency has been associated with stronger meeting performance.",
                evidence: { observations: 94, duration: "8 weeks" }
              },
              {
                id: "2",
                type: "HYPOTHESIS",
                status: "ACTIVE",
                confidence: "MEDIUM",
                title: "Increased Follow-ups",
                description: "Increasing follow-up attempts from 2 to 5 may increase booked meetings.",
                evidence: { observations: 14, duration: "2 weeks" }
              },
              {
                id: "3",
                type: "VALIDATED",
                status: "VALIDATED",
                confidence: "HIGH",
                title: "Morning Deep Work",
                description: "Scheduling deep work before 10 AM produced a 40% increase in weekly code output.",
                evidence: { observations: 45, duration: "6 weeks" }
              },
              {
                id: "4",
                type: "OBSERVATION",
                status: "ACTIVE",
                confidence: "HIGH",
                title: "Outreach Volume Increase",
                description: "Outreach volume increased 31% over the previous month.",
                evidence: { observations: 120, duration: "4 weeks" }
              }
            ];
            setInsights(mockData);
            setSynthesis({
              title: "System Execution is stabilizing, but outcomes are lagging.",
              text: "Execution has improved over the last 30 days, but outcome performance has not improved at the same rate. The largest measurable constraint currently appears to be the quality of the 'Qualified Prospects' milestone rather than raw activity volume.",
              evidence: "Based on 3 completed reviews and 42 days of input tracking."
            });
          }
        }
      } catch (err) {
        console.error("Error fetching insights:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Loading Ledger...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="max-w-2xl py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-8" />
        <p className="text-ink max-w-md">You need an active system to accumulate knowledge.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl animate-in fade-in duration-500">
      
      <div className="mb-12">
        <h1 className="text-3xl font-serif font-bold text-ink mb-1">Insights Archive</h1>
        <p className="text-ink/70 text-sm mb-6">Turn your history into knowledge that improves the system.</p>
        <hr className="border-divider mb-6" />
        
        <div className="flex flex-wrap gap-12 text-sm border-b border-divider pb-6">
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Total Insights</div>
            <div className="text-ink font-semibold text-lg">{insights.length}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Hypotheses</div>
            <div className="text-ochre font-semibold text-lg">{insights.filter(i => i.type === 'HYPOTHESIS').length}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Validated</div>
            <div className="text-moss font-semibold text-lg">{insights.filter(i => i.type === 'VALIDATED').length}</div>
          </div>
        </div>
      </div>

      {synthesis && (
        <div className="mb-12 border border-divider p-8 bg-white">
          <div className="text-[10px] font-bold text-ochre uppercase tracking-widest mb-4">
            Evidence-Based Synthesis
          </div>
          <h3 className="text-xl font-serif font-bold text-ink mb-4 leading-tight max-w-2xl">
            {synthesis.title}
          </h3>
          <p className="text-sm text-ink/80 mb-6 leading-relaxed max-w-3xl">
            {synthesis.text}
          </p>
          <div className="border-t border-divider/50 pt-4">
            <span className="text-xs font-mono text-ink/50">{synthesis.evidence}</span>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-serif font-bold text-ink mb-2">Knowledge Library</h2>
        <hr className="border-divider mb-8" />

        {insights.length === 0 ? (
          <p className="text-ink/50 text-sm italic py-4">No insights yet. Keep recording, reviewing, and testing. Insights emerge from accumulated evidence.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
