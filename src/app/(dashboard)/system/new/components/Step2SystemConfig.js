"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Settings2, Calendar, Clock, Globe, Award, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useMemo } from "react";

const configSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  expirationDate: z.string().min(1, "Expiration date is required"),
  primaryDomain: z.string().min(2, "Select or define a primary domain"),
  description: z.string().optional(),
  timeZone: z.string().min(1, "Time zone is required"),
  preferredWeeklyReviewDay: z.string().min(1, "Weekly review day is required"),
  preferredDailyClosingTime: z.string().min(1, "Daily closing time is required"),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.expirationDate);
  return end > start;
}, {
  message: "Expiration date must be strictly after the start date.",
  path: ["expirationDate"],
});

const DOMAINS = [
  "Career & Business",
  "Software & Product Engineering",
  "Financial Mastery & Wealth",
  "Health, Fitness & Performance",
  "Creative Output & Authorship",
  "Academic & Cognitive Mastery",
  "Personal Transformation",
];

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Step2SystemConfig() {
  const { systemConfig, setSystemConfig, systemIdentity, setStep } = useSystemCreationStore();

  const { register, watch, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      startDate: systemConfig.startDate || new Date().toISOString().split('T')[0],
      expirationDate: systemConfig.expirationDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      primaryDomain: systemConfig.primaryDomain || "Career & Business",
      description: systemConfig.description || "",
      timeZone: systemConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      preferredWeeklyReviewDay: systemConfig.preferredWeeklyReviewDay || "Sunday",
      preferredDailyClosingTime: systemConfig.preferredDailyClosingTime || "21:00",
    },
  });

  const startDateWatch = watch("startDate");
  const expirationDateWatch = watch("expirationDate");

  const durationDays = useMemo(() => {
    if (!startDateWatch || !expirationDateWatch) return 0;
    const start = new Date(startDateWatch);
    const end = new Date(expirationDateWatch);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [startDateWatch, expirationDateWatch]);

  const durationWeeks = (durationDays / 7).toFixed(1);

  const onSubmit = (data) => {
    setSystemConfig(data);
    setStep(3);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Settings2 className="w-3.5 h-3.5" />
            Stage 2 of 12 — System Configuration & Lifecycle
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define System Lifecycle & Cadence</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Every operating system requires clear temporal boundaries. Once activated, its structure is locked until its expiration date to enforce operational discipline and prevent premature pivoting.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* System Active Name Indicator */}
        <div className="flex items-center justify-between p-4 bg-orange-50/60 rounded-xl border border-orange-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 block mb-0.5">Configuring OS</span>
            <span className="font-semibold text-gray-900 text-base">{systemIdentity.name || "Personal Operating System"}</span>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-white text-orange-700 rounded-md border border-orange-200">
            Locked on Activation
          </span>
        </div>

        {/* Temporal Bounds: Start Date & Expiration Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              Start Date
            </label>
            <p className="text-xs text-gray-500 mb-2">When this operating system begins active tracking.</p>
            <input
              type="date"
              {...register("startDate")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              Expiration Date (Lock Expiry)
            </label>
            <p className="text-xs text-gray-500 mb-2">System configuration remains immutable until this date.</p>
            <input
              type="date"
              {...register("expirationDate")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            />
            {errors.expirationDate && <p className="mt-1 text-xs text-red-500">{errors.expirationDate.message}</p>}
          </div>

          {/* Auto-calculated Duration Banner */}
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                OS
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Calculated System Duration</div>
                <div className="text-base font-bold text-gray-900">
                  {durationDays} Days <span className="text-sm font-normal text-gray-500">({durationWeeks} weeks / ~{(durationDays / 30).toFixed(1)} months)</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 max-w-xs text-right">
              Recommended: 90 days (1 quarter) to 365 days (1 year) for a standard operating sprint.
            </div>
          </div>
        </div>

        {/* Primary Domain & Operational Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Award className="w-4 h-4 text-orange-600" />
              Primary Domain / Area of Life
            </label>
            <p className="text-xs text-gray-500 mb-2">Select the primary theater of execution.</p>
            <select
              {...register("primaryDomain")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            >
              {DOMAINS.map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {errors.primaryDomain && <p className="mt-1 text-xs text-red-500">{errors.primaryDomain.message}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Globe className="w-4 h-4 text-orange-600" />
              Time Zone
            </label>
            <p className="text-xs text-gray-500 mb-2">Controls day cutoff and review schedules.</p>
            <input
              type="text"
              {...register("timeZone")}
              placeholder="e.g. America/New_York or UTC"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            />
            {errors.timeZone && <p className="mt-1 text-xs text-red-500">{errors.timeZone.message}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              Preferred Weekly Review Day
            </label>
            <p className="text-xs text-gray-500 mb-2">The designated day for deep audit and roadmap adjustment.</p>
            <select
              {...register("preferredWeeklyReviewDay")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            >
              {WEEKDAYS.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-1">
              <Clock className="w-4 h-4 text-orange-600" />
              Preferred Daily Closing Time
            </label>
            <p className="text-xs text-gray-500 mb-2">Target evening time to finalize ledger inputs.</p>
            <input
              type="time"
              {...register("preferredDailyClosingTime")}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              System Description (Optional)
            </label>
            <textarea
              rows={2}
              {...register("description")}
              placeholder="Optional high-level overview or operational notes for this version cycle."
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 outline-none text-sm resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Identity
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Goals & Success Criteria
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
