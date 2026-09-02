"use client";

import { useEffect, useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { useParams, useRouter } from "next/navigation";
import PerformanceOverview from "./components/PerformanceOverview";
import ExecutionPerformance from "./components/ExecutionPerformance";
import GapAnalysis from "./components/GapAnalysis";
import InvestigationEngine from "./components/InvestigationEngine";
import DecisionEngine from "./components/DecisionEngine";
import ReviewSummary from "./components/ReviewSummary";
import { Check, ChevronRight } from "lucide-react";

export default function ReviewFlow() {
  const { id } = useParams();
  const router = useRouter();
  const { currentStep, reviewContext, setStep } = useReviewEngineStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If user refreshes and there is no active review context for this ID, boot them back
    if (useReviewEngineStore.getState().reviewContext?.id !== id) {
       // Optional: fetch draft from DB if missing, but for MVP we redirect if lost state
       // router.push("/reviews"); 
    }
  }, [id, router]);

  if (!mounted || !reviewContext) return null;

  const steps = [
    { id: 1, name: "Performance Overview" },
    { id: 2, name: "Execution" },
    { id: 3, name: "Gap Analysis" },
    { id: 4, name: "Investigation" },
    { id: 5, name: "Decisions" },
    { id: 6, name: "Summary" },
  ];

  return (
    <div className="min-h-screen bg-[#0F1014] text-gray-200 font-sans -mx-8 -mt-8 -mb-12">
      {/* Executive Header */}
      <header className="border-b border-white/10 bg-[#0A0B0E] px-8 py-4 sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 mb-1">
              <span>REVIEW ENGINE</span> <ChevronRight className="w-3 h-3" /> <span>{reviewContext.type}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Diagnostic Analysis</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#B8862E]">{reviewContext.periodStart} to {reviewContext.periodEnd}</div>
            <div className="text-xs text-gray-500">Draft Status</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-4xl px-6 py-12">
        
        {/* Progress Tracker */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500
                    ${currentStep === step.id ? "bg-[#B8862E] text-white shadow-[0_0_15px_rgba(184,134,46,0.4)] ring-2 ring-[#B8862E]/50 ring-offset-2 ring-offset-[#0F1014]" : 
                      currentStep > step.id ? "bg-[#1F2026] text-[#B8862E] border border-[#B8862E]/30" : "bg-[#1F2026] text-gray-600 border border-white/5"}`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span className={`absolute -bottom-6 text-[10px] uppercase tracking-wider whitespace-nowrap font-medium hidden md:block
                  ${currentStep === step.id ? "text-[#B8862E]" : "text-gray-600"}`}>
                  {step.name}
                </span>
              </div>
            ))}
            
            {/* Connecting Lines */}
            <div className="absolute top-[16px] left-0 w-full h-[1px] -z-0 max-w-4xl mx-auto px-10">
               <div className="relative w-full h-full bg-white/5 rounded">
                  <div 
                    className="absolute top-0 left-0 h-full bg-[#B8862E]/30 transition-all duration-500" 
                    style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Step Content Rendering */}
        <div className="bg-[#14151A] border border-white/5 rounded-2xl p-10 shadow-2xl">
          {currentStep === 1 && <PerformanceOverview onNext={() => setStep(2)} />}
          {currentStep === 2 && <ExecutionPerformance onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {currentStep === 3 && <GapAnalysis onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {currentStep === 4 && <InvestigationEngine onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {currentStep === 5 && <DecisionEngine onNext={() => setStep(6)} onBack={() => setStep(4)} />}
          {currentStep === 6 && <ReviewSummary onBack={() => setStep(5)} />}
        </div>
        
      </main>
    </div>
  );
}
