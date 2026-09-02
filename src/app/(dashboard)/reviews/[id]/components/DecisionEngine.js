"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";

export default function DecisionEngine({ onNext, onBack }) {
  const { decisions, addDecision, removeDecision } = useReviewEngineStore();
  
  const [inputs, setInputs] = useState({
    keep: "",
    stop: "",
    start: "",
    change: ""
  });

  const handleAdd = (category) => {
    if (!inputs[category].trim()) return;
    addDecision(category, inputs[category]);
    setInputs({ ...inputs, [category]: "" });
  };

  const handleKeyDown = (e, category) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd(category);
    }
  };

  const boards = [
    { id: 'keep', title: 'KEEP', desc: 'What is working and should continue?', color: 'border-green-500/30', bg: 'bg-green-500/5', titleColor: 'text-green-500' },
    { id: 'stop', title: 'STOP', desc: 'What should be removed?', color: 'border-red-500/30', bg: 'bg-red-500/5', titleColor: 'text-red-500' },
    { id: 'start', title: 'START', desc: 'What should be introduced?', color: 'border-blue-500/30', bg: 'bg-blue-500/5', titleColor: 'text-blue-500' },
    { id: 'change', title: 'CHANGE', desc: 'What should be modified?', color: 'border-amber-500/30', bg: 'bg-amber-500/5', titleColor: 'text-amber-500' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Decision Engine</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Based on the investigation, what structural changes should we make to the system?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {boards.map((board) => (
          <div key={board.id} className={`bg-[#0A0B0E] border ${board.color} rounded-xl p-5 flex flex-col h-[300px]`}>
            <div className="mb-4">
              <h3 className={`text-sm font-bold tracking-widest ${board.titleColor}`}>{board.title}</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{board.desc}</p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-2 custom-scrollbar">
              {decisions[board.id].length === 0 ? (
                <div className="text-xs text-gray-600 italic mt-2">No decisions recorded yet.</div>
              ) : (
                decisions[board.id].map(decision => (
                  <div key={decision.id} className={`group flex items-start justify-between gap-3 p-3 rounded-lg border border-white/5 ${board.bg}`}>
                    <p className="text-sm text-gray-300 leading-snug">{decision.text}</p>
                    <button 
                      onClick={() => removeDecision(board.id, decision.id)}
                      className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="relative mt-auto">
              <input
                type="text"
                value={inputs[board.id]}
                onChange={(e) => setInputs({ ...inputs, [board.id]: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, board.id)}
                placeholder={`Add ${board.title.toLowerCase()} decision...`}
                className="w-full bg-[#1A1C23] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
              />
              <button 
                onClick={() => handleAdd(board.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-8 flex justify-between items-center mt-8 border-t border-white/5">
        <button 
          onClick={onBack}
          className="text-gray-400 px-6 py-3 rounded-lg text-sm font-semibold hover:text-white transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button 
          onClick={onNext}
          className="bg-[#B8862E] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#A37525] transition-all shadow-lg shadow-[#B8862E]/20 flex items-center gap-2"
        >
          Review Summary <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
