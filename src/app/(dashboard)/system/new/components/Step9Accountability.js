"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { ShieldAlert, Clock, Calendar, CheckSquare, Plus, Trash2, ArrowLeft, ArrowRight, RotateCcw, AlertTriangle } from "lucide-react";

export default function Step9Accountability() {
  const { accountability, setAccountability, setStep } = useSystemCreationStore();

  const defaultValues = {
    dailyClosingTime: accountability?.dailyClosingTime || "21:00",
    dailyReflectionQuestions: accountability?.dailyReflectionQuestions?.length
      ? accountability.dailyReflectionQuestions
      : [
          "Did I fulfill all three non-negotiable core inputs today?",
          "What friction, distraction, or fatigue slowed down my velocity?",
          "What concrete correction will I make tomorrow morning?",
        ],
    trackObstacles: accountability?.trackObstacles ?? true,
    trackFailureReasons: accountability?.trackFailureReasons ?? true,
    weeklyReviewDay: accountability?.weeklyReviewDay || "Sunday",
    weeklyReviewTime: accountability?.weeklyReviewTime || "17:00",
    weeklyPerformanceObjective: accountability?.weeklyPerformanceObjective || "Achieve at least 6 Normal Success days out of 7 with 100% Core Input completion.",
    weeklyReviewQuestions: accountability?.weeklyReviewQuestions?.length
      ? accountability.weeklyReviewQuestions
      : [
          "Which Weekly Milestone advanced closest to completion?",
          "Did I honor my No-To-Do commitments and environmental boundaries?",
          "What operational friction needs to be eliminated or accelerated next week?",
        ],
    accountabilityPartner: accountability?.accountabilityPartner || "",
    commitmentStatement: accountability?.commitmentStatement || "I commit to executing my 3 core inputs daily and closing my ledger every evening without excuses.",
    safeConsequences: accountability?.safeConsequences || "Donate $25 to a non-profit or perform 50 burpees next morning if I have an unexcused failed day.",
    recoveryAction: accountability?.recoveryAction || "Start the next morning immediately with 45 minutes on Core Input #1 before checking phone or email.",
  };

  const { register, control, handleSubmit } = useForm({
    defaultValues,
  });

  const { fields: dailyQFields, append: appendDailyQ, remove: removeDailyQ } = useFieldArray({
    control,
    name: "dailyReflectionQuestions",
  });

  const { fields: weeklyQFields, append: appendWeeklyQ, remove: removeWeeklyQ } = useFieldArray({
    control,
    name: "weeklyReviewQuestions",
  });

  const onSubmit = (data) => {
    setAccountability({
      dailyClosingTime: data.dailyClosingTime,
      dailyReflectionQuestions: data.dailyReflectionQuestions,
      trackObstacles: data.trackObstacles,
      trackFailureReasons: data.trackFailureReasons,
      weeklyReviewDay: data.weeklyReviewDay,
      weeklyReviewTime: data.weeklyReviewTime,
      weeklyPerformanceObjective: data.weeklyPerformanceObjective,
      weeklyReviewQuestions: data.weeklyReviewQuestions,
      accountabilityPartner: data.accountabilityPartner,
      commitmentStatement: data.commitmentStatement,
      safeConsequences: data.safeConsequences,
      recoveryAction: data.recoveryAction,
    });
    setStep(10);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            Stage 9 of 12 — Accountability, Pressure & Recovery
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define Accountability Loops & Pressure Mechanisms</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Commitment without consequences evaporates under pressure. Set your daily closing cadence, weekly audit questions, positive pressure mechanisms, and rapid recovery protocol.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Recovery Protocol Callout */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-5 h-5 text-orange-200" />
            <h3 className="text-base font-bold">The Immediate Recovery Protocol</h3>
          </div>
          <p className="text-xs text-orange-100 mb-3">
            "If I experience a Failed Day, what is the first concrete, non-negotiable action I must take the following day?"
          </p>
          <input
            type="text"
            {...register("recoveryAction", { required: true })}
            placeholder="e.g. Start the day with 45 minutes on Core Input #1 before opening any communication channel."
            className="w-full rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 text-white placeholder-orange-200 text-sm font-medium outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        {/* Daily Accountability Cadence */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-bold text-gray-900">1. Daily Ledger Closing Cadence</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Closing Cutoff:</span>
              <input
                type="time"
                {...register("dailyClosingTime")}
                className="text-xs font-bold border border-gray-200 rounded px-2.5 py-1 text-gray-900 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Daily Reflection Questions (Logged in Close Day Modal)</label>
              <button
                type="button"
                onClick={() => appendDailyQ("")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {dailyQFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                <input
                  type="text"
                  {...register(`dailyReflectionQuestions.${idx}`)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
                />
                {dailyQFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDailyQ(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                {...register("trackObstacles")}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              Require obstacle tracking on incomplete days
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                {...register("trackFailureReasons")}
                className="rounded text-orange-600 focus:ring-orange-500"
              />
              Require failure reason logging if core inputs fall below Bad-Day floor
            </label>
          </div>
        </div>

        {/* Weekly Accountability */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-base font-bold text-gray-900">2. Weekly Strategic Audit</h3>
            </div>
            <div className="flex items-center gap-3">
              <select
                {...register("weeklyReviewDay")}
                className="text-xs font-bold border border-gray-200 rounded px-2.5 py-1 bg-white text-gray-900 outline-none"
              >
                {["Sunday", "Saturday", "Friday", "Monday"].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                {...register("weeklyReviewTime")}
                className="text-xs font-bold border border-gray-200 rounded px-2 py-1 text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Weekly Performance Objective</label>
            <input
              type="text"
              {...register("weeklyPerformanceObjective")}
              placeholder="e.g. 6 of 7 Normal Success days and complete Milestone W1"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">Weekly Review Questions</label>
              <button
                type="button"
                onClick={() => appendWeeklyQ("")}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>

            {weeklyQFields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
                <input
                  type="text"
                  {...register(`weeklyReviewQuestions.${idx}`)}
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
                />
                {weeklyQFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWeeklyQ(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pressure Mechanisms & Commitments */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">3. Pressure Mechanisms & Consequences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Personal Commitment Statement</label>
              <input
                type="text"
                {...register("commitmentStatement")}
                placeholder="e.g. I commit to executing my 3 core inputs daily and closing my ledger every evening without excuses."
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Accountability Partner / Observer (Optional)
              </label>
              <input
                type="text"
                {...register("accountabilityPartner")}
                placeholder="e.g. Mentor name or peer email (receives weekly digest)"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Safe, Constructive Consequence
              </label>
              <input
                type="text"
                {...register("safeConsequences")}
                placeholder="e.g. $25 charitable donation or 50 burpees next morning"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(8)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Perfect Week
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Gamification Configuration
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
