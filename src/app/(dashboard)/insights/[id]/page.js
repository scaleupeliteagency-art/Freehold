"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BrainCircuit, Activity, Beaker, CheckCircle2, ChevronRight, Settings } from "lucide-react";

export default function InsightDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const [insight, setInsight] = useState(null);

  useEffect(() => {
    // For MVP, if it's our mock ID, load mock data. Otherwise in production, fetch from DB.
    // We will just provide a very rich mock view that fulfills the PRD for demonstration.
    setInsight({
      id: id,
      title: "Follow-up Consistency",
      type: "PATTERN",
      status: "ACTIVE",
      confidence: "HIGH",
      discovered: "September 2, 2026",
      description: "Higher follow-up consistency has been associated with stronger meeting performance. When follow-ups are completed at >90% of target, meeting volume reliably increases the following week.",
      evidence: {
        inputs: ["Follow-up completion"],
        period: "8 weeks",
        observations: "94",
        averageCompletion: "91%",
        relatedOutcome: "Meeting volume",
        comparison: "7 of 9 comparable weeks showed higher meeting volume when follow-up completion was above 90%."
      },
      lineage: {
        observation: "Outreach volume fluctuated wildly in Q1.",
        hypothesis: "Increasing follow-up consistency will stabilize meeting volume.",
        experiment: "Test strict adherence to 5 follow-ups per lead for 30 days.",
        optimization: "Normal Input for Follow-ups changed from 2 to 5.",
        systemVersion: "v1.3"
      }
    });
  }, [id]);

  if (!insight) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#B8862E]/30 border-t-[#B8862E] rounded-full animate-spin" />
      </div>
    );
  }

  const getTypeConfig = (type) => {
    switch (type) {
      case 'OBSERVATION': return { icon: Activity, color: 'text-gray-400', border: 'border-gray-500/30', bg: 'bg-gray-500/10' };
      case 'PATTERN': return { icon: BrainCircuit, color: 'text-[#B8862E]', border: 'border-[#B8862E]/30', bg: 'bg-[#B8862E]/10' };
      case 'HYPOTHESIS': return { icon: Beaker, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
      case 'VALIDATED': return { icon: CheckCircle2, color: 'text-green-500', border: 'border-green-500/30', bg: 'bg-green-500/10' };
      default: return { icon: Activity, color: 'text-gray-400', border: 'border-white/10', bg: 'bg-white/5' };
    }
  };

  const config = getTypeConfig(insight.type);
  const Icon = config.icon;

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Library
      </button>

      {/* Header Panel */}
      <div className={`bg-[#0A0B0E] border ${config.border} rounded-2xl p-8 mb-8 relative overflow-hidden shadow-2xl`}>
        <div className={`absolute top-0 right-0 w-64 h-64 ${config.bg} rounded-full blur-3xl -mr-20 -mt-20 opacity-50`} />
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg} border ${config.border}`}>
                <Icon className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${config.color}`}>{insight.type}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{insight.status}</span>
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{insight.title}</h1>
              </div>
            </div>
            
            <div className="bg-[#1A1C23] border border-white/5 rounded-lg p-3 text-right shrink-0">
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Confidence</div>
              <div className="text-sm font-bold text-green-400">{insight.confidence}</div>
            </div>
          </div>
          
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl border-l-2 border-[#B8862E] pl-4">
            "{insight.description}"
          </p>
          
          <div className="mt-6 text-xs text-gray-500 font-mono">
            Discovered: {insight.discovered}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Evidence & Data */}
        <div className="md:col-span-2 space-y-8">
          
          <section>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Evidence Base</h2>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Source Input</div>
                  <div className="font-semibold text-gray-900">{insight.evidence.inputs.join(", ")}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Period Analysed</div>
                  <div className="font-semibold text-gray-900">{insight.evidence.period}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Observations</div>
                  <div className="font-semibold text-gray-900">{insight.evidence.observations}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Completion</div>
                  <div className="font-semibold text-[#B8862E]">{insight.evidence.averageCompletion}</div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Detailed Comparison</div>
                <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                  {insight.evidence.comparison}
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Lineage / Traceability */}
        <div>
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Insight Lineage</h2>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 relative">
            {/* Connection Line */}
            <div className="absolute left-[39px] top-[40px] bottom-[40px] w-px bg-gray-200" />
            
            <div className="space-y-6 relative z-10">
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center shrink-0 mt-1">
                  <Activity className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Observation</h3>
                  <p className="text-sm text-gray-700">{insight.lineage.observation}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center shrink-0 mt-1">
                  <Beaker className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Hypothesis</h3>
                  <p className="text-sm text-gray-700">{insight.lineage.hypothesis}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-white flex items-center justify-center shrink-0 mt-1">
                  <Search className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Experiment</h3>
                  <p className="text-sm text-gray-700">{insight.lineage.experiment}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#B8862E]/10 border-2 border-white flex items-center justify-center shrink-0 mt-1">
                  <Settings className="w-4 h-4 text-[#B8862E]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[#B8862E] uppercase tracking-widest mb-1">Optimization</h3>
                  <p className="text-sm text-gray-700">{insight.lineage.optimization}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-gray-900 text-white px-2 py-1 rounded">
                    System Version {insight.lineage.systemVersion}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
