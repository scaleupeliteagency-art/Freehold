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
        <h2 className="text-2xl font-semibold mb-2 text-gray-900">Progressive Roadmap</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Break down your North Star into actionable phases. We only plan the current active period in detail to remain adaptable. Future years are locked until their planning window opens.
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
        
        {/* Yearly Goal */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-3 text-gray-900">
            <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">Y</span>
            Current Year: {roadmap.year}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Yearly Goal Name</label>
              <input type="text" {...register("yearlyGoal.name", { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. Build Core Product & Initial Revenue" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Target Number</label>
              <input type="number" {...register("yearlyGoal.target", { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Quarterly Objective */}
        <div className="space-y-4 relative">
          <div className="absolute left-3 top-[-30px] bottom-10 w-px bg-gray-200" />
          <h3 className="text-sm font-semibold flex items-center gap-3 relative z-10 text-gray-900">
            <span className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">Q{roadmap.quarter}</span>
            Current Quarter Objective
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-9 relative z-10">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quarterly Objective</label>
              <input type="text" {...register("quarterlyObjective.name", { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder="e.g. Launch MVP and get 10 paid users" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Quarter Target</label>
              <input type="number" {...register("quarterlyObjective.target", { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" />
            </div>
          </div>
        </div>

        {/* Monthly Rocks */}
        <div className="space-y-8 relative">
          <div className="absolute left-3 top-[-30px] bottom-10 w-px bg-gray-200" />
          <h3 className="text-sm font-semibold flex items-center gap-3 relative z-10 text-gray-900">
            <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold">M</span>
            The 3 Monthly Rocks
          </h3>
          <div className="space-y-6 pl-9 relative z-10">
            {rockFields.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-semibold text-gray-900">Rock {index + 1}</h4>
                  <div className="text-xs font-medium text-gray-500 bg-gray-50 rounded-full px-3 py-1">Weight: 33.3%</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1 text-gray-700">Rock Name</label>
                    <input type="text" {...register(`rocks.${index}.name`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" placeholder={`Month ${index + 1} main focus`} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Deadline</label>
                    <input type="date" {...register(`rocks.${index}.deadline`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all" />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-2">
                  <p className="text-sm font-medium mb-3 text-gray-700">Weekly Milestones</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map((weekNum) => (
                      <div key={weekNum} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <label className="block text-xs font-medium mb-1 text-gray-500">Week {weekNum}</label>
                        <input 
                          type="text" 
                          {...register(`rocks.${index}.milestones.${weekNum-1}.name`, { required: true })} 
                          className="w-full bg-transparent text-sm text-gray-900 border-b border-gray-200 focus:border-orange-500 focus:outline-none pb-1 placeholder:text-gray-400" 
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

        <hr className="border-gray-100" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(2)}
            className="border border-gray-200 text-gray-700 rounded-lg font-medium px-4 py-2 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-medium px-4 py-2 transition-colors"
          >
            Continue to Daily Inputs
          </button>
        </div>
      </form>
    </div>
  );
}
