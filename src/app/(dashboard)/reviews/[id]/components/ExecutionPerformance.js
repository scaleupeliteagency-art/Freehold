"use client";

import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function ExecutionPerformance({ onNext, onBack }) {
  const { snapshots } = useReviewEngineStore();

  const getStatus = (actual, target) => {
    const min = target * 0.5; 
    if (actual < min) return { label: 'BELOW MINIMUM', color: 'text-red-700', bg: 'bg-red-700/10', border: 'border-red-700' };
    if (actual >= target) return { label: 'NORMAL', color: 'text-ink', bg: 'bg-ink/10', border: 'border-ink' };
    return { label: 'ACCEPTABLE', color: 'text-ochre', bg: 'bg-ochre/10', border: 'border-ochre' };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b-2 border-divider pb-4">
        <h2 className="text-2xl font-bold text-ink mb-1 uppercase tracking-tight">Execution Performance</h2>
        <p className="text-ink/60 text-sm font-mono uppercase">
          Milestone Verification & Input Optimization
        </p>
      </div>

      <div className="space-y-12">
        {/* Milestone Verification Section */}
        <section>
          <h3 className="text-lg font-bold text-ink uppercase mb-4 flex items-center gap-2">
            <span className="bg-ink text-paper px-2 py-0.5 text-xs">1</span> Milestone Verification
          </h3>
          
          {(!snapshots.milestones || snapshots.milestones.length === 0) ? (
            <div className="bg-paper border-2 border-divider p-6 text-center">
              <AlertTriangle className="w-6 h-6 text-ink/40 mx-auto mb-2" />
              <p className="text-ink/60 font-mono text-sm uppercase">No milestone data recorded.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {snapshots.milestones.map((milestone, idx) => (
                <div key={idx} className="bg-paper border-2 border-divider p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {milestone.achieved ? (
                      <CheckCircle2 className="w-5 h-5 text-ink" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-700" />
                    )}
                    <div>
                      <h4 className="font-bold text-ink uppercase text-sm">{milestone.name}</h4>
                      <p className="text-xs text-ink/60 font-mono uppercase">{milestone.date || 'TBD'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 border-2 ${milestone.achieved ? 'border-ink text-ink bg-ink/5' : 'border-red-700 text-red-700 bg-red-700/5'}`}>
                      {milestone.achieved ? 'Verified' : 'Missed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Input Optimization Section */}
        <section>
          <h3 className="text-lg font-bold text-ink uppercase mb-4 flex items-center gap-2">
            <span className="bg-ink text-paper px-2 py-0.5 text-xs">2</span> Input Optimization
          </h3>

          {(!snapshots.inputs || snapshots.inputs.length === 0) ? (
            <div className="bg-paper border-2 border-divider p-8 text-center">
              <AlertTriangle className="w-6 h-6 text-ink/40 mx-auto mb-3" />
              <p className="text-ink/60 font-mono text-sm uppercase">Not enough input data yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {snapshots.inputs.map((input, idx) => {
                const status = getStatus(input.actual, input.target);
                const consistency = Math.round((input.actual / input.target) * 100);

                return (
                  <div key={idx} className="bg-paper border-2 border-divider p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-base font-bold text-ink uppercase">{input.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 uppercase border-2 ${status.border} ${status.color} ${status.bg}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div>
                          <span className="text-ink/60 text-[10px] font-bold uppercase">Actual:</span> <span className="text-ink font-mono font-bold ml-1">{input.actual}</span>
                        </div>
                        <div>
                          <span className="text-ink/60 text-[10px] font-bold uppercase">Target:</span> <span className="text-ink font-mono font-bold ml-1">{input.target}</span>
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right border-t-2 md:border-t-0 md:border-l-2 border-divider pt-4 md:pt-0 md:pl-6 w-full md:w-48">
                      <div className="text-[10px] uppercase font-bold text-ink/60 font-mono tracking-wider mb-1">Consistency</div>
                      <div className="flex items-center gap-3 md:justify-end">
                        <div className="w-full bg-divider h-2 overflow-hidden border border-ink/10">
                          <div 
                            className={`h-full transition-all ${consistency >= 100 ? 'bg-ink' : consistency >= 50 ? 'bg-ochre' : 'bg-red-700'}`}
                            style={{ width: `${Math.min(100, consistency)}%` }}
                          />
                        </div>
                        <span className="text-ink font-bold font-mono text-sm">{consistency}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div className="pt-8 flex justify-between items-center mt-8 border-t-2 border-divider">
        <button 
          onClick={onBack}
          className="text-ink/60 px-6 py-3 text-sm font-bold uppercase hover:text-ink transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNext}
          className="bg-ochre text-paper px-8 py-3 font-bold hover:bg-ink transition-all shadow-[4px_4px_0px_0px_rgba(30,42,36,1)] border-2 border-ink flex items-center gap-2 uppercase tracking-wide"
        >
          Identify Constraints <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
