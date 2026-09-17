import { ArrowRight, Activity } from "lucide-react";

export default function DataAssembly({ reviewState, onNext }) {
  const { system, milestone, inputs } = reviewState;

  if (!system) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Assembly</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Aggregating execution data for the review period.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Strategic Target</h3>
          <div className="text-lg font-bold text-gray-900 mb-1">{milestone?.name || "No active milestone"}</div>
          <div className="text-sm font-mono text-gray-500">Target: {milestone?.target} {milestone?.metric_id ? "units" : ""}</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Operating Inputs</h3>
          {inputs.length === 0 ? (
            <div className="text-sm text-gray-400 italic">No active inputs found.</div>
          ) : (
            <div className="space-y-3">
              {inputs.map(input => (
                <div key={input.id} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <div className="font-medium text-gray-900 text-sm">{input.name}</div>
                  <div className="font-mono text-sm text-gray-500">{input.target} / {input.frequency}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-8 flex justify-end mt-8 border-t border-gray-100">
        <button 
          onClick={onNext}
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          Initialize AI Investigation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
