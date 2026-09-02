export default function StepGoals({ data, updateData }) {
  const primary = data.primaryGoal || { weight: 100 };
  const secondary = data.secondaryGoal || null;

  const updatePrimary = (updates) => updateData({ primaryGoal: { ...primary, ...updates } });
  
  const addSecondary = () => {
    updateData({ 
      primaryGoal: { ...primary, weight: 75 },
      secondaryGoal: { name: '', baseline: 0, target: 0, weight: 25, direction: 'higher' }
    });
  };

  const removeSecondary = () => {
    updateData({ 
      primaryGoal: { ...primary, weight: 100 },
      secondaryGoal: null 
    });
  };

  const updateSecondary = (updates) => updateData({ secondaryGoal: { ...secondary, ...updates } });

  const renderGoalForm = (goal, updateFn, isPrimary) => (
    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 border border-gray-200 rounded-lg p-6 bg-gray-50/50 relative">
      {!isPrimary && (
        <button 
          onClick={removeSecondary}
          className="absolute top-4 right-4 text-sm text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      )}
      <div className="sm:col-span-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">Goal Name</label>
        <div className="mt-2">
          <input
            type="text"
            value={goal.name || ""}
            onChange={(e) => updateFn({ name: e.target.value })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
            placeholder={isPrimary ? "e.g. Annual Revenue" : "e.g. Personal Savings"}
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Unit</label>
        <div className="mt-2">
          <input
            type="text"
            value={goal.unit || ""}
            onChange={(e) => updateFn({ unit: e.target.value })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
            placeholder="e.g. $"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Baseline (Current)</label>
        <div className="mt-2">
          <input
            type="number"
            value={goal.baseline || ""}
            onChange={(e) => updateFn({ baseline: parseFloat(e.target.value) })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Target</label>
        <div className="mt-2">
          <input
            type="number"
            value={goal.target || ""}
            onChange={(e) => updateFn({ target: parseFloat(e.target.value) })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          />
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className="block text-sm font-medium leading-6 text-gray-900">Direction</label>
        <div className="mt-2">
          <select
            value={goal.direction || "higher"}
            onChange={(e) => updateFn({ direction: e.target.value })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          >
            <option value="higher">Higher is better</option>
            <option value="lower">Lower is better</option>
          </select>
        </div>
      </div>

      <div className="sm:col-span-3">
        <label className="block text-sm font-medium leading-6 text-gray-900">Deadline</label>
        <div className="mt-2">
          <input
            type="date"
            value={goal.deadline || ""}
            onChange={(e) => updateFn({ deadline: e.target.value })}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          />
        </div>
      </div>

      <div className="sm:col-span-3">
        <label className="block text-sm font-medium leading-6 text-gray-900">Weight</label>
        <div className="mt-2">
          <input
            type="text"
            disabled
            value={`${goal.weight}%`}
            className="block w-full rounded-md border-0 py-1.5 text-gray-500 bg-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 sm:text-sm px-3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-gray-900">Long-Term Goals</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Define a maximum of two North Star goals. Your primary goal is the main destination.
        </p>
      </div>

      <div className="border-t border-gray-900/10 pt-8 space-y-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Primary Goal</h3>
          {renderGoalForm(primary, updatePrimary, true)}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Secondary Goal <span className="text-sm font-normal text-gray-500">(Optional)</span></h3>
            {!secondary && (
              <button
                type="button"
                onClick={addSecondary}
                className="text-sm font-semibold text-[#B8862E] hover:text-[#8C6420]"
              >
                + Add Secondary Goal
              </button>
            )}
          </div>
          
          {secondary ? renderGoalForm(secondary, updateSecondary, false) : (
            <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
              No secondary goal defined. Your primary goal will carry 100% of the system weight.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
