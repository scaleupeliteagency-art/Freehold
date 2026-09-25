"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

function RecordResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const definitionIdParam = searchParams.get("definition");
  const handoff = searchParams.get("handoff");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [definitions, setDefinitions] = useState([]);

  const [formData, setFormData] = useState({
    definition_id: definitionIdParam || "",
    period_label: "",
    actual_value: "",
    target_value: "",
    baseline_value: ""
  });

  useEffect(() => {
    async function fetchDefinitions() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id")
          .eq("status", "active")
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }

        const { data: defs, error } = await supabase
          .from("result_definitions")
          .select("id, name, target, baseline")
          .eq("system_id", systems[0].id);

        if (error) throw error;
        setDefinitions(defs || []);

        if (!definitionIdParam && defs && defs.length > 0) {
          setFormData(prev => ({ ...prev, definition_id: defs[0].id }));
        }

      } catch (err) {
        console.error("Error fetching definitions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDefinitions();
  }, [definitionIdParam]);

  // Pre-fill target and baseline if the definition changes
  useEffect(() => {
    if (formData.definition_id && definitions.length > 0) {
      const selected = definitions.find(d => d.id === formData.definition_id);
      if (selected) {
        setFormData(prev => ({
          ...prev,
          target_value: prev.target_value || selected.target?.toString() || "",
          baseline_value: prev.baseline_value || selected.baseline?.toString() || ""
        }));
      }
    }
  }, [formData.definition_id, definitions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.definition_id || !formData.period_label || formData.actual_value === "") return;

    setSaving(true);
    try {
      const { error } = await supabase.from("result_records").insert({
        result_definition_id: formData.definition_id,
        period_label: formData.period_label,
        actual_value: Number(formData.actual_value),
        target_value: formData.target_value !== "" ? Number(formData.target_value) : null,
        baseline_value: formData.baseline_value !== "" ? Number(formData.baseline_value) : null,
      });

      if (error) throw error;
      
      if (handoff === 'true') {
        router.replace('/results');
      } else {
        router.push("/results");
      }
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Failed to save result.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-wider text-slate-400">Loading...</div>
      </div>
    );
  }

  if (definitions.length === 0) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">No Results Defined</h2>
        <p className="text-slate-500 mb-6">You need to define at least one result before you can record values.</p>
        <Link href="/results/define" className="bg-orange-600 text-white font-medium rounded-lg px-6 py-2 shadow-sm transition-colors hover:bg-orange-700 inline-block">
          Define a Result
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 pb-24 pt-4">
      <Link href="/results" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Record Result</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Log the actual outcome against your defined targets for a specific period.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Metric</label>
            <select
              value={formData.definition_id}
              onChange={(e) => setFormData({ ...formData, definition_id: e.target.value })}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 cursor-pointer"
            >
              <option value="" disabled>Select a metric</option>
              {definitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Period Label</label>
            <input
              type="text"
              value={formData.period_label}
              onChange={(e) => setFormData({ ...formData, period_label: e.target.value })}
              placeholder="e.g. Week 34, Q3 2026, September"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual Value</label>
            <input
              type="number"
              step="any"
              value={formData.actual_value}
              onChange={(e) => setFormData({ ...formData, actual_value: e.target.value })}
              placeholder="e.g. 8500"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target (Optional)</label>
              <input
                type="number"
                step="any"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 font-mono text-slate-600"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline (Optional)</label>
              <input
                type="number"
                step="any"
                value={formData.baseline_value}
                onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 font-mono text-slate-600"
              />
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-4">
            <Link 
              href="/results"
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Result"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function RecordResultPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="text-sm font-semibold animate-pulse uppercase tracking-wider text-slate-400">Loading...</div></div>}>
      <RecordResultContent />
    </Suspense>
  );
}
