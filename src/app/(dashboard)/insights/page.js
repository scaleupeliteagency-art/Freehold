"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import {
  Brain,
  Sparkles,
  AlertCircle,
  Loader2,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  Zap,
} from "lucide-react";

const PRIORITY_STYLES = {
  High: "border-red-200 bg-red-50 text-red-700",
  Medium: "border-amber-200 bg-amber-50 text-amber-700",
  Low: "border-blue-200 bg-blue-50 text-blue-700",
};

export default function InsightsCenter() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [synthesizing, setSynthesizing] = useState(false);
  const [allSystems, setAllSystems] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [insights, setInsights] = useState([]);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // 1. Fetch available systems
  useEffect(() => {
    async function loadSystems() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: systems, error: sysErr } = await supabase
          .from("systems")
          .select("id, name, status, start_date, deadline, expiration_date")
          .order("created_at", { ascending: false });

        if (sysErr) throw sysErr;

        if (systems && systems.length > 0) {
          setAllSystems(systems);
          const active = systems.find((s) => s.status === "active") || systems[0];
          setSelectedSystemId(active.id);
          setSelectedSystem(active);
        }
      } catch (err) {
        console.error("Error loading systems:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSystems();
  }, []);

  // 2. Fetch insights strictly isolated to the selected system from Supabase
  const fetchInsightsForSystem = useCallback(async (sys) => {
    if (!sys) return;
    try {
      const { data: dbInsights, error: insErr } = await supabase
        .from("insights")
        .select("*")
        .eq("system_id", sys.id)
        .order("created_at", { ascending: false });

      if (insErr) throw insErr;
      setInsights(dbInsights || []);
    } catch (e) {
      console.error("Failed to load insights from database:", e);
    }
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      fetchInsightsForSystem(selectedSystem);
    }
  }, [selectedSystem, fetchInsightsForSystem]);

  const handleSystemChange = (e) => {
    const sysId = e.target.value;
    setSelectedSystemId(sysId);
    const found = allSystems.find((s) => s.id === sysId);
    setSelectedSystem(found || null);
  };

  // 3. Synthesize AI Insights and persist them directly to Supabase
  const handleSynthesize = async () => {
    if (!selectedSystem) return;
    setSynthesizing(true);
    setError("");

    try {
      // Gather real system evidence payload
      const [
        { data: reviews },
        { data: inputDefs },
        { data: dailyEntries },
        { data: metrics },
      ] = await Promise.all([
        supabase.from("reviews").select("*").eq("system_id", selectedSystem.id),
        supabase.from("input_definitions").select("*").eq("system_id", selectedSystem.id),
        supabase.from("daily_input_entries").select("*, input_definitions!inner(system_id)").eq("input_definitions.system_id", selectedSystem.id).limit(1000),
        supabase.from("metrics").select("*").eq("system_id", selectedSystem.id),
      ]);

      const dataPayload = {
        system: selectedSystem,
        reviews: reviews || [],
        experiments: [],
        input_definitions: inputDefs || [],
        daily_input_entries: dailyEntries || [],
        metrics: metrics || [],
        result_definitions: [],
        result_records: [],
      };

      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataPayload }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`AI Insights API failed: ${text.slice(0, 200)}`);
      }

      const json = await res.json();
      const generatedList = json.insights || [];

      // Persist generated insights permanently into Supabase
      if (generatedList.length > 0) {
        const inserts = generatedList.map((ins) => ({
          system_id: selectedSystem.id,
          type: "PATTERN",
          status: "ACTIVE",
          title: ins.observed_fact || "System Insight",
          description: ins.ai_hypothesis || "",
          category: ins.category || "Execution Pattern",
          priority: ins.priority || "Medium",
          observed_fact: ins.observed_fact || "",
          evidence: { raw: ins.evidence },
          ai_hypothesis: ins.ai_hypothesis || "",
          recommended_action: ins.recommended_action || "",
          success_metric: ins.success_metric || "",
          review_after_days: ins.review_after_days || 7,
          created_at: new Date().toISOString(),
        }));

        const { data: savedData, error: insSaveErr } = await supabase
          .from("insights")
          .insert(inserts)
          .select();

        if (insSaveErr) throw insSaveErr;
        setInsights((prev) => [...(savedData || []), ...prev]);
      }
    } catch (e) {
      console.error("Synthesis error:", e);
      setError(e.message);
    } finally {
      setSynthesizing(false);
    }
  };

  // Filtered insights list
  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      const matchSearch =
        !searchQuery ||
        ins.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.observed_fact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ins.ai_hypothesis?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCat = categoryFilter === "ALL" || ins.category === categoryFilter;
      const matchPri = priorityFilter === "ALL" || ins.priority === priorityFilter;
      const matchStatus = statusFilter === "ALL" || ins.status === statusFilter;

      return matchSearch && matchCat && matchPri && matchStatus;
    });
  }, [insights, searchQuery, categoryFilter, priorityFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold animate-pulse text-gray-500">Loading AI Insights Archive...</div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 space-y-8">
      {/* Header with System Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              AI
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              AI Insights Archive
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Synthesized cognitive diagnoses permanently attached to your operating systems.
          </p>
        </div>

        {/* System Scope Context Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Operating System
            </label>
            <select
              value={selectedSystemId}
              onChange={handleSystemChange}
              className="text-xs font-bold text-gray-900 bg-transparent outline-none cursor-pointer pr-4"
            >
              {allSystems.map((sys) => (
                <option key={sys.id} value={sys.id}>
                  {sys.name} ({sys.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={synthesizing || !selectedSystem}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            {synthesizing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Synthesize Insights
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search observed facts, hypotheses, or recommendations..."
            className="w-full text-xs text-gray-900 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Execution Pattern">Execution Pattern</option>
            <option value="Bottleneck">Bottleneck</option>
            <option value="Input Pattern">Input Pattern</option>
            <option value="Milestone Pattern">Milestone Pattern</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs font-semibold border border-gray-200 rounded-lg px-2.5 py-1.5 bg-gray-50 text-gray-700 outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <span className="text-xs text-gray-400 font-semibold pl-2">
            {filteredInsights.length} records
          </span>
        </div>
      </div>

      {/* Insights Cards Grid */}
      {filteredInsights.length === 0 ? (
        <div className="p-12 text-center bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-500">
          No insights on record for {selectedSystem?.name || "this system"}. Click "Synthesize Insights" to generate evidence-based diagnoses from execution records.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInsights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded">
                    {ins.category || "Insight"}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    PRIORITY_STYLES[ins.priority] || "border-gray-200 bg-gray-50 text-gray-700"
                  }`}>
                    {ins.priority || "Medium"} Priority
                  </span>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
                  {ins.observed_fact || ins.title}
                </h3>

                {ins.ai_hypothesis && (
                  <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                    {ins.ai_hypothesis}
                  </p>
                )}

                {ins.recommended_action && (
                  <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-orange-950 mb-4">
                    <span className="font-bold block mb-0.5">Recommended Action:</span>
                    <span className="line-clamp-2">{ins.recommended_action}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-medium">
                  {ins.created_at ? new Date(ins.created_at).toLocaleDateString() : "Active"}
                </span>

                <Link
                  href={`/insights/${ins.id}`}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  Inspect Evidence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
