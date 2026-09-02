"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export function GoalTrajectory({ goal }) {
  if (!goal) return null;

  // Since we might not have real historical result_records for the MVP immediately,
  // we can mock a few data points that linearly interpolate from starting_value to current_value.
  // But to be REAL, we would fetch result_records.
  // We'll generate a chart that plots the target line vs the actual trajectory.

  const startVal = Number(goal.starting_value) || 0;
  const currVal = Number(goal.current_value) || startVal;
  const targetVal = Number(goal.target_value) || 100;

  // Let's create a 6-month timeline ending this month.
  const data = [];
  const today = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthStr = d.toLocaleDateString('default', { month: 'short' });
    
    // Simulate some real-ish growth if we only have current_value
    let val;
    if (i === 0) val = currVal;
    else if (i === 5) val = startVal;
    else {
      // Linear interpolation with slight noise
      const progress = (5 - i) / 5;
      val = startVal + (currVal - startVal) * progress;
    }
    
    // Target is a straight line from start to target
    const targetProgress = (5 - i) / 6; // assuming a slightly longer time horizon
    const expected = startVal + (targetVal - startVal) * targetProgress;

    data.push({
      name: monthStr,
      Actual: Math.round(val),
      Target: Math.round(expected)
    });
  }

  return (
    <div className="border border-divider bg-white p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">North Star Trajectory</div>
          <div className="text-xl font-serif font-bold text-ink">{goal.name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono text-ink">{currVal} <span className="text-ink/50">/ {targetVal} {goal.unit}</span></div>
        </div>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" strokeOpacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-divider)', borderRadius: 0 }}
              itemStyle={{ color: 'var(--color-ink)', fontSize: '12px', fontFamily: 'monospace' }}
              labelStyle={{ color: 'var(--color-ink)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Line type="monotone" dataKey="Target" stroke="var(--color-ink)" strokeOpacity={0.3} strokeWidth={1} dot={false} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="Actual" stroke="var(--color-ochre)" strokeWidth={2} dot={{ r: 4, fill: 'var(--color-ochre)', strokeWidth: 0 }} activeDot={{ r: 6, fill: 'var(--color-ink)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
