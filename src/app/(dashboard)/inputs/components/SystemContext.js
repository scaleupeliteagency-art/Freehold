
"use client";

import { ChevronRight, LockKeyhole, Target } from "lucide-react";

export default function SystemContext({ context }) {
  if (!context) return null;

  const coreInputs = Array.isArray(context.coreInputs)
    ? context.coreInputs
    : [];

  const configuredCoreInputs = coreInputs.filter(
    (input) => input?.isCore && input?.name?.trim()
  ).length;

  const showCoreInputs = Array.isArray(context.coreInputs);

  const steps = [
    {
      label: context.northStar || "5-Year Goal",
      style: "bg-slate-50 border-slate-100 text-slate-500",
    },
    {
      label: context.yearPlan || "Current Year",
      style: "bg-slate-50 border-slate-100 text-slate-500",
    },
    {
      label: context.quarterObjective || "Quarter Objective",
      style: "bg-slate-50 border-slate-100 text-slate-500",
    },
    {
      label: context.currentRock || "Current Rock",
      style: "bg-white border-slate-200 text-slate-700 shadow-sm",
    },
    {
      label: context.currentMilestone || "Current Milestone",
      style:
        "bg-orange-50 border-orange-100 text-orange-600 font-semibold shadow-sm",
    },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Strategic hierarchy */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className={`rounded-md border px-2 py-1 ${step.style}`}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <ChevronRight className="h-3 w-3 shrink-0 text-slate-400" />
            )}
          </div>
        ))}
      </div>

      {/* Core inputs status */}
      {showCoreInputs && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
            configuredCoreInputs === 3
              ? "border-orange-100 bg-orange-50/60"
              : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-orange-100 bg-white">
              <LockKeyhole className="h-4 w-4 text-orange-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Core Inputs
              </p>

              <p className="text-xs text-slate-500">
                Your three permanent execution commitments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  className={`h-2 w-6 rounded-full ${
                    index < configuredCoreInputs
                      ? "bg-orange-500"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>

            <span className="text-xs font-semibold text-slate-700">
              {configuredCoreInputs}/3 configured
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
