"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Shield, Sparkles, User, AlertOctagon, Compass, Plus, Trash2, HelpCircle } from "lucide-react";

const identitySchema = z.object({
  name: z.string().min(2, "System Name is required (min 2 characters)"),
  identityStatement: z.string().min(10, "Identity statement must be meaningful (e.g., 'I am becoming a disciplined founder')"),
  mission: z.string().min(15, "Mission must clearly articulate why this system exists (min 15 characters)"),
  antiIdentity: z.string().min(10, "Define what type of person you refuse to become"),
  personalStandards: z.string().min(15, "Define the non-negotiable behaviors and standards you expect of yourself"),
  principles: z.array(z.string().min(3, "Principle cannot be empty")).min(3, "Define at least 3 core principles").max(7, "Maximum 7 principles allowed"),
});

export default function Step1Identity() {
  const { systemIdentity, setIdentity, setStep } = useSystemCreationStore();

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      name: systemIdentity.name || "",
      identityStatement: systemIdentity.identityStatement || "",
      mission: systemIdentity.mission || systemIdentity.why || "",
      antiIdentity: systemIdentity.antiIdentity || "",
      personalStandards: systemIdentity.personalStandards || "",
      principles: (systemIdentity.principles && systemIdentity.principles.length >= 3)
        ? systemIdentity.principles
        : ["Act with relentless consistency over fleeting motivation", "Protect deep work time from low-value reactive distractions", "Measure reality truthfully via the daily execution ledger"],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "principles",
  });

  const onSubmit = (data) => {
    setIdentity(data);
    setStep(2);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Shield className="w-3.5 h-3.5" />
            Stage 1 of 12 — Identity & Mission
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define Your Operating Identity</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Systems fail when disconnected from identity. Define who you are becoming, the non-negotiable standards you demand, and the behaviors you actively reject.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* System Name */}
        <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-100">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            System Name
          </label>
          <p className="text-xs text-gray-500 mb-3">
            The designation for this execution cycle (e.g. "Apex Execution OS", "Sovereign Growth System").
          </p>
          <input
            type="text"
            {...register("name")}
            placeholder="e.g. Apex Execution OS"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all font-medium text-base"
          />
          {errors.name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.name.message}</p>}
        </div>

        {/* Identity Statement */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-orange-600" />
            <label className="text-sm font-semibold text-gray-900">
              Identity Statement: Who am I becoming?
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            State your target identity in the present continuous tense. You don't execute tasks; you embody an operating standard.
          </p>
          <input
            type="text"
            {...register("identityStatement")}
            placeholder="e.g. I am becoming a relentless, world-class product builder who delivers daily without excuses."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
          />
          {errors.identityStatement && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.identityStatement.message}</p>}
        </div>

        {/* Mission */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-orange-600" />
            <label className="text-sm font-semibold text-gray-900">
              Mission: Why does this system exist?
            </label>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Clarify the underlying existential purpose of this operating cycle. What concrete reality does it forge?
          </p>
          <textarea
            rows={3}
            {...register("mission")}
            placeholder="e.g. Build an autonomous software business generating recurring cashflow to secure personal autonomy and professional freedom."
            className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
          />
          {errors.mission && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.mission.message}</p>}
        </div>

        {/* Core Principles */}
        <div className="bg-white p-5 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <label className="text-sm font-semibold text-gray-900">
                Core Principles (3–7 Operating Rules)
              </label>
            </div>
            <span className="text-xs text-gray-400 font-medium">{fields.length}/7</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            The immutable decision-making heuristics that govern how you prioritize and act when friction arises.
          </p>

          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 font-bold text-xs flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  {...register(`principles.${idx}`)}
                  placeholder={`Core Principle #${idx + 1}`}
                  className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2.5 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
                {fields.length > 3 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {errors.principles && <p className="mt-2 text-xs font-medium text-red-500">{errors.principles.message}</p>}

          {fields.length < 7 && (
            <button
              type="button"
              onClick={() => append("")}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another Principle
            </button>
          )}
        </div>

        {/* Anti-Identity & Personal Standards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anti-Identity */}
          <div className="bg-red-50/40 p-5 rounded-xl border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <label className="text-sm font-semibold text-gray-900">
                Anti-Identity: Who do I refuse to become?
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Describe the passive, undisciplined version of yourself that you repudiate.
            </p>
            <textarea
              rows={3}
              {...register("antiIdentity")}
              placeholder="e.g. The perpetual planner who consumes content, talks about ambition, but hides from uncomfortable execution and blames external conditions."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
            />
            {errors.antiIdentity && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.antiIdentity.message}</p>}
          </div>

          {/* Personal Standards */}
          <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <label className="text-sm font-semibold text-gray-900">
                Personal Standards: Behaviors I Expect
              </label>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              What minimum standards of execution, preparation, and follow-through do you require daily?
            </p>
            <textarea
              rows={3}
              {...register("personalStandards")}
              placeholder="e.g. Always begin work on time, record truthful numbers at night, never complain without proposing a concrete solution, maintain physical energy."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            />
            {errors.personalStandards && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.personalStandards.message}</p>}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Save & Proceed to System Configuration →
          </button>
        </div>
      </form>
    </div>
  );
}
