export default function StepRoadmap({ data, updateData }) {
  const roadmap = data.roadmap || {
    year: { objective: "" },
    quarter: { objective: "", rocks: [
      { id: 1, name: "", milestones: [{ id: 1, name: "", target: 0, deadline: "" }] },
      { id: 2, name: "", milestones: [{ id: 1, name: "", target: 0, deadline: "" }] },
      { id: 3, name: "", milestones: [{ id: 1, name: "", target: 0, deadline: "" }] }
    ]}
  };

  const updateYear = (val) => updateData({ roadmap: { ...roadmap, year: { ...roadmap.year, objective: val } } });
  const updateQuarter = (val) => updateData({ roadmap: { ...roadmap, quarter: { ...roadmap.quarter, objective: val } } });

  const updateRock = (rockIndex, field, value) => {
    const newRocks = [...roadmap.quarter.rocks];
    newRocks[rockIndex] = { ...newRocks[rockIndex], [field]: value };
    updateData({ roadmap: { ...roadmap, quarter: { ...roadmap.quarter, rocks: newRocks } } });
  };

  const updateMilestone = (rockIndex, msIndex, field, value) => {
    const newRocks = [...roadmap.quarter.rocks];
    const newMs = [...newRocks[rockIndex].milestones];
    newMs[msIndex] = { ...newMs[msIndex], [field]: value };
    newRocks[rockIndex].milestones = newMs;
    updateData({ roadmap: { ...roadmap, quarter: { ...roadmap.quarter, rocks: newRocks } } });
  };

  const addMilestone = (rockIndex) => {
    const newRocks = [...roadmap.quarter.rocks];
    newRocks[rockIndex].milestones.push({ id: Date.now(), name: "", target: 0, deadline: "" });
    updateData({ roadmap: { ...roadmap, quarter: { ...roadmap.quarter, rocks: newRocks } } });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-gray-900">Roadmap Execution</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Plan the near future in detail. We will lock future periods until their planning windows open.
        </p>
      </div>

      <div className="border-t border-gray-900/10 pt-8 space-y-8">
        
        {/* YEARLY */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded">Year 1</span>
            Current Year Objective
          </h3>
          <input
            type="text"
            placeholder="e.g. Establish product-market fit and reach $200k ARR"
            value={roadmap.year.objective}
            onChange={(e) => updateYear(e.target.value)}
            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          />
        </div>

        {/* QUARTERLY */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="bg-gray-700 text-white text-xs px-2 py-1 rounded">Q1</span>
            Current Quarter Objective
          </h3>
          <input
            type="text"
            placeholder="e.g. Launch v1.0 and acquire first 50 paying customers"
            value={roadmap.quarter.objective}
            onChange={(e) => updateQuarter(e.target.value)}
            className="block w-full rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
          />
        </div>

        {/* MONTHLY ROCKS */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Rocks & Weekly Milestones</h3>
          <p className="text-sm text-gray-500 mb-6">Each quarter contains 3 major Rocks. Break them down into measurable weekly milestones.</p>
          
          <div className="space-y-6">
            {roadmap.quarter.rocks.map((rock, rIndex) => (
              <div key={rock.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Rock {rIndex + 1} Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Build Core Platform MVP"
                    value={rock.name}
                    onChange={(e) => updateRock(rIndex, 'name', e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] sm:text-sm px-3"
                  />
                </div>

                <div className="pl-4 border-l-2 border-gray-200 mt-4 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Weekly Milestones</h4>
                  {rock.milestones.map((ms, mIndex) => (
                    <div key={ms.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 sm:col-span-6">
                        <label className="block text-xs text-gray-500 mb-1">Milestone Name (Measurable)</label>
                        <input
                          type="text"
                          placeholder="e.g. Complete 100 prospect outreaches"
                          value={ms.name}
                          onChange={(e) => updateMilestone(rIndex, mIndex, 'name', e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Target</label>
                        <input
                          type="number"
                          value={ms.target || ""}
                          onChange={(e) => updateMilestone(rIndex, mIndex, 'target', e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                        />
                      </div>
                      <div className="col-span-6 sm:col-span-3">
                        <label className="block text-xs text-gray-500 mb-1">Deadline</label>
                        <input
                          type="date"
                          value={ms.deadline}
                          onChange={(e) => updateMilestone(rIndex, mIndex, 'deadline', e.target.value)}
                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#B8862E] text-sm px-3"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addMilestone(rIndex)}
                    className="text-xs font-semibold text-[#B8862E] hover:text-[#8C6420] mt-2"
                  >
                    + Add Weekly Milestone
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
