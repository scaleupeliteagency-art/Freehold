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
        <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">Daily Inputs</h2>
        <p className="text-sm leading-relaxed">
          Move from WHAT must happen to WHAT you will repeatedly DO to make it happen. Define the leading indicators and inputs that will drive your weekly milestones.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {fields.map((item, index) => (
          <div key={item.id} className="bg-paper border border-divider p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                <input 
                  type="text" 
                  {...register(`inputs.${index}.name`, { required: true })} 
                  className="w-full bg-transparent border-b border-divider text-ink font-medium text-lg focus:border-text-ochre focus:outline-none pb-1 placeholder:text-ink/50" 
                  placeholder="e.g. Cold Calls" 
                />
              </div>
              <button type="button" onClick={() => remove(index)} className="text-ink hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase mb-1 text-ink">Connect to Rock</label>
                <select {...register(`inputs.${index}.rockIndex`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre">
                  {roadmap.rocks.map((rock, rIdx) => (
                    <option key={rIdx} value={rIdx}>{rock.name || `Rock ${rIdx + 1}`}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] uppercase mb-1 text-ink">Frequency</label>
                <select {...register(`inputs.${index}.frequency`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre">
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase mb-1 flex items-center justify-between text-ink">
                  Minimum
                  <span className="text-red-500 text-[9px] border border-red-500 px-1">Req</span>
                </label>
                <input type="number" {...register(`inputs.${index}.minimumTarget`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. 10" />
              </div>

              <div>
                <label className="block text-[10px] uppercase mb-1 flex items-center justify-between text-ink">
                  Normal
                  <span className="text-green-500 text-[9px] border border-green-500 px-1">Req</span>
                </label>
                <input type="number" {...register(`inputs.${index}.normalTarget`, { required: true })} className="w-full bg-paper border border-divider px-3 py-2 text-sm text-ink focus:outline-none focus:border-text-ochre" placeholder="e.g. 20" />
              </div>
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={() => append({ name: "", minimumTarget: "", normalTarget: "", stretchTarget: "", frequency: "DAILY", rockIndex: 0 })}
          className="w-full border border-dashed border-divider py-4 flex flex-col items-center justify-center text-ink hover:text-text-ochre hover:border-text-ochre transition-all"
        >
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs font-semibold uppercase tracking-wider">Add Input</span>
        </button>

        <hr className="border-divider" />

        <div className="pt-2 flex justify-between">
          <button 
            type="button"
            onClick={() => setStep(3)}
            className="border border-divider px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper transition-all uppercase"
          >
            Back
          </button>
          <button 
            type="submit"
            className="bg-paper border border-divider text-ink px-8 py-3 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-all uppercase"
          >
            Preview System
          </button>
        </div>
      </form>
    </div>
  );
}
