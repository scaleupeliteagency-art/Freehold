"use client";

import InputCard from "./InputCard";

export default function ExecutionBoard({ inputs, onUpdate, onEdit, onViewHistory }) {
  if (!inputs || inputs.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl p-12 text-center bg-slate-50">
        <p className="text-sm text-slate-600 font-medium">No active inputs found.</p>
        <p className="text-sm text-slate-400 mt-1">Add a new operational input to start tracking execution.</p>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-slate-900 mb-5">Today's Execution</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {inputs.map(input => (
          <InputCard 
            key={input.id} 
            input={input} 
            onUpdate={onUpdate} 
            onEdit={onEdit} 
            onViewHistory={onViewHistory} 
          />
        ))}
      </div>
    </div>
  );
}
