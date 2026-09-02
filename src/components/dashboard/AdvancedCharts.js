"use client";

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, AreaChart, Area } from 'recharts';

export function QuarterlyConsistencyChart({ rocks, entries, inputs }) {
  const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
  
  const data = weeks.map((weekName, weekIdx) => {
    const dataPoint = { name: weekName };
    
    // Overall system activity (User Activity)
    const daysSinceQuarterStart = 30; // Mock: assume 30 days into the quarter
    const currentWeekOfQuarter = Math.floor(daysSinceQuarterStart / 7) + 1;
    
    if (weekIdx + 1 > currentWeekOfQuarter) {
      dataPoint['User Activity'] = null;
      rocks.forEach((rock, idx) => { dataPoint[`Rock${idx + 1}`] = null; });
    } else {
      // Calculate real overall system success
      const systemSuccess = entries ? entries.length / (inputs.length * 30 || 1) : 0;
      let overallScore = Math.min(100, Math.max(0, (systemSuccess * 100) + 40 + (weekIdx * 2))); // slightly up-trending mock logic
      dataPoint['User Activity'] = Math.round(overallScore);
      
      rocks.forEach((rock, rockIdx) => {
        const rockKey = `Rock${rockIdx + 1}`;
        const rockInputs = inputs?.filter(() => true) || []; // MVP: trace later
        if (rockInputs.length === 0) {
          dataPoint[rockKey] = 0;
        } else {
          const variance = (rockIdx * 8) - (weekIdx * 3); 
          let score = Math.min(100, Math.max(0, (systemSuccess * 100) + variance + 35));
          dataPoint[rockKey] = Math.round(score);
        }
      });
    }

    return dataPoint;
  });

  return (
    <div className="border border-divider bg-white p-6 w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Quarterly Consistency</div>
        <div className="text-xl font-serif font-bold text-ink">User Activity Performance</div>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
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
            <Legend iconType="rect" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            
            {/* Main User Activity Line */}
            <Line 
              type="monotone" 
              dataKey="User Activity" 
              name="Overall System Activity" 
              stroke="var(--color-ink)" 
              strokeWidth={3} 
              dot={{ r: 4, strokeWidth: 0, fill: "var(--color-ink)" }} 
              activeDot={{ r: 6 }} 
              connectNulls={false}
            />

            {/* Rocks Lines */}
            {rocks.map((rock, idx) => {
               const key = `Rock${idx + 1}`;
               const colors = ["var(--color-ochre)", "var(--color-moss)", "var(--color-ink)"];
               return (
                 <Line 
                   key={key} 
                   type="monotone" 
                   dataKey={key} 
                   name={rock?.name || `Rock ${idx + 1}`} 
                   stroke={colors[idx % colors.length]} 
                   strokeOpacity={0.6}
                   strokeWidth={1.5} 
                   dot={false} 
                   activeDot={{ r: 3 }} 
                   strokeDasharray="4 4"
                   connectNulls={false}
                 />
               );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function DailyInputsPerformanceChart({ inputs, entries }) {
  // Using a Bar Chart to analyze performance of daily inputs relative to their targets
  const data = inputs?.map(inp => {
    // Calculate the actual average of this input over the last 30 days
    const inpEntries = entries?.filter(e => e.input_definition_id === inp.id) || [];
    const sum = inpEntries.reduce((acc, e) => acc + (e.actual_value || (e.completed ? (inp.target || 1) : 0)), 0);
    const avg = inpEntries.length > 0 ? sum / inpEntries.length : 0;
    const max = inpEntries.reduce((acc, e) => Math.max(acc, e.actual_value || (e.completed ? (inp.target || 1) : 0)), 0);

    return {
      name: inp.name.substring(0, 15) + (inp.name.length > 15 ? '...' : ''),
      Target: inp.target || 1,
      Avg: Math.round(avg * 10) / 10,
      Max: max
    };
  }) || [];

  return (
    <div className="border border-divider bg-white p-6 w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Input Analysis</div>
        <div className="text-xl font-serif font-bold text-ink">Daily Performance (Last 30 Days)</div>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" strokeOpacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--color-ink)', opacity: 0.5 }} dy={10} interval={0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-divider)', borderRadius: 0 }}
              itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              labelStyle={{ color: 'var(--color-ink)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
              cursor={{ fill: 'var(--color-ink)', opacity: 0.05 }}
            />
            <Legend iconType="rect" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '10px' }} />
            <Bar dataKey="Avg" name="Average Actual" fill="var(--color-ink)" radius={[0, 0, 0, 0]} maxBarSize={40} />
            <Bar dataKey="Target" name="Target Base" fill="var(--color-ochre)" fillOpacity={0.3} radius={[0, 0, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function MilestonesChart({ rocks }) {
  // Area chart tracking milestone completion pace across the quarter
  // We'll calculate cumulative expected milestones vs cumulative actual completed milestones
  
  // Flatten all milestones from all rocks
  const allMilestones = rocks?.flatMap(r => r.weekly_milestones || []) || [];
  
  // Sort by week_number (1 to 12 typically)
  const maxWeek = Math.max(12, ...allMilestones.map(m => m.week_number || 1));
  
  let cumulativeExpected = 0;
  let cumulativeActual = 0;
  
  const data = Array.from({ length: maxWeek }, (_, i) => {
    const weekNum = i + 1;
    const weekMilestones = allMilestones.filter(m => m.week_number === weekNum);
    
    cumulativeExpected += weekMilestones.length;
    cumulativeActual += weekMilestones.filter(m => m.status === 'completed' || m.current_value >= m.target).length;

    // For a brand new system, we don't want the actual pace line to instantly jump to 0 for future weeks
    // We can show 'Pace' only up to the current week if we knew the current week. 
    // We'll just show the cumulative curve.
    
    return {
      name: `W${weekNum}`,
      Pace: cumulativeActual,
      Expected: cumulativeExpected
    };
  });

  return (
    <div className="border border-divider bg-white p-6 w-full h-full flex flex-col">
      <div className="mb-6">
        <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Execution Pace</div>
        <div className="text-xl font-serif font-bold text-ink">Milestone Velocity</div>
      </div>
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" strokeOpacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--color-ink)', opacity: 0.5 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-paper)', border: '1px solid var(--color-divider)', borderRadius: 0 }}
              itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
              labelStyle={{ color: 'var(--color-ink)', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}
            />
            <Legend iconType="rect" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }} />
            <Area type="monotone" dataKey="Expected" stroke="var(--color-ink)" fill="var(--color-ink)" fillOpacity={0.05} strokeOpacity={0.3} strokeDasharray="4 4" />
            <Area type="monotone" dataKey="Pace" stroke="var(--color-ochre)" fill="var(--color-ochre)" fillOpacity={0.2} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
