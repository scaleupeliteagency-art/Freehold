"use client";

import { useEffect, useState } from "react";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import Step1Identity from "./components/Step1Identity";
import Step2SystemConfig from "./components/Step2SystemConfig";
import Step3Goals from "./components/Step3Goals";
import Step4Roadmap from "./components/Step4Roadmap";
import Step5Inputs from "./components/Step5Inputs";
import Step6NoTodoList from "./components/Step6NoTodoList";
import Step7FocusArchitecture from "./components/Step7FocusArchitecture";
import Step8PerfectWeek from "./components/Step8PerfectWeek";
import Step9Accountability from "./components/Step9Accountability";
import Step10Gamification from "./components/Step10Gamification";
import Step11Preview from "./components/Step11Preview";
import Step12Activation from "./components/Step12Activation";
import {
  Check,
  Shield,
  Settings2,
  Target,
  Layers,
  LockKeyhole,
  Ban,
  Sparkles,
  Calendar,
  ShieldAlert,
  Gamepad2,
  Eye,
  Rocket,
} from "lucide-react";

export default function SystemCreationFlow() {
  const currentStep = useSystemCreationStore((state) => state.currentStep);
  const setStep = useSystemCreationStore((state) => state.setStep);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  const steps = [
    { id: 1, name: "Identity & Mission", icon: Shield },
    { id: 2, name: "Lifecycle & Config", icon: Settings2 },
    { id: 3, name: "Goals & Success", icon: Target },
    { id: 4, name: "Strategic Roadmap", icon: Layers },
    { id: 5, name: "Execution Inputs", icon: LockKeyhole },
    { id: 6, name: "No-To-Do List", icon: Ban },
    { id: 7, name: "Focus Architecture", icon: Sparkles },
    { id: 8, name: "Perfect Week", icon: Calendar },
    { id: 9, name: "Accountability", icon: ShieldAlert },
    { id: 10, name: "Gamification", icon: Gamepad2 },
    { id: 11, name: "Blueprint Preview", icon: Eye },
    { id: 12, name: "Activation Lock", icon: Rocket },
  ];

  const currentStepObj = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <div className="min-h-screen bg-gray-50/70 text-gray-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-6 sm:px-8 py-4 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
              OS
            </div>
            <div>
              <span className="font-bold text-gray-900 text-sm block">Personal Operating System Architect</span>
              <span className="text-xs text-gray-500 hidden sm:block">Configuration & Execution Blueprint</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1 bg-orange-50 text-orange-700 rounded-full border border-orange-200">
              Stage {currentStep} of {steps.length} — {currentStepObj.name}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-8 pb-12">
        {/* Step Progression Bar / Pill Selector */}
        <div className="mb-10 bg-white rounded-2xl border border-gray-200 p-4 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[760px] gap-2">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.id;
              const isPast = currentStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    // Allow navigating to any previously visited step or direct view
                    if (isPast || step.id <= currentStep) {
                      setStep(step.id);
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? "text-orange-600"
                      : isPast
                      ? "text-gray-700 hover:text-orange-600"
                      : "text-gray-400 opacity-60"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-orange-600 text-white shadow-md shadow-orange-200 ring-4 ring-orange-100"
                        : isPast
                        ? "bg-orange-100 text-orange-700 font-semibold"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : step.id}
                  </div>
                  <span className="text-[10px] font-bold whitespace-nowrap tracking-tight">
                    {step.name.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* Progress bar line */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-orange-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Step Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 transition-all">
          {currentStep === 1 && <Step1Identity />}
          {currentStep === 2 && <Step2SystemConfig />}
          {currentStep === 3 && <Step3Goals />}
          {currentStep === 4 && <Step4Roadmap />}
          {currentStep === 5 && <Step5Inputs />}
          {currentStep === 6 && <Step6NoTodoList />}
          {currentStep === 7 && <Step7FocusArchitecture />}
          {currentStep === 8 && <Step8PerfectWeek />}
          {currentStep === 9 && <Step9Accountability />}
          {currentStep === 10 && <Step10Gamification />}
          {currentStep === 11 && <Step11Preview />}
          {currentStep === 12 && <Step12Activation />}
        </div>
      </main>
    </div>
  );
}
