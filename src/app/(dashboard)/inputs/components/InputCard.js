
"use client";

import { useEffect, useState } from "react";
import {
  Minus,
  Plus,
  Settings2,
  History,
  LockKeyhole,
  Target,
} from "lucide-react";

export default function InputCard({
  input,
  onUpdate,
  onEdit,
  onViewHistory,
}) {
  const [value, setValue] = useState(input.actual ?? 0);

  const isCore = input.isCore === true;

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

  const target = Number(input.target ?? input.normalTarget ?? 1);
  const progress =
    target > 0
      ? Math.min(100, Math.round((Number(value || 0) / target) * 100))
      : 0;

  const minimumTarget = input.minimumTarget ?? input.minimum;
  const normalTarget = input.normalTarget ?? input.normal ?? input.target;
  const stretchTarget = input.stretchTarget ?? input.stretch;

  return (
    <div
      className={`relative flex flex-col rounded-xl border p-5 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md ${
        isCore
          ? "border-orange-200 bg-orange-50/40"
          : "border-slate-100 bg-white/90"
      }`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {input.name}
            </h3>

            {isCore && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-800">
                <LockKeyhole className="h-3 w-3" />
                Core
              </span>
            )}
          </div>

          {input.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {input.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          {onViewHistory && (
            <button
              type="button"
              onClick={() => onViewHistory(input)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              title="Version History"
              aria-label={`View history for ${input.name}`}
            >
              <History className="h-4 w-4" />
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(input)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
              title={isCore ? "Edit Core Input" : "Edit Input"}
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

      {/* Targets */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
        <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1">
          Target:{" "}
          <span className="text-slate-900">
            {target} {input.unit || ""} / {input.frequency || "Daily"}
          </span>
        </div>

        {input.weight != null && (
          <div className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1">
            Weight:{" "}
            <span className="text-slate-900">{input.weight}%</span>
          </div>
        )}
      </div>

      {/* Core target range */}
      {isCore && (
        <div className="mb-5 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-100 bg-white p-2">
            <p className="text-xs text-slate-500">Minimum</p>
            <p className="mt-1 font-semibold text-slate-900">
              {minimumTarget ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-2">
            <p className="text-xs text-orange-700">Normal</p>
            <p className="mt-1 font-semibold text-slate-900">
              {normalTarget ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-2">
            <p className="text-xs text-slate-500">Stretch</p>
            <p className="mt-1 font-semibold text-slate-900">
              {stretchTarget ?? "—"}
            </p>
          </div>
        </div>
      )}

      {/* Daily value controls */}
      <div className="mb-5 mt-auto flex items-center gap-3">
        {input.type === "binary" ? (
          <button
            type="button"
            onClick={() => handleUpdate(value ? 0 : 1)}
            className={`flex-1 rounded-full border py-2.5 text-sm font-medium shadow-sm transition-all ${
              value
                ? "border-green-600 bg-green-500 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {value ? "Completed" : "Not Completed"}
          </button>
        ) : (
          <div className="flex w-full items-center rounded-full border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => handleUpdate(Number(value) - 1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-100"
              aria-label={`Decrease ${input.name}`}
            >
              <Minus className="h-4 w-4" />
            </button>

            <input
              type="number"
              min="0"
              value={value}
              onChange={(event) => {
                const raw = event.target.value;

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
              className="h-10 min-w-0 flex-1 bg-transparent text-center text-xl font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none"
              aria-label={`Actual value for ${input.name}`}
            />

            <button
              type="button"
              onClick={() => handleUpdate(Number(value || 0) + 1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white shadow-sm transition-colors hover:bg-orange-700"
              aria-label={`Increase ${input.name}`}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mt-1">
        <div className="mb-1.5 flex justify-between text-xs font-medium text-slate-500">
          <span>Progress</span>
          <span className="text-slate-900">{progress}%</span>
        </div>

        <div
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${input.name} progress`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              progress >= 100
                ? "bg-green-500"
                : progress >= 50
                  ? "bg-orange-600"
                  : "bg-slate-800"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Supporting milestone */}
      {input.milestoneName && (
        <div className="mt-5 flex items-center gap-1.5 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <Target className="h-3.5 w-3.5 shrink-0" />
          Supports:
          <span className="rounded border border-slate-100 bg-slate-50 px-2 py-0.5 font-medium text-slate-900">
            {input.milestoneName}
          </span>
        </div>
      )}

      {/* Permanent core notice */}
      {isCore && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-orange-100 pt-3 text-xs text-orange-800">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" />
          Permanent core input — targets remain editable.
        </div>
      )}
    </div>
  );
}
