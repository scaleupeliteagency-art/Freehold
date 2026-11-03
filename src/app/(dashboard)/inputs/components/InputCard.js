"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Settings2,
  History,
  LockKeyhole,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Zap,
} from "lucide-react";

export default function InputCard({
  input,
  onUpdate,
  onEdit,
  onViewHistory,
}) {
  const [value, setValue] = useState(input.actual ?? 0);

  const isCore = input.isCore === true || input.is_core === true;

  useEffect(() => {
    setValue(input.actual ?? 0);
  }, [input.actual]);

  const handleUpdate = (newValue) => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue)) return;
    const clamped = Math.max(0, numericValue);
    setValue(clamped);
    onUpdate?.(input.id, clamped);
  };

  const actualNum = Number(value || 0);

  // Semantically clear targets for core inputs
  const badDayMinimum = Number(input.badDayMinimum ?? input.bad_day_minimum ?? input.minimumTarget ?? input.minimum ?? 0);
  const normalTarget = Number(input.normalTarget ?? input.normal_target ?? input.normal ?? input.target ?? 1);
  const stretchTarget = Number(input.stretchTarget ?? input.stretch_target ?? input.stretch ?? (normalTarget * 1.5));

  // Determine current achievement tier for core input
  let coreTier = "not_started";
  let tierBadge = {
    label: "Not Started",
    style: "bg-slate-100 text-slate-600 border-slate-200",
    icon: Target,
  };

  if (isCore) {
    if (actualNum >= stretchTarget && stretchTarget > 0) {
      coreTier = "stretch";
      tierBadge = {
        label: "Stretch Target Achieved",
        style: "bg-orange-500 text-white border-orange-600 font-bold shadow-xs",
        icon: Flame,
      };
    } else if (actualNum >= normalTarget && normalTarget > 0) {
      coreTier = "normal";
      tierBadge = {
        label: "Normal Target Achieved",
        style: "bg-emerald-500 text-white border-emerald-600 font-bold shadow-xs",
        icon: CheckCircle2,
      };
    } else if (actualNum >= badDayMinimum && badDayMinimum > 0) {
      coreTier = "bad_day";
      tierBadge = {
        label: "Bad-Day Minimum Achieved",
        style: "bg-amber-500 text-white border-amber-600 font-bold shadow-xs",
        icon: AlertTriangle,
      };
    } else if (actualNum > 0) {
      coreTier = "in_progress";
      tierBadge = {
        label: "In Progress (Below Minimum)",
        style: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
        icon: Zap,
      };
    }
  } else {
    // Additional input progress
    const addlTarget = Number(input.target || 1);
    if (actualNum >= addlTarget && addlTarget > 0) {
      tierBadge = {
        label: "Completed",
        style: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
        icon: CheckCircle2,
      };
    } else if (actualNum > 0) {
      tierBadge = {
        label: "In Progress",
        style: "bg-blue-50 text-blue-700 border-blue-200 font-semibold",
        icon: Zap,
      };
    }
  }

  const normalProgress = normalTarget > 0
    ? Math.min(100, Math.round((actualNum / normalTarget) * 100))
    : 0;

  const TierIcon = tierBadge.icon;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md ${
        isCore
          ? "border-orange-200/90 bg-gradient-to-b from-orange-50/50 via-white to-white ring-1 ring-orange-100"
          : "border-slate-200/80 bg-white"
      }`}
    >
      {/* Top Tag & Actions */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {isCore ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-100/80 px-2 py-0.5 text-xs font-bold text-orange-900 uppercase tracking-wider">
                <LockKeyhole className="h-3 w-3 text-orange-700" />
                Core Non-Negotiable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                Additional Input
              </span>
            )}

            {/* Achievement Tier Badge */}
            <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs ${tierBadge.style}`}>
              <TierIcon className="h-3 w-3 shrink-0" />
              {tierBadge.label}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {input.name}
          </h3>

          {input.description && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500 leading-relaxed">
              {input.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          {onViewHistory && (
            <button
              type="button"
              onClick={() => onViewHistory(input)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title="Audit / Version History"
              aria-label={`View history for ${input.name}`}
            >
              <History className="h-4 w-4" />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(input)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              title={isCore ? "Authorized Core Target Correction" : "Edit Input"}
              aria-label={`Edit ${input.name}`}
            >
              {isCore ? (
                <LockKeyhole className="h-4 w-4 text-orange-600" />
              ) : (
                <Settings2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Target Tiers Comparison for Core Inputs */}
      {isCore ? (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {/* Bad-day minimum */}
          <div className={`rounded-xl border p-2.5 text-center transition-colors ${
            actualNum >= badDayMinimum
              ? "border-amber-300 bg-amber-50/70"
              : "border-slate-100 bg-slate-50/60"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
              1. Bad-Day Min
            </span>
            <div className="mt-0.5 text-base font-extrabold text-slate-900">
              {badDayMinimum}
              <span className="text-[10px] font-normal text-slate-500 ml-1">{input.unit || ""}</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Floor</span>
          </div>

          {/* Normal Target */}
          <div className={`rounded-xl border p-2.5 text-center transition-colors ${
            actualNum >= normalTarget
              ? "border-emerald-300 bg-emerald-50/70"
              : "border-orange-200 bg-orange-50/60"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 block">
              2. Normal Target
            </span>
            <div className="mt-0.5 text-base font-extrabold text-slate-900">
              {normalTarget}
              <span className="text-[10px] font-normal text-slate-500 ml-1">{input.unit || ""}</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Expected</span>
          </div>

          {/* Stretch Target */}
          <div className={`rounded-xl border p-2.5 text-center transition-colors ${
            actualNum >= stretchTarget
              ? "border-orange-400 bg-orange-100/70 ring-1 ring-orange-300"
              : "border-slate-100 bg-slate-50/60"
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950 block">
              3. Stretch Target
            </span>
            <div className="mt-0.5 text-base font-extrabold text-slate-900">
              {stretchTarget}
              <span className="text-[10px] font-normal text-slate-500 ml-1">{input.unit || ""}</span>
            </div>
            <span className="text-[9px] text-slate-400 block mt-0.5">Peak</span>
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Target</span>
            <span className="text-sm font-bold text-slate-900">
              {input.target || 1} {input.unit || ""}
            </span>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
            {input.frequency || "Daily"}
          </span>
        </div>
      )}

      {/* Daily Value Stepper Controls */}
      <div className="mb-4 mt-auto">
        <div className="flex w-full items-center rounded-xl border border-slate-200 bg-slate-50/70 p-1">
          <button
            type="button"
            onClick={() => handleUpdate(Number(value) - 1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs transition-colors hover:bg-slate-100 active:scale-95"
            aria-label={`Decrease ${input.name}`}
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="flex-1 flex items-center justify-center gap-1.5 px-2">
            <input
              type="number"
              min="0"
              value={value}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  setValue("");
                  return;
                }
                handleUpdate(Number(raw));
              }}
              onBlur={() => {
                if (value === "") handleUpdate(0);
              }}
              placeholder="0"
              className="h-10 w-24 bg-transparent text-center text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:outline-none"
              aria-label={`Actual value for ${input.name}`}
            />
            {input.unit && (
              <span className="text-xs font-bold text-slate-400 truncate max-w-[80px]">
                {input.unit}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleUpdate(Number(value || 0) + 1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-600 text-white shadow-xs transition-colors hover:bg-orange-700 active:scale-95"
            aria-label={`Increase ${input.name}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar (Relative to Normal Target) */}
      <div className="mt-1">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
          <span>{isCore ? "Progress to Normal Target" : "Target Progress"}</span>
          <span className="text-slate-900 font-bold">{normalProgress}%</span>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={normalProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              actualNum >= stretchTarget
                ? "bg-orange-500"
                : actualNum >= normalTarget
                ? "bg-emerald-500"
                : actualNum >= badDayMinimum
                ? "bg-amber-400"
                : "bg-slate-700"
            }`}
            style={{ width: `${Math.min(100, normalProgress)}%` }}
          />
        </div>
      </div>

      {/* Connected Milestone or Rock */}
      {(input.milestoneName || input.connectedRock) && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <Target className="h-3.5 w-3.5 shrink-0 text-orange-600" />
          Supports:
          <span className="font-semibold text-slate-800 truncate">
            {input.connectedRock || input.milestoneName}
          </span>
        </div>
      )}
    </div>
  );
}
