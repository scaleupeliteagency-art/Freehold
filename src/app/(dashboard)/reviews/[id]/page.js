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
import MilestoneVerification from "./components/MilestoneVerification";
import InputOptimization from "./components/InputOptimization";
import { Check, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function ReviewFlow() {
  const { id } = useParams();
  const router = useRouter();
  const { currentStep, reviewContext, setStep } = useReviewEngineStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, [id, router]);

  if (!mounted || !reviewContext) return null;

  const steps = [
    { id: 1, name: "Performance" },
    { id: 2, name: "Execution" },
    { id: 3, name: "Milestones" },
    { id: 4, name: "Gap Analysis" },
    { id: 5, name: "Investigation" },
    { id: 6, name: "Input Optimisation" },
    { id: 7, name: "Decisions" },
    { id: 8, name: "Summary" },
  ];

  const handleCompleteReview = async () => {
    // Unfreeze the system and push next_review_date forward by 7 days
    try {
      const { data: systems } = await supabase
        .from("systems")
        .select("id")
        .eq("status", "active")
        .limit(1);

      if (systems && systems.length > 0) {
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 7);
        await supabase
          .from("systems")
          .update({
            is_frozen: false,
            next_review_date: nextReview.toISOString()
          })
          .eq("id", systems[0].id);
      }
    } catch (err) {
      console.error("Error unfreezing system:", err);
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans -mx-8 -mt-8 -mb-12">
      {/* Header */}
      <header className="border-b border-divider bg-paper px-8 py-5 sticky top-0 z-50">
        <div className="mx-auto max-w-5xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">
              <span>Weekly Review</span>
              <ChevronRight className="w-3 h-3" />
              <span>{reviewContext.type}</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-ink uppercase tracking-tight">Diagnostic Analysis</h1>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-bold text-ochre">{reviewContext.periodStart} → {reviewContext.periodEnd}</div>
            <div className="text-[10px] text-ink/50 uppercase tracking-widest mt-1">Draft · Step {currentStep} of {steps.length}</div>
          </div>
        </div>
      </header>

      {/* Progress Tracker */}
      <div className="border-b border-divider bg-paper sticky top-[73px] z-40">
        <div className="mx-auto max-w-5xl px-8 py-4">
          <div className="flex items-center gap-0 overflow-x-auto">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center shrink-0">
                <button
                  onClick={() => currentStep > step.id && setStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors
                    ${currentStep === step.id ? "text-ink border-b-2 border-ink" :
                      currentStep > step.id ? "text-ochre cursor-pointer hover:text-ink" :
                      "text-ink/30 cursor-default"}`}
                >
                  <span className={`w-5 h-5 border flex items-center justify-center text-[9px] shrink-0
                    ${currentStep === step.id ? "border-ink bg-ink text-paper" :
                      currentStep > step.id ? "border-ochre text-ochre" :
                      "border-divider text-ink/30"}`}
                  >
                    {currentStep > step.id ? <Check className="w-3 h-3" /> : step.id}
                  </span>
                  <span className="hidden md:block">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="w-4 h-[1px] bg-divider shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="bg-paper border border-divider p-10">
          {currentStep === 1 && <PerformanceOverview onNext={() => setStep(2)} />}
          {currentStep === 2 && <ExecutionPerformance onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {currentStep === 3 && <MilestoneVerification onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {currentStep === 4 && <GapAnalysis onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {currentStep === 5 && <InvestigationEngine onNext={() => setStep(6)} onBack={() => setStep(4)} />}
          {currentStep === 6 && <InputOptimization onNext={() => setStep(7)} onBack={() => setStep(5)} />}
          {currentStep === 7 && <DecisionEngine onNext={() => setStep(8)} onBack={() => setStep(6)} />}
          {currentStep === 8 && <ReviewSummary onBack={() => setStep(7)} onComplete={handleCompleteReview} />}
        </div>
      </main>
    </div>
  );
}
