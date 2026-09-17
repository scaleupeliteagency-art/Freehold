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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow relative flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-base">{input.name}</h3>
          {input.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{input.description}</p>}
        </div>
        <div className="flex gap-1">
          <button onClick={() => onViewHistory(input)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Version History">
            <History className="w-4 h-4" />
          </button>
          <button onClick={() => onEdit(input)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" title="Edit Input">
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-5">
        <div className="bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">Target: <span className="text-gray-900">{input.target} {input.unit || ""} / {input.frequency}</span></div>
        <div className="bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">Weight: <span className="text-gray-900">{input.weight}%</span></div>
      </div>

      <div className="flex items-center gap-3 mt-auto mb-5">
        {input.type === "binary" ? (
          <button 
            onClick={() => handleUpdate(value ? 0 : 1)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-full transition-all shadow-sm ${value ? "bg-green-500 text-white border border-green-600" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"}`}
          >
            {value ? "Completed" : "Not Completed"}
          </button>
        ) : (
          <div className="flex items-center w-full bg-gray-50 p-1 rounded-full border border-gray-200">
            <button onClick={() => handleUpdate(value - 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 bg-white hover:bg-gray-50 rounded-full shadow-sm border border-gray-200 transition-colors shrink-0">
              <Minus className="w-4 h-4" />
            </button>
            <input 
              type="number" 
              value={value === 0 && input.type !== "percentage" ? "" : value} 
              onChange={(e) => handleUpdate(Number(e.target.value))}
              placeholder="0"
              className="flex-1 h-10 bg-transparent text-center font-semibold text-xl focus:outline-none text-gray-900 placeholder:text-gray-300"
            />
            <button onClick={() => handleUpdate(value + 1)} className="w-10 h-10 flex items-center justify-center text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-sm transition-colors shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-1">
        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
          <span>Progress</span>
          <span className="text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progress >= 100 ? "bg-green-500" : progress >= 50 ? "bg-orange-500" : "bg-gray-800"}`} style={{ width: `${progress}%` }} />
        </div>
      </div>
      
      {input.milestoneName && (
        <div className="mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
          Supports: <span className="font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{input.milestoneName}</span>
        </div>
      )}
    </div>
  );
}
