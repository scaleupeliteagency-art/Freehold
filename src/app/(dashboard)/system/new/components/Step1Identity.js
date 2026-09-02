"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";

const identitySchema = z.object({
  name: z.string().min(2, "System Name is required (min 2 chars)"),
  why: z.string().min(10, "Please provide a meaningful reason (min 10 chars)"),
});

export default function Step1Identity() {
  const { systemIdentity, setIdentity, setStep } = useSystemCreationStore();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(identitySchema),
    defaultValues: systemIdentity,
  });

  const onSubmit = (data) => {
    setIdentity(data);
    setStep(2);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">System Identity</h2>
        <p className="text-sm leading-relaxed">
          The first step is establishing the identity and core purpose of your system. 
          What is this system called, and why does it exist?
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-2 uppercase tracking-wider text-text-ochre">System Name</label>
          <input 
            type="text"
            {...register("name")}
            placeholder="e.g. Ascend Growth System"
            className="w-full bg-paper border border-divider px-4 py-3 text-ink focus:outline-none focus:border-text-ochre transition-all placeholder:text-ink/50"
          />
          {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 uppercase tracking-wider text-text-ochre">Why does this system exist?</label>
          <textarea 
            {...register("why")}
            placeholder="e.g. Build Ascend into a profitable international acquisition agency and create financial independence."
            rows={4}
            className="w-full bg-paper border border-divider px-4 py-3 text-ink focus:outline-none focus:border-text-ochre transition-all placeholder:text-ink/50 resize-none"
          />
          {errors.why && <p className="mt-2 text-xs text-red-500">{errors.why.message}</p>}
        </div>

        <hr className="border-divider" />

        <div className="pt-2 flex justify-end">
          <button 
            type="submit"
            className="bg-paper border border-divider text-ink px-8 py-3 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-all uppercase"
          >
            Continue to Goals
          </button>
        </div>
      </form>
    </div>
  );
}
