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
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <span className="font-bold text-xs">OS</span>
            </div>
            <span className="font-semibold text-gray-900">System Architect</span>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-gray-100 rounded-full px-3 py-1">
            Step {currentStep} of 6
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full px-6 py-12">
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Connecting Lines */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 bg-gray-200 -z-10" />
            <div 
              className="absolute top-1/2 left-0 h-[2px] -translate-y-1/2 bg-orange-600 -z-10 transition-all duration-300" 
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-300
                    ${currentStep === step.id ? "bg-orange-600 text-white shadow-md shadow-orange-200" : 
                      currentStep > step.id ? "bg-orange-600 text-white" : "bg-white text-gray-400 border-2 border-gray-200"}`}
                >
                  {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                </div>
                <span className={`absolute -bottom-7 text-xs font-medium whitespace-nowrap
                  ${currentStep === step.id ? "text-orange-600" : currentStep > step.id ? "text-gray-900" : "text-gray-400"}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content Rendering */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-10">
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
