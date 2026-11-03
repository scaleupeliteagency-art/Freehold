"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Target, Star, Plus, X, ArrowLeft, ArrowRight, HelpCircle } from "lucide-react";
import { useEffect } from "react";

const goalSchema = z.object({
  systemSuccessOutcome: z.string().min(10, "Define the measurable outcome that makes this system successful by expiration."),
  primary: z.object({
    name: z.string().min(2, "Primary North Star Goal name is required"),
    description: z.string().optional(),
    baseline: z.coerce.number(),
    target: z.coerce.number(),
    unit: z.string().min(1, "Measurement unit is required (e.g., USD, users, kg, hrs)"),
    deadline: z.string().min(1, "Deadline is required"),
    weight: z.coerce.number().min(1).max(100),
    direction: z.enum(["HIGHER", "LOWER", "MAINTAIN"]),
    successCriteria: z.string().min(5, "Measurable success criteria is required"),
  }),
  secondary: z.object({
    enabled: z.boolean(),
    name: z.string().optional(),
    description: z.string().optional(),
    baseline: z.coerce.number().optional(),
    target: z.coerce.number().optional(),
    unit: z.string().optional(),
    deadline: z.string().optional(),
    weight: z.coerce.number().min(0).max(99),
    direction: z.enum(["HIGHER", "LOWER", "MAINTAIN"]),
    successCriteria: z.string().optional(),
  }),
}).refine(data => {
  if (data.secondary.enabled) {
    if (!data.secondary.name || data.secondary.name.trim().length < 2) return false;
    if (data.secondary.target === undefined || isNaN(data.secondary.target)) return false;
    if (!data.secondary.unit) return false;
    if (Number(data.primary.weight) + Number(data.secondary.weight) !== 100) return false;
  } else {
    if (Number(data.primary.weight) !== 100) return false;
  }
  return true;
}, {
  message: "If secondary goal is enabled, its name, target, and unit are required, and combined weights must equal exactly 100%. If only primary goal exists, weight must be 100%.",
  path: ["primary", "weight"],
});

export default function Step3Goals() {
  const { goals, setGoals, setStep } = useSystemCreationStore();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      systemSuccessOutcome: goals.systemSuccessOutcome || "",
      primary: {
        name: goals.primary?.name || "",
        description: goals.primary?.description || "",
        baseline: goals.primary?.baseline ?? 0,
        target: goals.primary?.target ?? 10000,
        unit: goals.primary?.unit || "USD",
        deadline: goals.primary?.deadline || "",
        weight: goals.secondary?.enabled ? (goals.primary?.weight || 75) : 100,
        direction: goals.primary?.direction || "HIGHER",
        successCriteria: goals.primary?.successCriteria || "",
      },
      secondary: {
        enabled: !!goals.secondary?.enabled,
        name: goals.secondary?.name || "",
        description: goals.secondary?.description || "",
        baseline: goals.secondary?.baseline ?? 0,
        target: goals.secondary?.target ?? 0,
        unit: goals.secondary?.unit || "",
        deadline: goals.secondary?.deadline || "",
        weight: goals.secondary?.enabled ? (goals.secondary?.weight || 25) : 0,
        direction: goals.secondary?.direction || "HIGHER",
        successCriteria: goals.secondary?.successCriteria || "",
      },
    },
  });

  const isSecondaryEnabled = useWatch({ control, name: "secondary.enabled" });
  const primaryWeight = useWatch({ control, name: "primary.weight" });
  const secondaryWeight = useWatch({ control, name: "secondary.weight" });

  const toggleSecondary = () => {
    const val = !isSecondaryEnabled;
    setValue("secondary.enabled", val);
    if (val) {
      setValue("primary.weight", 75);
      setValue("secondary.weight", 25);
    } else {
      setValue("primary.weight", 100);
      setValue("secondary.weight", 0);
    }
  };

  const handlePrimaryWeightChange = (e) => {
    const pWeight = Number(e.target.value);
    setValue("primary.weight", pWeight);
    if (isSecondaryEnabled) {
      setValue("secondary.weight", Math.max(0, 100 - pWeight));
    }
  };

  const handleSecondaryWeightChange = (e) => {
    const sWeight = Number(e.target.value);
    setValue("secondary.weight", sWeight);
    setValue("primary.weight", Math.max(0, 100 - sWeight));
  };

  const onSubmit = (data) => {
    setGoals(data);
    setStep(4);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Target className="w-3.5 h-3.5" />
            Stage 3 of 12 — Goals & Success Criteria
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configure North Star Outcomes</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Every daily input feeds directly into a North Star metric. Define your primary outcome and optional secondary counter-metric with rigorous weights.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Core System Success Outcome */}
        <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-900 mb-1">
            System Expiration Success Outcome
          </label>
          <p className="text-xs text-gray-600 mb-3">
            "What measurable outcome would make this system successful by its expiration date?"
          </p>
          <textarea
            rows={2}
            {...register("systemSuccessOutcome")}
            placeholder="e.g. Generate $50,000 in validated software subscriptions while maintaining 15% body fat and zero missed weekly reviews."
            className="w-full rounded-lg border border-orange-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
          />
          {errors.systemSuccessOutcome && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.systemSuccessOutcome.message}</p>}
        </div>

        {/* Primary North Star Goal */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                <Star className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Primary North Star Goal</h3>
                <p className="text-xs text-gray-500">The single decisive measure of strategic victory.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-600">Weight:</label>
              <input
                type="number"
                min="1"
                max="100"
                {...register("primary.weight", { valueAsNumber: true })}
                onChange={handlePrimaryWeightChange}
                disabled={!isSecondaryEnabled}
                className="w-16 rounded-md border border-gray-200 px-2 py-1 text-right text-sm font-bold text-gray-900 bg-gray-50 disabled:bg-gray-100 outline-none"
              />
              <span className="text-sm font-semibold text-gray-600">%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Goal Title</label>
              <input
                type="text"
                {...register("primary.name")}
                placeholder="e.g. Reach $10,000 / month in Monthly Recurring Revenue"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              {errors.primary?.name && <p className="mt-1 text-xs text-red-500">{errors.primary.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Baseline (Current Value)</label>
              <input
                type="number"
                step="any"
                {...register("primary.baseline", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Value</label>
              <input
                type="number"
                step="any"
                {...register("primary.target", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement Unit</label>
              <input
                type="text"
                {...register("primary.unit")}
                placeholder="e.g. USD, users, kg, hours"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              {errors.primary?.unit && <p className="mt-1 text-xs text-red-500">{errors.primary.unit.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Direction</label>
              <select
                {...register("primary.direction")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="HIGHER">Increase (Higher is better)</option>
                <option value="LOWER">Decrease (Lower is better)</option>
                <option value="MAINTAIN">Maintain (Hold within threshold)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Deadline</label>
              <input
                type="date"
                {...register("primary.deadline")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              {errors.primary?.deadline && <p className="mt-1 text-xs text-red-500">{errors.primary.deadline.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Measurable Success Criteria</label>
              <input
                type="text"
                {...register("primary.successCriteria")}
                placeholder="e.g. 50 paying customers on $200/mo tier with Stripe invoices verified"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
              {errors.primary?.successCriteria && <p className="mt-1 text-xs text-red-500">{errors.primary.successCriteria.message}</p>}
            </div>
          </div>
        </div>

        {/* Secondary Goal Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <div className="text-sm font-semibold text-gray-900">Secondary Goal (Optional Counter-Metric)</div>
            <div className="text-xs text-gray-500">Balance your primary goal (e.g. Revenue vs. Health or Customer Satisfaction).</div>
          </div>
          <button
            type="button"
            onClick={toggleSecondary}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isSecondaryEnabled
                ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                : "bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
            }`}
          >
            {isSecondaryEnabled ? <><X className="w-3.5 h-3.5" /> Remove Secondary Goal</> : <><Plus className="w-3.5 h-3.5" /> Add Secondary Goal</>}
          </button>
        </div>

        {/* Secondary Goal Card */}
        {isSecondaryEnabled && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Secondary Goal</h3>
                  <p className="text-xs text-gray-500">Supporting metric or protective counter-constraint.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600">Weight:</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  {...register("secondary.weight", { valueAsNumber: true })}
                  onChange={handleSecondaryWeightChange}
                  className="w-16 rounded-md border border-gray-200 px-2 py-1 text-right text-sm font-bold text-gray-900 bg-white outline-none"
                />
                <span className="text-sm font-semibold text-gray-600">%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  {...register("secondary.name")}
                  placeholder="e.g. Bodyweight & Athletic Conditioning"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
                {errors.secondary?.name && <p className="mt-1 text-xs text-red-500">{errors.secondary.name.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Baseline</label>
                <input
                  type="number"
                  step="any"
                  {...register("secondary.baseline", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Value</label>
                <input
                  type="number"
                  step="any"
                  {...register("secondary.target", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement Unit</label>
                <input
                  type="text"
                  {...register("secondary.unit")}
                  placeholder="e.g. kg, lbs, hours"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Direction</label>
                <select
                  {...register("secondary.direction")}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="HIGHER">Increase</option>
                  <option value="LOWER">Decrease</option>
                  <option value="MAINTAIN">Maintain</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target Deadline</label>
                <input
                  type="date"
                  {...register("secondary.deadline")}
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Measurable Success Criteria</label>
                <input
                  type="text"
                  {...register("secondary.successCriteria")}
                  placeholder="e.g. Body fat at 14% verified with caliper measurement"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Weight Total Bar */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-600 font-medium">
            Combined Goal Weights: <span className="font-bold text-gray-900">{Number(primaryWeight || 0) + Number(secondaryWeight || 0)}%</span>
            {Number(primaryWeight || 0) + Number(secondaryWeight || 0) !== 100 && (
              <span className="text-red-500 ml-2 font-semibold">(Must equal exactly 100%)</span>
            )}
          </div>
          {errors.primary?.weight && (
            <span className="text-xs text-red-500 font-semibold">{errors.primary.weight.message}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Config
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Strategic Roadmap
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
