"use client";

import { useMemo } from "react";
import {
  LockKeyhole,
  Target,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Zap,
  Info,
} from "lucide-react";
import InputCard from "./InputCard";

export default function ExecutionBoard({
  inputs = [],
  onUpdate,
  onEdit,
  onViewHistory,
}) {
  // Separate core inputs from additional inputs
  const coreInputs = inputs.filter((inp) => inp.isCore === true || inp.is_core === true);
  const additionalInputs = inputs.filter(
    (inp) =>
      inp.isCore !== true &&
      inp.is_core !== true &&
      inp.status !== "archived" &&
      inp.status !== "paused"
  );

  // Calculate Overall Daily Status based on the three core inputs
  const coreAnalysis = useMemo(() => {
    let reachStretchCount = 0;
    let reachNormalCount = 0;
    let reachBadDayCount = 0;
    let belowBadDayCount = 0;
    let hasStartedAny = false;

    coreInputs.forEach((inp) => {
      const actual = Number(inp.actual || 0);
      const badDay = Number(inp.badDayMinimum ?? inp.bad_day_minimum ?? inp.minimumTarget ?? inp.minimum ?? 0);
      const normal = Number(inp.normalTarget ?? inp.normal_target ?? inp.normal ?? inp.target ?? 1);
      const stretch = Number(inp.stretchTarget ?? inp.stretch_target ?? inp.stretch ?? (normal * 1.5));

      if (actual > 0) hasStartedAny = true;
      if (actual >= stretch && stretch > 0) reachStretchCount++;
      if (actual >= normal && normal > 0) reachNormalCount++;
      if (actual >= badDay && badDay > 0) reachBadDayCount++;
      if (actual < badDay) belowBadDayCount++;
    });

    // Exact Daily Classification Rules:
    // NORMAL SUCCESS: All three core inputs reach their normal targets.
    // BAD-DAY SUCCESS: All three core inputs reach bad-day minimums, but at least one does not reach normal target.
    // FAILED DAY: At least one core input falls below its bad-day minimum.
    let statusLabel = "Not Started";
    let statusType = "not_started";
    let statusStyle = "bg-slate-100 text-slate-700 border-slate-200";
    let statusDesc = "Record your execution for today's non-negotiable commitments.";
    let StatusIcon = Target;

    if (coreInputs.length >= 3) {
      if (reachNormalCount === 3) {
        if (reachStretchCount === 3) {
          statusLabel = "Stretch Target Achieved";
          statusType = "stretch";
          statusStyle = "bg-orange-500 text-white border-orange-600 shadow-sm";
          statusDesc = "Exceptional performance: all 3 core inputs hit stretch targets!";
          StatusIcon = Flame;
        } else {
          statusLabel = "Normal Success";
          statusType = "normal";
          statusStyle = "bg-emerald-600 text-white border-emerald-700 shadow-sm";
          statusDesc = "All 3 core inputs reached normal target requirements.";
          StatusIcon = CheckCircle2;
        }
      } else if (reachBadDayCount === 3) {
        statusLabel = "Bad-Day Success";
        statusType = "bad_day";
        statusStyle = "bg-amber-500 text-white border-amber-600 shadow-sm";
        statusDesc = "All 3 core inputs hit bad-day minimum floor. Core commitment protected.";
        StatusIcon = ShieldCheck;
      } else if (hasStartedAny) {
        statusLabel = "In Progress";
        statusType = "in_progress";
        statusStyle = "bg-amber-50 text-amber-800 border-amber-200";
        statusDesc = `${reachBadDayCount}/3 core inputs have met bad-day floor so far.`;
        StatusIcon = Zap;
      } else {
        statusLabel = "Not Started";
        statusType = "not_started";
        statusStyle = "bg-slate-100 text-slate-700 border-slate-200";
        statusDesc = "Awaiting execution for today's commitments.";
        StatusIcon = Target;
      }
    }

    return {
      reachStretchCount,
      reachNormalCount,
      reachBadDayCount,
      belowBadDayCount,
      statusLabel,
      statusType,
      statusStyle,
      statusDesc,
      StatusIcon,
    };
  }, [coreInputs]);

  const StatusIcon = coreAnalysis.StatusIcon;

  return (
    <div className="space-y-12">
      {/* SECTION A — NON-NEGOTIABLE DAILY COMMITMENTS */}
      <section className="bg-white rounded-2xl border-2 border-orange-200 p-6 sm:p-8 shadow-sm">
        {/* Section Heading with Overall Daily Commitment Status */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white font-bold shadow-xs">
                <LockKeyhole className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Non-Negotiable Daily Commitments
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Exactly three permanent core inputs that determine whether today's commitment is fulfilled.
            </p>
          </div>

          {/* Daily Commitment Status Pill */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${coreAnalysis.statusStyle}`}>
              <StatusIcon className="h-4 w-4" />
              <span>{coreAnalysis.statusLabel}</span>
            </div>
          </div>
        </div>

        {/* 3 Core Commitment Levels Explanation Banner */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              Level 1 • Bad-Day Minimum
            </span>
            <p className="text-xs text-amber-950 leading-relaxed font-medium">
              The non-negotiable floor on catastrophic or low-energy days. Protects streak.
            </p>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              Level 2 • Normal Daily Target
            </span>
            <p className="text-xs text-emerald-950 leading-relaxed font-medium">
              The expected operational performance standard to achieve normal success.
            </p>
          </div>

          <div className="bg-orange-50/70 border border-orange-200 rounded-xl p-3.5">
            <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block mb-1">
              Level 3 • Stretch Target
            </span>
            <p className="text-xs text-orange-950 leading-relaxed font-medium">
              Peak flow state execution that accelerates compounding strategic milestones.
            </p>
          </div>
        </div>

        {/* Core Inputs Cards Grid (Exactly 3) */}
        {coreInputs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No core inputs found in this system.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreInputs.slice(0, 3).map((input) => (
              <InputCard
                key={input.id}
                input={input}
                onUpdate={onUpdate}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
              />
            ))}
          </div>
        )}
      </section>

      {/* SECTION B — ADDITIONAL SUPPORTING INPUTS */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Additional Supporting Inputs
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Secondary routines that contribute to execution score and XP without altering core commitment status.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-lg">
            {additionalInputs.length} Active {additionalInputs.length === 1 ? "Input" : "Inputs"}
          </span>
        </div>

        {additionalInputs.length === 0 ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-8 text-center text-slate-500 text-xs">
            No additional inputs configured. Use "+ Add Input" to add optional weekly or daily protocols.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {additionalInputs.map((input) => (
              <InputCard
                key={input.id}
                input={input}
                onUpdate={onUpdate}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
