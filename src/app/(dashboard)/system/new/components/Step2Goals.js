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
        <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">Define Goals</h2>
        <p className="text-sm leading-relaxed">
          Define your North Star. You can define a maximum of 2 long-term goals. Your Primary goal is the main destination.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Primary Goal */}
        <div className="bg-paper border border-divider p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold uppercase text-text-ochre">Primary Goal</h3>
            <div className="text-xs font-mono border border-divider px-2 py-1 uppercase">WEIGHT: {isSecondaryEnabled ? '75%' : '100%'}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Goal Name</label>
              <input type="text" {...register("primary.name")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. Annual Revenue" />
            </div>
            
            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Baseline (Current)</label>
              <input type="number" {...register("primary.baseline")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="0" />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Target</label>
              <input type="number" {...register("primary.target")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="2000000" />
              {errors.primary?.target && <p className="text-[10px] text-red-500 mt-1">{errors.primary.target.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Unit</label>
              <input type="text" {...register("primary.unit")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. USD, Users, %" />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Direction</label>
              <select {...register("primary.direction")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre">
                <option value="HIGHER">Higher is better</option>
                <option value="LOWER">Lower is better</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Deadline</label>
              <input type="date" {...register("primary.deadline")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" />
            </div>
          </div>
        </div>

        {/* Secondary Goal */}
        {!isSecondaryEnabled ? (
          <button 
            type="button" 
            onClick={toggleSecondary}
            className="w-full border border-dashed border-divider py-6 flex flex-col items-center justify-center text-ink hover:text-text-ochre hover:border-text-ochre transition-all"
          >
            <Plus className="w-5 h-5 mb-2" />
            <span className="text-sm font-medium uppercase">Add Secondary Goal (Optional)</span>
          </button>
        ) : (
          <div className="bg-paper border border-divider p-6 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold uppercase text-ink">Secondary Goal</h3>
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono border border-divider px-2 py-1 uppercase">WEIGHT: 25%</div>
                <button type="button" onClick={toggleSecondary} className="text-ink hover:text-red-500"><X className="w-4 h-4" /></button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Goal Name</label>
                <input type="text" {...register("secondary.name")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. Personal Savings" />
              </div>
              
              <div>
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Baseline (Current)</label>
                <input type="number" {...register("secondary.baseline")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="0" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Target</label>
                <input type="number" {...register("secondary.target")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="800000" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Unit</label>
                <input type="text" {...register("secondary.unit")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. USD" />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Direction</label>
                <select {...register("secondary.direction")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre">
                  <option value="HIGHER">Higher is better</option>
                  <option value="LOWER">Lower is better</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium mb-1 uppercase text-ink">Deadline</label>
                <input type="date" {...register("secondary.deadline")} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" />
              </div>
            </div>
          </div>
        )}

        {errors.primary?.weight && <p className="text-sm text-red-500 font-medium text-center">{errors.primary.weight.message}</p>}

        <hr className="border-divider" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(1)}
            className="border border-divider px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper transition-all uppercase"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-paper border border-divider text-ink px-8 py-3 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-all uppercase"
          >
            Continue to Roadmap
          </button>
        </div>
      </form>
    </div>
  );
}
