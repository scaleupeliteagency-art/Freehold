"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewSummary({ onBack, onComplete }) {
  const { reviewContext, snapshots, investigation, decisions, resetReview } = useReviewEngineStore();
  const [completing, setCompleting] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setCompleting(true);
    if (onComplete) {
      await onComplete();
    }
    resetReview();
    router.push("/dashboard");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Step 8 · Summary</div>
        <h2 className="text-2xl font-serif font-bold text-ink uppercase mb-3">Final Review Summary</h2>
        <p className="text-sm text-ochre font-bold uppercase tracking-widest">
          {reviewContext.type} Review · {reviewContext.periodStart} → {reviewContext.periodEnd}
        </p>
      </div>

      <hr className="border-divider mb-8" />

      <div className="space-y-8 mb-12">
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
      <div className="border-2 border-ink bg-ink p-8 flex flex-col items-center text-center">
        <CheckCircle2 className="w-8 h-8 text-paper mb-4" />
        <h3 className="text-xl font-serif font-bold text-paper uppercase mb-2">Complete This Review</h3>
        <p className="text-sm text-paper/70 max-w-md mb-8 leading-relaxed">
          Completing this review will unfreeze your system, schedule the next review in 7 days, and permanently lock this record.
        </p>
        <button
          onClick={handleComplete}
          disabled={completing}
          className="bg-paper text-ink px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ochre hover:text-paper transition-colors disabled:opacity-50 flex items-center gap-3"
        >
          {completing ? (
            <span className="animate-pulse">Completing...</span>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Lock &amp; Complete Review</>
          )}
        </button>
      </div>

      <div className="pt-8 flex justify-start">
        <button
          onClick={onBack}
          disabled={completing}
          className="text-ink/60 text-sm font-bold uppercase tracking-widest hover:text-ink transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Decisions
        </button>
      </div>
    </div>
  );
}
