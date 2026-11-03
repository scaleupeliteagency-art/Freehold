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
  Flame,
  ShieldCheck,
  Zap,
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
      (input) => input.status !== "archived" && input.status !== "paused"
    );

    const coreInputs = activeInputs.filter(
      (input) => input.isCore === true || input.is_core === true
    );

    const additionalInputs = activeInputs.filter(
      (input) => input.isCore !== true && input.is_core !== true
    );

    let reachStretchCount = 0;
    let reachNormalCount = 0;
    let reachBadDayCount = 0;
    let belowBadDayCount = 0;

    const coreWithProgress = coreInputs.map((input) => {
      const actual = Number(input.actual || 0);
      const badDay = Number(
        input.badDayMinimum ??
        input.bad_day_minimum ??
        input.minimumTarget ??
        input.minimum ??
        0
      );
      const normal = Number(
        input.normalTarget ??
        input.normal_target ??
        input.normal ??
        input.target ??
        1
      );
      const stretch = Number(
        input.stretchTarget ??
        input.stretch_target ??
        input.stretch ??
        normal * 1.5
      );

      const isStretch = actual >= stretch && stretch > 0;
      const isNormal = actual >= normal && normal > 0;
      const isBadDay = actual >= badDay && badDay > 0;
      const isFailed = actual < badDay;

      if (isStretch) reachStretchCount++;
      if (isNormal) reachNormalCount++;
      if (isBadDay) reachBadDayCount++;
      if (isFailed) belowBadDayCount++;

      return {
        ...input,
        actual,
        badDay,
        normal,
        stretch,
        isStretch,
        isNormal,
        isBadDay,
        isFailed,
      };
    });

    // Exact Daily Classification Rules:
    // NORMAL SUCCESS: All three core inputs reach their normal targets.
    // BAD-DAY SUCCESS: All three reach bad-day minimums, but at least one does not reach normal target.
    // FAILED DAY: At least one core input falls below its bad-day minimum.
    let classification = "FAILED_DAY";
    let classificationLabel = "Failed Day";
    let classificationStyle = "bg-red-50 text-red-800 border-red-200";
    let ClassificationIcon = AlertTriangle;

    if (coreInputs.length >= 3) {
      if (reachNormalCount === 3) {
        if (reachStretchCount === 3) {
          classification = "STRETCH_SUCCESS";
          classificationLabel = "Stretch Target Achieved";
          classificationStyle = "bg-orange-500 text-white border-orange-600";
          ClassificationIcon = Flame;
        } else {
          classification = "NORMAL_SUCCESS";
          classificationLabel = "Normal Success";
          classificationStyle = "bg-emerald-600 text-white border-emerald-700";
          ClassificationIcon = CheckCircle2;
        }
      } else if (reachBadDayCount === 3) {
        classification = "BAD_DAY_SUCCESS";
        classificationLabel = "Bad-Day Success";
        classificationStyle = "bg-amber-500 text-white border-amber-600";
        ClassificationIcon = ShieldCheck;
      } else {
        classification = "FAILED_DAY";
        classificationLabel = "Failed Day (Core Minimum Not Reached)";
        classificationStyle = "bg-red-600 text-white border-red-700";
        ClassificationIcon = ShieldAlert;
      }
    }

    const failedCoreInputs = coreWithProgress.filter((inp) => inp.isFailed);

    return {
      activeInputs,
      coreInputs: coreWithProgress,
      additionalInputs,
      failedCoreInputs,
      classification,
      classificationLabel,
      classificationStyle,
      ClassificationIcon,
      isSuccess: classification !== "FAILED_DAY",
    };
  }, [inputs]);

  if (!isOpen) return null;

  const ClassificationIcon = analysis.ClassificationIcon;

  const handleConfirm = () => {
    onConfirm?.({
      note: note.trim(),
      outcomes: outcomes.trim(),
      score,
      classification: analysis.classification,
      classificationLabel: analysis.classificationLabel,
      closedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs">
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

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <ClipboardCheck className="h-7 w-7" />
          </div>

          <h2 id="close-day-title" className="text-2xl font-bold text-slate-900">
            Daily Execution Ledger Closing
          </h2>

          <p className="mt-1 text-xs text-slate-500 font-medium">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Daily Classification Card */}
        <div className="mb-6 rounded-2xl border p-4 text-center transition-all shadow-xs space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
            Today's Operating Classification
          </span>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${analysis.classificationStyle}`}>
            <ClassificationIcon className="h-4 w-4" />
            <span>{analysis.classificationLabel}</span>
          </div>

          <p className="text-xs text-slate-500 pt-1">
            {analysis.classification === "NORMAL_SUCCESS"
              ? "All three core inputs fulfilled standard normal targets."
              : analysis.classification === "BAD_DAY_SUCCESS"
              ? "Bad-day minimum floor maintained. Streak and baseline consistency protected."
              : analysis.classification === "STRETCH_SUCCESS"
              ? "Peak execution across all three non-negotiable inputs."
              : "One or more core inputs fell below bad-day minimums."}
          </p>
        </div>

        {/* Three Core Commitments Review */}
        <div className="mb-6 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Three Core Commitments
          </span>

          <div className="space-y-2">
            {analysis.coreInputs.map((inp) => (
              <div
                key={inp.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{inp.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    Recorded: {inp.actual} {inp.unit || ""} (Min: {inp.badDay} | Normal: {inp.normal})
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  inp.isNormal
                    ? "bg-emerald-100 text-emerald-800"
                    : inp.isBadDay
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {inp.isNormal ? "Normal Met" : inp.isBadDay ? "Bad-Day Met" : "Below Min"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reflection Notes */}
        <div className="mb-6 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Daily Debrief & Reflection
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What friction occurred? What will be improved tomorrow?"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Key Strategic Outcomes Achieved
            </label>
            <input
              type="text"
              value={outcomes}
              onChange={(e) => setOutcomes(e.target.value)}
              placeholder="Tangible progress made today..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Close Button */}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all"
          >
            Confirm & Close Day to Ledger
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel / Continue Execution
          </button>
        </div>
      </div>
    </div>
  );
}
