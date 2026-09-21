"use client";

import { useState, useEffect } from "react";
import { Play, Square, Plus } from "lucide-react";

const getLocalISODate = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export default function TimeTracker({ inputs, activeTimer, onStart, onStop, onManualAdd }) {
  const [selectedInput, setSelectedInput] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualDate, setManualDate] = useState(getLocalISODate(new Date()));
  const [manualHours, setManualHours] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval = null;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsed(Math.floor((new Date() - activeTimer.startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!selectedInput) return alert("Please select an input.");
    const h = parseInt(manualHours || "0", 10);
    const m = parseInt(manualMinutes || "0", 10);
    if (h === 0 && m === 0) return alert("Please enter a duration.");
    
    onManualAdd(selectedInput, manualDate, h * 60 + m);
    setManualHours("");
    setManualMinutes("");
    setSelectedInput("");
    setManualMode(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800">Time Logger</h2>
        <button 
          onClick={() => setManualMode(!manualMode)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          {manualMode ? "Use Timer" : "Manual Entry"}
        </button>
      </div>

      <div className="p-6">
        {activeTimer && !manualMode ? (
          <div className="text-center py-6">
            <div className="text-sm font-medium text-slate-500 mb-2">Currently Tracking</div>
            <div className="text-lg font-semibold text-slate-900 mb-6">
              {inputs.find(i => i.id === activeTimer.input_definition_id)?.name || "Unknown"}
            </div>
            <div className="text-5xl font-mono text-slate-800 mb-8 font-light">
              {formatTime(elapsed)}
            </div>
            <button 
              onClick={onStop}
              className="w-full bg-red-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-medium hover:bg-red-700 transition-colors shadow-sm"
            >
              <Square className="w-5 h-5 fill-current" /> Stop Timer
            </button>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Input to Track</label>
              <select 
                value={selectedInput}
                onChange={(e) => setSelectedInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              >
                <option value="">-- Choose an Input --</option>
                {inputs.map(inp => (
                  <option key={inp.id} value={inp.id}>{inp.name}</option>
                ))}
              </select>
            </div>

            {manualMode ? (
              <form onSubmit={handleManualSubmit} className="space-y-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hours</label>
                    <input 
                      type="number" 
                      min="0"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Minutes</label>
                    <input 
                      type="number" 
                      min="0"
                      max="59"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      placeholder="0"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full mt-4 bg-slate-900 text-white rounded-xl py-3.5 flex items-center justify-center gap-2 font-medium hover:bg-black transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Time Entry
                </button>
              </form>
            ) : (
              <div className="pt-4">
                <button 
                  onClick={() => {
                    if (!selectedInput) return alert("Please select an input first.");
                    onStart(selectedInput);
                  }}
                  className="w-full bg-slate-900 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-medium hover:bg-black transition-colors shadow-sm"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Timer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
