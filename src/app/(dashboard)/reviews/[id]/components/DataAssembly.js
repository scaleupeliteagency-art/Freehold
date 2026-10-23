"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Activity, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

/**
 * DataAssembly — Stage 1 of the Review Flow
 *
 * Fetches and displays the full data package that will be passed to AI Investigation.
 * This includes:
 *   - System info
 *   - Full goal hierarchy (north star → year → quarter → rock → milestone)
 *   - Active input definitions
 *   - Actual daily_input_entries for the review period
 *   - Previous review summaries (for pattern detection)
 *   - Behavioral weakness register entries
 */
export default function DataAssembly({ reviewState, setReviewState, onNext, reviewContext }) {
  const [assembling, setAssembling] = useState(false);
  const [assembled, setAssembled] = useState(false);
  const [assemblyError, setAssemblyError] = useState(null);

  // Derive period from reviewContext or reviewState
  const periodStart =
    reviewContext?.periodStart ||
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const periodEnd =
    reviewContext?.periodEnd || new Date().toISOString().split("T")[0];

  // If data was already assembled (e.g. user navigated back), show it
  useEffect(() => {
    if (reviewState.assembled) {
      setAssembled(true);
    }
  }, [reviewState.assembled]);

  const handleAssemble = async () => {
    setAssembling(true);
    setAssemblyError(null);

    try {
      const system = reviewState.system;
      if (!system) throw new Error("No active system found. Cannot assemble review data.");

     
    // --- Goal hierarchy ---
    const requireQuerySuccess = (label, result) => {
      if (result.error) {
        throw new Error(
          `Failed to load ${label}: ${result.error.message}`
        );
      }
      return result.data || [];
    };

    const northStarResult = await supabase
      .from("north_star_goals")
      .select("*")
      .eq("system_id", system.id)
      .limit(1);

    const northStarGoals = requireQuerySuccess(
      "north-star goals",
      northStarResult
    );

    const yearResult = await supabase
      .from("year_plans")
      .select("*")
      .eq("system_id", system.id)
      .order("year_number", { ascending: false })
      .limit(1);

    const yearPlans = requireQuerySuccess("year plans", yearResult);
    const activeYear = yearPlans[0] || null;

    let activeQuarter = null;
    let activeRock = null;
    let activeMilestone = null;

    if (activeYear) {
      const quarterResult = await supabase
        .from("quarters")
        .select("*")
        .eq("year_plan_id", activeYear.id)
        .ilike("status", "active")
        .limit(1);

      const quarters = requireQuerySuccess(
        "active quarter",
        quarterResult
      );

      activeQuarter = quarters[0] || null;

      if (activeQuarter) {
        const rockResult = await supabase
          .from("monthly_rocks")
          .select("*")
          .eq("quarter_id", activeQuarter.id)
          .ilike("status", "active")
          .limit(1);

        const rocks = requireQuerySuccess("active rock", rockResult);
        activeRock = rocks[0] || null;

        if (activeRock) {
          // Fetch milestones for this rock first, without filtering by
          // status in SQL. This helps reveal status-value mismatches.
          const milestoneResult = await supabase
            .from("weekly_milestones")
            .select("*")
            .eq("monthly_rock_id", activeRock.id);

          const milestones = requireQuerySuccess(
            "milestones for the active rock",
            milestoneResult
          );

          // Compare status case-insensitively.
          
const normalizedStatus = (milestone) =>
  String(milestone.status || "").trim().toLowerCase();

const activeMilestones = milestones.filter(
  (milestone) => normalizedStatus(milestone) === "active"
);

const pendingMilestones = milestones.filter(
  (milestone) => normalizedStatus(milestone) === "pending"
);

// Prefer the explicitly active milestone.
// If none exists, fall back to the first pending milestone.
// Never select a completed milestone as the current milestone.
activeMilestone =
  activeMilestones[0] ||
  pendingMilestones[0] ||
  null;

          if (!activeMilestone && milestones.length > 0) {
            console.warn(
              "[DataAssembly] Milestones exist for the active rock, " +
                "but none has status 'active'.",
              milestones.map((milestone) => ({
                id: milestone.id,
                name: milestone.name,
                status: milestone.status,
                monthly_rock_id: milestone.monthly_rock_id,
              }))
            );
          }
        }
      }
    }

      // --- Input definitions ---
      const { data: inputDefs, error: inputError } = await supabase
        .from("input_definitions")
        .select("*")
        .eq("system_id", system.id)
        .eq("active_status", true);

      if (inputError) throw new Error(`Failed to load inputs: ${inputError.message}`);

      // --- Actual execution entries for the review period ---
      let executionEntries = [];
      if (inputDefs && inputDefs.length > 0) {
        const { data: entries, error: entriesError } = await supabase
          .from("daily_input_entries")
          .select("*")
          .in("input_definition_id", inputDefs.map((i) => i.id))
          .gte("date", periodStart)
          .lte("date", periodEnd)
          .order("date", { ascending: true });

        if (entriesError) {
          console.warn("[DataAssembly] Could not load execution entries:", entriesError.message);
          // Continue — mark as data unavailable rather than failing the whole assembly
        } else {
          executionEntries = entries || [];
        }
      }

      // --- Aggregate entries per input ---
      const daysInPeriod = Math.max(
        1,
        Math.round(
          (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) /
            (1000 * 60 * 60 * 24)
        ) + 1
      );

      const enrichedInputs = (inputDefs || []).map((def) => {
        const defEntries = executionEntries.filter(
          (e) => e.input_definition_id === def.id
        );

        const totalActual =
          defEntries.length > 0
            ? defEntries.reduce((sum, e) => sum + (Number(e.actual_value) || 0), 0)
            : null; // null = no data, not zero

        const isDaily = (def.frequency || "").toLowerCase() === "daily";
        const targetForPeriod = isDaily
          ? (Number(def.target) || 0) * daysInPeriod
          : Number(def.target) || 0;

        const completionPct =
          totalActual !== null && targetForPeriod > 0
            ? Math.round((totalActual / targetForPeriod) * 100)
            : null;

        return {
          id: def.id,
          name: def.name,
          target: def.target,
          frequency: def.frequency,
          unit: def.unit || "",
          weight: def.weight || 10,
          description: def.description || null,
          executionEntries: defEntries.map((e) => ({
            date: e.date,
            actual_value: e.actual_value,
            completed: e.completed,
          })),
          aggregates: {
            totalActual,
            targetForPeriod,
            completionPct,
            periodDays: daysInPeriod,
            entryCount: defEntries.length,
          },
        };
      });

      // --- Previous reviews for pattern detection (last 4) ---
      const { data: prevReviews } = await supabase
        .from("reviews")
        .select("period_start, period_end, summary, investigation, type")
        .eq("system_id", system.id)
        .eq("status", "COMPLETED")
        .order("created_at", { ascending: false })
        .limit(4);

      // --- Behavioral weakness register ---
      const { data: bwrEntries } = await supabase
        .from("behavioral_weakness_register")
        .select("pattern, status, evidence_entries, triggering_situations, corrective_actions")
        .eq("system_id", system.id)
        .order("created_at", { ascending: false });

      // --- Assemble the final data package ---
      const goalHierarchy = {
        northStar: northStarGoals?.[0] || null,
        yearPlan: activeYear || null,
        quarter: activeQuarter
          ? {
              objective: activeQuarter.objective,
              start_date: activeQuarter.start_date,
              end_date: activeQuarter.end_date,
              status: activeQuarter.status,
            }
          : null,
        rock: activeRock
          ? {
              name: activeRock.name,
              description: activeRock.description,
              success_criteria: activeRock.success_criteria,
              status: activeRock.status,
            }
          : null,
        milestone: activeMilestone
          ? {
              id: activeMilestone.id,
              name: activeMilestone.name,
              target: activeMilestone.target,
              current_value: activeMilestone.current_value,
              success_criteria: activeMilestone.success_criteria,
              status: activeMilestone.status,
              deadline: activeMilestone.deadline,
            }
          : null,
      };

      const assembledData = {
        system: {
          id: system.id,
          name: system.name,
          why: system.why,
          description: system.description,
          start_date: system.start_date,
          deadline: system.deadline,
        },
        goalHierarchy,
        inputs: enrichedInputs,
        reviewPeriod: { start: periodStart, end: periodEnd, daysInPeriod },
        previousReviews: (prevReviews || []).map((r) => ({
          type: r.type,
          period_start: r.period_start,
          period_end: r.period_end,
          summary: r.summary,
          // Only pass lightweight investigation snippet to avoid token bloat
          investigationVerdictSummary: r.investigation?.verdict?.overallAssessment || null,
        })),
        behavioralWeaknessRegister: bwrEntries || [],
      };

      setReviewState((prev) => ({
        ...prev,
        // Preserve existing system/milestone from page load; enrich with full package
        system,
        milestone: activeMilestone,
        inputs: inputDefs || [],
        goalHierarchy,
        assembledDataPayload: assembledData,
        assembled: true,
      }));

      setAssembled(true);
    } catch (err) {
      console.error("[DataAssembly] Error:", err.message);
      setAssemblyError(err.message);
    } finally {
      setAssembling(false);
    }
  };

  const { system, milestone, inputs, assembledDataPayload } = reviewState;

  if (!system) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Assembly</h2>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-600 text-sm font-medium">
          No active system found. Create and activate a system before starting a review.
        </div>
      </div>
    );
  }

  const totalInputs = inputs?.length || 0;
  const inputsWithData =
    assembledDataPayload?.inputs?.filter(
      (i) => i.aggregates.entryCount > 0
    ).length ?? 0;
  const inputsWithoutData =
    assembledDataPayload?.inputs?.filter(
      (i) => i.aggregates.entryCount === 0
    ).length ?? 0;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Assembly</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Aggregating execution data for the review period{" "}
          <span className="font-mono text-gray-700">
            {periodStart} → {periodEnd}
          </span>
        </p>
      </div>

      <div className="space-y-6">
        {/* System */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            System
          </h3>
          <div className="text-base font-bold text-gray-900">{system.name}</div>
          {system.why && (
            <div className="text-sm text-gray-500 mt-1">{system.why}</div>
          )}
        </div>

        {/* Goal hierarchy */}
        {assembledDataPayload?.goalHierarchy && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Goal Hierarchy
            </h3>
            <div className="space-y-2 text-sm">
              {assembledDataPayload.goalHierarchy.northStar && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 shrink-0">5-Year Goal</span>
                  <span className="font-medium text-gray-900">
                    {assembledDataPayload.goalHierarchy.northStar.name}
                  </span>
                </div>
              )}
              {assembledDataPayload.goalHierarchy.quarter && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 shrink-0">Quarter</span>
                  <span className="font-medium text-gray-900">
                    {assembledDataPayload.goalHierarchy.quarter.objective}
                  </span>
                </div>
              )}
              {assembledDataPayload.goalHierarchy.rock && (
                <div className="flex gap-2">
                  <span className="text-gray-400 w-24 shrink-0">ROCK</span>
                  <span className="font-medium text-gray-900">
                    {assembledDataPayload.goalHierarchy.rock.name}
                  </span>
                </div>
              )}
   
{assembledDataPayload.goalHierarchy.milestone ? (
  <div className="flex gap-2">
    <span className="text-gray-400 w-24 shrink-0">Milestone</span>
    <span className="font-medium text-gray-900">
      {assembledDataPayload.goalHierarchy.milestone.name}
    </span>
  </div>
) : (
  <div className="flex gap-2">
    <span className="text-gray-400 w-24 shrink-0">Milestone</span>
    <span className="text-yellow-600 text-sm">
      No active milestone — check milestone statuses
    </span>
  </div>
)}

            </div>
          </div>
        )}

        {/* Strategic target (before assembly) */}
        {!assembled && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Current Milestone
            </h3>
            <div className="text-base font-bold text-gray-900 mb-1">
              {milestone?.name || "No active milestone"}
            </div>
            {milestone?.target && (
              <div className="text-sm font-mono text-gray-500">
                Target: {milestone.target}
              </div>
            )}
          </div>
        )}

        {/* Operating inputs overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Operating Inputs ({totalInputs})
          </h3>
          {totalInputs === 0 ? (
            <div className="text-sm text-gray-400 italic">No active inputs found.</div>
          ) : assembled && assembledDataPayload ? (
            <div className="space-y-3">
              {assembledDataPayload.inputs.map((input) => {
                const { aggregates } = input;
                const hasData = aggregates.entryCount > 0;
                return (
                  <div
                    key={input.id}
                    className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{input.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Target: {input.target} {input.unit} / {input.frequency}
                      </div>
                    </div>
                    <div className="text-right">
                      {hasData ? (
                        <>
                          <div className="text-sm font-mono font-semibold text-gray-900">
                            {aggregates.totalActual ?? "—"} / {aggregates.targetForPeriod}
                          </div>
                          <div
                            className={`text-xs font-semibold mt-0.5 ${
                              (aggregates.completionPct ?? 0) >= 90
                                ? "text-green-600"
                                : (aggregates.completionPct ?? 0) >= 50
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {aggregates.completionPct ?? 0}%
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-gray-400 font-medium flex items-center gap-1 justify-end">
                          <AlertCircle className="w-3 h-3 text-yellow-500" />
                          No data recorded
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {inputs.map((input) => (
                <div
                  key={input.id}
                  className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0"
                >
                  <div className="font-medium text-gray-900 text-sm">{input.name}</div>
                  <div className="font-mono text-sm text-gray-500">
                    {input.target} / {input.frequency}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Data quality summary */}
        {assembled && assembledDataPayload && (
          <div
            className={`rounded-xl border p-4 text-sm ${
              inputsWithoutData > 0
                ? "border-yellow-200 bg-yellow-50"
                : "border-green-200 bg-green-50"
            }`}
          >
            <div className="flex items-center gap-2 font-semibold mb-1">
              {inputsWithoutData > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-800">Partial execution data</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-green-800">Full execution data available</span>
                </>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">
              {inputsWithData} of {totalInputs} input
              {totalInputs !== 1 ? "s" : ""} have recorded execution data for this period.
              {inputsWithoutData > 0 &&
                ` ${inputsWithoutData} input${inputsWithoutData !== 1 ? "s" : ""} have no recorded entries — the AI investigation will mark these as UNKNOWN rather than zero.`}
            </p>
          </div>
        )}

        {/* Assembly error */}
        {assemblyError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-red-700 text-sm">
            <div className="font-semibold mb-1">Assembly Failed</div>
            {assemblyError}
          </div>
        )}
      </div>

      <div className="pt-8 flex justify-end mt-8 border-t border-gray-100">
        {!assembled ? (
          <button
            onClick={handleAssemble}
            disabled={assembling}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {assembling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Assembling Data...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Assemble Execution Data
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            Initialize AI Investigation <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
