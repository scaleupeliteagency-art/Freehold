"use client";

import { useState } from "react";
import { Minus, Plus, Settings2, History } from "lucide-react";

export default function InputCard({ input, onUpdate, onEdit, onViewHistory }) {
  const [value, setValue] = useState(input.actual || 0);

  const handleUpdate = (newValue) => {
    const clamped = Math.max(0, newValue);
    setValue(clamped);
    onUpdate(input.id, clamped);
  };

  const progress = Math.min(100, Math.round(((value || 0) / (input.target || 1)) * 100));

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow relative flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">{input.name}</h3>
          {input.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{input.description}</p>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onViewHistory(input)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Version History">
            <History className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(input)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" title="Edit Input">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mb-5">
        <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">Target: <span className="text-slate-900">{input.target} {input.unit || ""} / {input.frequency}</span></div>
        <div className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">Weight: <span className="text-slate-900">{input.weight}%</span></div>
      </div>

      <div className="flex items-center gap-3 mt-auto mb-5">
        {input.type === "binary" ? (
          <button 
            onClick={() => handleUpdate(value ? 0 : 1)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all shadow-sm ${value ? "bg-green-500 text-white border border-green-600" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            {value ? "Completed" : "Not Completed"}
          </button>
        ) : (
          <div className="flex items-center w-full bg-slate-50 p-1 rounded-full border border-slate-200">
            <button onClick={() => handleUpdate(value - 1)} className="w-10 h-10 flex items-center justify-center text-slate-600 bg-white hover:bg-slate-50 rounded-full shadow-sm border border-slate-200 transition-colors shrink-0">
              <Minus className="w-4 h-4" />
            </button>
            <input 
              type="number" 
              value={value === 0 && input.type !== "percentage" ? "" : value} 
              onChange={(e) => handleUpdate(Number(e.target.value))}
              placeholder="0"
              className="flex-1 min-w-0 h-10 bg-transparent text-center font-semibold text-xl focus:outline-none text-slate-900 placeholder:text-slate-300"
            />
            <button onClick={() => handleUpdate(value + 1)} className="w-10 h-10 flex items-center justify-center text-white bg-orange-600 hover:bg-orange-700 rounded-full shadow-sm transition-colors shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1.5">
          <span>Progress</span>
          <span className="text-slate-900">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? "bg-green-500" : progress >= 50 ? "bg-orange-600" : "bg-slate-800"}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      {input.milestoneName && (
        <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5">
          Supports: <span className="font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{input.milestoneName}</span>
        </div>
      )}
    </div>
  );
}
