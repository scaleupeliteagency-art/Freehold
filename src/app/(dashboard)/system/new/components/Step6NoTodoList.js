"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Ban, ShieldAlert, AlertTriangle, Plus, Trash2, ArrowLeft, ArrowRight, Smartphone, Globe, BatteryLow, CheckCircle2 } from "lucide-react";

export default function Step6NoTodoList() {
  const { noTodoList, setNoTodoList, setStep } = useSystemCreationStore();

  const defaultValues = {
    rules: noTodoList?.rules?.length ? noTodoList.rules : [
      {
        name: "No social media or feed scrolling before core commitments",
        description: "Zero algorithmic entertainment or feeds until all 3 daily core inputs are completed.",
        reason: "Protects dopamine baseline and mental clarity during peak morning hours.",
        situation: "Morning until all 3 Core Inputs are completed",
        violation: "Opening Twitter/X, Instagram, YouTube Shorts, or Reddit",
        recoveryAction: "Step away from screen for 10 minutes, do 20 pushups, and re-enter focus session.",
      },
      {
        name: "No unscheduled meetings or reactive calls",
        description: "Refuse calls or ad-hoc syncs that interrupt dedicated deep work blocks.",
        reason: "Context switching ruins cognitive velocity.",
        situation: "Focus blocks and peak execution windows",
        violation: "Accepting an unscheduled non-emergency call during deep work",
        recoveryAction: "Politely reschedule to afternoon administrative block.",
      },
    ],
    restrictedAppsText: (noTodoList?.restrictedApps || ["Twitter / X", "YouTube", "Reddit", "Instagram"]).join(", "),
    restrictedWebsitesText: (noTodoList?.restrictedWebsites || ["news.ycombinator.com", "reddit.com", "x.com", "youtube.com"]).join(", "),
    distractionSources: noTodoList?.distractionSources || "Group chats, phone notifications on desk, multi-tab browsing without intent",
    energyDrainingHabits: noTodoList?.energyDrainingHabits || "Late-night screen use after 22:30, skipping meal prep, multi-tasking",
    permittedAfterCommitments: noTodoList?.permittedAfterCommitments || "Casual browsing, gaming, social messaging allowed strictly after Daily Closing",
  };

  const { register, control, handleSubmit } = useForm({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const onSubmit = (data) => {
    const formatted = {
      rules: data.rules,
      restrictedApps: data.restrictedAppsText.split(",").map((s) => s.trim()).filter(Boolean),
      restrictedWebsites: data.restrictedWebsitesText.split(",").map((s) => s.trim()).filter(Boolean),
      distractionSources: data.distractionSources,
      energyDrainingHabits: data.energyDrainingHabits,
      permittedAfterCommitments: data.permittedAfterCommitments,
    };
    setNoTodoList(formatted);
    setStep(7);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 mb-3">
            <Ban className="w-3.5 h-3.5" />
            Stage 6 of 12 — No-To-Do List & Negative Constraints
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define Prohibited Behaviors & Traps</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            High performance is as much about subtraction as addition. Define the destructive habits, distraction traps, and violations you commit to eliminating throughout this cycle.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Prohibited Rules Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="text-base font-bold text-gray-900">Prohibited Rules & Recovery Protocols</h3>
            </div>
            <button
              type="button"
              onClick={() => append({
                name: "",
                description: "",
                reason: "",
                situation: "",
                violation: "",
                recoveryAction: "",
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 transition-colors border border-red-200"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Prohibited Rule
            </button>
          </div>

          <div className="space-y-6">
            {fields.map((rule, index) => (
              <div key={rule.id} className="bg-white rounded-xl border border-red-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />

                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5" /> Rule #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Rule
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rule Name</label>
                    <input
                      type="text"
                      {...register(`rules.${index}.name`, { required: true })}
                      placeholder="e.g. No social media during deep work blocks"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Underlying Reason</label>
                    <input
                      type="text"
                      {...register(`rules.${index}.reason`)}
                      placeholder="Why does this rule exist? (e.g. Protect dopamine & cognitive energy)"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Applicable Situation / Window</label>
                    <input
                      type="text"
                      {...register(`rules.${index}.situation`)}
                      placeholder="e.g. 08:00 - 14:00 or until all core inputs are closed"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">What Constitutes a Violation?</label>
                    <input
                      type="text"
                      {...register(`rules.${index}.violation`)}
                      placeholder="e.g. Opening Twitter or YouTube on phone or browser"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mandatory Recovery Action</label>
                    <input
                      type="text"
                      {...register(`rules.${index}.recoveryAction`)}
                      placeholder="e.g. 10 min cold walk + log incident in notes + re-enter deep work"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Distraction & Device Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Smartphone className="w-4 h-4 text-red-600" />
              Restricted Apps (Comma-separated)
            </label>
            <p className="text-xs text-gray-500 mb-2">Apps to remove from home screen or lock behind app blockers.</p>
            <input
              type="text"
              {...register("restrictedAppsText")}
              placeholder="e.g. Instagram, TikTok, YouTube, Reddit, Games"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Globe className="w-4 h-4 text-red-600" />
              Restricted Websites (Comma-separated)
            </label>
            <p className="text-xs text-gray-500 mb-2">Websites blocked on computer hosts during focus hours.</p>
            <input
              type="text"
              {...register("restrictedWebsitesText")}
              placeholder="e.g. x.com, reddit.com, news.ycombinator.com"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Primary Distraction Sources
            </label>
            <p className="text-xs text-gray-500 mb-2">Identify the most common traps you fall into.</p>
            <input
              type="text"
              {...register("distractionSources")}
              placeholder="e.g. Group chats, checking metrics every 15 minutes, snack breaks"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <BatteryLow className="w-4 h-4 text-red-600" />
              Energy-Draining Habits
            </label>
            <p className="text-xs text-gray-500 mb-2">Behaviors that sap physical and cognitive endurance.</p>
            <input
              type="text"
              {...register("energyDrainingHabits")}
              placeholder="e.g. Staying up past 23:00, heavy processed lunches, zero hydration"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none"
            />
          </div>

          <div className="md:col-span-2 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Permitted After Commitments Fulfilled
            </label>
            <p className="text-xs text-emerald-700 mb-2">
              Activities permissible strictly after all 3 core inputs are complete and daily closing has taken place.
            </p>
            <input
              type="text"
              {...register("permittedAfterCommitments")}
              placeholder="e.g. Casual gaming, watching series, checking personal social channels"
              className="w-full rounded-lg border border-emerald-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(5)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inputs
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Focus Architecture
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
