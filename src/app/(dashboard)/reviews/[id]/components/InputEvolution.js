import { ArrowLeft, ArrowRight } from "lucide-react";

export default function InputEvolution({ reviewState, setReviewState, onNext, onBack }) {
  const { inputs, milestoneAchieved, inputChanges } = reviewState;

  const handleAction = (inputId, action) => {
    setReviewState(prev => {
      const existing = prev.inputChanges.find(c => c.id === inputId);
      if (existing) {
        return { ...prev, inputChanges: prev.inputChanges.map(c => c.id === inputId ? { ...c, action } : c) };
      }
      return { ...prev, inputChanges: [...prev.inputChanges, { id: inputId, action, newTarget: null }] };
    });
  };

  const updateTarget = (inputId, target) => {
    setReviewState(prev => {
      return { ...prev, inputChanges: prev.inputChanges.map(c => c.id === inputId ? { ...c, newTarget: target } : c) };
    });
  };

  if (!milestoneAchieved) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Continue Execution</h2>
        <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">You have not achieved the milestone yet. The system recommends continuing with current inputs.</p>
        <div className="flex justify-center gap-4">
          <button onClick={onBack} className="text-gray-600 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Back</button>
          <button onClick={onNext} className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm">Proceed</button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Input Evolution</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Milestone achieved. Your previous inputs were designed for this milestone. Review your operating inputs before beginning the next period.
        </p>
      </div>

      <div className="space-y-6">
        {inputs.map(input => {
          const change = inputChanges.find(c => c.id === input.id) || { action: 'KEEP', newTarget: input.target };
          
          return (
            <div key={input.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="font-semibold text-gray-900 text-base mb-1">{input.name}</div>
                  <div className="font-mono text-sm text-gray-500">Current: {input.target} / {input.frequency}</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {['KEEP', 'INCREASE', 'REDUCE', 'PAUSE', 'ARCHIVE'].map(action => (
                  <button 
                    key={action}
                    onClick={() => handleAction(input.id, action)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors
                      ${change.action === action 
                        ? 'bg-orange-600 text-white shadow-sm' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                  >
                    {action.charAt(0).toUpperCase() + action.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {(change.action === 'INCREASE' || change.action === 'REDUCE') && (
                <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4 mt-4">
                  <span className="text-sm font-medium text-gray-700">New Target:</span>
                  <input 
                    type="number" 
                    value={change.newTarget || input.target}
                    onChange={(e) => updateTarget(input.id, e.target.value)}
                    className="border border-gray-200 rounded-md bg-white px-3 py-1.5 text-sm w-24 outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              )}
            </div>
          );
        })}
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
          Finalize <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
