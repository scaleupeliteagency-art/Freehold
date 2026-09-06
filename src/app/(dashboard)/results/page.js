"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResultsPage() {
  const [loading, setLoading] = useState(true);
  const [activeSystem, setActiveSystem] = useState(null);
  const [results, setResults] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("This Week");
  const [systemLevelFilter, setSystemLevelFilter] = useState("All");
  
  const router = useRouter();

  useEffect(() => {
    async function fetchResults() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id")
          .eq("status", "active")
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }

        const systemId = systems[0].id;
        setActiveSystem(systems[0]);

        // Fetch result definitions and their latest records
        const { data: definitions, error: defError } = await supabase
          .from("result_definitions")
          .select(`
            *,
            result_records (
              id, period_label, period_start, period_end, actual_value, target_value, baseline_value, created_at
            )
          `)
          .eq("system_id", systemId);

        if (defError) throw defError;

        if (definitions) {
          const processed = definitions.map(def => {
            // Sort records newest first
            const records = def.result_records?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || [];
            const latest = records[0];
            const previous = records[1];

            // Calculations
            let progress = null;
            let status = "NO DATA";
            let statusColor = "text-ink/50";
            let change = null;
            
            const currentActual = latest?.actual_value;
            const currentTarget = latest?.target_value ?? def.target;
            const currentBaseline = latest?.baseline_value ?? def.baseline;

            if (currentActual !== undefined && currentTarget !== undefined && currentBaseline !== undefined) {
              const range = currentTarget - currentBaseline;
              if (range !== 0) {
                let progValue = (currentActual - currentBaseline) / range;
                if (def.direction === "Lower is better") {
                  progValue = (currentBaseline - currentActual) / (currentBaseline - currentTarget);
                }
                progress = Math.round(progValue * 100);

                if (progress >= 100) {
                  status = "AHEAD";
                  statusColor = "text-moss";
                } else if (progress >= 80) {
                  status = "ON TRACK";
                  statusColor = "text-ink";
                } else if (progress >= 50) {
                  status = "AT RISK";
                  statusColor = "text-ochre";
                } else {
                  status = "OFF TRACK";
                  statusColor = "text-red-700";
                }
              }
            }

            if (currentActual !== undefined && previous?.actual_value !== undefined) {
              const diff = currentActual - previous.actual_value;
              change = diff > 0 ? `+${diff}` : `${diff}`;
            }

            return {
              ...def,
              records,
              latestRecord: latest,
              currentActual,
              currentTarget,
              currentBaseline,
              progress,
              status,
              statusColor,
              change
            };
          });
          
          setResults(processed);
        }
      } catch (err) {
        console.error("Error fetching results:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-bold animate-pulse uppercase tracking-widest text-ink/50">Loading Outcomes...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="max-w-2xl py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-8" />
        <p className="text-ink max-w-md">You need an active system to record results.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-ink mb-2">Results</h1>
          <p className="text-sm text-ink/70">Record what actually happened. Keep the system grounded in reality.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-transparent border border-divider text-ink text-sm py-2 px-3 focus:outline-none focus:border-ink cursor-pointer"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
          </select>
          <button className="bg-ink text-paper text-sm font-bold uppercase tracking-widest py-2 px-5 hover:bg-ink/80 transition-colors">
            + Record Result
          </button>
        </div>
      </div>
      
      <hr className="border-divider mb-16" />

      {/* CURRENT RESULTS */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-bold text-ink mb-1">Current Results</h2>
          <p className="text-sm text-ink/70">Where the system stands right now.</p>
        </div>

        {results.length === 0 ? (
          <div className="border border-divider bg-white p-12 text-center">
            <h3 className="text-lg font-serif font-bold text-ink mb-2">No results recorded yet.</h3>
            <p className="text-sm text-ink/70 mb-6 max-w-sm mx-auto">Define the outcomes that matter to your system, then record what actually happens.</p>
            <button className="bg-ink text-paper text-[10px] font-bold uppercase tracking-widest py-2 px-6 hover:bg-ink/80 transition-colors">
              Define a Result
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto border-t border-b border-divider">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="border-b border-divider/50">
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50">Result</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Current</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Target</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Baseline</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Change</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Progress</th>
                  <th className="py-4 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-divider/50 hover:bg-white/40 transition-colors cursor-pointer group">
                    <td className="py-4 px-2 font-bold text-ink group-hover:text-ochre transition-colors">{r.name}</td>
                    <td className="py-4 px-2 font-mono text-ink text-right font-semibold">
                      {r.currentActual !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentActual}${r.unit ? ' ' + r.unit : ''}` : '—'}
                    </td>
                    <td className="py-4 px-2 font-mono text-ink/70 text-right">
                      {r.currentTarget !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentTarget}${r.unit ? ' ' + r.unit : ''}` : '—'}
                    </td>
                    <td className="py-4 px-2 font-mono text-ink/50 text-right">
                      {r.currentBaseline !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentBaseline}${r.unit ? ' ' + r.unit : ''}` : '—'}
                    </td>
                    <td className="py-4 px-2 font-mono text-ink text-right">{r.change ? r.change : '—'}</td>
                    <td className="py-4 px-2 font-mono text-ink text-right">{r.progress !== null ? `${r.progress}%` : '—'}</td>
                    <td className={`py-4 px-2 text-[10px] font-bold uppercase tracking-widest ${r.statusColor}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* RESULT TRENDS */}
      {results.length > 0 && (
        <section className="mb-16">
          <div className="flex justify-between items-end mb-6 border-b border-divider pb-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-ink mb-1">Result Trends</h2>
              <select className="bg-transparent text-sm font-bold text-ink focus:outline-none cursor-pointer">
                {results.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D', 'Quarter', 'Year', 'All'].map(t => (
                <button key={t} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-divider hover:bg-ink hover:text-paper transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          {/* Trend Chart Area */}
          <div className="h-64 border border-divider bg-white flex items-center justify-center relative overflow-hidden p-6">
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(var(--color-divider) 1px, transparent 1px), linear-gradient(90deg, var(--color-divider) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {results[0].records.length < 2 ? (
                <div className="relative z-10 text-center">
                  <h3 className="text-lg font-serif font-bold text-ink mb-1">Not enough data yet.</h3>
                  <p className="text-sm text-ink/70">Record at least 2 comparable periods to begin showing a trend.</p>
                </div>
             ) : (
                <div className="relative z-10 w-full h-full flex items-end gap-4 justify-between">
                  {/* Map actual records to heights (mocked height logic for MVP) */}
                  {results[0].records.slice(0).reverse().map((rec, i) => {
                    const heightPercent = Math.min(100, Math.max(10, ((rec.actual_value || 0) / (rec.target_value || 1)) * 100));
                    return (
                      <div key={rec.id || i} className="w-full bg-ink/5 relative h-full flex items-end group">
                         <div className="w-full bg-ink border-t-2 border-ochre transition-all duration-300" style={{ height: `${heightPercent}%` }}></div>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-ink text-paper text-[10px] font-mono py-1 px-2 whitespace-nowrap pointer-events-none transition-opacity z-20">
                            {rec.period_label}: {rec.actual_value}
                         </div>
                      </div>
                    );
                  })}
                </div>
             )}
          </div>
        </section>
      )}

      {/* RESULTS BY SYSTEM LEVEL */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-bold text-ink mb-1">Results by System Level</h2>
          <div className="flex gap-4 border-b border-divider pb-4 mt-4 overflow-x-auto hide-scrollbar">
            {['All', 'Goals', 'Years', 'Quarters', 'Rocks', 'Milestones'].map((filter) => (
              <button 
                key={filter} 
                onClick={() => setSystemLevelFilter(filter)}
                className={`text-sm font-bold whitespace-nowrap ${systemLevelFilter === filter ? 'text-ink border-b-2 border-ochre pb-1' : 'text-ink/50 hover:text-ink'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-[10px] font-bold text-ink uppercase tracking-widest mb-4">Filtered Ledger</h3>
          <table className="w-full text-sm text-left border-t border-b border-divider">
            <thead>
              <tr className="border-b border-divider/50">
                <th className="py-3 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50">Result</th>
                <th className="py-3 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Current</th>
                <th className="py-3 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Target</th>
                <th className="py-3 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50 text-right">Progress</th>
                <th className="py-3 px-2 font-bold text-[10px] uppercase tracking-widest text-ink/50">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 px-2 text-center text-ink/50 italic text-sm border-b border-divider/50">
                    No results match this level.
                  </td>
                </tr>
              )}
              {results.map((r) => (
                <tr key={r.id} className="border-b border-divider/50">
                  <td className="py-3 px-2 font-semibold text-ink">{r.name}</td>
                  <td className="py-3 px-2 font-mono text-ink text-right">
                    {r.currentActual !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentActual}` : '—'}
                  </td>
                  <td className="py-3 px-2 font-mono text-ink/50 text-right">
                    {r.currentTarget !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentTarget}` : '—'}
                  </td>
                  <td className="py-3 px-2 font-mono text-ink text-right">{r.progress !== null ? `${r.progress}%` : '—'}</td>
                  <td className={`py-3 px-2 text-[10px] font-bold uppercase tracking-widest ${r.statusColor}`}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* EXECUTION -> RESULTS */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl font-serif font-bold text-ink mb-1">Execution → Results</h2>
          <p className="text-sm text-ink/70 mb-6">Observe the structural connection between inputs and outcomes.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 border border-divider p-6 bg-white relative">
             <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Input</div>
             <div className="text-xl font-serif font-bold text-ink">Recorded Inputs</div>
             <div className="text-2xl font-mono text-ink mt-2">See /inputs</div>
             <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 text-divider">→</div>
          </div>
          
          <div className="flex-1 border border-divider p-6 bg-white relative">
             <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Milestone</div>
             <div className="text-xl font-serif font-bold text-ink">Active Milestones</div>
             <div className="text-2xl font-mono text-ink mt-2">In Progress</div>
             <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 text-divider">→</div>
          </div>
          
          <div className="flex-1 border border-ochre/30 bg-ochre/5 p-6">
             <div className="text-[10px] font-bold text-ochre uppercase tracking-widest mb-4">Result</div>
             <div className="text-xl font-serif font-bold text-ink">{results.length > 0 ? results[0].name : "Primary Outcome"}</div>
             <div className="text-2xl font-mono text-ink mt-2">
                {results.length > 0 && results[0].currentActual !== undefined ? `${results[0].type === 'Currency' ? '$' : ''}${results[0].currentActual}` : '—'}
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}
