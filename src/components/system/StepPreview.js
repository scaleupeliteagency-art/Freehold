export default function StepPreview({ data }) {
  
  const validateSystem = () => {
    const errors = [];
    if (!data.name) errors.push("System Name is missing.");
    if (!data.why) errors.push("System 'Why' is missing.");
    if (!data.primaryGoal?.name || !data.primaryGoal?.target) errors.push("Primary goal name or target is missing.");
    if (data.secondaryGoal && (!data.secondaryGoal.name || !data.secondaryGoal.target)) errors.push("Secondary goal is partially filled.");
    if (!data.roadmap?.year?.objective) errors.push("Yearly objective is missing.");
    if (!data.roadmap?.quarter?.objective) errors.push("Quarterly objective is missing.");
    
    // Check rocks & milestones
    data.roadmap?.quarter?.rocks?.forEach((rock, rIdx) => {
      if (!rock.name) errors.push(`Rock ${rIdx + 1} is missing a name.`);
      if (rock.milestones.length === 0) errors.push(`Rock ${rIdx + 1} has no weekly milestones.`);
      rock.milestones.forEach((ms, mIdx) => {
        if (!ms.name || !ms.target || !ms.deadline) {
          errors.push(`Rock ${rIdx + 1} - Milestone ${mIdx + 1} is missing name, target, or deadline.`);
        }
      });
    });

    if (!data.inputs || data.inputs.length === 0) errors.push("No daily inputs are defined.");
    data.inputs?.forEach((input, i) => {
      if (!input.name || !input.milestoneId || !input.normal) {
        errors.push(`Input ${i + 1} is missing name, connected milestone, or normal target.`);
      }
    });

    return errors;
  };

  const errors = validateSystem();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold leading-7 text-gray-900">System Architecture Preview</h2>
        <p className="mt-1 text-sm leading-6 text-gray-500">
          Review your complete operating system architecture before activation.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Cannot activate system: Missing requirements</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* System & Goals */}
        <div className="bg-gray-900 p-6 text-white">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-1">System</h3>
          <h1 className="text-2xl font-bold text-[#B8862E]">{data.name || "Unnamed System"}</h1>
          <p className="text-gray-300 mt-2 italic">"{data.why || "No why defined"}"</p>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-lg">
              <span className="text-xs font-semibold text-[#B8862E] uppercase tracking-wider">Primary Goal (75%)</span>
              <p className="font-medium text-lg mt-1">{data.primaryGoal?.name || "Not set"}</p>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>Current: {data.primaryGoal?.baseline || 0} {data.primaryGoal?.unit}</span>
                <span>Target: {data.primaryGoal?.target || 0} {data.primaryGoal?.unit}</span>
              </div>
            </div>
            {data.secondaryGoal && (
              <div className="bg-white/5 p-4 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Secondary Goal (25%)</span>
                <p className="font-medium text-lg mt-1">{data.secondaryGoal.name}</p>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span>Current: {data.secondaryGoal.baseline} {data.secondaryGoal.unit}</span>
                  <span>Target: {data.secondaryGoal.target} {data.secondaryGoal.unit}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap */}
        <div className="p-6 bg-white space-y-6 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Yearly Roadmap</h3>
            <p className="text-lg font-medium text-gray-900">{data.roadmap?.year?.objective || "Not set"}</p>
          </div>
          
          <div className="pl-4 border-l-4 border-gray-200">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Current Quarter Objective</h3>
            <p className="text-base text-gray-800">{data.roadmap?.quarter?.objective || "Not set"}</p>
            
            <div className="mt-6 space-y-6">
              {data.roadmap?.quarter?.rocks?.map((rock, i) => (
                <div key={rock.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="text-xs font-bold text-[#B8862E]">ROCK {i + 1}</span>
                  <p className="font-medium text-gray-900 mt-1">{rock.name || "Unnamed Rock"}</p>
                  
                  <div className="mt-4 space-y-2 pl-2">
                    {rock.milestones.map((ms, j) => (
                      <div key={ms.id} className="flex justify-between items-center text-sm border-l-2 border-[#B8862E] pl-3 py-1">
                        <span className="text-gray-700">{ms.name || "Unnamed Milestone"}</span>
                        <span className="text-gray-500 text-xs">Target: {ms.target} | Due: {ms.deadline}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="p-6 bg-white">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Execution Engine (Daily Inputs)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.inputs?.map((input, i) => {
              const msName = data.roadmap?.quarter?.rocks?.flatMap(r => r.milestones).find(m => m.id === input.milestoneId)?.name || "Unknown";
              return (
                <div key={input.id || i} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">{input.name}</span>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 capitalize">{input.frequency}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">Drives: {msName}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div><span className="text-gray-500 text-xs block">Minimum</span><span className="font-medium text-orange-600">{input.minimum}</span></div>
                    <div><span className="text-gray-500 text-xs block">Normal</span><span className="font-medium text-green-600">{input.normal}</span></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
