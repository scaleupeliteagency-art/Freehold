"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  Target,
  Zap,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
} from "lucide-react";

const PRIORITY_STYLES = {
  High: "border-red-500/30 bg-red-500/10 text-red-600",
  Medium: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  Low: "border-green-500/30 bg-green-500/10 text-green-700",
};

export default function InsightDetailView() {
  const params = useParams();
  const router = useRouter();

  const [insight, setInsight] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionStatus, setActionStatus] = useState("NEW");

  useEffect(() => {
    async function loadInsightFromDatabase() {
      try {
        const insightId = params.id;
        if (!insightId) {
          setError("No insight ID provided.");
          setLoading(false);
          return;
        }

        // Fetch stable record by ID from Supabase
        const { data: record, error: dbErr } = await supabase
          .from("insights")
          .select("*, systems(*), reviews(*)")
          .eq("id", insightId)
          .maybeSingle();

        if (dbErr) throw dbErr;

        if (!record) {
          setError("This insight was not found in your operating system ledger.");
          setLoading(false);
          return;
        }

        setInsight(record);
        setSystem(record.systems || null);
        setActionStatus(record.status || "ACTIVE");
      } catch (err) {
        console.error("Could not load insight:", err);
        setError(err.message || "Unable to read insight from the database.");
      } finally {
        setLoading(false);
      }
    }

    loadInsightFromDatabase();
  }, [params.id]);

  const handleUpdateStatus = async (newStatus) => {
    if (!insight) return;
    try {
      await supabase
        .from("insights")
        .update({ status: newStatus })
        .eq("id", insight.id);
      setActionStatus(newStatus);
    } catch (e) {
      console.error("Failed to update insight status:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-gray-500">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
        <span className="text-sm">Loading persistent insight ledger...</span>
      </div>
    );
  }

  if (error || !insight) {
    return (
      <div className="mx-auto max-w-3xl py-10">
        <Link
          href="/insights"
          className="mb-8 flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights Archive
        </Link>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <AlertCircle className="mb-3 h-6 w-6 text-amber-700" />
          <h1 className="text-xl font-semibold text-gray-900">Insight Unavailable</h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {error || "The requested insight could not be found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl py-8 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Back button and metadata header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <Link
          href="/insights"
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Insights Archive
        </Link>

        {system && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Originating System:</span>
            <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded">
              {system.name}
            </span>
          </div>
        )}
      </div>

      {/* Main Insight Title & Priority */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
              {insight.category || "Execution Pattern"}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
              PRIORITY_STYLES[insight.priority] || "border-gray-200 bg-gray-50 text-gray-700"
            }`}>
              {insight.priority || "Medium"} Priority
            </span>
          </div>

          {/* Lifecycle Action Tracking */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold">Lifecycle Status:</span>
            <select
              value={actionStatus}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="text-xs font-bold border border-gray-200 rounded-lg px-2.5 py-1 bg-gray-50 text-gray-800 outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="ACTION_IN_PROGRESS">ACTION IN PROGRESS</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="DISMISSED">DISMISSED</option>
            </select>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-snug">
            {insight.observed_fact || insight.title}
          </h1>
          <span className="text-xs text-gray-400 mt-2 block">
            Generated on {insight.created_at ? new Date(insight.created_at).toLocaleString() : "Ledger entry"}
          </span>
        </div>

        {/* Supporting Evidence */}
        <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
            <Target className="w-4 h-4 text-orange-600" />
            Supporting Evidence & Observed Data
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">
            {typeof insight.evidence === "string"
              ? insight.evidence
              : insight.evidence?.raw || JSON.stringify(insight.evidence || "Empirical correlation from execution entries.")}
          </p>
        </div>

        {/* AI Hypothesis */}
        {insight.ai_hypothesis && (
          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Diagnostic Hypothesis
            </div>
            <p className="text-xs text-blue-950 leading-relaxed font-medium">
              {insight.ai_hypothesis}
            </p>
          </div>
        )}

        {/* Recommended Action */}
        {insight.recommended_action && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-900 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-orange-600" />
              Prescribed Operational Action
            </div>
            <p className="text-sm font-semibold text-orange-950 leading-relaxed">
              {insight.recommended_action}
            </p>
          </div>
        )}

        {/* Evaluation Metrics & Review Cadence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Success Metric</span>
            <div className="text-xs font-bold text-slate-900">
              {insight.success_metric || "Measurable improvement in next period review"}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Re-evaluate After</span>
            <div className="text-xs font-bold text-slate-900">
              {insight.review_after_days || 7} Days
            </div>
          </div>
        </div>

        {/* Originating Review Link */}
        {insight.related_review_id && (
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Generated from Diagnostic Review:</span>
            <Link
              href={`/reviews/${insight.related_review_id}`}
              className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
            >
              Open Originating Review <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
