import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit } from "lucide-react";

export default function AIInvestigation({ reviewState, setReviewState, onNext, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewState.aiAnalysis) return;
    
    async function runInvestigation() {
      setLoading(true);
      setError(null);
      try {
        const payload = {
          reviewType: "WEEKLY",
          dataPayload: {
            system: reviewState.system,
            milestone: reviewState.milestone,
            inputs: reviewState.inputs
          }
        };

        const res = await fetch("/api/ai/investigate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch AI analysis");
        }
        
        const data = await res.json();
        setReviewState(prev => ({ ...prev, aiAnalysis: data }));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    runInvestigation();
  }, [reviewState.aiAnalysis, reviewState.system, reviewState.milestone, reviewState.inputs, setReviewState]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Investigation</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          The engine is analyzing your operating data to identify patterns and bottlenecks.
        </p>
      </div>

      <div className="space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-orange-100 bg-orange-50">
            <BrainCircuit className="w-8 h-8 animate-pulse text-orange-500 mb-4" />
            <div className="text-sm font-medium text-orange-900">Investigating System...</div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-red-600 text-sm font-medium shadow-sm">
            Investigation Failed: {error}
          </div>
        )}

        {reviewState.aiAnalysis && (
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Executive Summary</h3>
              <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-100 p-6 text-sm leading-relaxed text-gray-700">
                {reviewState.aiAnalysis.summary}
              </div>
            </div>

            {reviewState.aiAnalysis.patterns_detected && reviewState.aiAnalysis.patterns_detected.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Patterns Detected</h3>
                <div className="space-y-4">
                  {reviewState.aiAnalysis.patterns_detected.map((p, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Observation</div>
                      <div className="text-sm text-gray-900 mb-4">{p.observation}</div>
                      <div className="text-xs font-semibold text-orange-600 mb-1">Hypothesis</div>
                      <div className="text-sm text-gray-700">{p.hypothesis}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {reviewState.aiAnalysis.potential_issues && reviewState.aiAnalysis.potential_issues.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-4">Potential Issues</h3>
                <div className="space-y-4">
                  {reviewState.aiAnalysis.potential_issues.map((p, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-orange-100 p-5">
                      <div className="text-xs font-semibold text-gray-500 mb-1">Observation</div>
                      <div className="text-sm text-gray-900 mb-4">{p.observation}</div>
                      <div className="text-xs font-semibold text-orange-600 mb-1">Hypothesis</div>
                      <div className="text-sm text-gray-700">{p.hypothesis}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-8 flex justify-between items-center mt-8 border-t border-gray-100">
        <button 
          onClick={onBack}
          className="text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNext}
          disabled={loading}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          Verify Milestone <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
