"use client";

import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function ExecutionPerformance({ onNext, onBack }) {
  const { snapshots } = useReviewEngineStore();

  const getStatus = (actual, target) => {
    // simplified for MVP: assuming target is 'normal' and half of it is 'minimum'
    const min = target * 0.5; 
    if (actual < min) return { label: 'BELOW MINIMUM', color: 'text-red-400', bg: 'bg-red-400/10' };
    if (actual >= target) return { label: 'NORMAL', color: 'text-green-400', bg: 'bg-green-400/10' };
    return { label: 'ACCEPTABLE', color: 'text-amber-400', bg: 'bg-amber-400/10' };
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Execution Performance</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          How consistently were the required inputs executed?
        </p>
      </div>

      {snapshots.inputs.length === 0 ? (
        <div className="bg-[#0A0B0E] border border-white/5 rounded-xl p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">Not enough data yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {snapshots.inputs.map((input, idx) => {
            const status = getStatus(input.actual, input.target);
            const consistency = Math.round((input.actual / input.target) * 100);

            return (
              <div key={idx} className="bg-[#0A0B0E] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-bold text-white">{input.name}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${status.color} ${status.bg}`}>
                      {status.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs">Actual:</span> <span className="text-white font-mono">{input.actual}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Normal Target:</span> <span className="text-white font-mono">{input.target}</span>
                    </div>
                  </div>
                </div>

                <div className="md:text-right border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 w-full md:w-48">
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Consistency</div>
                  <div className="flex items-center gap-3 md:justify-end">
                    <div className="w-full bg-[#1A1C23] rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${consistency >= 100 ? 'bg-green-500' : consistency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, consistency)}%` }}
                      />
                    </div>
                    <span className="text-white font-bold font-mono text-sm">{consistency}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-8 flex justify-between items-center mt-4 border-t border-white/5">
        <button 
          onClick={onBack}
          className="text-gray-400 px-6 py-3 rounded-lg text-sm font-semibold hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNext}
          className="bg-[#B8862E] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#A37525] transition-all shadow-lg shadow-[#B8862E]/20 flex items-center gap-2"
        >
          Identify Constraints <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
