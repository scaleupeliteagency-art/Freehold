"use client";

import { AlertTriangle, ArrowUpCircle } from "lucide-react";

export default function InputEvolution({ inputs, onEdit }) {
  const overperforming = inputs.filter(inp => inp.actual >= inp.target && inp.actual > 0);
  const underperforming = inputs.filter(inp => inp.target > 0 && (inp.actual / inp.target) < 0.5);

  if (overperforming.length === 0 && underperforming.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">Input Evolution</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {overperforming.map(inp => (
          <div key={inp.id} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-sm border border-green-100 p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-green-500" />
            <ArrowUpCircle className="w-5 h-5 text-green-500 absolute top-5 right-6" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{inp.name}</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-[90%]">You have consistently exceeded the target. Consider upgrading it.</p>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mb-4">
              <div className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md">Target: {inp.target}</div>
              <div className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md">Actual: {inp.actual}</div>
            </div>
            <button onClick={() => onEdit(inp)} className="text-sm font-medium text-green-600 hover:text-green-700 transition-colors">Upgrade Target &rarr;</button>
          </div>
        ))}

        {underperforming.map(inp => (
          <div key={inp.id} className="bg-white/90 backdrop-blur-xl rounded-xl shadow-sm border border-red-100 p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />
            <AlertTriangle className="w-5 h-5 text-red-500 absolute top-5 right-6" />
            <h3 className="font-semibold text-slate-900 text-sm mb-1">{inp.name}</h3>
            <p className="text-sm text-slate-500 mb-4 max-w-[90%]">Consistent friction detected. Investigate why this is failing.</p>
            <div className="flex items-center gap-3 text-xs text-slate-600 font-medium mb-4">
              <div className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md">Target: {inp.target}</div>
              <div className="bg-slate-50 text-slate-700 px-2.5 py-1 rounded-md">Actual: {inp.actual}</div>
            </div>
            <button onClick={() => onEdit(inp)} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Investigate Friction &rarr;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
