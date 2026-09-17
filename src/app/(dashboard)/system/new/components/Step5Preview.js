"use client";

import useSystemCreationStore from "@/lib/store/useSystemCreationStore";

export default function Step5Preview() {
  const { systemIdentity, goals, roadmap, inputs, setStep } = useSystemCreationStore();

  const validateSystem = () => {
    // We could add robust validation here. For MVP, we trust the Zod schemas from previous steps.
    return true; 
  };

  const handleContinue = () => {
    if (validateSystem()) setStep(6);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">System Architecture Preview</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Review your long-term operating system structure before activation.
        </p>
      </div>

      <hr className="border-gray-100 mb-8" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-12">
        
        {/* System Identity */}
        <div className="text-left pb-8 border-b border-gray-100">
          <div className="inline-block bg-orange-50 rounded-full px-3 py-1 text-orange-600 text-xs font-semibold mb-4">System Core</div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">{systemIdentity.name || "Unnamed System"}</h1>
          <p className="text-gray-500 max-w-xl text-lg">"{systemIdentity.why || "No reason provided"}"</p>
        </div>

        {/* Long Term Goals */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Long-Term Goals</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <h4 className="text-sm font-semibold text-orange-600">Primary</h4>
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">{goals.primary.weight}%</span>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-4">{goals.primary.name}</p>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Target</div>
                  <div className="text-2xl font-semibold text-gray-900">{goals.primary.target} <span className="text-sm text-gray-500 font-normal">{goals.primary.unit}</span></div>
                </div>
                <div className="text-xs text-right bg-gray-50 rounded-lg p-2 border border-gray-100">
                  <span className="text-gray-500 block mb-1">Deadline</span>
                  <span className="font-medium text-gray-900">{goals.primary.deadline}</span>
                </div>
              </div>
            </div>

            {goals.secondary.enabled && (
              <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                  <h4 className="text-sm font-semibold text-gray-900">Secondary</h4>
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{goals.secondary.weight}%</span>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-4">{goals.secondary.name}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Target</div>
                    <div className="text-2xl font-semibold text-gray-900">{goals.secondary.target} <span className="text-sm text-gray-500 font-normal">{goals.secondary.unit}</span></div>
                  </div>
                  <div className="text-xs text-right bg-gray-50 rounded-lg p-2 border border-gray-100">
                    <span className="text-gray-500 block mb-1">Deadline</span>
                    <span className="font-medium text-gray-900">{goals.secondary.deadline}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap hierarchy */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Active Execution Plan</h3>
          
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200" />
            
            {/* Year */}
            <div className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 bg-white border-2 border-gray-300 rounded-full" />
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Year {roadmap.year}</div>
              <div className="text-sm font-medium bg-gray-50 rounded-lg py-2.5 px-4 border border-gray-200 inline-block text-gray-900">{roadmap.yearlyGoal.name || "Undefined Yearly Goal"}</div>
            </div>

            {/* Quarter */}
            <div className="relative">
              <div className="absolute -left-[23px] top-1.5 w-3 h-3 bg-white border-2 border-orange-500 rounded-full" />
              <div className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-2">Quarter {roadmap.quarter}</div>
              <div className="text-sm font-medium bg-orange-50 rounded-lg py-2.5 px-4 border border-orange-200 inline-block text-orange-900">{roadmap.quarterlyObjective.name || "Undefined Quarterly Objective"}</div>
              
              {/* Rocks */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {roadmap.rocks?.map((rock, rIdx) => (
                  <div key={rIdx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="text-xs text-gray-500 font-medium mb-2 border-b border-gray-100 pb-2">Rock {rIdx + 1}</div>
                    <div className="text-sm font-semibold text-gray-900 mb-4">{rock.name || "Undefined Rock"}</div>
                    
                    <div className="space-y-2.5">
                      <div className="text-xs text-gray-500 font-medium border-b border-gray-100 pb-1.5">Milestones</div>
                      {rock.milestones?.map((m, mIdx) => (
                        <div key={mIdx} className="text-sm flex items-start gap-2 text-gray-700">
                          <span className="font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded text-xs">W{mIdx+1}</span> <span>{m.name || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Daily Execution Protocol</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {inputs.length === 0 && <div className="text-sm text-gray-500">No inputs defined.</div>}
            {inputs.map((input, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col justify-between">
                <div className="text-sm font-semibold text-gray-900 mb-3">{input.name || "Undefined Input"}</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs font-medium text-gray-500 bg-gray-50 rounded-md px-2 py-1">{input.frequency}</div>
                  <div className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{input.minimumTarget} - {input.normalTarget}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <hr className="border-gray-100 mt-8 mb-4" />

      <div className="pt-2 flex justify-between">
        <button 
          type="button"
          onClick={() => setStep(4)}
          className="rounded-lg font-medium px-6 py-2.5 transition-colors border border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
        >
          Back to Inputs
        </button>
        <button 
          onClick={handleContinue}
          className="rounded-lg font-medium px-6 py-2.5 transition-colors bg-orange-600 text-white hover:bg-orange-700 shadow-sm"
        >
          Finalize & Confirm
        </button>
      </div>
    </div>
  );
}
