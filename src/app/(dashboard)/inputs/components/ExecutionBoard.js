
"use client";

import { LockKeyhole, Target, AlertTriangle } from "lucide-react";
import InputCard from "./InputCard";

export default function ExecutionBoard({
  inputs = [],
  onUpdate,
  onEdit,
  onViewHistory,
}) {
  // Core inputs remain visible regardless of status.
  const coreInputs = inputs.filter((input) => input.isCore === true);

  // Additional inputs follow normal status rules.
  const additionalInputs = inputs.filter(
    (input) =>
      input.isCore !== true &&
      input.status !== "archived" &&
      input.status !== "paused"
  );

  // Core inputs are always included in the board's active count.
  const activeInputs = inputs.filter(
    (input) =>
      input.isCore === true ||
      (input.status !== "archived" && input.status !== "paused")
  );

  const missingCoreCount = Math.max(0, 3 - coreInputs.length);

  const renderInputCards = (items) => (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
      {items.map((input) => (
        <InputCard
          key={input.id}
          input={input}
          onUpdate={onUpdate}
          onEdit={onEdit}
          onViewHistory={onViewHistory}
        />
      ))}
    </div>
  );

  return (
    <section className="mb-12">
      {/* Board heading */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today's Execution
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Track your daily execution against your operational targets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600">
            {activeInputs.length} active{" "}
            {activeInputs.length === 1 ? "input" : "inputs"}
          </span>

          <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-800">
            <LockKeyhole className="h-3.5 w-3.5" />
            {coreInputs.length}/3 core inputs
          </span>
        </div>
      </div>

      {/* Empty state */}
      {activeInputs.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-12 text-center">
          <Target className="mx-auto mb-3 h-7 w-7 text-slate-400" />

          <p className="text-sm font-medium text-slate-700">
            No active inputs found.
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add operational inputs to start tracking execution.
          </p>
        </div>
      )}

      {/* Permanent core inputs */}
      <div className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
              <LockKeyhole className="h-4 w-4 text-orange-600" />
              Core Inputs
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Your three permanent execution commitments. Targets can evolve;
              core inputs cannot be removed, paused, or archived.
            </p>
          </div>

          <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800">
            {coreInputs.length} found
          </span>
        </div>

        {coreInputs.length > 0 && renderInputCards(coreInputs)}

        {/* Missing core inputs warning */}
        {missingCoreCount > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

            <div>
              <p className="text-sm font-semibold text-amber-900">
                {missingCoreCount} core{" "}
                {missingCoreCount === 1 ? "input is" : "inputs are"} missing
              </p>

              <p className="mt-1 text-sm text-amber-800">
                The board received {coreInputs.length} input
                {coreInputs.length === 1 ? "" : "s"} marked with{" "}
                <code>isCore: true</code>. Check the saved input data and the
                code that loads it. Do not create duplicates until the source
                of the missing inputs is identified.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Additional inputs */}
      {additionalInputs.length > 0 && (
        <div>
          <div className="mb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Additional Inputs
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Supporting activities that can be adjusted as your strategy
              changes.
            </p>
          </div>

          {renderInputCards(additionalInputs)}
        </div>
      )}
    </section>
  );
}
