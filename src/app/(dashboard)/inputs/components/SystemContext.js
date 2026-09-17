import { ChevronRight } from "lucide-react";

export default function SystemContext({ context }) {
  if (!context) return null;
  return (
    <div className="mb-8">
      <div className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-500">
        <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{context.northStar || "5-Year Goal"}</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{context.yearPlan || "Current Year"}</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">{context.quarterObjective || "Quarter Objective"}</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="bg-white px-2 py-1 rounded-md border border-gray-200 text-gray-700 shadow-sm">{context.currentRock || "Current Rock"}</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 shadow-sm">{context.currentMilestone || "Current Milestone"}</span>
      </div>
    </div>
  );
}
