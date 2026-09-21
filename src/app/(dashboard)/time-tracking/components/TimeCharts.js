"use client";
import { useMemo } from "react";

const getLocalISODate = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend
} from "recharts";

const RADIAL_COLORS = ['#bae6fd', '#38bdf8', '#0284c7']; // Light to dark blue

export default function TimeCharts({ entries, inputs }) {
  
  const dailyData = useMemo(() => {
    if (!entries || !entries.length) return [];
    
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getLocalISODate(d);
    }).reverse();

    const prior7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i - 7);
      return getLocalISODate(d);
    }).reverse();

    const grouped = entries.reduce((acc, entry) => {
      if (entry.duration_minutes) {
        acc[entry.date] = (acc[entry.date] || 0) + (entry.duration_minutes / 60);
      }
      return acc;
    }, {});

    return last7Days.map((date, i) => {
      const d = new Date(date);
      const lastWeekDate = prior7Days[i];
      return {
        name: d.toLocaleDateString("en-US", { weekday: 'short' }),
        fullDate: date,
        "This Week": Number((grouped[date] || 0).toFixed(2)),
        "Last Week": Number((grouped[lastWeekDate] || 0).toFixed(2))
      };
    });
  }, [entries]);

  const inputData = useMemo(() => {
    if (!entries || !entries.length || !inputs.length) return [];
    
    // Only count this week for the input breakdown
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - i); return getLocalISODate(d);
    });

    const grouped = entries.reduce((acc, entry) => {
      if (last7Days.includes(entry.date) && entry.duration_minutes) {
        acc[entry.input_definition_id] = (acc[entry.input_definition_id] || 0) + (entry.duration_minutes / 60);
      }
      return acc;
    }, {});

    const sorted = Object.entries(grouped).map(([id, hours]) => {
      const input = inputs.find(i => i.id === id);
      return {
        name: input ? input.name : "Unknown",
        hours: Number(hours.toFixed(2))
      };
    }).sort((a, b) => b.hours - a.hours).slice(0, 3);

    // Recharts renders from inner to outer based on array order.
    // We want the highest value on the outer ring, so we reverse it.
    // We also assign colors.
    return sorted.reverse().map((item, index) => ({
      ...item,
      fill: RADIAL_COLORS[index]
    }));
  }, [entries, inputs]);

  const productiveSlots = useMemo(() => {
    if (!entries || !entries.length) return [];
    const hourCounts = new Array(24).fill(0);
    let totalTimed = 0;
    entries.forEach(entry => {
      if (entry.start_time && entry.duration_minutes) {
        const startHour = new Date(entry.start_time).getHours();
        hourCounts[startHour] += entry.duration_minutes;
        totalTimed += entry.duration_minutes;
      }
    });
    if (totalTimed === 0) return [];
    return hourCounts.map((mins, hour) => ({ hour, mins }))
      .filter(item => item.mins > 0)
      .sort((a, b) => b.mins - a.mins)
      .slice(0, 3)
      .map(item => {
        const ampm = item.hour >= 12 ? 'PM' : 'AM';
        const h = item.hour % 12 || 12;
        return {
          slot: `${h}:00 ${ampm} - ${h === 11 ? '12:00 PM' : h === 23 ? '12:00 AM' : (h+1)+':00 '+ampm}`,
          minutes: Math.round(item.mins)
        };
      });
  }, [entries]);

  const totalHoursWeek = dailyData.reduce((sum, d) => sum + d["This Week"], 0).toFixed(1);

  // Custom Legend for the Radial Chart
  const renderRadialLegend = (props) => {
    const { payload } = props;
    // Reverse again so highest value is listed first in legend
    const reversedPayload = [...payload].reverse();
    return (
      <div className="flex flex-col gap-2 w-full pl-4 mt-8">
        {reversedPayload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-600 font-medium">{entry.payload.name}</span>
            </div>
            <span className="font-bold text-slate-900">{entry.payload.hours} hrs</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top row cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="text-sm font-medium text-slate-500 mb-1">Last 7 Days</div>
          <div className="text-4xl font-bold text-slate-900">{totalHoursWeek} <span className="text-xl font-medium text-slate-500">hrs</span></div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-4">Most Productive Slots</div>
          {productiveSlots.length > 0 ? (
            <div className="space-y-3">
              {productiveSlots.map((slot, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-ochre/80 font-bold">#{i+1}</span>
                    <span className="font-medium text-slate-700">{slot.slot}</span>
                  </div>
                  <span className="text-slate-600 font-semibold">{Math.round(slot.minutes / 60 * 10) / 10} hrs</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-400">Not enough timed data yet. Use the timer to calculate slots.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Daily Smooth Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-semibold text-slate-800">Balance Overview</h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="h-64 w-full flex-1">
            {dailyData.some(d => d["This Week"] > 0 || d["Last Week"] > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="Last Week" stroke="#60a5fa" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="This Week" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No data for the last 14 days</div>
            )}
          </div>
        </div>

        {/* Half Donut Radial Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-slate-800 mb-2">Accounts summary</h3>
          <div className="h-64 w-full flex-1 flex flex-col relative">
            {inputData.length > 0 ? (
              <>
                <div className="h-40 w-full absolute top-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      cx="50%" cy="100%" 
                      innerRadius="40%" outerRadius="100%" 
                      barSize={16} 
                      data={inputData} 
                      startAngle={180} endAngle={0}
                    >
                      <RadialBar
                        minAngle={15}
                        background={{ fill: '#f1f5f9' }}
                        clockWise
                        dataKey="hours"
                        cornerRadius={10}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value} hrs`, 'Time']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend at the bottom matching the image */}
                <div className="mt-40 w-full px-4">
                  <div className="flex flex-col gap-3">
                    {[...inputData].reverse().map((entry, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                          <span className="text-slate-500 font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold text-slate-900">{entry.hours} hrs</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-400">No time allocation data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
