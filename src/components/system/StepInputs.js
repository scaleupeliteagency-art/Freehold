export default function StepInputs({ data, updateData }) {
  const inputs = data.inputs || [];

  // Extract all milestones across all rocks to allow connecting inputs
  const allMilestones = [];
  if (data.roadmap?.quarter?.rocks) {
    data.roadmap.quarter.rocks.forEach((rock, rIndex) => {
      rock.milestones.forEach((ms, mIndex) => {
        if (ms.name) {
          allMilestones.push({
            id: ms.id,
            name: ms.name,
            rockName: rock.name || `Rock ${rIndex + 1}`
          });
        }
      });
    });
  }

  const addInput = () => {
    updateData({
      inputs: [
        ...inputs,
        { id: Date.now(), milestoneId: "", name: "", frequency: "daily", minimum: 0, normal: 0 }
      ]
    });
  };

  const updateInput = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index] = { ...newInputs[index], [field]: value };
    updateData({ inputs: newInputs });
  };

  const removeInput = (index) => {
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    updateData({ inputs: newInputs });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-gray-900">Define Daily Inputs</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          What will you repeatedly DO to make the milestones happen? Focus entirely on leading indicators under your direct control.
        </p>
      </div>

      <div className="border-t border-gray-900/10 pt-8">
        
        {inputs.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No inputs defined</h3>
            <p className="mt-1 text-sm text-gray-500">Create the recurring actions that drive your milestones.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={addInput}
                className="inline-flex items-center rounded-md bg-[#B8862E] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#A37525]"
              >
                + Add Input
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {inputs.map((input, index) => (
              <div key={input.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative">
                <button 
                  onClick={() => removeInput(index)}
                  className="absolute top-4 right-4 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                  
                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Input Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cold Calls"
                      value={input.name}
                      onChange={(e) => updateInput(index, 'name', e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Connected Milestone</label>
                    <select
                      value={input.milestoneId}
                      onChange={(e) => updateInput(index, 'milestoneId', e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                    >
                      <option value="">Select a milestone...</option>
                      {allMilestones.map(ms => (
                        <option key={ms.id} value={ms.id}>{ms.name} ({ms.rockName})</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Frequency</label>
                    <select
                      value={input.frequency}
                      onChange={(e) => updateInput(index, 'frequency', e.target.value)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Minimum Acceptable</label>
                    <input
                      type="number"
                      placeholder="e.g. 10"
                      value={input.minimum || ""}
                      onChange={(e) => updateInput(index, 'minimum', parseInt(e.target.value) || 0)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Normal Target</label>
                    <input
                      type="number"
                      placeholder="e.g. 20"
                      value={input.normal || ""}
                      onChange={(e) => updateInput(index, 'normal', parseInt(e.target.value) || 0)}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                    />
                  </div>

                </div>
              </div>
            ))}
            
            <div className="mt-4">
              <button
                type="button"
                onClick={addInput}
                className="text-sm font-semibold text-[#B8862E] hover:text-[#8C6420]"
              >
                + Add Another Input
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
