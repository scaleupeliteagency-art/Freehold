"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";

const ACTIONS = ["Keep as-is", "Increase target", "Decrease target", "Pause", "Remove", "Replace"];

export default function InputOptimization({ onNext, onBack }) {
  const { reviewContext } = useReviewEngineStore();
  const inputs = reviewContext?.inputs || [];

  const [decisions, setDecisions] = useState(() =>
    Object.fromEntries(inputs.map(inp => [inp.id, { action: "Keep as-is", note: "" }]))
  );

  const updateDecision = (id, field, value) => {
    setDecisions(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const changesCount = Object.values(decisions).filter(d => d.action !== "Keep as-is").length;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Step 6 · Input Optimisation</div>
        <h2 className="text-2xl font-serif font-bold text-ink uppercase mb-3">Are your inputs still right?</h2>
        <p className="text-sm text-ink/70 leading-relaxed max-w-xl">
          The system inputs should evolve with reality. Review each one based on this week's execution data. Are targets appropriate? Is anything missing or should be removed?
        </p>
      </div>

      <hr className="border-divider mb-8" />

      {changesCount > 0 && (
        <div className="border-l-2 border-ochre pl-4 mb-8 py-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ochre">{changesCount} input{changesCount > 1 ? "s" : ""} flagged for adjustment</span>
        </div>
      )}

      {inputs.length === 0 ? (
        <div className="border border-divider p-8 text-center text-sm text-ink/60 mb-8">
          No daily inputs configured for this system.
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {inputs.map((inp, idx) => {
            const decision = decisions[inp.id] || { action: "Keep as-is", note: "" };
            const isChanged = decision.action !== "Keep as-is";
            return (
              <div key={inp.id} className={`border p-6 transition-colors ${isChanged ? "border-ochre bg-white" : "border-divider bg-paper"}`}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Input {String(idx + 1).padStart(2, "0")}</div>
                    <div className="font-serif font-bold text-ink mb-1">{inp.name}</div>
                    <div className="text-xs text-ink/60 font-mono">
                      Target: {inp.target || "—"} · {inp.frequency || "DAILY"}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Decision</label>
                    <select
                      value={decision.action}
                      onChange={e => updateDecision(inp.id, "action", e.target.value)}
                      className={`bg-white border text-ink text-xs py-2 px-3 focus:outline-none focus:border-ink transition-colors ${isChanged ? "border-ochre" : "border-divider"}`}
                    >
                      {ACTIONS.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {isChanged && (
                  <div className="mt-4 pt-4 border-t border-divider">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Reasoning</label>
                    <input
                      type="text"
                      placeholder="Why this change?"
                      value={decision.note}
                      onChange={e => updateDecision(inp.id, "note", e.target.value)}
                      className="w-full bg-paper border border-divider text-ink text-sm py-2 px-3 focus:outline-none focus:border-ink transition-colors placeholder:text-ink/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="border border-divider p-6 bg-white mb-8">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">New Inputs to Add</label>
        <textarea
          rows={2}
          placeholder="Any new inputs that should be tracked next week? List them here..."
          className="w-full bg-paper border border-divider text-ink text-sm py-3 px-4 focus:outline-none focus:border-ink transition-colors resize-none placeholder:text-ink/30"
        />
      </div>

      <hr className="border-divider mb-8" />

      <div className="flex justify-between">
        <button onClick={onBack} className="border border-divider text-ink/60 px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-ink hover:text-ink transition-colors">
          ← Back
        </button>
        <button onClick={onNext} className="bg-ink text-paper px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}
