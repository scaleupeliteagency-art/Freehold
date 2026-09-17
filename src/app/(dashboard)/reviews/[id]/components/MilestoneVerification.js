import { ArrowLeft, ArrowRight, CheckCircle, Circle } from "lucide-react";

export default function MilestoneVerification({ reviewState, setReviewState, onNext, onBack }) {
  const { milestone, milestoneAchieved } = reviewState;

  const toggleAchieved = () => {
    setReviewState(prev => ({ ...prev, milestoneAchieved: !prev.milestoneAchieved }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Milestone Verification</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Did you achieve your targeted milestone for this period?
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center">
          <div className="text-sm font-medium text-gray-500 mb-6">Current Milestone</div>
          <div className="text-2xl font-bold text-gray-900 mb-2">{milestone?.name || "No Milestone Active"}</div>
          <div className="text-sm font-mono text-gray-500 mb-8">Target: {milestone?.target}</div>

          <button 
            onClick={toggleAchieved}
            className={`px-6 py-3 rounded-xl border flex items-center justify-center gap-3 transition-colors ${
              milestoneAchieved 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {milestoneAchieved ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5 text-gray-400" />}
            <span className="text-sm font-medium">
              {milestoneAchieved ? "Milestone Achieved" : "Mark as Achieved"}
            </span>
          </button>
        </div>

        {milestoneAchieved && (
          <div className="rounded-xl border border-orange-100 bg-orange-50 p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">Evolution Triggered</h3>
            <p className="text-sm text-orange-700 leading-relaxed">
              Because you achieved your milestone, you will be prompted to evolve your operating inputs in the next step before starting the next period.
            </p>
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
          className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          {milestoneAchieved ? "Evolve Inputs" : "Finalize Review"} <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
