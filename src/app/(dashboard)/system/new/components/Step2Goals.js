"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Plus, X } from "lucide-react";

const goalSchema = z.object({
  primary: z.object({
    name: z.string().min(2, "Required"),
    description: z.string().optional(),
    baseline: z.coerce.number(),
    target: z.coerce.number(),
    unit: z.string().min(1, "Required"),
    deadline: z.string().min(1, "Required"),
    weight: z.number().min(1).max(100),
    direction: z.enum(["HIGHER", "LOWER"]),
    successCriteria: z.string().optional()
  }).refine(data => {
    if (data.direction === "HIGHER") return data.target > data.baseline;
    if (data.direction === "LOWER") return data.target < data.baseline;
    return true;
  }, { message: "Target must logically follow the baseline and direction", path: ["target"] }),
  secondary: z.object({
    enabled: z.boolean(),
    name: z.string().optional(),
    description: z.string().optional(),
    baseline: z.coerce.number().optional(),
    target: z.coerce.number().optional(),
    unit: z.string().optional(),
    deadline: z.string().optional(),
    weight: z.number().min(0).max(99),
    direction: z.enum(["HIGHER", "LOWER"]),
    successCriteria: z.string().optional()
  })
}).refine(data => {
  if (data.secondary.enabled) {
    if (!data.secondary.name) return false;
    if (data.secondary.target === undefined) return false;
    if (data.primary.weight + data.secondary.weight !== 100) return false;
  } else {
    if (data.primary.weight !== 100) return false;
  }
  return true;
}, { message: "If secondary is enabled, all its fields are required and total weight must be 100%. If single goal, weight must be 100%.", path: ["primary", "weight"] });

export default function Step2Goals() {
  const { goals, setGoals, setStep } = useSystemCreationStore();
  
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: goals,
  });

  const isSecondaryEnabled = useWatch({ control, name: "secondary.enabled" });

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

  const onSubmit = (data) => {
    setGoals(data);
    setStep(3);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">Define Goals</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Define your North Star. You can define a maximum of 2 long-term goals. Your Primary goal is the main destination.
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Primary Goal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Primary Goal</h3>
            <div className="text-xs font-medium text-gray-500 bg-gray-50 rounded-full px-3 py-1">Weight: {isSecondaryEnabled ? '75%' : '100%'}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Goal Name</label>
              <input type="text" {...register("primary.name")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. Annual Revenue" />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Baseline (Current)</label>
              <input type="number" {...register("primary.baseline")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="0" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Target</label>
              <input type="number" {...register("primary.target")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="2000000" />
              {errors.primary?.target && <p className="text-[10px] text-red-500 mt-1">{errors.primary.target.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
              <input type="text" {...register("primary.unit")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. USD, Users, %" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Direction</label>
              <select {...register("primary.direction")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all">
                <option value="HIGHER">Higher is better</option>
                <option value="LOWER">Lower is better</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Deadline</label>
              <input type="date" {...register("primary.deadline")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Secondary Goal */}
        {!isSecondaryEnabled ? (
          <button 
            type="button" 
            onClick={toggleSecondary}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 py-8 flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all"
          >
            <Plus className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium">Add Secondary Goal (Optional)</span>
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Secondary Goal</h3>
              <div className="flex items-center gap-3">
                <div className="text-xs font-medium text-gray-500 bg-gray-50 rounded-full px-3 py-1">Weight: 25%</div>
                <button type="button" onClick={toggleSecondary} className="text-gray-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Goal Name</label>
                <input type="text" {...register("secondary.name")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. Personal Savings" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Baseline (Current)</label>
                <input type="number" {...register("secondary.baseline")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="0" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Target</label>
                <input type="number" {...register("secondary.target")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="800000" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Unit</label>
                <input type="text" {...register("secondary.unit")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. USD" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Direction</label>
                <select {...register("secondary.direction")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all">
                  <option value="HIGHER">Higher is better</option>
                  <option value="LOWER">Lower is better</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-gray-700">Deadline</label>
                <input type="date" {...register("secondary.deadline")} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" />
              </div>
            </div>
          </div>
        )}

        {errors.primary?.weight && <p className="text-sm text-red-500 font-medium text-center">{errors.primary.weight.message}</p>}

        <hr className="border-gray-100" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="border border-gray-200 text-gray-700 rounded-lg font-medium px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium px-4 py-2 transition-colors"
          >
            Continue to Roadmap
          </button>
        </div>
      </form>
    </div>
  );
}
