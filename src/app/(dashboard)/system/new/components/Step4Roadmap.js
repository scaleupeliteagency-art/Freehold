"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Layers, Calendar, ChevronRight, CheckCircle2, ArrowLeft, ArrowRight, Flag, Milestone } from "lucide-react";

export default function Step4Roadmap() {
  const { roadmap, setRoadmap, setStep } = useSystemCreationStore();

  const defaultRoadmap = {
    year: roadmap.year || new Date().getFullYear(),
    yearlyGoal: roadmap.yearlyGoal || {
      name: "",
      description: "",
      expectedOutcome: "",
      measurement: "",
      target: 0,
    },
    quarter: roadmap.quarter || Math.floor((new Date().getMonth() + 3) / 3),
    quarterlyObjective: roadmap.quarterlyObjective || {
      name: "",
      description: "",
      successCriteria: "",
      deadline: "",
      target: 0,
    },
    rocks: roadmap.rocks?.length === 3 ? roadmap.rocks : [
      {
        id: "1",
        name: "",
        description: "",
        desiredOutcome: "",
        target: 0,
        unit: "",
        weight: 33.33,
        deadline: "",
        successCriteria: "",
        milestones: [
          { name: "Week 1 Foundation Milestone", description: "", week: 1 },
          { name: "Week 2 Acceleration Milestone", description: "", week: 2 },
          { name: "Week 3 Expansion Milestone", description: "", week: 3 },
          { name: "Week 4 Consolidation Milestone", description: "", week: 4 },
        ],
      },
      {
        id: "2",
        name: "",
        description: "",
        desiredOutcome: "",
        target: 0,
        unit: "",
        weight: 33.33,
        deadline: "",
        successCriteria: "",
        milestones: [
          { name: "Week 1 Foundation Milestone", description: "", week: 1 },
          { name: "Week 2 Acceleration Milestone", description: "", week: 2 },
          { name: "Week 3 Expansion Milestone", description: "", week: 3 },
          { name: "Week 4 Consolidation Milestone", description: "", week: 4 },
        ],
      },
      {
        id: "3",
        name: "",
        description: "",
        desiredOutcome: "",
        target: 0,
        unit: "",
        weight: 33.34,
        deadline: "",
        successCriteria: "",
        milestones: [
          { name: "Week 1 Foundation Milestone", description: "", week: 1 },
          { name: "Week 2 Acceleration Milestone", description: "", week: 2 },
          { name: "Week 3 Expansion Milestone", description: "", week: 3 },
          { name: "Week 4 Consolidation Milestone", description: "", week: 4 },
        ],
      },
    ],
  };

  const { register, handleSubmit, control } = useForm({
    defaultValues: defaultRoadmap,
  });

  const { fields: rockFields } = useFieldArray({
    control,
    name: "rocks",
  });

  const onSubmit = (data) => {
    setRoadmap(data);
    setStep(5);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Layers className="w-3.5 h-3.5" />
            Stage 4 of 12 — Strategic Roadmap
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Deconstruct North Star into Strategic Horizon</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Preserve the core strategic hierarchy: <span className="font-semibold text-gray-800">North Star → Yearly Objective → Quarterly Objective → Exactly Three Monthly Rocks → Weekly Milestones</span>.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Hierarchy Breadcrumb Banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <span className="text-orange-600 font-bold">North Star</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900">Yearly Objective</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900">Quarterly Objective</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900">3 Monthly Rocks</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900">Weekly Milestones</span>
        </div>

        {/* 1. Yearly Objective */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
              Y
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900">Yearly Objective ({defaultRoadmap.year})</h3>
              <p className="text-xs text-gray-500">The primary strategic leap this annual cycle delivers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Yearly Goal Title</label>
              <input
                type="text"
                {...register("yearlyGoal.name", { required: true })}
                placeholder="e.g. Build Core Platform & Reach $120k ARR"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Outcome</label>
              <input
                type="text"
                {...register("yearlyGoal.expectedOutcome")}
                placeholder="e.g. Fully self-sustaining product engine with active recurring userbase"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement / Key Metric</label>
              <input
                type="text"
                {...register("yearlyGoal.measurement")}
                placeholder="e.g. $10,000 MRR & 500 active subscribers"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Quarterly Objective */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-bold">
              Q{defaultRoadmap.quarter}
            </span>
            <div>
              <h3 className="text-base font-bold text-gray-900">Quarterly Objective (Q{defaultRoadmap.quarter})</h3>
              <p className="text-xs text-gray-500">The immediate 90-day focal point to execute right now.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quarterly Objective Title</label>
              <input
                type="text"
                {...register("quarterlyObjective.name", { required: true })}
                placeholder="e.g. Complete System Engine & Validate 20 Beta Clients"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Success Criteria</label>
              <input
                type="text"
                {...register("quarterlyObjective.successCriteria")}
                placeholder="e.g. 20 paying customers signed up with >80% completion rate"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quarter Deadline</label>
              <input
                type="date"
                {...register("quarterlyObjective.deadline")}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Exactly Three Monthly Rocks */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-orange-600" />
                Three Monthly Rocks (Required)
              </h3>
              <p className="text-xs text-gray-500">
                The bedrock quarterly architecture: exactly 3 foundational pillars, each with 4 weekly milestones.
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              3 of 3 Required
            </span>
          </div>

          <div className="space-y-6">
            {rockFields.map((rock, index) => (
              <div key={rock.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500" />

                <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </span>
                    <h4 className="text-sm font-bold text-gray-900">Monthly Rock #{index + 1}</h4>
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Month {index + 1} of Quarter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rock Title</label>
                    <input
                      type="text"
                      {...register(`rocks.${index}.name`, { required: true })}
                      placeholder={`e.g. Month ${index + 1} Rock: Infrastructure, Outreach, or Conversion`}
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Desired Outcome</label>
                    <input
                      type="text"
                      {...register(`rocks.${index}.desiredOutcome`)}
                      placeholder="e.g. Core landing page live and 50 discovery calls booked"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Measurement / Deadline</label>
                    <input
                      type="text"
                      {...register(`rocks.${index}.deadline`)}
                      placeholder="e.g. End of Month or YYYY-MM-DD"
                      className="w-full rounded-lg border border-gray-200 px-3.5 py-2 text-sm bg-white text-gray-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                {/* 4 Weekly Milestones */}
                <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
                  <div className="flex items-center gap-2 mb-3">
                    <Milestone className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                      Weekly Milestones (Weeks 1 to 4)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[0, 1, 2, 3].map((weekIdx) => (
                      <div key={weekIdx} className="bg-white p-3 rounded-lg border border-gray-200 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 font-bold text-[11px] flex items-center justify-center shrink-0 mt-1">
                          W{weekIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                            Week {weekIdx + 1} Milestone
                          </label>
                          <input
                            type="text"
                            {...register(`rocks.${index}.milestones.${weekIdx}.name`)}
                            placeholder={`Deliverable for Week ${weekIdx + 1}`}
                            className="w-full text-xs rounded border border-gray-200 px-2.5 py-1.5 bg-white text-gray-900 outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Goals
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Execution Inputs
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
