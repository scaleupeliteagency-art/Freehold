import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function InputEvolution({ reviewState, setReviewState, onNext, onBack }) {
  const { inputs, milestoneAchieved, inputChanges, newInputs = [] } = reviewState;

  const handleAction = (inputId, action) => {
    setReviewState(prev => {
      const existing = prev.inputChanges.find(c => c.id === inputId);
      if (existing) {
        return { ...prev, inputChanges: prev.inputChanges.map(c => c.id === inputId ? { ...c, action } : c) };
      }
      return { ...prev, inputChanges: [...prev.inputChanges, { id: inputId, action, newTarget: null }] };
    });
  };

  const [isAdding, setIsAdding] = useState(false);
  const [newInputDraft, setNewInputDraft] = useState({ name: '', target: '', unit: '', frequency: 'Daily', weight: 10 });

  const handleAddNew = () => {
    if (!newInputDraft.name || !newInputDraft.target) return;
    setReviewState(prev => ({
      ...prev,
      newInputs: [...(prev.newInputs || []), { ...newInputDraft, id: Date.now().toString() }]
    }));
    setIsAdding(false);
    setNewInputDraft({ name: '', target: '', unit: '', frequency: 'Daily', weight: 10 });
  };

  const handleRemoveNew = (id) => {
    setReviewState(prev => ({
      ...prev,
      newInputs: (prev.newInputs || []).filter(i => i.id !== id)
    }));
  };

  const updateTarget = (inputId, target) => {
    setReviewState(prev => {
      return { ...prev, inputChanges: prev.inputChanges.map(c => c.id === inputId ? { ...c, newTarget: target } : c) };
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Input Evolution</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          {milestoneAchieved 
            ? "Milestone achieved. Evolve your operating inputs before beginning the next period." 
            : "Milestone not achieved. You may keep your inputs to try again, or evolve your strategy by adding or removing inputs."}
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

      <div className="mt-8 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">New Inputs</h3>
        
        {newInputs.length > 0 && (
          <div className="space-y-4 mb-6">
            {newInputs.map(input => (
              <div key={input.id} className="bg-orange-50 rounded-xl p-4 flex justify-between items-center border border-orange-100">
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{input.name}</div>
                  <div className="font-mono text-xs text-gray-500">Target: {input.target} {input.unit} / {input.frequency}</div>
                </div>
                <button onClick={() => handleRemoveNew(input.id)} className="text-red-500 text-sm hover:underline font-medium">Remove</button>
              </div>
            ))}
          </div>
        )}

        {isAdding ? (
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="text-sm font-bold text-gray-900 mb-4">Create New Input</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input type="text" value={newInputDraft.name} onChange={e => setNewInputDraft({...newInputDraft, name: e.target.value})} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. Outreach Emails" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target</label>
                <input type="number" value={newInputDraft.target} onChange={e => setNewInputDraft({...newInputDraft, target: e.target.value})} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. 50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Unit</label>
                <input type="text" value={newInputDraft.unit} onChange={e => setNewInputDraft({...newInputDraft, unit: e.target.value})} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" placeholder="e.g. emails" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Frequency</label>
                <select value={newInputDraft.frequency} onChange={e => setNewInputDraft({...newInputDraft, frequency: e.target.value})} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500">
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
              <button onClick={handleAddNew} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors">Add Input</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm">
            + Add New Strategy Input
          </button>
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
          Finalize <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
