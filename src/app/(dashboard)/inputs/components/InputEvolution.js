
"use client";

import {
  AlertTriangle,
  ArrowUpCircle,
  LockKeyhole,
  Target,
} from "lucide-react";

export default function InputEvolution({ inputs = [], onEdit }) {
  const normalizedInputs = inputs.map((input) => {
    const target = Number(
      input.target ?? input.normalTarget ?? input.normal ?? 0
    );
    const actual = Number(input.actual ?? 0);

    return {
      ...input,
      target,
      actual,
      isCore: input.isCore === true,
      minimumTarget: input.minimumTarget ?? input.minimum,
      normalTarget: input.normalTarget ?? input.normal ?? target,
      stretchTarget: input.stretchTarget ?? input.stretch,
    };
  });

  const overperforming = normalizedInputs.filter(
    (input) => input.actual >= input.target && input.actual > 0
  );

  const underperforming = normalizedInputs.filter(
    (input) =>
      input.target > 0 &&
      input.actual / input.target < 0.5
  );

  if (overperforming.length === 0 && underperforming.length === 0) {
    return null;
  }

  const renderTargets = (input) => (
    <>
      {input.isCore && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-100 bg-white p-2">
            <p className="text-xs text-slate-500">Minimum</p>
            <p className="mt-1 font-semibold text-slate-900">
              {input.minimumTarget ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-2">
            <p className="text-xs text-orange-700">Normal</p>
            <p className="mt-1 font-semibold text-slate-900">
              {input.normalTarget ?? "—"}
            </p>
          </div>

          <div className="rounded-lg border border-slate-100 bg-white p-2">
            <p className="text-xs text-slate-500">Stretch</p>
            <p className="mt-1 font-semibold text-slate-900">
              {input.stretchTarget ?? "—"}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
        <div className="rounded-md bg-slate-50 px-2.5 py-1 text-slate-700">
          Target: {input.target} {input.unit || ""}
        </div>

        <div className="rounded-md bg-slate-50 px-2.5 py-1 text-slate-700">
          Actual: {input.actual} {input.unit || ""}
        </div>

        {input.frequency && (
          <div className="rounded-md bg-slate-50 px-2.5 py-1 text-slate-700">
            {input.frequency}
          </div>
        )}
      </div>
    </>
  );

  const renderHeader = (input) => (
    <div className="mb-1 flex flex-wrap items-center gap-2">
      <h3 className="text-sm font-semibold text-slate-900">
        {input.name}
      </h3>

      {input.isCore && (
        <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-800">
          <LockKeyhole className="h-3 w-3" />
          Core
        </span>
      )}
    </div>
  );

  return (
    <section className="mb-12">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Input Evolution
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Review inputs that may need a target adjustment or an investigation
          into execution friction.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Inputs exceeding their targets */}
        {overperforming.map((input) => (
          <article
            key={input.id}
            className="relative overflow-hidden rounded-xl border border-green-100 bg-white/90 p-5 shadow-sm backdrop-blur-xl"
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-green-500" />

            <ArrowUpCircle className="absolute right-6 top-5 h-5 w-5 text-green-500" />

            <div className="mb-4 max-w-[85%]">
              {renderHeader(input)}

              <p className="mt-2 text-sm text-slate-500">
                You have met or exceeded this target. Review whether the
                current target still represents an appropriate challenge.
              </p>
            </div>

            {renderTargets(input)}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(input)}
                className="inline-flex items-center gap-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700"
              >
                Upgrade Target
                <span aria-hidden="true">→</span>
              </button>
            )}

            {input.isCore && (
              <p className="mt-3 flex items-center gap-1.5 border-t border-green-100 pt-3 text-xs text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5 text-orange-600" />
                Core input remains permanent; only its settings can change.
              </p>
            )}
          </article>
        ))}

        {/* Inputs falling below their targets */}
        {underperforming.map((input) => (
          <article
            key={input.id}
            className="relative overflow-hidden rounded-xl border border-red-100 bg-white/90 p-5 shadow-sm backdrop-blur-xl"
          >
            <div className="absolute right-0 top-0 h-full w-2 bg-red-500" />

            <AlertTriangle className="absolute right-6 top-5 h-5 w-5 text-red-500" />

            <div className="mb-4 max-w-[85%]">
              {renderHeader(input)}

              <p className="mt-2 text-sm text-slate-500">
                Performance is below 50% of the target. Investigate the
                obstacle before changing the target.
              </p>
            </div>

            {renderTargets(input)}

            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(input)}
                className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition-colors hover:text-red-700"
              >
                Investigate Friction
                <span aria-hidden="true">→</span>
              </button>
            )}

            {input.isCore && (
              <p className="mt-3 flex items-center gap-1.5 border-t border-red-100 pt-3 text-xs text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5 text-orange-600" />
                Investigate execution friction without removing this core input.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
