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
} from "lucide-react";

export default function SystemOverviewPage() {
  const [system, setSystem] = useState(null);
  const [northStar, setNorthStar] = useState(null);
  const [quarters, setQuarters] = useState([]);
  const [loading, setLoading] = useState(true);
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
    async function fetchSystem() {
      try {
        // Fetch the active or scheduled system
        const { data: systems, error } = await supabase
          .from("systems")
          .select("*")
          .in("status", ["active", "scheduled"])
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (systems && systems.length > 0) {
          const activeSys = systems.find((s) => s.status === "active");
          const targetSystem = activeSys || systems[0];
          setSystem(targetSystem);

          // Fetch North Star Goal
          const { data: goals } = await supabase
            .from("north_star_goals")
            .select("*")
            .eq("system_id", targetSystem.id)
            .limit(1);

          if (goals && goals.length > 0) {
            setNorthStar(goals[0]);
          }

          // Fetch Year Plans for this system
          const { data: yearPlans } = await supabase
            .from("year_plans")
            .select("id, year_number, status")
            .eq("system_id", targetSystem.id)
            .order("year_number", { ascending: true });

          if (yearPlans && yearPlans.length > 0) {
            // Gather all year plan IDs
            const yearPlanIds = yearPlans.map((yp) => yp.id);
            const yearPlanMap = Object.fromEntries(
              yearPlans.map((yp) => [yp.id, yp.year_number])
            );

            // Fetch all quarters for those year plans
            const { data: quartersData } = await supabase
              .from("quarters")
              .select("*")
              .in("year_plan_id", yearPlanIds)
              .order("quarter_number", { ascending: true });

            if (quartersData && quartersData.length > 0) {
              // Fetch monthly rocks for each quarter to compute progress
              const quarterIds = quartersData.map((q) => q.id);
              const { data: rocks } = await supabase
                .from("monthly_rocks")
                .select("id, quarter_id, status")
                .in("quarter_id", quarterIds);

              // Map rocks per quarter
              const rocksByQuarter = {};
              if (rocks) {
                for (const rock of rocks) {
                  if (!rocksByQuarter[rock.quarter_id]) {
                    rocksByQuarter[rock.quarter_id] = [];
                  }
                  rocksByQuarter[rock.quarter_id].push(rock);
                }
              }

              // Enrich quarters with year info and rock progress
              const enriched = quartersData.map((q) => {
                const qRocks = rocksByQuarter[q.id] || [];
                const total = qRocks.length;
                const done = qRocks.filter(
                  (r) => r.status === "completed" || r.status === "done"
                ).length;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return {
                  ...q,
                  year_number: yearPlanMap[q.year_plan_id] || "—",
                  totalRocks: total,
                  doneRocks: done,
                  progressPct: pct,
                };
              });

              setQuarters(enriched);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching system:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSystem();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  // EMPTY STATE
  if (!system) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] animate-in fade-in zoom-in-95 duration-500 p-8 w-full mx-auto text-center">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
          <Activity className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-4 tracking-tight">
          No Active System
        </h2>
        <div className="w-12 h-1 bg-gray-200 rounded-full mb-6" />
        <p className="max-w-md text-gray-500 mb-8 leading-relaxed">
          You currently have zero active systems. Initialize your long-term
          operating system to start tracking your North Star goals, milestones,
          and daily inputs.
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

  // North Star progress
  let nsProgress = 0;
  let nsDone = 0;
  let nsRemaining = 0;
  if (northStar && northStar.target_value != null && northStar.starting_value != null) {
    const total = Math.abs(northStar.target_value - northStar.starting_value);
    const current = Math.abs(
      (northStar.current_value || northStar.starting_value) - northStar.starting_value
    );
    if (total > 0) {
      nsProgress = Math.min(100, Math.max(0, (current / total) * 100));
      nsDone = current;
      nsRemaining = Math.max(0, total - current);
    }
  }

  const statusStyles = {
    active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    pending: "bg-gray-100 text-gray-500 border border-gray-200",
    completed: "bg-blue-100 text-blue-700 border border-blue-200",
    archived: "bg-gray-100 text-gray-400 border border-gray-200",
  };

  return (
    <div className="p-8 w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      {/* Page header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            System Overview
          </h1>
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
              {system.start_date
                ? new Date(system.start_date).toLocaleDateString()
                : "a future date"}
              .
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {system.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    system.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {system.status.charAt(0).toUpperCase() +
                    system.status.slice(1)}
                </span>
                <span className="text-sm text-gray-500">
                  Phase: {system.current_phase || "Execution"}
                </span>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">The Why</h3>
        <p className="text-lg text-gray-700 italic border-l-4 border-orange-200 pl-4 py-1">
          &ldquo;{system.why || system.description || "No reason specified"}&rdquo;
        </p>
      </div>

      {/* ═══════════════════════════════════════════
          GOALS TRACKING TABLE
      ═══════════════════════════════════════════ */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <Layers className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                Goals Tracking
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                North Star &amp; quarterly milestones
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-6">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Goal
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Progress
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Done
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {/* ── North Star Row ── */}
              {northStar && (
                <tr className="hover:bg-orange-50/30 transition-colors group">
                  {/* Type icon */}
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Star className="w-4 h-4 text-orange-500" />
                    </div>
                  </td>

                  {/* Goal name */}
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-0.5">
                        North Star
                      </div>
                      <div className="font-semibold text-gray-900 text-sm leading-snug">
                        {northStar.name}
                      </div>
                      {northStar.deadline && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(northStar.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                      <TrendingUp className="w-3 h-3" />
                      In Progress
                    </span>
                  </td>

                  {/* Progress bar */}
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">
                          {northStar.current_value ?? northStar.starting_value}{" "}
                          {northStar.unit}
                        </span>
                        <span className="font-semibold text-orange-600">
                          {nsProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-700"
                          style={{ width: `${nsProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Start: {northStar.starting_value} {northStar.unit}</span>
                        <span>Target: {northStar.target_value} {northStar.unit}</span>
                      </div>
                    </div>
                  </td>

                  {/* Done */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-800">
                      {nsDone} {northStar.unit}
                    </span>
                  </td>

                  {/* Remaining */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-400">
                      {nsRemaining} {northStar.unit}
                    </span>
                  </td>
                </tr>
              )}

              {/* ── Quarter Rows ── */}
              {quarters.length === 0 && !northStar && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-gray-400 text-sm"
                  >
                    No goals found for this system yet.
                  </td>
                </tr>
              )}

              {quarters.map((q) => {
                const isActive = q.status === "active";
                const statusKey = q.status in statusStyles ? q.status : "pending";

                return (
                  <tr
                    key={q.id}
                    className={`transition-colors ${
                      isActive
                        ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                        : "hover:bg-gray-50/60"
                    }`}
                  >
                    {/* Type icon */}
                    <td className="px-6 py-4">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        Q{q.quarter_number}
                      </div>
                    </td>

                    {/* Goal name */}
                    <td className="px-4 py-4">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Year {q.year_number} · Q{q.quarter_number}
                          </div>
                          {isActive && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-gray-900 text-sm leading-snug">
                          {q.objective || "Quarterly Objective"}
                        </div>
                        {(q.start_date || q.end_date) && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {q.start_date
                              ? new Date(q.start_date).toLocaleDateString()
                              : "—"}{" "}
                            →{" "}
                            {q.end_date
                              ? new Date(q.end_date).toLocaleDateString()
                              : "—"}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[statusKey]}`}
                      >
                        {isActive ? (
                          <Clock className="w-3 h-3" />
                        ) : q.status === "completed" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </td>

                    {/* Progress bar */}
                    <td className="px-4 py-4">
                      {q.totalRocks > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              {q.doneRocks}/{q.totalRocks} rocks
                            </span>
                            <span
                              className={`font-semibold ${
                                isActive ? "text-emerald-600" : "text-gray-500"
                              }`}
                            >
                              {q.progressPct}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-700 ${
                                isActive
                                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                  : q.status === "completed"
                                  ? "bg-gradient-to-r from-blue-400 to-blue-500"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${q.progressPct}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          No rocks tracked
                        </span>
                      )}
                    </td>

                    {/* Done */}
                    <td className="px-4 py-4">
                      {q.totalRocks > 0 ? (
                        <span className="text-sm font-semibold text-gray-800">
                          {q.doneRocks} rock{q.doneRocks !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>

                    {/* Remaining */}
                    <td className="px-4 py-4">
                      {q.totalRocks > 0 ? (
                        <span className="text-sm font-semibold text-gray-400">
                          {q.totalRocks - q.doneRocks} rock
                          {q.totalRocks - q.doneRocks !== 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer link */}
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
