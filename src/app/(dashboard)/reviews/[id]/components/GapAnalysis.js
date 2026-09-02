"use client";

import { useState, useEffect } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, ArrowRight, TrendingDown } from "lucide-react";

export default function GapAnalysis({ onNext, onBack }) {
  const { snapshots, setInvestigation } = useReviewEngineStore();
  const [analyzing, setAnalyzing] = useState(true);
  const [constraint, setConstraint] = useState(null);

  useEffect(() => {
    // Simulate AI / automated analysis to find largest measurable constraint
    const timer = setTimeout(() => {
      if (snapshots.inputs.length > 0) {
        // Find input with lowest consistency
        const sorted = [...snapshots.inputs].sort((a, b) => {
          return (a.actual / a.target) - (b.actual / b.target);
        });
        
        const worst = sorted[0];
        const gap = worst.target - worst.actual;
        
        const result = {
          name: worst.name,
          gap: gap,
          consistency: Math.round((worst.actual / worst.target) * 100),
          actual: worst.actual,
          target: worst.target,
          evidence: "Largest negative deviation from target. Completion rate is lowest among all active inputs.",
        };
        
        setConstraint(result);
        
        // Save to store for the next steps
        setInvestigation({
          largestGap: worst.name,
          bottleneck: result,
          hypotheses: []
        });
      }
      setAnalyzing(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [snapshots, setInvestigation]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Gap Analysis</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Where is the largest measurable deviation?
        </p>
      </div>

      {analyzing ? (
        <div className="bg-[#0A0B0E] border border-white/5 rounded-xl p-12 text-center flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#B8862E]/30 border-t-[#B8862E] rounded-full animate-spin mb-6" />
          <h3 className="text-lg font-bold text-white mb-2">Analyzing Performance Data</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Scanning goals, milestones, and daily execution to isolate the primary constraint...
          </p>
        </div>
      ) : constraint ? (
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingDown className="w-32 h-32 text-red-500" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-2">Largest Measurable Constraint</h3>
              <div className="text-3xl font-bold text-white mb-6">{constraint.name}</div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target</div>
                  <div className="text-xl font-mono text-white">{constraint.target}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Actual</div>
                  <div className="text-xl font-mono text-white">{constraint.actual}</div>
                </div>
                <div>
                  <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Gap</div>
                  <div className="text-xl font-mono text-red-400">-{constraint.gap}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Completion</div>
                  <div className="text-xl font-mono text-white">{constraint.consistency}%</div>
                </div>
              </div>

              <div className="bg-[#0A0B0E] rounded-lg p-5 border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Evidence</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {constraint.evidence}
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 italic text-center">
            * The system identifies this as the strongest measurable constraint associated with underperformance.
          </div>
        </div>
      ) : (
         <div className="bg-[#0A0B0E] border border-white/5 rounded-xl p-8 text-center">
          <p className="text-gray-400">Insufficient data to perform a gap analysis.</p>
        </div>
      )}

      <div className="pt-8 flex justify-between items-center mt-4 border-t border-white/5">
        <button 
          onClick={onBack}
          disabled={analyzing}
          className="text-gray-400 px-6 py-3 rounded-lg text-sm font-semibold hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNext}
          disabled={analyzing}
          className="bg-[#B8862E] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#A37525] transition-all shadow-lg shadow-[#B8862E]/20 flex items-center gap-2 disabled:opacity-50"
        >
          Investigate Causes <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
