"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, ArrowRight, BrainCircuit, Plus, X } from "lucide-react";

export default function InvestigationEngine({ onNext, onBack }) {
  const { investigation, addHypothesis } = useReviewEngineStore();
  const [customHypothesis, setCustomHypothesis] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerateAI = () => {
    setGenerating(true);
    setTimeout(() => {
      addHypothesis({
        id: Date.now().toString(),
        text: `Lower volume of "${investigation.largestGap}" may be associated with reduced milestone progression.`,
        confidence: "Medium",
        evidence: [
          `Normal target: ${investigation.bottleneck?.target}`,
          `Actual average: ${investigation.bottleneck?.actual}`,
          "Milestone completion declined simultaneously."
        ]
      });
      setGenerating(false);
    }, 1500);
  };

  const handleAddCustom = () => {
    if (!customHypothesis.trim()) return;
    addHypothesis({
      id: Date.now().toString(),
      text: customHypothesis,
      confidence: "User Generated",
      evidence: ["Manual observation"]
    });
    setCustomHypothesis("");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Investigation Engine</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          What might explain the gap in {investigation.largestGap}? Let's generate evidence-based hypotheses.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Hypotheses List */}
        {investigation.hypotheses.map((hyp) => (
          <div key={hyp.id} className="bg-[#1A1C23] border border-[#B8862E]/30 rounded-xl p-6 relative">
            <h3 className="text-lg font-medium text-white mb-4 pr-8 leading-relaxed">
              "{hyp.text}"
            </h3>
            
            <div className="bg-[#0A0B0E] rounded-lg p-4 border border-white/5 mb-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Evidence</h4>
              <ul className="list-disc pl-4 space-y-1">
                {hyp.evidence.map((ev, i) => (
                  <li key={i} className="text-sm text-gray-400">{ev}</li>
                ))}
              </ul>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-md border border-gray-800 text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Confidence:</span> {hyp.confidence}
            </div>
          </div>
        ))}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={handleGenerateAI}
            disabled={generating}
            className="flex flex-col items-center justify-center gap-3 bg-[#0A0B0E] border border-dashed border-gray-700 rounded-xl p-8 hover:border-[#B8862E]/50 hover:bg-[#B8862E]/5 transition-all text-gray-400 hover:text-[#B8862E] group disabled:opacity-50"
          >
            {generating ? (
              <div className="w-8 h-8 border-2 border-[#B8862E]/30 border-t-[#B8862E] rounded-full animate-spin" />
            ) : (
              <BrainCircuit className="w-8 h-8" />
            )}
            <span className="text-sm font-semibold">Generate AI Hypothesis</span>
          </button>
          
          <div className="bg-[#0A0B0E] border border-gray-800 rounded-xl p-6 flex flex-col justify-center">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add Custom Hypothesis</label>
            <textarea 
              value={customHypothesis}
              onChange={(e) => setCustomHypothesis(e.target.value)}
              placeholder="E.g., I was sick on Tuesday which ruined momentum..."
              className="w-full bg-[#1A1C23] border border-white/5 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#B8862E]/50 mb-3 resize-none h-20"
            />
            <button 
              onClick={handleAddCustom}
              disabled={!customHypothesis.trim()}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-3 h-3" /> Add Hypothesis
            </button>
          </div>
        </div>

      </div>

      <div className="pt-8 flex justify-between items-center mt-8 border-t border-white/5">
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
          Make Decisions <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
