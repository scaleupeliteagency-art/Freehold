"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function ResultsContent() {
  const [loading, setLoading] = useState(true);
  const [activeSystem, setActiveSystem] = useState(null);
  const [results, setResults] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState("This Week");
  const [systemLevelFilter, setSystemLevelFilter] = useState("All");
  
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [handoffMilestoneName, setHandoffMilestoneName] = useState(null);
  const [handoffDefinitionId, setHandoffDefinitionId] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const handoff = searchParams.get('handoff');
  const milestoneId = searchParams.get('milestone');

  useEffect(() => {
    async function handleHandoff() {
      if (handoff === 'true' && milestoneId && activeSystem) {
        // Fetch milestone name
        const { data: milestone } = await supabase.from('weekly_milestones').select('name').eq('id', milestoneId).single();
        if (milestone) {
          setHandoffMilestoneName(milestone.name);
          
          // Check if there is a result definition connected to it
          const { data: def } = await supabase.from('result_definitions').select('id').eq('connected_milestone_id', milestoneId).single();
          if (def) {
            setHandoffDefinitionId(def.id);
            // Auto redirect to record page
            router.push(`/results/record?definition=${def.id}&handoff=true`);
          }
        }
      }
    }
    handleHandoff();
  }, [handoff, milestoneId, activeSystem, router]);

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
            let statusColor = "text-slate-400";
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
                  statusColor = "text-emerald-600";
                } else if (progress >= 80) {
                  status = "ON TRACK";
                  statusColor = "text-slate-900";
                } else if (progress >= 50) {
                  status = "AT RISK";
                  statusColor = "text-amber-500";
                } else {
                  status = "OFF TRACK";
                  statusColor = "text-red-600";
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
  }, [refreshTrigger]);



  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-wider text-slate-400">Loading Outcomes...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">No Active System</h2>
        <hr className="border-slate-200 mb-8" />
        <p className="text-slate-500 max-w-md">You need an active system to record results.</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      
      {handoff === 'true' && handoffMilestoneName && !handoffDefinitionId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-pulse">
          <div>
            <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Milestone Achieved</div>
            <h2 className="text-xl font-bold text-slate-900">You achieved: {handoffMilestoneName}. What was the exact measurable result generated?</h2>
            <p className="text-sm text-slate-500 mt-1">There is no measurable result connected to this milestone. Please define one to continue the Ledger.</p>
          </div>
          <Link 
            href={`/results/define?milestone=${milestoneId}`}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg px-4 py-2 shadow-sm transition-colors shrink-0"
          >
            Define Result
          </Link>
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Results</h1>
          <p className="text-sm text-slate-500">Record what actually happened. Keep the system grounded in reality.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg shadow-sm text-slate-900 text-sm py-2 px-3 focus:outline-none focus:border-slate-300 cursor-pointer"
          >
            <option>This Week</option>
            <option>This Month</option>
            <option>This Quarter</option>
          </select>
          <Link 
            href="/results/record"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg px-4 py-2 shadow-sm transition-colors"
          >
            + Record Result
          </Link>
        </div>
      </div>
      
      <hr className="border-slate-200 mb-10" />

      {/* CURRENT RESULTS */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Current Results</h2>
          <p className="text-sm text-slate-500">Where the system stands right now.</p>
        </div>

        {results.length === 0 ? (
          <div className="border border-slate-200 rounded-xl shadow-sm bg-white p-12 text-center">
            <h3 className="text-lg font-bold text-slate-900 mb-2">No results recorded yet.</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">Define the outcomes that matter to your system, then record what actually happens.</p>
            <Link href="/results/define" className="bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg px-4 py-2 shadow-sm transition-colors inline-block">
              Define a Result
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Current</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Target</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Baseline</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Change</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Progress</th>
                    <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <td className="py-4 px-4 font-medium text-slate-900 group-hover:text-orange-600 transition-colors">{r.name}</td>
                      <td className="py-4 px-4 font-mono text-slate-900 text-right font-medium">
                        {r.currentActual !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentActual}${r.unit ? ' ' + r.unit : ''}` : '—'}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-500 text-right">
                        {r.currentTarget !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentTarget}${r.unit ? ' ' + r.unit : ''}` : '—'}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400 text-right">
                        {r.currentBaseline !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentBaseline}${r.unit ? ' ' + r.unit : ''}` : '—'}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-700 text-right">{r.change ? r.change : '—'}</td>
                      <td className="py-4 px-4 font-mono text-slate-700 text-right">{r.progress !== null ? `${r.progress}%` : '—'}</td>
                      <td className={`py-4 px-4 text-xs font-semibold uppercase tracking-wider ${r.statusColor}`}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* RESULT TRENDS */}
      {results.length > 0 && (
        <section className="mb-12">
          <div className="flex justify-between items-end mb-6 pb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Result Trends</h2>
              <select className="bg-transparent text-sm font-semibold text-slate-900 focus:outline-none cursor-pointer">
                {results.map(r => <option key={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', '90D', 'Quarter', 'Year', 'All'].map(t => (
                <button key={t} className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md px-3 py-1 hover:bg-slate-50 transition-colors shadow-sm">
                  {t}
                </button>
              ))}
            </div>
          </div>
          
          {/* Trend Chart Area */}
          <div className="h-64 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center relative overflow-hidden p-6">
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(var(--color-divider) 1px, transparent 1px), linear-gradient(90deg, var(--color-divider) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {results[0].records.length < 2 ? (
                <div className="relative z-10 text-center">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Not enough data yet.</h3>
                  <p className="text-sm text-slate-500">Record at least 2 comparable periods to begin showing a trend.</p>
                </div>
             ) : (
                <div className="relative z-10 w-full h-full flex items-end gap-4 justify-between">
                  {/* Map actual records to heights (mocked height logic for MVP) */}
                  {results[0].records.slice(0).reverse().map((rec, i) => {
                    const heightPercent = Math.min(100, Math.max(10, ((rec.actual_value || 0) / (rec.target_value || 1)) * 100));
                    return (
                      <div key={rec.id || i} className="w-full bg-slate-50 rounded-t-sm relative h-full flex items-end group">
                         <div className="w-full bg-orange-400 hover:bg-orange-500 rounded-t-sm transition-colors duration-300" style={{ height: `${heightPercent}%` }}></div>
                         <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 bg-slate-800 text-white text-xs font-medium py-1 px-2 rounded whitespace-nowrap pointer-events-none transition-opacity z-20 shadow-sm">
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
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Results by System Level</h2>
          <div className="flex gap-4 border-b border-slate-200 pb-4 mt-4 overflow-x-auto hide-scrollbar">
            {['All', 'Goals', 'Years', 'Quarters', 'Rocks', 'Milestones'].map((filter) => (
              <button 
                key={filter} 
                onClick={() => setSystemLevelFilter(filter)}
                className={`text-sm font-semibold whitespace-nowrap ${systemLevelFilter === filter ? 'text-slate-900 border-b-2 border-orange-500 pb-1' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Filtered Ledger</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Current</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Target</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Progress</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 px-4 text-center text-slate-500 italic text-sm">
                      No results match this level.
                    </td>
                  </tr>
                )}
                {results.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="py-4 px-4 font-medium text-slate-900">{r.name}</td>
                    <td className="py-4 px-4 font-mono text-slate-900 text-right">
                      {r.currentActual !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentActual}` : '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-500 text-right">
                      {r.currentTarget !== undefined ? `${r.type === 'Currency' ? '$' : ''}${r.currentTarget}` : '—'}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-700 text-right">{r.progress !== null ? `${r.progress}%` : '—'}</td>
                    <td className={`py-4 px-4 text-xs font-semibold uppercase tracking-wider ${r.statusColor}`}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* EXECUTION -> RESULTS */}
      <section className="mb-16">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Execution → Results</h2>
          <p className="text-sm text-slate-500 mb-6">Observe the structural connection between inputs and outcomes.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 rounded-xl shadow-sm border border-slate-200 p-6 bg-white relative">
             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Input</div>
             <div className="text-xl font-bold text-slate-900">Recorded Inputs</div>
             <div className="text-2xl font-mono text-slate-700 mt-2">See /inputs</div>
             <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 text-slate-300 font-bold">→</div>
          </div>
          
          <div className="flex-1 rounded-xl shadow-sm border border-slate-200 p-6 bg-white relative">
             <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Milestone</div>
             <div className="text-xl font-bold text-slate-900">Active Milestones</div>
             <div className="text-2xl font-mono text-slate-700 mt-2">In Progress</div>
             <div className="hidden md:block absolute right-[-24px] top-1/2 -translate-y-1/2 text-slate-300 font-bold">→</div>
          </div>
          
          <div className="flex-1 rounded-xl shadow-sm bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 text-orange-900 p-6">
             <div className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-4">Result</div>
             <div className="text-xl font-bold text-orange-900">{results.length > 0 ? results[0].name : "Primary Outcome"}</div>
             <div className="text-2xl font-mono text-orange-800 mt-2">
                {results.length > 0 && results[0].currentActual !== undefined ? `${results[0].type === 'Currency' ? '$' : ''}${results[0].currentActual}` : '—'}
             </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center"><div className="text-sm font-semibold animate-pulse uppercase tracking-wider text-slate-400">Loading Outcomes...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
