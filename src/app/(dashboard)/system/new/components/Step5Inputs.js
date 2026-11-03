"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import {
  ShieldCheck,
  LockKeyhole,
  Target,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Info,
} from "lucide-react";

export default function Step5Inputs() {
  const { inputs, setInputs, setStep, roadmap } = useSystemCreationStore();
  const [validationError, setValidationError] = useState("");

  const initialInputs = inputs && inputs.length >= 3 ? inputs : [
    {
      id: "core-input-1",
      name: "",
      description: "",
      measurementType: "numeric",
      unit: "sessions",
      minimumTarget: 1,
      normalTarget: 2,
      stretchTarget: 3,
      frequency: "DAILY",
      rockIndex: 0,
      isCore: true,
    },
    {
      id: "core-input-2",
      name: "",
      description: "",
      measurementType: "numeric",
      unit: "outreach",
      minimumTarget: 5,
      normalTarget: 15,
      stretchTarget: 25,
      frequency: "DAILY",
      rockIndex: 1,
      isCore: true,
    },
    {
      id: "core-input-3",
      name: "",
      description: "",
      measurementType: "numeric",
      unit: "minutes",
      minimumTarget: 30,
      normalTarget: 60,
      stretchTarget: 90,
      frequency: "DAILY",
      rockIndex: 2,
      isCore: true,
    },
  ];

  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: { inputs: initialInputs },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inputs",
  });

  useEffect(() => {
    if (inputs && inputs.length > 0) {
      reset({ inputs });
    }
  }, [inputs, reset]);

  const coreInputs = fields.slice(0, 3);
  const additionalInputs = fields.slice(3);

  const onSubmit = (data) => {
    setValidationError("");

    // Validate exactly 3 core inputs exist and have non-empty names
    const submittedInputs = data.inputs;
    if (submittedInputs.length < 3) {
      setValidationError("You must configure exactly three permanent core inputs.");
      return;
    }

    for (let i = 0; i < 3; i++) {
      const inp = submittedInputs[i];
      if (!inp.name || inp.name.trim().length === 0) {
        setValidationError(`Core Input #${i + 1} must have a valid title.`);
        return;
      }
      const min = Number(inp.minimumTarget);
      const normal = Number(inp.normalTarget);
      const stretch = Number(inp.stretchTarget);

      if (isNaN(min) || isNaN(normal) || isNaN(stretch)) {
        setValidationError(`Core Input #${i + 1} must have numeric targets.`);
        return;
      }
      if (min < 0 || normal < min || stretch < normal) {
        setValidationError(
          `Core Input #${i + 1} validation failed: Bad-day minimum (${min}) ≤ Normal target (${normal}) ≤ Stretch target (${stretch}) must hold.`
        );
        return;
      }
    }

    // Normalize inputs
    const normalized = submittedInputs.map((inp, idx) => ({
      ...inp,
      id: idx < 3 ? `core-input-${idx + 1}` : (inp.id || `addl-input-${Date.now()}-${idx}`),
      isCore: idx < 3,
      frequency: idx < 3 ? "DAILY" : (inp.frequency || "DAILY"),
      minimumTarget: Number(inp.minimumTarget || 0),
      normalTarget: Number(inp.normalTarget || 0),
      stretchTarget: Number(inp.stretchTarget || 0),
      rockIndex: Number(inp.rockIndex || 0),
    }));

    setInputs(normalized);
    setStep(6);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <LockKeyhole className="w-3.5 h-3.5" />
            Stage 5 of 12 — Execution Inputs & Rules
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Define Daily Operational Commitments</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Require exactly <span className="font-semibold text-gray-900">THREE non-negotiable permanent core inputs</span>. These daily actions determine whether you fulfill your minimum operating commitment.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      {/* Daily Classification Rules Callout */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md mb-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          The Immutable Daily Classification Law
        </h3>
        <p className="text-xs text-slate-300 mb-4">
          These rules govern your daily closing, streaks, analytics, and XP economy across the entire application lifecycle:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-lg border border-emerald-500/30">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Normal Success
            </div>
            <p className="text-xs text-slate-300">All 3 core inputs reach their Normal Daily Targets.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-amber-500/30">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Bad-Day Success
            </div>
            <p className="text-xs text-slate-300">All 3 reach Bad-Day Minimums, but at least 1 misses Normal target.</p>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-lg border border-red-500/30">
            <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> Failed Day
            </div>
            <p className="text-xs text-slate-300">At least one core input falls strictly below its Bad-Day Minimum.</p>
          </div>
        </div>
      </div>

      {validationError && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Core Inputs Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-bold text-gray-900">Three Permanent Core Inputs</h3>
            </div>
            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              Permanently Daily • Non-Negotiable
            </span>
          </div>

          <div className="space-y-6">
            {coreInputs.map((field, idx) => (
              <div
                key={field.id}
                className="bg-white rounded-xl border-2 border-orange-200 shadow-sm p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-2 h-full bg-orange-600" />

                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                      C{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Core Input #{idx + 1}</h4>
                      <span className="text-[11px] text-gray-500">Connected to Monthly Rock #{idx + 1}</span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200">
                    Mandatory Daily Action
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Input Name</label>
                    <input
                      type="text"
                      {...register(`inputs.${idx}.name`)}
                      placeholder={`e.g. Deep Work Focus Block, Cold Prospecting Calls, Intense Training`}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement Unit</label>
                    <input
                      type="text"
                      {...register(`inputs.${idx}.unit`)}
                      placeholder="e.g. minutes, calls, words, sessions"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description / Protocol</label>
                    <input
                      type="text"
                      {...register(`inputs.${idx}.description`)}
                      placeholder="Specific instructions: zero notifications, browser tab locked, no music with lyrics."
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                {/* Target Tiers: Bad-day <= Normal <= Stretch */}
                <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-amber-200">
                    <label className="block text-[11px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                      1. Bad-Day Minimum
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register(`inputs.${idx}.minimumTarget`)}
                      className="w-full font-bold text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Lowest acceptable floor</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-orange-200">
                    <label className="block text-[11px] font-bold text-orange-700 uppercase tracking-wider mb-1">
                      2. Normal Daily Target
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register(`inputs.${idx}.normalTarget`)}
                      className="w-full font-bold text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:border-orange-500"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Standard daily expectation</span>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-emerald-200">
                    <label className="block text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      3. Stretch Target
                    </label>
                    <input
                      type="number"
                      step="any"
                      {...register(`inputs.${idx}.stretchTarget`)}
                      className="w-full font-bold text-gray-900 border border-gray-200 rounded px-2.5 py-1.5 text-sm outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Peak performance output</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Additional Inputs */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-gray-600" />
                Additional Inputs (Optional)
              </h3>
              <p className="text-xs text-gray-500">
                Secondary routines or weekly protocols. They award XP but do not affect core success status.
              </p>
            </div>
            <button
              type="button"
              onClick={() => append({
                name: "",
                description: "",
                measurementType: "numeric",
                unit: "",
                minimumTarget: 0,
                normalTarget: 1,
                stretchTarget: 2,
                frequency: "DAILY",
                rockIndex: 0,
                isCore: false,
              })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Optional Input
            </button>
          </div>

          {additionalInputs.map((field, addlIdx) => {
            const actualIdx = addlIdx + 3;
            return (
              <div key={field.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Additional Input #{addlIdx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(actualIdx)}
                    className="text-gray-400 hover:text-red-600 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      {...register(`inputs.${actualIdx}.name`)}
                      placeholder="Input Name (e.g. Read 20 pages, Hydration, Mobility)"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      {...register(`inputs.${actualIdx}.normalTarget`)}
                      placeholder="Target"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                    />
                  </div>
                  <div>
                    <select
                      {...register(`inputs.${actualIdx}.frequency`)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-900 outline-none"
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(4)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Roadmap
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to No-To-Do List
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
