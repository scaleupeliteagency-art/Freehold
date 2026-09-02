"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";

export default function Step3Roadmap() {
  const { roadmap, setRoadmap, setStep } = useSystemCreationStore();
  
  const defaultRoadmap = {
    year: roadmap.year || new Date().getFullYear(),
    yearlyGoal: roadmap.yearlyGoal || { name: '', target: 0 },
    quarter: roadmap.quarter || Math.floor((new Date().getMonth() + 3) / 3),
    quarterlyObjective: roadmap.quarterlyObjective || { name: '', target: 0 },
    rocks: roadmap.rocks?.length === 3 ? roadmap.rocks : [
      { id: '1', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
      { id: '2', name: '', description: '', target: 0, unit: '', weight: 33.33, deadline: '', successCriteria: '', milestones: [] },
      { id: '3', name: '', description: '', target: 0, unit: '', weight: 33.34, deadline: '', successCriteria: '', milestones: [] }
    ]
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
    setStep(4);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">Progressive Roadmap</h2>
        <p className="text-sm leading-relaxed">
          Break down your North Star into actionable phases. We only plan the current active period in detail to remain adaptable. Future years are locked until their planning window opens.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Yearly Goal */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 text-text-ochre">
            <span className="w-6 h-6 border border-divider flex items-center justify-center text-xs">Y</span>
            Current Year: {roadmap.year}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Yearly Goal Name</label>
              <input type="text" {...register("yearlyGoal.name", { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. Build Core Product & Initial Revenue" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Target Number</label>
              <input type="number" {...register("yearlyGoal.target", { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" />
            </div>
          </div>
        </div>

        {/* Quarterly Objective */}
        <div className="space-y-4 relative">
          <div className="absolute left-3 top-[-30px] bottom-10 w-px bg-divider" />
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 relative z-10 text-text-ochre">
            <span className="w-6 h-6 border border-text-ochre text-text-ochre bg-paper flex items-center justify-center text-xs">Q{roadmap.quarter}</span>
            Current Quarter Objective
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9 relative z-10">
            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Quarterly Objective</label>
              <input type="text" {...register("quarterlyObjective.name", { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. Launch MVP and get 10 paid users" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 uppercase text-text-ochre">Quarter Target</label>
              <input type="number" {...register("quarterlyObjective.target", { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" />
            </div>
          </div>
        </div>

        {/* Monthly Rocks */}
        <div className="space-y-8 relative">
          <div className="absolute left-3 top-[-30px] bottom-10 w-px bg-divider" />
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-3 relative z-10 text-ink">
            <span className="w-6 h-6 border border-divider bg-paper flex items-center justify-center text-xs">M</span>
            The 3 Monthly Rocks
          </h3>
          <div className="space-y-6 pl-9 relative z-10">
            {rockFields.map((item, index) => (
              <div key={item.id} className="bg-paper border border-divider p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold uppercase">Rock {index + 1}</h4>
                  <div className="text-xs font-mono uppercase border border-divider px-2 py-1">Weight: 33.3%</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase mb-1 text-ink">Rock Name</label>
                    <input type="text" {...register(`rocks.${index}.name`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder={`Month ${index + 1} main focus`} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase mb-1 text-ink">Deadline</label>
                    <input type="date" {...register(`rocks.${index}.deadline`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" />
                  </div>
                </div>

                <div className="border-t border-divider pt-4 mt-2">
                  <p className="text-xs font-medium mb-3 uppercase tracking-wider text-ink">Weekly Milestones</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((weekNum) => (
                      <div key={weekNum} className="bg-paper p-3 border border-divider">
                        <label className="block text-[10px] uppercase mb-1 text-ink">Week {weekNum}</label>
                        <input 
                          type="text" 
                          {...register(`rocks.${index}.milestones.${weekNum-1}.name`, { required: true })} 
                          className="w-full bg-transparent text-xs text-ink border-b border-divider focus:border-text-ochre focus:outline-none pb-1 placeholder:text-ink/50" 
                          placeholder="Measurable result" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-divider" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(2)}
            className="border border-divider px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper transition-all uppercase"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-paper border border-divider text-ink px-8 py-3 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-all uppercase"
          >
            Continue to Daily Inputs
          </button>
        </div>
      </form>
    </div>
  );
}
