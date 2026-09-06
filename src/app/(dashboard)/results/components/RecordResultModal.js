"use client";

import { useState } from "react";

export default function RecordResultModal({ isOpen, onClose, definitions, onSave }) {
  const [definitionId, setDefinitionId] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [baselineValue, setBaselineValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Initialize definitionId when opened if not set
  if (isOpen && !definitionId && definitions.length > 0) {
    setDefinitionId(definitions[0].id);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!definitionId || !periodLabel || actualValue === "") return;
    
    setIsSubmitting(true);
    await onSave({
      definition_id: definitionId,
      period_label: periodLabel,
      actual_value: Number(actualValue),
      target_value: targetValue !== "" ? Number(targetValue) : null,
      baseline_value: baselineValue !== "" ? Number(baselineValue) : null,
    });
    setIsSubmitting(false);
    
    // Reset form
    setPeriodLabel("");
    setActualValue("");
    setTargetValue("");
    setBaselineValue("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-paper border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full max-w-md relative flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-ink p-4 bg-white">
          <h2 className="text-xl font-serif font-bold text-ink">Record Result</h2>
          <button 
            onClick={onClose}
            className="text-ink/70 hover:text-ochre transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Metric</label>
            <select
              value={definitionId}
              onChange={(e) => setDefinitionId(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-ink p-2 text-sm focus:outline-none focus:border-ochre text-ink"
            >
              <option value="" disabled>Select a metric</option>
              {definitions.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Period Label</label>
            <input
              type="text"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              placeholder="e.g. Week 34, Q3 2026"
              required
              className="w-full bg-transparent border-2 border-ink p-2 text-sm focus:outline-none focus:border-ochre text-ink"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Actual Value</label>
            <input
              type="number"
              step="any"
              value={actualValue}
              onChange={(e) => setActualValue(e.target.value)}
              required
              className="w-full bg-transparent border-2 border-ink p-2 text-sm focus:outline-none focus:border-ochre text-ink font-mono"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Target (Optional)</label>
              <input
                type="number"
                step="any"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full bg-transparent border-2 border-ink p-2 text-sm focus:outline-none focus:border-ochre text-ink font-mono"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] font-bold text-ink uppercase tracking-widest">Baseline (Optional)</label>
              <input
                type="number"
                step="any"
                value={baselineValue}
                onChange={(e) => setBaselineValue(e.target.value)}
                className="w-full bg-transparent border-2 border-ink p-2 text-sm focus:outline-none focus:border-ochre text-ink font-mono"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold uppercase tracking-widest text-ink hover:text-ochre transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-ink text-paper text-sm font-bold uppercase tracking-widest py-2 px-6 border-2 border-ink hover:bg-white hover:text-ink transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
