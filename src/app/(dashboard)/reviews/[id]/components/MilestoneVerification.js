"use client";

import { useState } from "react";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";

export default function MilestoneVerification({ onNext, onBack }) {
  const { reviewContext } = useReviewEngineStore();
  const rocks = reviewContext?.rocks || [];

  const [milestoneStatus, setMilestoneStatus] = useState(() => {
    const initial = {};
    rocks.forEach(rock => {
      (rock.weekly_milestones || []).forEach(m => {
        initial[m.id] = m.status || "pending";
      });
    });
    return initial;
  });

  const [notes, setNotes] = useState("");

  const toggleMilestone = (id, current) => {
    setMilestoneStatus(prev => ({
      ...prev,
      [id]: current === "completed" ? "pending" : "completed"
    }));
  };

  const totalMilestones = rocks.reduce((acc, r) => acc + (r.weekly_milestones?.length || 0), 0);
  const completedCount = Object.values(milestoneStatus).filter(s => s === "completed").length;
  const hitRate = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Step 3 · Milestone Verification</div>
        <h2 className="text-2xl font-serif font-bold text-ink uppercase mb-3">Did we hit our milestones?</h2>
        <p className="text-sm text-ink/70 leading-relaxed max-w-xl">
          Review each milestone from this week. Mark what was completed, what wasn't, and why. Honesty here is the whole point.
        </p>
      </div>

      <hr className="border-divider mb-8" />

      {/* Hit Rate Summary */}
      <div className="border border-divider p-6 mb-8 bg-white">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Milestone Hit Rate</span>
          <span className="font-mono font-bold text-lg text-ink">{hitRate}%</span>
        </div>
        <div className="w-full h-1 bg-paper border border-divider">
          <div
            className={`h-full transition-all duration-700 ${hitRate >= 80 ? "bg-moss" : hitRate >= 50 ? "bg-ochre" : "bg-ink"}`}
            style={{ width: `${hitRate}%` }}
          />
        </div>
        <div className="text-xs text-ink/50 mt-2 font-mono">{completedCount} of {totalMilestones} completed</div>
      </div>

      {/* Rocks & Milestones */}
      {rocks.length === 0 ? (
        <div className="border border-divider p-8 text-center text-sm text-ink/60">
          No rocks or milestones configured for this period.
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {rocks.map((rock, rIdx) => (
            <div key={rock.id} className="border border-divider">
              <div className="px-6 py-4 border-b border-divider bg-white flex justify-between items-center">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Rock {String(rIdx + 1).padStart(2, "0")}</div>
                  <div className="font-serif font-bold text-ink">{rock.name}</div>
                </div>
                <div className="text-[10px] font-mono text-ink/50">
                  {(rock.weekly_milestones || []).filter(m => milestoneStatus[m.id] === "completed").length} / {(rock.weekly_milestones || []).length}
                </div>
              </div>
              <div className="divide-y divide-divider">
                {(rock.weekly_milestones || []).map(milestone => {
                  const done = milestoneStatus[milestone.id] === "completed";
                  return (
                    <button
                      key={milestone.id}
                      onClick={() => toggleMilestone(milestone.id, milestoneStatus[milestone.id])}
                      className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-white/60 ${done ? "bg-white/80" : "bg-paper"}`}
                    >
                      <div className={`w-5 h-5 border-2 shrink-0 flex items-center justify-center transition-colors ${done ? "border-ink bg-ink" : "border-divider"}`}>
                        {done && <span className="text-paper text-[10px] font-bold">✓</span>}
                      </div>
                      <span className={`text-sm font-medium ${done ? "text-ink line-through opacity-60" : "text-ink"}`}>
                        {milestone.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Notes on missed milestones</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          placeholder="What blocked completion? External factors, underestimation, deprioritisation..."
          className="w-full bg-white border border-divider text-ink text-sm py-3 px-4 focus:outline-none focus:border-ink transition-colors resize-none placeholder:text-ink/30"
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
