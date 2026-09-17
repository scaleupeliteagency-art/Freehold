"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Zap } from "lucide-react";

export default function InsightsCenter() {
  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [activeSystem, setActiveSystem] = useState(null);
  
  const [dataPayload, setDataPayload] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id, name")
          .eq("status", "active")
          .limit(1);

        if (systems && systems.length > 0) {
          const sys = systems[0];
          setActiveSystem(sys);
          
          // Fetch system_versions
          const { data: system_versions } = await supabase
            .from("system_versions")
            .select("*")
            .eq("system_id", sys.id)
            .order("created_at", { ascending: false });

          // Fetch result_definitions with records
          const { data: result_definitions } = await supabase
            .from("result_definitions")
            .select(`
              *,
              result_records (*)
            `)
            .eq("system_id", sys.id);

          // Fetch reviews
          const { data: reviews } = await supabase
            .from("reviews")
            .select("*")
            .eq("system_id", sys.id)
            .order("created_at", { ascending: false });
            
          setDataPayload({
            system_versions,
            result_definitions,
            reviews
          });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  async function handleSynthesize() {
    if (!dataPayload) return;
    setSynthesizing(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataPayload })
      });
      const json = await res.json();
      if (json && json.insights) {
        setInsights(json.insights);
      }
    } catch (err) {
      console.error("Error calling AI API", err);
    } finally {
      setSynthesizing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-medium animate-pulse text-gray-500">Loading Insights...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Active System</h2>
        <p className="text-gray-500 max-w-md">You need an active system to accumulate knowledge.</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Insights Archive</h1>
        <p className="text-gray-500 text-sm">Turn your history into knowledge that improves the system.</p>
      </div>

      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Quarterly Analysis</h3>
          <p className="text-sm text-gray-500 max-w-xl leading-relaxed">
            Aggregate execution history, version changes, and results to generate hypotheses about your system's constraints and opportunities.
          </p>
        </div>
        <button 
          onClick={handleSynthesize} 
          disabled={synthesizing}
          className="flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-orange-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {synthesizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Synthesizing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Synthesize Insights
            </>
          )}
        </button>
      </div>

      {insights.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 fade-in">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Synthesized Findings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, idx) => (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                <div className="mb-5">
                  <span className="inline-block bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium">
                    {insight.category}
                  </span>
                </div>
                
                <div className="mb-6 flex-grow">
                  <div className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wide">
                    Observed Fact
                  </div>
                  <div className="bg-blue-50 text-blue-900 rounded-xl p-5 text-sm leading-relaxed border border-blue-100/50">
                    {insight.observed_fact}
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-semibold text-orange-800 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    AI Hypothesis
                  </div>
                  <div className="bg-orange-50 text-orange-950 rounded-xl p-5 text-sm leading-relaxed border border-orange-100/50">
                    {insight.ai_hypothesis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
