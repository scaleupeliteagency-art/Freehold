"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import {
  Plus,
  ArrowRight,
  Activity,
  Target,
  Calendar,
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
  Layers,
  ChevronRight,
  Circle,
  Flag,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function ProgressBar({ pct, color = "orange", thin = false }) {
  const h = thin ? "h-1.5" : "h-2";
  const gradients = {
    orange: "from-orange-400 to-orange-600",
    green:  "from-emerald-400 to-emerald-600",
    blue:   "from-blue-400 to-blue-500",
    gray:   "from-gray-300 to-gray-400",
  };
  return (
    <div className={`w-full bg-gray-100 rounded-full ${h} overflow-hidden`}>
      <div
        className={`${h} rounded-full bg-gradient-to-r ${gradients[color]} transition-all duration-700`}
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    active:    "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    done:      "bg-blue-100 text-blue-700 border-blue-200",
    pending:   "bg-gray-100 text-gray-500 border-gray-200",
    archived:  "bg-gray-100 text-gray-400 border-gray-200",
  };
  const cls = map[status] ?? map.pending;
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  const Icon = (status === "completed" || status === "done") ? CheckCircle2 : Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

// ─── Row components ──────────────────────────────────────────────────────────

/** Level-0: North Star */
function NorthStarRow({ goal }) {
  const { starting_value: sv, current_value: cv, target_value: tv, unit, name, deadline } = goal;
  const total    = tv != null && sv != null ? Math.abs(tv - sv) : 0;
  const current  = total > 0 ? Math.abs((cv ?? sv) - sv) : 0;
  const pct      = total > 0 ? Math.min(100, (current / total) * 100) : 0;
  const remaining = Math.max(0, total - current);

  return (
    <tr className="bg-orange-50/40 hover:bg-orange-50/70 transition-colors">
      {/* indent / type */}
      <td className="pl-5 pr-2 py-4 w-10">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
          <Star className="w-4 h-4 text-orange-500" />
        </div>
      </td>

      {/* goal info */}
      <td className="px-3 py-4">
        <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">
          North Star Goal
        </div>
        <div className="font-semibold text-gray-900 leading-snug">{name}</div>
        {deadline && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            Deadline: {new Date(deadline).toLocaleDateString()}
          </div>
        )}
      </td>

      {/* target */}
      <td className="px-3 py-4">
        <div className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Target</div>
        <div className="font-bold text-gray-900 text-sm">
          {tv != null ? `${Number(tv).toLocaleString()} ${unit ?? ""}` : "—"}
        </div>
        {sv != null && (
          <div className="text-xs text-gray-400">
            from {Number(sv).toLocaleString()} {unit}
          </div>
        )}
      </td>

      {/* status */}
      <td className="px-3 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-200">
          <TrendingUp className="w-3 h-3" />
          In Progress
        </span>
      </td>

      {/* progress */}
      <td className="px-3 py-4 min-w-[180px]">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">{(cv ?? sv) != null ? `${Number(cv ?? sv).toLocaleString()} ${unit}` : "—"}</span>
          <span className="font-semibold text-orange-600">{pct.toFixed(1)}%</span>
        </div>
        <ProgressBar pct={pct} color="orange" />
      </td>

      {/* done */}
      <td className="px-3 py-4 text-sm font-semibold text-gray-800 whitespace-nowrap">
        {total > 0 ? `${Number(current).toLocaleString()} ${unit ?? ""}` : "—"}
      </td>

      {/* remaining */}
      <td className="px-3 py-4 text-sm font-semibold text-gray-400 whitespace-nowrap">
        {total > 0 ? `${Number(remaining).toLocaleString()} ${unit ?? ""}` : "—"}
      </td>
    </tr>
  );
}

/** Level-1: Year heading row */
function YearRow({ yearNumber, yearlyGoal }) {
  return (
    <tr className="bg-gray-50 border-t border-gray-100">
      {/* indent */}
      <td className="pl-5 pr-2 py-3 w-10">
        <div className="flex items-center gap-1 ml-1">
          <div className="w-px h-4 bg-gray-300" />
          <ChevronRight className="w-3 h-3 text-gray-400" />
        </div>
      </td>

      {/* info */}
      <td className="px-3 py-3" colSpan={2}>
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          Year {yearNumber}
        </div>
        <div className="font-semibold text-gray-700 text-sm">
          {yearlyGoal?.name || `Year ${yearNumber} Goal`}
        </div>
      </td>

      {/* status */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-emerald-100 text-emerald-700 border-emerald-200">
          <TrendingUp className="w-3 h-3" />
          Active Year
        </span>
      </td>

      {/* target column */}
      <td className="px-3 py-3">
        {yearlyGoal?.target ? (
          <span className="text-xs font-semibold text-gray-600">
            Target: <span className="text-gray-900">{Number(yearlyGoal.target).toLocaleString()}</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">No numeric target</span>
        )}
      </td>

      <td colSpan={2} />
    </tr>
  );
}

/** Level-2: Quarter row */
function QuarterRow({ quarter, quarterTarget, isActive }) {
  const { quarter_number, objective, status, start_date, end_date, totalRocks, doneRocks, progressPct } = quarter;
  const remaining = totalRocks - doneRocks;
  const barColor = status === "completed" ? "blue" : isActive ? "green" : "gray";

  return (
    <tr className={`transition-colors border-t border-gray-50 ${isActive ? "bg-emerald-50/30 hover:bg-emerald-50/60" : "hover:bg-gray-50/60"}`}>
      {/* indent */}
      <td className="pl-5 pr-2 py-3.5 w-10">
        <div className="flex items-center gap-1 ml-5">
          <div className="w-px h-4 bg-gray-200" />
          <ChevronRight className="w-3 h-3 text-gray-300" />
        </div>
      </td>

      {/* info */}
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2 mb-0.5">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
            isActive ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"
          }`}>
            Q{quarter_number}
          </div>
          {isActive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-white tracking-wide animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              ACTIVE
            </span>
          )}
        </div>
        <div className="font-semibold text-gray-900 text-sm leading-snug mt-1">
          {objective || `Q${quarter_number} Objective`}
        </div>
        {(start_date || end_date) && (
          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            {start_date ? new Date(start_date).toLocaleDateString() : "—"}
            {" → "}
            {end_date ? new Date(end_date).toLocaleDateString() : "—"}
          </div>
        )}
      </td>

      {/* target — shown prominently for active quarter */}
      <td className="px-3 py-3.5">
        <div className="text-[10px] text-gray-400 uppercase font-semibold mb-0.5">Quarter Target</div>
        {isActive && quarterTarget != null ? (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${
            isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-50 text-gray-700 border border-gray-200"
          }`}>
            <Target className="w-3 h-3" />
            {Number(quarterTarget).toLocaleString()}
          </div>
        ) : quarterTarget != null ? (
          <div className="font-bold text-gray-700 text-sm">{Number(quarterTarget).toLocaleString()}</div>
        ) : (
          <div className="text-xs text-gray-400 italic">—</div>
        )}
        <div className="text-xs text-gray-400 mt-1.5">{totalRocks} rock{totalRocks !== 1 ? "s" : ""} planned</div>
      </td>

      {/* status */}
      <td className="px-3 py-3.5">
        <StatusPill status={status} />
      </td>

      {/* progress */}
      <td className="px-3 py-3.5 min-w-[180px]">
        {totalRocks > 0 ? (
          <>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">{doneRocks}/{totalRocks} rocks</span>
              <span className={`font-semibold ${isActive ? "text-emerald-600" : "text-gray-500"}`}>{progressPct}%</span>
            </div>
            <ProgressBar pct={progressPct} color={barColor} />
          </>
        ) : (
          <span className="text-xs text-gray-400 italic">No rocks tracked</span>
        )}
      </td>

      {/* done */}
      <td className="px-3 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">
        {totalRocks > 0 ? `${doneRocks} rock${doneRocks !== 1 ? "s" : ""}` : "—"}
      </td>

      {/* remaining */}
      <td className="px-3 py-3.5 text-sm font-semibold text-gray-400 whitespace-nowrap">
        {totalRocks > 0 ? `${remaining} rock${remaining !== 1 ? "s" : ""}` : "—"}
      </td>
    </tr>
  );
}

/** Level-3: Rock row */
function RockRow({ rock, isLast }) {
  const isDone = rock.status === "completed" || rock.status === "done";

  return (
    <tr className="hover:bg-gray-50/40 transition-colors border-t border-gray-50/80">
      {/* indent */}
      <td className="pl-5 pr-2 py-3 w-10">
        <div className="flex items-center gap-1 ml-12">
          <div className={`w-px ${isLast ? "h-3 self-start" : "h-full"} bg-gray-200`} />
          <div className="w-3 h-px bg-gray-200" />
        </div>
      </td>

      {/* info */}
      <td className="px-3 py-3">
        <div className="flex items-start gap-2">
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <Circle className="w-4 h-4 text-gray-300 mt-0.5 shrink-0" />
          )}
          <div>
            <div className={`text-sm font-medium leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}>
              {rock.name}
            </div>
            {rock.description && (
              <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{rock.description}</div>
            )}
          </div>
        </div>
      </td>

      {/* target = success criteria / deadline */}
      <td className="px-3 py-3">
        {rock.success_criteria ? (
          <div className="text-xs text-gray-500 italic line-clamp-2 max-w-[200px]">
            &ldquo;{rock.success_criteria}&rdquo;
          </div>
        ) : (
          <span className="text-xs text-gray-300">—</span>
        )}
      </td>

      {/* status */}
      <td className="px-3 py-3">
        <StatusPill status={rock.status} />
      </td>

      {/* deadline as progress */}
      <td className="px-3 py-3" colSpan={1}>
        {rock.deadline ? (
          <div className="flex items-center gap-1.5">
            <Flag className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Due {new Date(rock.deadline).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-300">No deadline</span>
        )}
      </td>

      {/* month */}
      <td className="px-3 py-3">
        {rock.month ? (
          <span className="text-xs text-gray-400">Month {rock.month}</span>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      <td />
    </tr>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SystemOverviewPage() {
  const [system, setSystem]         = useState(null);
  const [northStar, setNorthStar]   = useState(null);
  const [activeYear, setActiveYear] = useState(null);   // { year_number, yearlyGoal, quarterlyTarget, quarters: [{...q, rocks:[]}] }
  const [loading, setLoading]       = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

  const handleReschedule = async () => {
    if (!rescheduleDate) return;
    setIsRescheduling(true);
    try {
      const { error } = await supabase
        .from("systems")
        .update({ start_date: rescheduleDate })
        .eq("id", system.id);
      if (error) throw error;
      setSystem({ ...system, start_date: rescheduleDate });
    } catch (err) {
      console.error("Error rescheduling:", err);
    } finally {
      setIsRescheduling(false);
    }
  };

  useEffect(() => {
    async function fetchAll() {
      try {
        // 1. Fetch active/scheduled system
        const { data: systems, error } = await supabase
          .from("systems")
          .select("*")
          .in("status", ["active", "scheduled"])
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!systems || systems.length === 0) return;

        const activeSys = systems.find((s) => s.status === "active") || systems[0];
        setSystem(activeSys);

        // 2. North Star
        const { data: goals } = await supabase
          .from("north_star_goals")
          .select("*")
          .eq("system_id", activeSys.id)
          .limit(1);
        if (goals?.length > 0) setNorthStar(goals[0]);

        // 3. System version snapshot → yearly goal name/target, quarterly target
        const { data: versions } = await supabase
          .from("system_versions")
          .select("snapshot")
          .eq("system_id", activeSys.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const snapshot   = versions?.[0]?.snapshot ?? {};
        const yearlyGoal      = snapshot?.roadmap?.yearlyGoal ?? null;       // { name, target }
        const quarterlyTarget = snapshot?.roadmap?.quarterlyObjective?.target ?? null;

        // 4. Year plan — get the most recent one (do NOT filter by status,
        //    as it may be 'locked' or another value depending on how it was created)
        const { data: yearPlans } = await supabase
          .from("year_plans")
          .select("*")
          .eq("system_id", activeSys.id)
          .order("year_number", { ascending: false })
          .limit(1);

        if (!yearPlans || yearPlans.length === 0) return;
        const yearPlan = yearPlans[0];

        // 5. All quarters for this year plan
        const { data: quartersData } = await supabase
          .from("quarters")
          .select("*")
          .eq("year_plan_id", yearPlan.id)
          .order("quarter_number", { ascending: true });

        if (!quartersData || quartersData.length === 0) {
          setActiveYear({ ...yearPlan, yearlyGoal, quarterlyTarget, quarters: [] });
          return;
        }

        // 6. Monthly rocks for all quarters
        const quarterIds = quartersData.map((q) => q.id);
        const { data: rocks } = await supabase
          .from("monthly_rocks")
          .select("*")
          .in("quarter_id", quarterIds)
          .order("month", { ascending: true });

        // Group rocks by quarter and compute progress
        const rocksByQuarter = {};
        for (const r of rocks ?? []) {
          if (!rocksByQuarter[r.quarter_id]) rocksByQuarter[r.quarter_id] = [];
          rocksByQuarter[r.quarter_id].push(r);
        }

        const enrichedQuarters = quartersData.map((q) => {
          const qRocks   = rocksByQuarter[q.id] ?? [];
          const total    = qRocks.length;
          const done     = qRocks.filter((r) => r.status === "completed" || r.status === "done").length;
          const pct      = total > 0 ? Math.round((done / total) * 100) : 0;
          return { ...q, totalRocks: total, doneRocks: done, progressPct: pct, rocks: qRocks };
        });

        setActiveYear({ ...yearPlan, yearlyGoal, quarterlyTarget, quarters: enrichedQuarters });
      } catch (err) {
        console.error("Error fetching system data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────

  if (!system) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] animate-in fade-in zoom-in-95 duration-500 p-8 w-full mx-auto text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">No Active System</h2>
        <div className="w-12 h-1 bg-gray-200 rounded-full mb-6" />
        <p className="max-w-md text-gray-500 mb-8 leading-relaxed">
          You currently have zero active systems. Initialize your long-term operating system to start
          tracking your North Star goals, milestones, and daily inputs.
        </p>
        <Link
          href="/system/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-sm hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Initialize New System
        </Link>
      </div>
    );
  }

  // ── Active system ────────────────────────────────────────────────────────

  return (
    <div className="p-8 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">System Overview</h1>
          <p className="text-gray-500">Your core operating architecture.</p>
        </div>
      </div>

      {/* Scheduled banner */}
      {system.status === "scheduled" && (
        <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-orange-600" />
              System is Scheduled
            </h3>
            <p className="text-orange-700">
              This system is scheduled to start on{" "}
              {system.start_date ? new Date(system.start_date).toLocaleDateString() : "a future date"}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="date"
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="px-3 py-2 border border-orange-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={handleReschedule}
              disabled={!rescheduleDate || isRescheduling}
              className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {isRescheduling ? "Updating..." : "Reschedule"}
            </button>
          </div>
        </div>
      )}

      {/* System identity card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{system.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    system.status === "active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">Phase: {system.current_phase || "Execution"}</span>
              </div>
            </div>
          </div>
          <Link
            href="/system/settings"
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Configure
          </Link>
        </div>
      </div>

      {/* The Why */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">The Why</h3>
        <p className="text-lg text-gray-700 italic border-l-4 border-orange-200 pl-4 py-1">
          &ldquo;{system.why || system.description || "No reason specified"}&rdquo;
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════
           HIERARCHICAL GOALS TRACKING TABLE
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">

        {/* Table header card */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Goals Hierarchy</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                North Star → Year → Quarters → Rocks
              </p>
            </div>
          </div>

          {/* legend */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> North Star
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" /> Pending
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="w-10" />
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Goal / Rock
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">
                  Progress
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Done
                </th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
              </tr>
            </thead>

            <tbody>
              {/* ── North Star ── */}
              {northStar && <NorthStarRow goal={northStar} />}

              {/* ── Active Year ── */}
              {activeYear && (
                <>
                  <YearRow
                    yearNumber={activeYear.year_number}
                    yearlyGoal={activeYear.yearlyGoal}
                  />

                  {/* ── Quarters ── */}
                  {activeYear.quarters.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-xs text-gray-400 italic">
                        No quarters defined for this year yet.
                      </td>
                    </tr>
                  )}

                  {activeYear.quarters.map((q) => {
                    const isActive = q.status === "active";
                    return (
                      <>
                        <QuarterRow
                          key={q.id}
                          quarter={q}
                          quarterTarget={activeYear.quarterlyTarget}
                          isActive={isActive}
                        />

                        {/* ── Rocks ── */}
                        {q.rocks.map((rock, idx) => (
                          <RockRow
                            key={rock.id}
                            rock={rock}
                            isLast={idx === q.rocks.length - 1}
                          />
                        ))}

                        {q.rocks.length === 0 && (
                          <tr key={`${q.id}-empty`} className="border-t border-gray-50/80">
                            <td colSpan={7} className="pl-20 py-3 text-xs text-gray-300 italic">
                              No rocks defined for this quarter.
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </>
              )}

              {!northStar && !activeYear && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No goal data found for this system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-8">
        <Link
          href="/inputs"
          className="text-sm font-medium text-orange-600 flex items-center gap-2 hover:text-orange-700 transition-colors"
        >
          View Daily Inputs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
