"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewSummary({ onBack }) {
  const { reviewContext, snapshots, investigation, decisions, resetReview } = useReviewEngineStore();
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  const handleComplete = () => {
    setCompleting(true);
    
    // In production, this saves the draft to the DB and sets status to COMPLETED
    setTimeout(() => {
      // alert("Review officially recorded and locked.");
      resetReview();
      router.push("/reviews");
    }, 1500);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex justify-between items-end border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Final Review Summary</h2>
          <p className="text-[#B8862E] text-sm font-semibold uppercase tracking-widest">
            {reviewContext.type} REVIEW • {reviewContext.periodStart} to {reviewContext.periodEnd}
          </p>
        </div>
      </div>

      <div className="space-y-12 mb-12">
        {/* Constraints */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-gray-700 pl-3">Largest Constraint</h3>
          {investigation.bottleneck ? (
            <div className="bg-[#1A1C23] border border-white/5 rounded-xl p-6">
              <div className="text-xl font-bold text-white mb-2">{investigation.bottleneck.name}</div>
              <p className="text-sm text-gray-400">{investigation.bottleneck.evidence}</p>
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No major constraints identified.</p>
          )}
        </section>

        {/* Hypotheses */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-[#B8862E] pl-3">Validated Insights</h3>
          {investigation.hypotheses.length > 0 ? (
            <div className="space-y-3">
              {investigation.hypotheses.map(hyp => (
                <div key={hyp.id} className="bg-[#0A0B0E] border border-white/5 rounded-lg p-4">
                  <p className="text-sm text-gray-200">{hyp.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No hypotheses generated.</p>
          )}
        </section>

        {/* Decisions */}
        <section>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-white pl-3">Strategic Decisions</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['keep', 'stop', 'start', 'change'].map(category => {
              const items = decisions[category];
              if (items.length === 0) return null;
              
              const colors = {
                keep: 'text-green-500',
                stop: 'text-red-500',
                start: 'text-blue-500',
                change: 'text-amber-500'
              };

              return (
                <div key={category} className="bg-[#0A0B0E] border border-white/5 rounded-xl p-5">
                  <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${colors[category]}`}>{category}</h4>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item.id} className="text-sm text-gray-300 flex gap-2">
                        <span className="text-gray-600">•</span> {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            
            {Object.values(decisions).every(arr => arr.length === 0) && (
              <p className="text-gray-500 italic text-sm col-span-2">No structural changes decided.</p>
            )}
          </div>
        </section>
      </div>

      {/* Completion Section */}
      <div className="bg-[#B8862E]/10 border border-[#B8862E]/20 rounded-xl p-8 flex flex-col items-center text-center">
        <Lock className="w-8 h-8 text-[#B8862E] mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Lock & Complete Review</h3>
        <p className="text-sm text-gray-400 max-w-md mb-8">
          Completing this review will permanently lock the record and apply these insights to your system history. This cannot be undone.
        </p>
        
        <button 
          onClick={handleComplete}
          disabled={completing}
          className="bg-[#B8862E] text-white px-12 py-4 rounded-xl text-base font-bold hover:bg-[#A37525] hover:scale-105 transition-all shadow-[0_0_30px_rgba(184,134,46,0.3)] flex items-center justify-center gap-3 w-full sm:w-auto disabled:opacity-50 disabled:hover:scale-100"
        >
          {completing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Complete Review
            </>
          )}
        </button>
      </div>

      <div className="pt-8 flex justify-start mt-8">
        <button 
          onClick={onBack}
          disabled={completing}
          className="text-gray-400 px-6 py-3 rounded-lg text-sm font-semibold hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Decisions
        </button>
      </div>
    </div>
  );
}
