import React from "react";
import Link from "next/link";

export function DashboardHeader({ system, quarter }) {
  if (!system) return null;
  return (
    <div className="mb-12">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-ink uppercase tracking-tight">{system.name}</h1>
          <div className="text-sm font-bold text-ink/50 uppercase tracking-widest mt-2">
            2026 · {quarter ? `Q${quarter.quarter_number}` : 'Q-Active'} · System v1.2
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-ink/70">Last updated: Today</div>
        </div>
      </div>
      <p className="text-lg font-serif text-ink border-l-2 border-ochre pl-4 italic max-w-2xl">
        Build Ascend and Wellmade into two validated businesses.
      </p>
    </div>
  );
}

export function NorthStarLedger({ goals, daysRemainingYear }) {
  if (!goals || goals.length === 0) return null;
  const primary = goals[0];

  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">North Star</h2>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-2">Primary Goal (100% Weight)</div>
          <div className="text-lg font-serif font-bold text-ink mb-2">{primary.name}</div>
          <div className="text-sm text-ink/70 leading-relaxed">{primary.outcome || "No description provided."}</div>
        </div>
        
        <div className="md:w-2/3">
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Target</td>
                <td className="py-2 font-mono text-right">{primary.target_value || '0'} {primary.unit || ''}</td>
              </tr>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Current</td>
                <td className="py-2 font-mono text-right">{primary.current_value || '0'} {primary.unit || ''}</td>
              </tr>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Gap</td>
                <td className="py-2 font-mono text-right">{Math.max(0, (primary.target_value || 0) - (primary.current_value || 0))} {primary.unit || ''}</td>
              </tr>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Days Remaining</td>
                <td className="py-2 font-mono text-right">{daysRemainingYear}</td>
              </tr>
              <tr>
                <td className="py-2 text-ink/70">Status</td>
                <td className="py-2 font-bold text-ochre text-right uppercase tracking-widest text-[10px]">AT RISK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function QuarterLedger({ quarter, daysRemainingQuarter }) {
  if (!quarter) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Current Quarter</h2>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-2">Q{quarter.quarter_number} · 2026</div>
          <div className="text-lg font-serif font-bold text-ink mb-2">{quarter.objective || 'Quarterly Objective'}</div>
        </div>
        
        <div className="md:w-2/3">
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Target</td>
                <td className="py-2 font-mono text-right">$2,000 (Expected)</td>
              </tr>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Current</td>
                <td className="py-2 font-mono text-right">$0</td>
              </tr>
              <tr className="border-b border-divider/50">
                <td className="py-2 text-ink/70">Days Remaining</td>
                <td className="py-2 font-mono text-right">{daysRemainingQuarter}</td>
              </tr>
              <tr>
                <td className="py-2 text-ink/70">Status</td>
                <td className="py-2 font-bold text-ochre text-right uppercase tracking-widest text-[10px]">AT RISK</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function RocksLedger({ rocks }) {
  if (!rocks || rocks.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Current Rocks</h2>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="space-y-6">
        {rocks.map((rock, idx) => (
          <div key={rock.id} className="border border-divider p-6 bg-white hover:border-ochre transition-colors cursor-pointer flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">{String(idx + 1).padStart(2, '0')}</div>
              <div className="text-base font-serif font-bold text-ink mb-2">{rock.name}</div>
              <div className="text-xs text-ink/70">Milestones: {rock.weekly_milestones?.filter(m => m.status === 'completed').length || 0} / {rock.weekly_milestones?.length || 4} complete</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold text-ochre uppercase tracking-widest">AT RISK</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TodayLedger({ inputs, priority }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-1 uppercase">Today</h2>
      <p className="text-ink/70 text-sm mb-4 font-serif italic">What needs to happen today?</p>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-divider">
                <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2">Input</th>
                <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Min</th>
                <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Act</th>
                <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {inputs?.map(inp => (
                <tr key={inp.id} className="border-b border-divider/50">
                  <td className="py-3 font-semibold">{inp.name}</td>
                  <td className="py-3 text-right font-mono text-ink/70">{inp.target || 1}</td>
                  <td className="py-3 text-right font-mono font-bold">0</td>
                  <td className="py-3 text-right text-[10px] font-bold text-ochre uppercase tracking-widest">BELOW MINIMUM</td>
                </tr>
              ))}
              {(!inputs || inputs.length === 0) && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-ink/50 italic text-sm">No required input today.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div>
          <div className="border border-divider bg-white p-8">
            <h3 className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Today's Priority</h3>
            {priority ? (
              <>
                <div className="text-lg font-serif font-bold text-ink mb-4 leading-tight">{priority.action}</div>
                <div className="text-sm font-mono text-ink/70 mb-2">{priority.remaining}</div>
                <div className="text-xs text-ink/70 mb-6">Connected Rock: <span className="font-semibold">{priority.rock}</span><br/>Reason: {priority.reason}</div>
                <Link href="/inputs" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-ochre hover:text-ink transition-colors border-b border-ochre hover:border-ink pb-1">
                  START →
                </Link>
              </>
            ) : (
              <div className="text-sm text-ink/70 italic">System clear. Execute remaining inputs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResultsLedger({ results }) {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-1 uppercase">Results</h2>
      <p className="text-ink/70 text-sm mb-4 font-serif italic">What actually happened?</p>
      <hr className="border-divider border-t-2 mb-6" />
      
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-divider">
            <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2">Result</th>
            <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Current</th>
            <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Target</th>
            <th className="font-bold text-[10px] uppercase tracking-widest text-ink/50 pb-2 text-right">Gap</th>
          </tr>
        </thead>
        <tbody>
          {results && results.length > 0 ? results.map(res => {
            const latestRecord = res.result_records?.[0];
            const current = latestRecord?.actual_value || '—';
            const target = latestRecord?.target_value || '—';
            return (
              <tr key={res.id} className="border-b border-divider/50 hover:bg-white transition-colors">
                <td className="py-3 font-semibold">{res.name}</td>
                <td className="py-3 text-right font-mono">{current}</td>
                <td className="py-3 text-right font-mono">{target}</td>
                <td className="py-3 text-right font-mono text-ink/50">—</td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="4" className="py-4 text-ink/50 italic text-sm">No results recorded yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function BusinessBuild() {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Business Build</h2>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="border border-divider bg-white p-6">
          <h3 className="text-base font-serif font-bold text-ink mb-4 uppercase tracking-widest">ASCEND</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Revenue</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Clients</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Pipeline</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr><td className="py-2 text-ink/70">Model status</td><td className="py-2 font-bold text-[10px] uppercase tracking-widest text-right text-ink/50">TESTING</td></tr>
            </tbody>
          </table>
        </div>
        <div className="border border-divider bg-white p-6">
          <h3 className="text-base font-serif font-bold text-ink mb-4 uppercase tracking-widest">WELLMADE</h3>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Revenue</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Clients</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr className="border-b border-divider/50"><td className="py-2 text-ink/70">Pipeline</td><td className="py-2 font-mono text-right">—</td></tr>
              <tr><td className="py-2 text-ink/70">Model status</td><td className="py-2 font-bold text-[10px] uppercase tracking-widest text-right text-ink/50">TESTING</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function ConstraintAndActions({ constraint, actions }) {
  return (
    <div className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        <div>
          <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Current Constraint</h2>
          <hr className="border-divider border-t-2 mb-6" />
          
          {constraint ? (
            <div className="border border-divider bg-white p-6">
              <h3 className="text-lg font-serif font-bold text-ink mb-2 uppercase tracking-wide">{constraint.name}</h3>
              <div className="text-sm font-mono text-ink/70 mb-4">{constraint.consistency}</div>
              <p className="text-sm italic text-ink/70 mb-4">Largest measurable execution gap.</p>
              <ul className="text-xs text-ink/70 space-y-2 mb-6 pl-4 list-disc">
                {constraint.evidence.map((ev, idx) => <li key={idx}>{ev}</li>)}
              </ul>
              <Link href="/reviews" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-ochre hover:text-ink transition-colors border-b border-ochre hover:border-ink pb-1">
                INVESTIGATE →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-ink/70 italic">No measurable constraint yet.</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Next Actions</h2>
          <hr className="border-divider border-t-2 mb-6" />
          
          <div className="space-y-4">
            {actions?.map((action, idx) => (
              <div key={idx} className="border border-divider bg-white p-4 flex justify-between items-center group cursor-pointer hover:border-ink transition-colors">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${action.priority === 'HIGH' ? 'text-ochre' : 'text-ink/50'}`}>
                    {action.priority}
                  </div>
                  <div className="text-sm font-semibold text-ink">{action.text}</div>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/30 group-hover:text-ink transition-colors">
                  ACT →
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export function SystemHealthDiagnostic({ health }) {
  return (
    <div className="mb-12 max-w-sm">
      <h2 className="text-sm font-serif font-bold text-ink mb-4 uppercase">System Health</h2>
      <hr className="border-divider border-t-2 mb-4" />
      {health ? (
        <table className="w-full text-xs">
          <tbody>
            {Object.entries(health.metrics).map(([key, val]) => (
              <tr key={key} className="border-b border-divider/50 last:border-0">
                <td className="py-2 text-ink/70 uppercase tracking-wide">{key}</td>
                <td className="py-2 font-mono text-right">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-ink/50 italic">Not enough data yet.</p>
      )}
    </div>
  );
}

export function SystemIntelligence() {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">System Intelligence</h2>
      <hr className="border-divider border-t-2 mb-6" />
      <div className="border-l-2 border-ochre pl-6 py-2 max-w-3xl">
        <p className="text-base text-ink mb-2"><strong>Execution is currently the largest measurable weakness.</strong></p>
        <p className="text-sm text-ink/70 italic leading-relaxed">
          There is not yet enough evidence to determine whether the acquisition model itself is failing. The immediate issue is insufficient consistent execution across configured daily inputs.
        </p>
      </div>
    </div>
  );
}

export function ExecutionLedger({ inputs, entries }) {
  const days = Array.from({ length: 60 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - i));
    const dStr = d.toISOString().split('T')[0];
    
    const dayEntries = entries?.filter(e => e.date === dStr) || [];
    if (dayEntries.length === 0 || inputs?.length === 0) return { date: dStr, val: 0 };
    
    const totalTarget = inputs.reduce((sum, inp) => sum + (inp.target || 1), 0);
    const totalActual = dayEntries.reduce((sum, e) => {
       const inp = inputs.find(i => i.id === e.input_definition_id);
       if (!inp) return sum;
       return sum + (e.actual_value || (e.completed ? (inp.target || 1) : 0));
    }, 0);
    
    const pct = totalTarget > 0 ? (totalActual / totalTarget) : 0;
    let val = 0;
    if (pct > 0) val = 1;
    if (pct >= 0.4) val = 2;
    if (pct >= 0.8) val = 3;
    if (pct >= 1) val = 4;
    
    return { date: dStr, val };
  });

  return (
    <div className="mb-12">
      <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Execution</h2>
      <hr className="border-divider border-t-2 mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
        <div>
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">30-Day Consistency</div>
          <div className="text-2xl font-mono text-ink">0%</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">7-Day Consistency</div>
          <div className="text-2xl font-mono text-ink">0%</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Strongest Input</div>
          <div className="text-lg font-serif font-bold text-ink truncate">None</div>
        </div>
      </div>

      <div className="border border-divider bg-white p-6 inline-block">
        <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Required Input Execution (60 Days)</div>
        <div className="flex flex-wrap gap-1 w-[400px]">
          {days.map((d, idx) => {
            let color = "bg-paper border border-divider/50";
            if (d.val === 1) color = "bg-ochre/20 border border-transparent";
            if (d.val === 2) color = "bg-ochre/40 border border-transparent";
            if (d.val === 3) color = "bg-ochre/70 border border-transparent";
            if (d.val === 4) color = "bg-ochre border border-transparent";
            return (
              <div key={idx} className={`w-3.5 h-3.5 ${color}`} title={`${d.date}: Level ${d.val}`} />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-6 text-[10px] text-ink/50 uppercase tracking-wider">
          <span>No Completion</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-paper border border-divider/50" />
            <div className="w-3 h-3 bg-ochre/20" />
            <div className="w-3 h-3 bg-ochre/40" />
            <div className="w-3 h-3 bg-ochre/70" />
            <div className="w-3 h-3 bg-ochre" />
          </div>
          <span>Target Met</span>
        </div>
      </div>
      
      <div className="mt-8">
        <ExecutionTrendChart entries={entries} inputs={inputs} />
      </div>
    </div>
  );
}

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function ExecutionTrendChart({ entries, inputs }) {
  // We need to calculate consistency day by day for the last 14 days to compare this week vs last week.
  // 14 days ago to 7 days ago = "Last Week"
  // 7 days ago to today = "This Week"
  
  const today = new Date();
  const data = [];
  
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  // Let's just create 7 data points for the days of the week, plotting "This Week" vs "Last Week"
  
  for (let i = 0; i < 7; i++) {
    // We will walk backwards from today. Actually, it's better to align by weekday.
    // For MVP visual richness, we'll calculate the last 7 days vs the 7 days before that.
    
    const currentDay = new Date();
    currentDay.setDate(today.getDate() - (6 - i));
    const currentDayStr = currentDay.toISOString().split('T')[0];
    
    const previousDay = new Date();
    previousDay.setDate(today.getDate() - (13 - i));
    const previousDayStr = previousDay.toISOString().split('T')[0];
    
    const calcConsistency = (dateStr) => {
      const dayEntries = entries?.filter(e => e.date === dateStr) || [];
      if (!inputs || inputs.length === 0) return 0;
      
      const totalTarget = inputs.reduce((sum, inp) => sum + (inp.target || 1), 0);
      const totalActual = dayEntries.reduce((sum, e) => {
         const inp = inputs.find(inv => inv.id === e.input_definition_id);
         if (!inp) return sum;
         return sum + (e.actual_value || (e.completed ? (inp.target || 1) : 0));
      }, 0);
      
      return totalTarget > 0 ? Math.min(100, Math.round((totalActual / totalTarget) * 100)) : 0;
    };
    
    data.push({
      name: currentDay.toLocaleDateString('default', { weekday: 'short' }),
      "This Week": calcConsistency(currentDayStr),
      "Last Week": calcConsistency(previousDayStr)
    });
  }

  return (
    <div className="border border-divider bg-white p-6 max-w-4xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Execution Trend</div>
          <div className="text-xl font-serif font-bold text-ink">Consistency Comparison</div>
        </div>
        <div className="flex gap-4">
          <div className="text-xs font-bold text-ochre uppercase tracking-widest border-b border-ochre pb-1">7D</div>
          <div className="text-xs font-bold text-ink/30 hover:text-ink transition-colors uppercase tracking-widest cursor-pointer">30D</div>
          <div className="text-xs font-bold text-ink/30 hover:text-ink transition-colors uppercase tracking-widest cursor-pointer">90D</div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" strokeOpacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-divider)', borderRadius: 0 }}
              itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              labelStyle={{ color: 'var(--color-ink)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Legend iconType="rect" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }} />
            <Line 
              type="monotone" 
              dataKey="This Week" 
              stroke="var(--color-ink)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 0, fill: "var(--color-ink)" }} 
              activeDot={{ r: 6 }} 
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="Last Week" 
              stroke="var(--color-ochre)" 
              strokeWidth={2} 
              strokeDasharray="4 4" 
              dot={false} 
              activeDot={{ r: 4, fill: "var(--color-ochre)" }}
              animationDuration={1500} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
