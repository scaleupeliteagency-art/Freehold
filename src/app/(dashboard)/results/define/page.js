"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

function DefineResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const milestoneId = searchParams.get("milestone");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSystem, setActiveSystem] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    target: "",
    baseline: "0",
    unit: "",
    direction: "Higher is better"
  });

  useEffect(() => {
    async function init() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id")
          .eq("status", "active")
          .limit(1);

        if (systems && systems.length > 0) {
          setActiveSystem(systems[0]);
        }
      } catch (err) {
        console.error("Error fetching system:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeSystem) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("result_definitions").insert({
        system_id: activeSystem.id,
        name: formData.name,
        target: Number(formData.target),
        baseline: Number(formData.baseline),
        unit: formData.unit,
        direction: formData.direction,
        connected_milestone_id: milestoneId || null
      });

      if (error) throw error;
      
      // Navigate back to results, triggering handoff again if milestone existed
      if (milestoneId) {
        router.push(`/results?handoff=true&milestone=${milestoneId}`);
      } else {
        router.push("/results");
      }
    } catch (err) {
      console.error("Error defining result:", err);
      alert("Failed to define result.");
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

  if (!activeSystem) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">No Active System</h2>
        <p className="text-slate-500">You need an active system to define results.</p>
        <Link href="/results" className="text-orange-600 mt-4 inline-block font-medium hover:underline">← Back to Results</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500 pb-24 pt-4">
      <Link href="/results" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Results
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Define a Result</h1>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Establish what you want to measure. A clear result definition tracks your actual outcomes against a specific target.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Monthly Recurring Revenue (MRR)"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Value</label>
              <input
                type="number"
                step="any"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                placeholder="e.g. 10000"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 font-mono"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline (Starting Point)</label>
              <input
                type="number"
                step="any"
                value={formData.baseline}
                onChange={(e) => setFormData({ ...formData, baseline: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit (Optional)</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. $, %, Users"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Direction</label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-slate-900 cursor-pointer"
              >
                <option value="Higher is better">Higher is better</option>
                <option value="Lower is better">Lower is better</option>
              </select>
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
              {saving ? "Saving..." : "Create Result Definition"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default function DefineResultPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="text-sm font-semibold animate-pulse uppercase tracking-wider text-slate-400">Loading...</div></div>}>
      <DefineResultContent />
    </Suspense>
  );
}
