"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

import StepIdentity from "./StepIdentity";
import StepGoals from "./StepGoals";
import StepRoadmap from "./StepRoadmap";
import StepInputs from "./StepInputs";
import StepPreview from "./StepPreview";

const steps = [
  { id: 1, name: "Identity" },
  { id: 2, name: "Goals" },
  { id: 3, name: "Roadmap" },
  { id: 4, name: "Inputs" },
  { id: 5, name: "Preview & Activate" }
];

export default function SystemWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Global form state
  const [data, setData] = useState({
    name: "",
    why: "",
    primaryGoal: { name: "", unit: "", baseline: 0, target: 0, deadline: "", direction: "higher", weight: 100 },
    secondaryGoal: null,
    roadmap: {
      year: { objective: "" },
      quarter: { 
        objective: "", 
        rocks: [
          { id: 1, name: "", milestones: [{ id: 101, name: "", target: 0, deadline: "" }] },
          { id: 2, name: "", milestones: [{ id: 201, name: "", target: 0, deadline: "" }] },
          { id: 3, name: "", milestones: [{ id: 301, name: "", target: 0, deadline: "" }] }
        ]
      }
    },
    inputs: []
  });

  const updateData = (updates) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateSystem = () => {
    // Basic structural validation check before API call
    if (!data.name || !data.why || !data.primaryGoal.name) return false;
    if (data.inputs.length === 0) return false;
    return true;
  };

  const handleActivate = async () => {
    if (!validateSystem()) {
      setError("Please ensure all required fields are filled.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) throw new Error("Authentication required");

      // 1. Insert System
      const { data: system, error: sysError } = await supabase
        .from('systems')
        .insert([{
          user_id: user.id,
          name: data.name,
          why: data.why,
          category: 'General',
          status: 'ACTIVE',
          current_phase: 'Foundation'
        }]).select().single();

      if (sysError) throw sysError;

      // 2. Insert Goals (North Stars)
      const goalsToInsert = [
        {
          system_id: system.id,
          name: data.primaryGoal.name,
          starting_value: data.primaryGoal.baseline,
          target_value: data.primaryGoal.target,
          current_value: data.primaryGoal.baseline,
          unit: data.primaryGoal.unit,
          deadline: data.primaryGoal.deadline,
        }
      ];

      if (data.secondaryGoal && data.secondaryGoal.name) {
        goalsToInsert.push({
          system_id: system.id,
          name: data.secondaryGoal.name,
          starting_value: data.secondaryGoal.baseline,
          target_value: data.secondaryGoal.target,
          current_value: data.secondaryGoal.baseline,
          unit: data.secondaryGoal.unit,
          deadline: data.secondaryGoal.deadline,
        });
      }

      const { error: goalError } = await supabase.from('north_star_goals').insert(goalsToInsert);
      if (goalError) throw goalError;

      // 3. Insert Year Plan
      const currentYear = new Date().getFullYear();
      const { data: yearPlan, error: yearError } = await supabase
        .from('year_plans')
        .insert([{
          system_id: system.id,
          year_number: currentYear,
          status: 'ACTIVE'
        }]).select().single();
      if (yearError) throw yearError;

      // 4. Insert Quarter
      const { data: quarter, error: qError } = await supabase
        .from('quarters')
        .insert([{
          year_plan_id: yearPlan.id,
          quarter_number: Math.floor((new Date().getMonth() / 3)) + 1,
          objective: data.roadmap.quarter.objective,
          status: 'ACTIVE'
        }]).select().single();
      if (qError) throw qError;

      // 5. Insert Rocks, Milestones & Inputs
      // Since this requires relational mapping back to Supabase generated UUIDs,
      // we iterate carefully.
      for (let i = 0; i < data.roadmap.quarter.rocks.length; i++) {
        const rockData = data.roadmap.quarter.rocks[i];
        if (!rockData.name) continue;

        const { data: rock, error: rError } = await supabase
          .from('monthly_rocks')
          .insert([{
            quarter_id: quarter.id,
            name: rockData.name,
            month: (new Date().getMonth() + 1) + i, // Rough estimation for MVP
            status: 'ACTIVE'
          }]).select().single();
        
        if (rError) throw rError;

        for (let j = 0; j < rockData.milestones.length; j++) {
          const msData = rockData.milestones[j];
          if (!msData.name) continue;

          // Note: In MVP we aren't creating explicit 'metrics' rows for each milestone yet,
          // but we can just use the target values directly on the milestone table.
          const { data: ms, error: msError } = await supabase
            .from('weekly_milestones')
            .insert([{
              monthly_rock_id: rock.id,
              week_number: j + 1,
              name: msData.name,
              baseline: 0,
              current_value: 0,
              target: msData.target,
              deadline: msData.deadline,
              status: 'ACTIVE'
            }]).select().single();

          if (msError) throw msError;

          // Find inputs connected to this frontend milestone ID
          const connectedInputs = data.inputs.filter(inp => inp.milestoneId == msData.id);
          
          if (connectedInputs.length > 0) {
            const inputsToInsert = connectedInputs.map(inp => ({
              system_id: system.id,
              weekly_milestone_id: ms.id,
              name: inp.name,
              target: inp.normal, // Using 'normal' as target
              frequency: inp.frequency,
              active_status: true
            }));

            const { error: iError } = await supabase.from('input_definitions').insert(inputsToInsert);
            if (iError) throw iError;
          }
        }
      }

      // 6. Redirect to Dashboard
      router.push('/dashboard');
      
    } catch (err) {
      console.error(err);
      setError(err.message || "An error occurred during system activation.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress Header */}
      <nav aria-label="Progress" className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <ol role="list" className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <li key={step.name} className="flex items-center">
              <span className={`text-sm font-medium ${currentStep === step.id ? 'text-[#B8862E]' : currentStep > step.id ? 'text-gray-900' : 'text-gray-400'}`}>
                {step.id}. {step.name}
              </span>
              {index !== steps.length - 1 && (
                <svg className="ml-4 h-5 w-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Main Content Area */}
      <div className="p-8 flex-1 bg-white">
        {currentStep === 1 && <StepIdentity data={data} updateData={updateData} />}
        {currentStep === 2 && <StepGoals data={data} updateData={updateData} />}
        {currentStep === 3 && <StepRoadmap data={data} updateData={updateData} />}
        {currentStep === 4 && <StepInputs data={data} updateData={updateData} />}
        {currentStep === 5 && <StepPreview data={data} />}

        {error && (
          <div className="mt-6 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="bg-gray-50 border-t border-gray-200 px-8 py-5 flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1 || isSubmitting}
          className="rounded bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Back
        </button>
        
        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="rounded bg-[#111827] px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleActivate}
            disabled={isSubmitting || !validateSystem()}
            className="rounded bg-[#B8862E] px-8 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#A37525] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? "Activating..." : "Activate System"}
          </button>
        )}
      </div>
    </div>
  );
}
