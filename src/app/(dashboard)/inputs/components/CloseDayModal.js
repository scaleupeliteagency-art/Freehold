
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ClipboardCheck,
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";

export default function CloseDayModal({
  isOpen,
  onClose,
  score = 0,
  completedInputs = 0,
  totalInputs = 0,
  inputs = [],
  onConfirm,
}) {
  const [note, setNote] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfirmation(false);
      setAcknowledged(false);
      setNote("");
      setOutcomes("");
    }
  }, [isOpen]);

  const analysis = useMemo(() => {
    const activeInputs = inputs.filter(
      (input) =>
        input.status !== "archived" &&
        input.status !== "paused"
    );

    const coreInputs = activeInputs.filter(
      (input) => input.isCore === true
    );

    const additionalInputs = activeInputs.filter(
      (input) => input.isCore !== true
    );

    const getProgress = (input) => {
      const actual = Number(input.actual ?? 0);
      const target = Number(
        input.target ?? input.normalTarget ?? input.normal ?? 0
      );

      if (target <= 0) {
        return {
          actual,
          target,
          percentage: actual > 0 ? 100 : 0,
          complete: actual > 0,
          hasTarget: false,
        };
      }

      return {
        actual,
        target,
        percentage: Math.min(100, Math.round((actual / target) * 100)),
        complete: actual >= target,
        hasTarget: true,
      };
    };

    const enrichedInputs = activeInputs.map((input) => ({
      ...input,
      ...getProgress(input),
    }));

    const incompleteCoreInputs = enrichedInputs.filter(
      (input) => input.isCore === true && !input.complete
    );

    const incompleteAdditionalInputs = enrichedInputs.filter(
      (input) => input.isCore !== true && !input.complete
    );

    const missingCoreSlots = Math.max(0, 3 - coreInputs.length);

    return {
      activeInputs,
      coreInputs,
      additionalInputs,
      incompleteCoreInputs,
      incompleteAdditionalInputs,
      missingCoreSlots,
      incompleteInputs: [
        ...incompleteCoreInputs,
        ...incompleteAdditionalInputs,
      ],
      allComplete:
        incompleteCoreInputs.length === 0 &&
        incompleteAdditionalInputs.length === 0 &&
        missingCoreSlots === 0,
    };
  }, [inputs]);

  if (!isOpen) return null;

  const hasInputDetails = inputs.length > 0;
  const hasIncompleteWork = hasInputDetails
    ? !analysis.allComplete
    : completedInputs < totalInputs;

  const incompleteCount = hasInputDetails
    ? analysis.incompleteInputs.length + analysis.missingCoreSlots
    : Math.max(0, totalInputs - completedInputs);

  const handleCloseRequest = () => {
    setShowConfirmation(true);
    setAcknowledged(false);
  };

  const handleBack = () => {
    setShowConfirmation(false);
    setAcknowledged(false);
  };

  const handleConfirm = () => {
    onConfirm?.({
      note: note.trim(),
      outcomes: outcomes.trim(),
      score,
      completedInputs,
      totalInputs,
      incompleteInputs: analysis.incompleteInputs.map((input) => ({
        id: input.id,
        name: input.name || "Unnamed input",
        isCore: input.isCore === true,
        actual: input.actual,
        target: input.target,
        percentage: input.percentage,
      })),
      missingCoreSlots: analysis.missingCoreSlots,
      confirmedWithIncompleteWork: hasIncompleteWork,
      closedAt: new Date().toISOString(),
    });
  };

  const formatValue = (value) =>
    Number.isInteger(value) ? value : Number(value.toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="close-day-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-5 w-5" />
        </button>

        {!showConfirmation ? (
          <>
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50">
                <ClipboardCheck className="h-7 w-7 text-orange-600" />
              </div>

              <h2
                id="close-day-title"
                className="text-2xl font-semibold text-slate-900"
              >
                Review your day
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm text-slate-600">
                Review your execution before closing the day. Unfinished work
                will be identified before you confirm.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Execution score
                </p>
                <p className="text-3xl font-semibold text-slate-900">
                  {Number(score) || 0}%
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Inputs completed
                </p>
                <p className="text-3xl font-semibold text-slate-900">
                  {completedInputs}
                  <span className="text-lg text-slate-400">
                    {" "}/ {totalInputs}
                  </span>
                </p>
              </div>
            </div>

            {hasIncompleteWork ? (
              <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                  <div className="min-w-0">
                    <h3 className="font-semibold text-amber-900">
                      Incomplete execution detected
                    </h3>

                    <p className="mt-1 text-sm text-amber-800">
                      {incompleteCount} unfinished{" "}
                      {incompleteCount === 1 ? "item" : "items"} detected.
                      Review the list before deciding to close the day.
                    </p>
                  </div>
                </div>

                {analysis.missingCoreSlots > 0 && (
                  <div className="mt-4 rounded-lg border border-red-200 bg-white p-3">
                    <p className="flex items-center gap-2 text-sm font-semibold text-red-700">
                      <ShieldAlert className="h-4 w-4 shrink-0" />
                      {analysis.missingCoreSlots} core input
                      {analysis.missingCoreSlots === 1 ? "" : "s"} missing
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      The system should have exactly three permanent core
                      inputs. Verify the saved input configuration.
                    </p>
                  </div>
                )}

                {hasInputDetails && analysis.incompleteInputs.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {analysis.incompleteInputs.map((input) => (
                      <div
                        key={input.id}
                        className="flex items-start justify-between gap-3 rounded-lg border border-amber-100 bg-white p-3"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="break-words text-sm font-medium text-slate-800">
                              {input.name || "Unnamed input"}
                            </p>

                            {input.isCore && (
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-800">
                                Core
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {input.hasTarget
                              ? `${formatValue(input.actual)} / ${formatValue(input.target)}`
                              : "No valid target configured"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">
                          {input.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {!hasInputDetails && (
                  <p className="mt-3 text-xs text-amber-800">
                    Detailed input names cannot be checked because the
                    <code className="mx-1">inputs</code>
                    prop was not provided. This warning uses the completion
                    counts only.
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    All tracked inputs are complete
                  </p>
                  <p className="mt-1 text-sm text-green-800">
                    Review your outcomes and notes, then proceed to confirmation.
                  </p>
                </div>
              </div>
            )}

            <div className="mb-6 space-y-4">
              <div>
                <label
                  htmlFor="close-day-outcomes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Key outcomes <span className="text-slate-400">(optional)</span>
                </label>

                <input
                  id="close-day-outcomes"
                  type="text"
                  value={outcomes}
                  onChange={(event) => setOutcomes(event.target.value)}
                  placeholder="e.g. 2 sales calls completed"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="close-day-note"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Daily note <span className="text-slate-400">(optional)</span>
                </label>

                <textarea
                  id="close-day-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What happened today? What needs to change tomorrow?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseRequest}
              className="w-full rounded-full bg-orange-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
            >
              Review & Continue
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <div
                className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                  hasIncompleteWork ? "bg-amber-100" : "bg-green-100"
                }`}
              >
                {hasIncompleteWork ? (
                  <AlertCircle className="h-7 w-7 text-amber-700" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-green-700" />
                )}
              </div>

              <h2
                id="close-day-title"
                className="text-2xl font-semibold text-slate-900"
              >
                Confirm day closure
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                {hasIncompleteWork
                  ? "Some execution targets remain unfinished. You can go back to continue working or explicitly confirm closure with incomplete work."
                  : "Your tracked execution is complete. Confirm that you want to close this day."}
              </p>
            </div>

            {hasIncompleteWork && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">
                  Before you confirm
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  Closing the day should record the actual result, not imply
                  that unfinished targets were completed. Your completion
                  report will identify the outstanding work.
                </p>

                <label className="mt-4 flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-amber-400 accent-orange-600"
                  />
                  <span className="text-sm text-amber-950">
                    I have reviewed the incomplete work and want to close the
                    day with these items unfinished.
                  </span>
                </label>
              </div>
            )}

            <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Execution score</span>
                <span className="font-semibold text-slate-900">
                  {Number(score) || 0}%
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span className="text-slate-500">Inputs completed</span>
                <span className="font-semibold text-slate-900">
                  {completedInputs} / {totalInputs}
                </span>
              </div>

              {hasIncompleteWork && (
                <div className="mt-3 flex justify-between gap-3 border-t border-slate-200 pt-3 text-sm">
                  <span className="text-amber-800">Items outstanding</span>
                  <span className="font-semibold text-amber-800">
                    {incompleteCount}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={hasIncompleteWork && !acknowledged}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-orange-600 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm & close day
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
