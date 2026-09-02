"use client";

import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowRight, Target } from "lucide-react";

export default function PerformanceOverview({ onNext }) {
  const { snapshots } = useReviewEngineStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Goal Performance</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Where do we stand relative to the North Star?
        </p>
      </div>

      <div className="space-y-6">
        {snapshots.goals.map((goal, idx) => {
          const progress = Math.round((goal.actual / goal.target) * 100);
          const gap = goal.target - goal.actual;
          
          return (
            <div key={idx} className="bg-[#0A0B0E] border border-white/5 rounded-xl p-6 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${idx === 0 ? 'bg-[#B8862E]' : 'bg-gray-600'}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#1A1C23] border border-white/10 flex items-center justify-center">
                    <Target className={`w-5 h-5 ${idx === 0 ? 'text-[#B8862E]' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                    <div className="text-xs font-mono text-gray-500">{idx === 0 ? 'PRIMARY (75%)' : 'SECONDARY (25%)'}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{progress}%</div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider">Progress</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                <div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Current</div>
                  <div className="text-lg font-semibold text-white">{goal.actual}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Target</div>
                  <div className="text-lg font-semibold text-white">{goal.target}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-500 tracking-wider mb-1">Gap</div>
                  <div className="text-lg font-semibold text-red-400">{gap > 0 ? `-${gap}` : '+0'}</div>
                </div>
              </div>
              
              <div className="w-full bg-[#1A1C23] rounded-full h-1.5 mt-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${idx === 0 ? 'bg-gradient-to-r from-[#8C6420] to-[#B8862E]' : 'bg-gray-500'}`}
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
          className="bg-[#B8862E] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#A37525] transition-all shadow-lg shadow-[#B8862E]/20 flex items-center gap-2"
        >
          Review Execution <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
