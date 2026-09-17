"use client";

import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import { Plus, Trash2 } from "lucide-react";

export default function Step4Inputs() {
  const { inputs, setInputs, setStep, roadmap } = useSystemCreationStore();
  
  const defaultInputs = inputs && inputs.length > 0 ? inputs : [
    { name: "", minimumTarget: "", normalTarget: "", stretchTarget: "", frequency: "DAILY", rockIndex: 0 }
  ];

  const { register, handleSubmit, control } = useForm({
    defaultValues: { inputs: defaultInputs },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inputs",
  });

  const onSubmit = (data) => {
    setInputs(data.inputs);
    setStep(5);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Daily Inputs</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Move from WHAT must happen to WHAT you will repeatedly DO to make it happen. Define the leading indicators and inputs that will drive your weekly milestones.
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {fields.map((item, index) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                <input 
                  type="text" 
                  {...register(`inputs.${index}.name`, { required: true })} 
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all font-medium text-lg text-gray-900 placeholder:text-gray-400" 
                  placeholder="e.g. Cold Calls" 
                />
              </div>
              <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500 transition-colors mt-3">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Connect to Rock</label>
                <select {...register(`inputs.${index}.rockIndex`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all text-sm text-gray-900">
                  {roadmap.rocks.map((rock, rIdx) => (
                    <option key={rIdx} value={rIdx}>{rock.name || `Rock ${rIdx + 1}`}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                <select {...register(`inputs.${index}.frequency`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all text-sm text-gray-900">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                  Minimum
                  <span className="text-red-500 text-[10px] bg-red-50 px-1.5 py-0.5 rounded">Req</span>
                </label>
                <input type="number" {...register(`inputs.${index}.minimumTarget`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all text-sm text-gray-900" placeholder="e.g. 10" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center justify-between">
                  Normal
                  <span className="text-green-500 text-[10px] bg-green-50 px-1.5 py-0.5 rounded">Req</span>
                </label>
                <input type="number" {...register(`inputs.${index}.normalTarget`, { required: true })} className="w-full rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white outline-none transition-all text-sm text-gray-900" placeholder="e.g. 20" />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={() => append({ name: "", minimumTarget: "", normalTarget: "", stretchTarget: "", frequency: "DAILY", rockIndex: 0 })}
          className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200 py-6 flex flex-col items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 transition-all"
        >
          <Plus className="w-6 h-6 mb-2" />
          <span className="text-sm font-medium">Add Input</span>
        </button>

        <hr className="border-gray-100" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(3)}
            className="rounded-lg font-medium px-6 py-2.5 transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
          >
            Back
          </button>
          <button 
            type="submit"
            className="rounded-lg font-medium px-6 py-2.5 transition-colors bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
          >
            Preview System
          </button>
        </div>
      </form>
    </div>
  );
}
