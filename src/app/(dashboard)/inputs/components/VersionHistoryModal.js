
"use client";

import { X, LockKeyhole, History, CalendarDays } from "lucide-react";

export default function VersionHistoryModal({
  isOpen,
  onClose,
  input,
  history = [],
}) {
  if (!isOpen || !input) return null;

  const isCore = input.isCore === true;

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTargets = (item) => ({
    minimum: item.minimumTarget ?? item.minimum,
    normal: item.normalTarget ?? item.normal ?? item.target,
    stretch: item.stretchTarget ?? item.stretch,
  });

  const renderTargets = (item) => {
    const targets = getTargets(item);

    if (!isCore) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="mb-1 block text-xs text-slate-500">
              Target
            </span>
            <span className="font-medium text-slate-900">
              {item.target ?? "—"} {item.unit || ""}
              {item.frequency ? ` / ${item.frequency}` : ""}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-xs text-slate-500">
              Weight
            </span>
            <span className="font-medium text-slate-900">
              {item.weight ?? "—"}%
            </span>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs text-slate-500">
              Minimum
            </span>
            <span className="font-semibold text-slate-900">
              {targets.minimum ?? "—"}
            </span>
          </div>

          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <span className="mb-1 block text-xs text-orange-700">
              Normal
            </span>
            <span className="font-semibold text-slate-900">
              {targets.normal ?? "—"}
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <span className="mb-1 block text-xs text-slate-500">
              Stretch
            </span>
            <span className="font-semibold text-slate-900">
              {targets.stretch ?? "—"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
          <div>
            <span className="mb-1 block text-xs text-slate-500">
              Frequency
            </span>
            <span className="font-medium text-slate-900">
              {item.frequency || "—"}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-xs text-slate-500">
              Weight
            </span>
            <span className="font-medium text-slate-900">
              {item.weight ?? "—"}%
            </span>
          </div>
        </div>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-orange-600/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="version-history-title"
        className="relative my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close version history"
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 pr-10">
          <div className="mb-2 flex items-center gap-2">
            <History className="h-5 w-5 text-orange-600" />

            <h2
              id="version-history-title"
              className="text-xl font-semibold text-slate-900"
            >
              Version History
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-500">{input.name}</p>

            {isCore && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800">
                <LockKeyhole className="h-3 w-3" />
                Permanent Core Input
              </span>
            )}
          </div>
        </div>

        {/* Core input notice */}
        {isCore && (
          <div className="mb-8 flex gap-3 rounded-xl border border-orange-100 bg-orange-50/70 p-4">
            <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />

            <p className="text-sm text-orange-900">
              This input is a permanent part of your system. Its targets and
              configuration can evolve, while its core identity should remain
              protected.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-7">
          {/* Current version */}
          <div className="relative border-l-2 border-orange-500 pl-5">
            <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-orange-600" />

            <h3 className="mb-1 text-sm font-semibold text-slate-900">
              Current Version
            </h3>

            <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(input.start_date)} → Present
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              {renderTargets(input)}

              {input.description && (
                <div className="mt-4 border-t border-slate-200 pt-3">
                  <span className="mb-1 block text-xs text-slate-500">
                    Description
                  </span>
                  <p className="text-sm text-slate-700">
                    {input.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Previous versions */}
          {history.map((version, index) => (
            <div
              key={version.id ?? `${version.start_date}-${index}`}
              className="relative border-l-2 border-slate-200 pl-5"
            >
              <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-white bg-slate-300" />

              <h3 className="mb-1 text-sm font-medium text-slate-700">
                Previous Version {history.length - index}
              </h3>

              <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(version.start_date)} →{" "}
                {formatDate(version.end_date)}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
                {renderTargets(version)}

                {version.description && (
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <span className="mb-1 block text-xs text-slate-500">
                      Description
                    </span>
                    <p className="text-sm text-slate-700">
                      {version.description}
                    </p>
                  </div>
                )}

                {version.change_reason && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <span className="mb-1 block text-xs text-slate-500">
                      Reason for Change
                    </span>
                    <p className="italic text-slate-700">
                      {version.change_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {history.length === 0 && (
            <div className="ml-5 rounded-xl border border-dashed border-slate-200 p-5 text-center">
              <History className="mx-auto mb-2 h-5 w-5 text-slate-400" />

              <p className="text-sm font-medium text-slate-700">
                No previous versions
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Previous versions will appear here when changes are saved to
                your version history.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
}
