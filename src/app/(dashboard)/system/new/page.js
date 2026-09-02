"use client";

import { useEffect, useState } from "react";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import Step1Identity from "./components/Step1Identity";
import Step2Goals from "./components/Step2Goals";
import Step3Roadmap from "./components/Step3Roadmap";
import Step4Inputs from "./components/Step4Inputs";
import Step5Preview from "./components/Step5Preview";
import Step6Activation from "./components/Step6Activation";
import { Check } from "lucide-react";

export default function SystemCreationFlow() {
  const currentStep = useSystemCreationStore((state) => state.currentStep);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch with Zustand persist

  const steps = [
    { id: 1, name: "System Identity" },
    { id: 2, name: "Define Goals" },
    { id: 3, name: "Progressive Roadmap" },
    { id: 4, name: "Daily Inputs" },
    { id: 5, name: "System Preview" },
    { id: 6, name: "Activation" },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink font-sans selection:bg-text-ochre selection:text-paper">
      {/* Header */}
      <header className="border-b border-divider bg-paper px-8 py-4">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-divider bg-paper flex items-center justify-center">
              <span className="text-ink font-bold text-[10px]">OS</span>
            </div>
            <span className="font-semibold text-sm tracking-widest uppercase text-ink">System Architect</span>
          </div>
          <div className="text-xs text-ink font-mono tracking-wider border border-divider px-2 py-1">
            STEP {currentStep} OF 6
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-3xl px-6 py-16">
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] -translate-y-1/2 bg-divider -z-10" />
            
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center bg-paper px-2">
                <div 
                  className={`w-8 h-8 border flex items-center justify-center text-xs font-semibold
                    ${currentStep === step.id ? "border-text-ochre text-text-ochre bg-paper" : 
                      currentStep > step.id ? "border-ink text-ink bg-paper" : "border-divider text-divider bg-paper"}`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`absolute -bottom-6 text-[10px] uppercase tracking-wider whitespace-nowrap font-medium
                  ${currentStep === step.id ? "text-text-ochre" : "text-ink"}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <hr className="border-divider mb-8" />

        {/* Step Content Rendering */}
        <div className="bg-paper border border-divider p-10">
          {currentStep === 1 && <Step1Identity />}
          {currentStep === 2 && <Step2Goals />}
          {currentStep === 3 && <Step3Roadmap />}
          {currentStep === 4 && <Step4Inputs />}
          {currentStep === 5 && <Step5Preview />}
          {currentStep === 6 && <Step6Activation />}
        </div>
        
      </main>
    </div>
  );
}
