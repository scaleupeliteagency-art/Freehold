"use client";

import { useState } from "react";
import { X, CheckCircle2 } from "lucide-react";

export default function CloseDayModal({ isOpen, onClose, score, completedInputs, totalInputs, onConfirm }) {
  const [note, setNote] = useState("");
  const [outcomes, setOutcomes] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-orange-600/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-lg relative border border-slate-100">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-8">
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-semibold text-slate-900 mb-1">Close Day</h2>
          <p className="text-sm text-slate-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-1">Execution Score</div>
            <div className="text-3xl font-semibold text-slate-900">{score}%</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-1">Inputs Completed</div>
            <div className="text-3xl font-semibold text-slate-900">{completedInputs} <span className="text-lg text-slate-400">/ {totalInputs}</span></div>
          </div>
        </div>

        <div className="space-y-5 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Key Outcomes (Optional)</label>
            <input 
              type="text" 
              value={outcomes} 
              onChange={e => setOutcomes(e.target.value)} 
              placeholder="e.g. 2 meetings booked" 
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Daily Note (Optional)</label>
            <textarea 
              value={note} 
              onChange={e => setNote(e.target.value)} 
              placeholder="How did the execution feel today?" 
              rows={3}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm resize-none"
            />
          </div>
        </div>

        <button 
          onClick={() => onConfirm({ note, outcomes })}
          className="w-full bg-orange-600 text-white rounded-full py-3.5 text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
        >
          Confirm & Close Day
        </button>
      </div>
    </div>
  );
}
