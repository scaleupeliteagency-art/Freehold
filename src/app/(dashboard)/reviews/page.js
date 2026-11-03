"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { useRouter } from "next/navigation";
import { calculateReviewPeriods, getStandardPeriodBounds } from "@/lib/reviewScheduler";
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function ReviewCenter() {
  const [loading, setLoading] = useState(true);
  const [allSystems, setAllSystems] = useState([]);
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [dueReviews, setDueReviews] = useState([]);
  const router = useRouter();
  const initReview = useReviewEngineStore((state) => state.initReview);

  // 1. Fetch available systems belonging to this user
  useEffect(() => {
    async function fetchSystems() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data: systems, error: sysErr } = await supabase
          .from("systems")
          .select("id, name, status, start_date, expiration_date, deadline, is_frozen, why")
          .order("created_at", { ascending: false });

        if (sysErr) throw sysErr;

        if (systems && systems.length > 0) {
          setAllSystems(systems);
          // Prefer active system, or first available system
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

    fetchSystems();
  }, []);

  // 2. Fetch reviews strictly isolated to the selected system
  const fetchReviewsForSystem = useCallback(async (sys) => {
    if (!sys) return;
    try {
      const { data: history, error: revErr } = await supabase
        .from("reviews")
        .select("*")
        .eq("system_id", sys.id)
        .order("created_at", { ascending: false });

      if (revErr) throw revErr;

      const reviewHistory = history || [];
      setReviews(reviewHistory);
      const calculatedDue = calculateReviewPeriods(sys, reviewHistory);
      setDueReviews(calculatedDue);
    } catch (e) {
      console.error("Error loading reviews for system:", e);
    }
  }, []);

  useEffect(() => {
    if (selectedSystem) {
      fetchReviewsForSystem(selectedSystem);
    }
  }, [selectedSystem, fetchReviewsForSystem]);

  const handleSystemChange = (e) => {
    const sysId = e.target.value;
    setSelectedSystemId(sysId);
    const found = allSystems.find((s) => s.id === sysId);
    setSelectedSystem(found || null);
  };

  const handleStartReview = async (type) => {
    if (!selectedSystem) return;
    const { periodStart, periodEnd } = getStandardPeriodBounds(type, selectedSystem);
    const newId = `rev_${Date.now()}`;

    initReview({
      id: newId,
      systemId: selectedSystem.id,
      systemName: selectedSystem.name,
      type,
      periodStart,
      periodEnd,
    }, { goals: [], inputs: [], milestones: [] });

    router.push(`/reviews/${newId}`);
  };

  const handleStartDueReview = (dueReview) => {
    if (!selectedSystem) return;
    const newId = `rev_${Date.now()}`;

    initReview({
      id: newId,
      systemId: selectedSystem.id,
      systemName: selectedSystem.name,
      type: dueReview.type,
      periodStart: dueReview.period_start,
      periodEnd: dueReview.period_end,
    }, { goals: [], inputs: [], milestones: [] });

    router.push(`/reviews/${newId}`);
  };

  const handleResumeDraft = (draftReview) => {
    initReview({
      id: draftReview.id,
      systemId: draftReview.system_id,
      systemName: selectedSystem?.name,
      type: draftReview.type,
      periodStart: draftReview.period_start,
      periodEnd: draftReview.period_end,
    }, {
      goals: draftReview.goal_snapshot || [],
      inputs: draftReview.input_snapshot || [],
      milestones: draftReview.milestone_snapshot || [],
    });

    router.push(`/reviews/${draftReview.id}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold animate-pulse text-gray-500">Loading Diagnostic Review Center...</div>
      </div>
    );
  }

  if (!selectedSystem) {
    return (
      <div className="w-full py-12 text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Operating System Found</h2>
        <p className="text-gray-500 text-sm mb-6">Initialize a personal operating system to conduct diagnostic reviews.</p>
        <Link href="/system/new" className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-sm">
          Initialize System
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24 space-y-8">
      {/* Header with System Context Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
              RC
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              System Review Center
            </h1>
          </div>
          <p className="text-xs text-gray-500">
            Evaluate execution fidelity, diagnose performance bottlenecks, and evolve operating commitments.
          </p>
        </div>

        {/* System Scope Context Bar */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Reviewing System
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

          <div className="pl-3 border-l border-gray-200 text-right">
            <span className="text-[10px] text-gray-400 block font-semibold">Lifecycle</span>
            <span className="text-xs font-bold text-orange-600">
              {selectedSystem.start_date?.split("T")[0]} → {selectedSystem.expiration_date?.split("T")[0] || selectedSystem.deadline?.split("T")[0] || "Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Due Scheduled Reviews Banner */}
      {dueReviews.length > 0 && (
        <section className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <h2 className="text-sm font-bold text-gray-900">
                Scheduled Reviews Requiring Audit ({dueReviews.length})
              </h2>
            </div>
            <span className="text-[11px] font-bold text-orange-700 bg-white px-2.5 py-0.5 rounded-full border border-orange-200">
              Pending Ledger Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dueReviews.map((due) => (
              <div key={due.id} className="bg-white p-4 rounded-xl border border-orange-100 flex items-center justify-between shadow-xs">
                <div>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                    {due.type} Cycle
                  </span>
                  <div className="text-xs font-bold text-gray-900 mt-0.5">{due.title}</div>
                  <span className="text-[10px] text-gray-400">
                    Period: {due.period_start} → {due.period_end}
                  </span>
                </div>
                <button
                  onClick={() => handleStartDueReview(due)}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" /> Audit
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Initiate Diagnostic Review (Four Cadences) */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Initiate Period Review</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: "WEEKLY", label: "Weekly Audit", desc: "7-day sprint review of core execution fidelity and weekly milestones." },
            { type: "MONTHLY", label: "Monthly Retrospective", desc: "Evaluate monthly Rock progress and eliminate friction bottlenecks." },
            { type: "QUARTERLY", label: "Quarterly Campaign", desc: "Major milestone checkpoint across the 90-day strategic horizon." },
            { type: "YEARLY", label: "Yearly Evolution", desc: "Strategic overhaul of North Star goals and operating architecture." },
          ].map((item) => (
            <div key={item.type} className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block mb-1">{item.type}</span>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.label}</h3>
                <p className="text-xs text-gray-500 mb-6 leading-relaxed">{item.desc}</p>
              </div>

              <button
                onClick={() => handleStartReview(item.type)}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                Start {item.type} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Reviews Ledger for Selected System */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Historical Reviews for {selectedSystem.name}
          </h2>
          <span className="text-xs font-semibold text-gray-500">{reviews.length} completed records</span>
        </div>

        {reviews.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500">
            No completed diagnostic reviews on record for this system. Complete a weekly or monthly review to establish historical baselines.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {rev.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      rev.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {rev.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      Completed: {rev.completed_at ? rev.completed_at.split("T")[0] : rev.created_at?.split("T")[0]}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-gray-900">
                    Period: {rev.period_start} → {rev.period_end}
                  </div>
                  {rev.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{typeof rev.summary === "string" ? rev.summary : JSON.stringify(rev.summary)}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rev.status === "DRAFT" ? (
                    <button
                      onClick={() => handleResumeDraft(rev)}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold"
                    >
                      Resume Draft
                    </button>
                  ) : (
                    <Link
                      href={`/reviews/${rev.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold flex items-center gap-1"
                    >
                      View Report <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
