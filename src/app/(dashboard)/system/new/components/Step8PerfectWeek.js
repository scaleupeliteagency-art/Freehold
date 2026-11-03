"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Calendar, Clock, Plus, Trash2, ArrowLeft, ArrowRight, ShieldCheck, Zap } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const CATEGORIES = ["Deep Work", "Priority Activity", "Administrative", "Learning", "Training / Physical", "Recovery / Review"];

export default function Step8PerfectWeek() {
  const { perfectWeek, setPerfectWeek, setStep } = useSystemCreationStore();

  const defaultValues = {
    workingDays: perfectWeek?.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workingHours: perfectWeek?.workingHours || "08:30 - 18:00",
    blocks: perfectWeek?.blocks?.length ? perfectWeek.blocks : [
      { id: "b1", title: "Morning Deep Work Block (Core Input #1)", day: "Monday", startTime: "08:30", endTime: "11:00", category: "Deep Work", description: "First energy allocated to top strategic input" },
      { id: "b2", title: "Priority Execution (Core Input #2)", day: "Monday", startTime: "11:30", endTime: "13:00", category: "Priority Activity", description: "Direct project momentum" },
      { id: "b3", title: "Administrative Batching & Comms", day: "Monday", startTime: "14:00", endTime: "15:00", category: "Administrative", description: "Consolidated emails and messages" },
      { id: "b4", title: "Secondary Deep Work Block", day: "Monday", startTime: "15:30", endTime: "17:30", category: "Deep Work", description: "Core Input #3 and secondary tasks" },
      { id: "b5", title: "Daily Review & System Closing", day: "Monday", startTime: "17:30", endTime: "18:00", category: "Recovery / Review", description: "Ledger closure and daily debrief" },
    ],
    firstProductiveHours: perfectWeek?.priorityRules?.firstProductiveHours || "Core Input #1 receives the first uninterrupted 90-120 minutes of biological peak energy.",
    beforeAdmin: perfectWeek?.priorityRules?.beforeAdmin || "At least two core inputs must reach Normal Target before opening inbox, slack, or social media.",
    batchingRule: perfectWeek?.priorityRules?.batchingRule || "Batch all administrative requests into a single 60-minute window in the afternoon.",
    protectedActivities: perfectWeek?.priorityRules?.protectedActivities || "Morning deep work sessions are strictly protected from all internal/external meetings.",
  };

  const { register, control, handleSubmit } = useForm({
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "blocks",
  });

  const onSubmit = (data) => {
    setPerfectWeek({
      workingDays: data.workingDays,
      workingHours: data.workingHours,
      blocks: data.blocks,
      priorityRules: {
        firstProductiveHours: data.firstProductiveHours,
        beforeAdmin: data.beforeAdmin,
        batchingRule: data.batchingRule,
        protectedActivities: data.protectedActivities,
      },
    });
    setStep(9);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Calendar className="w-3.5 h-3.5" />
            Stage 8 of 12 — The Perfect Week Operating Rhythm
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Establish Your Ideal Weekly Cadence</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Do not leave execution to reactive chance. Schedule your recurring deep-work blocks, operational windows, and clear priority sequence rules without micro-managing every minute.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Working Cadence Overview */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Standard Operating Hours</label>
            <input
              type="text"
              {...register("workingHours")}
              placeholder="e.g. 08:30 - 18:00"
              className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Active Execution Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <label key={day} className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100">
                  <input
                    type="checkbox"
                    value={day}
                    {...register("workingDays")}
                    className="rounded text-orange-600 focus:ring-orange-500"
                  />
                  {day.slice(0, 3)}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Sequencing Rules */}
        <div className="bg-orange-50/60 p-6 rounded-xl border border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">Execution Priority Rules</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                What receives the first productive hours?
              </label>
              <input
                type="text"
                {...register("firstProductiveHours")}
                className="w-full rounded-lg border border-orange-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                What must be completed before administrative tasks?
              </label>
              <input
                type="text"
                {...register("beforeAdmin")}
                className="w-full rounded-lg border border-orange-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Which activities must be batched together?
              </label>
              <input
                type="text"
                {...register("batchingRule")}
                className="w-full rounded-lg border border-orange-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Which activities are strictly protected from interruptions?
              </label>
              <input
                type="text"
                {...register("protectedActivities")}
                className="w-full rounded-lg border border-orange-200 px-3.5 py-2 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Weekly Recurring Time Blocks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-700" />
              Key Recurring Weekly Time Blocks
            </h3>
            <button
              type="button"
              onClick={() => append({
                id: `b-${Date.now()}`,
                title: "",
                day: "Monday",
                startTime: "09:00",
                endTime: "10:30",
                category: "Deep Work",
                description: "",
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Time Block
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((block, idx) => (
              <div key={block.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    {...register(`blocks.${idx}.title`, { required: true })}
                    placeholder="Block Title (e.g. Deep Work Block #1)"
                    className="w-full text-sm font-semibold text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 outline-none focus:border-orange-500"
                  />
                </div>

                <div className="w-32">
                  <select
                    {...register(`blocks.${idx}.category`)}
                    className="w-full text-xs font-medium border border-gray-200 rounded px-2 py-2 bg-white text-gray-800 outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <select
                    {...register(`blocks.${idx}.day`)}
                    className="w-full text-xs font-medium border border-gray-200 rounded px-2 py-2 bg-white text-gray-800 outline-none"
                  >
                    <option value="All Weekdays">All Weekdays</option>
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    {...register(`blocks.${idx}.startTime`)}
                    className="text-xs font-semibold border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-900 outline-none"
                  />
                  <span className="text-xs text-gray-400">—</span>
                  <input
                    type="time"
                    {...register(`blocks.${idx}.endTime`)}
                    className="text-xs font-semibold border border-gray-200 rounded px-2 py-1.5 bg-white text-gray-900 outline-none"
                  />
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(7)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Focus
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Accountability & Pressure
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
