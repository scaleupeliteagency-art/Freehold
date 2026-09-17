"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// Import components that we will rewrite
import DataAssembly from "./components/DataAssembly";
import AIInvestigation from "./components/AIInvestigation";
import MilestoneVerification from "./components/MilestoneVerification";
import InputEvolution from "./components/InputEvolution";
import ReviewSummary from "./components/ReviewSummary";

export default function ReviewFlow() {
  const { id } = useParams(); // 'id' will be something like 'rev_12345'
  const router = useRouter();
  
  const [currentStep, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // The global state for the review
  const [reviewState, setReviewState] = useState({
    system: null,
    milestone: null,
    inputs: [],
    entries: [],
    aiAnalysis: null,
    milestoneAchieved: false,
    inputChanges: [], // To track evolved inputs
    resultHandoff: false
  });

  useEffect(() => {
    async function loadData() {
      // Fetch active system
      const { data: systems } = await supabase.from("systems").select("*").eq("status", "active").limit(1);
      if (!systems || systems.length === 0) return;
      const system = systems[0];

      // Fetch active milestone
      const { data: milestones } = await supabase.from("weekly_milestones").select("*, monthly_rocks!inner(quarter_id)").eq("status", "active").limit(1);
      const activeMilestone = milestones?.[0] || null;

      // Fetch active inputs
      const { data: inputs } = await supabase.from("input_definitions").select("*").eq("system_id", system.id).eq("status", "active");

      setReviewState(prev => ({ ...prev, system, milestone: activeMilestone, inputs: inputs || [] }));
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div className="p-12 text-center text-sm font-semibold text-gray-500 animate-pulse">Initializing Investigation Engine...</div>;

  const steps = [
    { id: 1, name: "Data Assembly" },
    { id: 2, name: "AI Investigation" },
    { id: 3, name: "Milestone Check" },
    { id: 4, name: "System Evolution" },
    { id: 5, name: "Finalize" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans -mx-8 -mt-8 -mb-12">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-8 py-5 sticky top-0 z-50">
        <div className="mx-auto w-full flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-1">
              <span>Review Pipeline</span>
              <ChevronRight className="w-3 h-3" />
              <span>{id}</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Diagnostic Analysis</h1>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-gray-500 mt-1">Step {currentStep} of {steps.length}</div>
          </div>
        </div>
      </header>

      {/* Progress Tracker */}
      <div className="border-b border-gray-200 bg-white sticky top-[73px] z-40">
        <div className="mx-auto w-full px-8 py-4">
          <div className="flex items-center gap-0 overflow-x-auto relative">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center shrink-0">
                <button
                  onClick={() => currentStep > step.id && setStep(step.id)}
                  className={`flex items-center gap-2.5 px-3 py-1 text-sm font-semibold transition-colors
                    ${currentStep === step.id ? "text-orange-600" :
                      currentStep > step.id ? "text-gray-900 cursor-pointer hover:text-orange-600" :
                      "text-gray-400 cursor-default"}`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors
                    ${currentStep === step.id ? "bg-orange-600 text-white shadow-sm" :
                      currentStep > step.id ? "bg-gray-900 text-white" :
                      "bg-gray-100 text-gray-400"}`}
                  >
                    {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
                  </span>
                  <span className="hidden md:block">{step.name}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className={`w-10 h-[2px] mx-2 shrink-0 rounded-full transition-colors ${currentStep > step.id ? "bg-gray-900" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="mx-auto w-full px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-10">
          {currentStep === 1 && <DataAssembly reviewState={reviewState} setReviewState={setReviewState} onNext={() => setStep(2)} />}
          {currentStep === 2 && <AIInvestigation reviewState={reviewState} setReviewState={setReviewState} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
          {currentStep === 3 && <MilestoneVerification reviewState={reviewState} setReviewState={setReviewState} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {currentStep === 4 && <InputEvolution reviewState={reviewState} setReviewState={setReviewState} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
          {currentStep === 5 && <ReviewSummary reviewState={reviewState} onBack={() => setStep(4)} />}
        </div>
      </main>
    </div>
  );
}
