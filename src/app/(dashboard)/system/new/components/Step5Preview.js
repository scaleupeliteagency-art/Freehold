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
        <h2 className="text-2xl font-bold mb-2 tracking-tight uppercase">System Architecture Preview</h2>
        <p className="text-sm leading-relaxed">
          Review your long-term operating system structure before activation.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <div className="bg-paper border border-divider p-8 space-y-12">
        
        {/* System Identity */}
        <div className="text-left pb-8 border-b border-divider">
          <div className="inline-block border border-divider px-3 py-1 text-text-ochre text-[10px] font-bold tracking-widest uppercase mb-4">SYSTEM CORE</div>
          <h1 className="text-3xl font-bold mb-3 uppercase">{systemIdentity.name || "Unnamed System"}</h1>
          <p className="italic text-ink max-w-xl">"{systemIdentity.why || "No reason provided"}"</p>
        </div>

        {/* Long Term Goals */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2 text-ink">Long-Term Goals</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-paper p-5 border border-divider">
              <div className="flex justify-between items-center mb-2 border-b border-divider pb-2">
                <h4 className="text-sm font-bold uppercase text-text-ochre">Primary</h4>
                <span className="text-xs font-mono text-text-ochre">{goals.primary.weight}%</span>
              </div>
              <p className="text-xs mb-4 uppercase">{goals.primary.name}</p>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-[10px] uppercase">Target</div>
                  <div className="text-lg font-bold">{goals.primary.target} <span className="text-xs text-ink">{goals.primary.unit}</span></div>
                </div>
                <div className="text-[10px] uppercase text-right border border-divider p-1">
                  Deadline<br/><span className="">{goals.primary.deadline}</span>
                </div>
              </div>
            </div>

            {goals.secondary.enabled && (
              <div className="bg-paper p-5 border border-divider">
                <div className="flex justify-between items-center mb-2 border-b border-divider pb-2">
                  <h4 className="text-sm font-bold uppercase">Secondary</h4>
                  <span className="text-xs font-mono">{goals.secondary.weight}%</span>
                </div>
                <p className="text-xs mb-4 uppercase">{goals.secondary.name}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase">Target</div>
                    <div className="text-lg font-bold">{goals.secondary.target} <span className="text-xs text-ink">{goals.secondary.unit}</span></div>
                  </div>
                  <div className="text-[10px] uppercase text-right border border-divider p-1">
                    Deadline<br/><span className="">{goals.secondary.deadline}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap hierarchy */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2 text-ink">Active Execution Plan</h3>
          
          <div className="relative pl-6 space-y-6">
            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-divider" />
            
            {/* Year */}
            <div className="relative">
              <div className="absolute -left-[22px] top-1 w-3 h-3 bg-paper border border-divider" />
              <div className="text-[10px] text-text-ochre font-bold uppercase tracking-wider mb-1">Year {roadmap.year}</div>
              <div className="text-sm font-medium bg-paper py-2 px-3 border border-divider inline-block uppercase">{roadmap.yearlyGoal.name || "Undefined Yearly Goal"}</div>
            </div>

            {/* Quarter */}
            <div className="relative">
              <div className="absolute -left-[22px] top-1 w-3 h-3 bg-paper border border-text-ochre" />
              <div className="text-[10px] text-text-ochre font-bold uppercase tracking-wider mb-1">Quarter {roadmap.quarter}</div>
              <div className="text-sm font-medium bg-paper py-2 px-3 border border-text-ochre inline-block uppercase">{roadmap.quarterlyObjective.name || "Undefined Quarterly Objective"}</div>
              
              {/* Rocks */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {roadmap.rocks?.map((rock, rIdx) => (
                  <div key={rIdx} className="bg-paper border border-divider p-3">
                    <div className="text-[10px] uppercase mb-1 border-b border-divider pb-1">Rock {rIdx + 1}</div>
                    <div className="text-xs font-medium mb-3 uppercase">{rock.name || "Undefined Rock"}</div>
                    
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase border-b border-divider pb-1">Milestones</div>
                      {rock.milestones?.map((m, mIdx) => (
                        <div key={mIdx} className="text-[10px] flex items-start gap-1.5">
                          <span className="mt-[1px] font-mono border border-divider px-1">W{mIdx+1}</span> <span className="uppercase">{m.name || "—"}</span>
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
          <h3 className="text-xs font-bold uppercase tracking-widest border-b border-divider pb-2 text-ink">Daily Execution Protocol</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {inputs.length === 0 && <div className="text-xs">No inputs defined.</div>}
            {inputs.map((input, idx) => (
              <div key={idx} className="bg-paper p-3 border border-divider flex flex-col justify-between">
                <div className="text-xs font-bold mb-2 uppercase">{input.name || "Undefined Input"}</div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] border border-divider px-1.5 py-0.5 uppercase">{input.frequency}</div>
                  <div className="text-xs font-mono text-text-ochre">{input.minimumTarget} - {input.normalTarget}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <hr className="border-divider mt-8 mb-4" />

      <div className="pt-2 flex justify-between">
        <button 
          type="button"
          onClick={() => setStep(4)}
          className="border border-divider px-6 py-3 text-sm font-semibold hover:bg-ink hover:text-paper transition-all uppercase"
        >
          Back to Inputs
        </button>
        <button 
          onClick={handleContinue}
          className="bg-paper border border-divider text-ink px-8 py-3 text-sm font-semibold hover:bg-text-ochre hover:text-paper transition-all uppercase"
        >
          Finalize & Confirm
        </button>
      </div>
    </div>
  );
}
