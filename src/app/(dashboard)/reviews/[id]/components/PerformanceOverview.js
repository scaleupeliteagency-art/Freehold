"use client";

import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowRight, Target } from "lucide-react";

export default function PerformanceOverview({ onNext }) {
  const { snapshots } = useReviewEngineStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 border-b-2 border-divider pb-4">
        <h2 className="text-2xl font-bold text-ink mb-1 uppercase tracking-tight">Goal Performance</h2>
        <p className="text-ink/60 text-sm font-mono uppercase">
          Where do we stand relative to the North Star?
        </p>
      </div>

      <div className="space-y-6">
        {snapshots.goals.map((goal, idx) => {
          const progress = Math.round((goal.actual / goal.target) * 100);
          const gap = goal.target - goal.actual;
          
          return (
            <div key={idx} className="bg-paper border-2 border-divider p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-2 h-full ${idx === 0 ? 'bg-ochre' : 'bg-ink/30'}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4 pl-2">
                  <div className="w-10 h-10 bg-paper border-2 border-divider flex items-center justify-center">
                    <Target className={`w-5 h-5 ${idx === 0 ? 'text-ochre' : 'text-ink/40'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink uppercase">{goal.name}</h3>
                    <div className="text-xs font-mono text-ink/60">{idx === 0 ? 'PRIMARY (75%)' : 'SECONDARY (25%)'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-ink">{progress}%</div>
                  <div className="text-[10px] uppercase text-ink/60 font-bold font-mono tracking-wider">Progress</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t-2 border-divider pt-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-ink/60 font-mono tracking-wider mb-1">Current</div>
                  <div className="text-lg font-bold text-ink">{goal.actual}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-ink/60 font-mono tracking-wider mb-1">Target</div>
                  <div className="text-lg font-bold text-ink">{goal.target}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-ink/60 font-mono tracking-wider mb-1">Gap</div>
                  <div className="text-lg font-bold text-red-700">{gap > 0 ? `-${gap}` : '+0'}</div>
                </div>
              </div>
              
              <div className="w-full bg-divider h-2 mt-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${idx === 0 ? 'bg-ochre' : 'bg-ink/50'}`}
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-8 flex justify-end">
        <button 
          onClick={onNext}
          className="bg-ochre text-paper px-8 py-3 font-bold hover:bg-ink transition-all shadow-[4px_4px_0px_0px_rgba(30,42,36,1)] border-2 border-ink flex items-center gap-2 uppercase tracking-wide"
        >
          Review Execution <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
