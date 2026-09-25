import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { Clock } from "lucide-react";

const RADIAL_COLORS = ['#bae6fd', '#38bdf8', '#0284c7'];

const formatDuration = (totalMinutes) => {
  if (!totalMinutes) return "0 min";
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const minutes = Math.floor(remainingMinutes);
  const seconds = Math.round((remainingMinutes - minutes) * 60);

  let parts = [];
  if (hours > 0) parts.push(`${hours} hours`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0) parts.push(`${seconds} seconds`);
  
  if (parts.length === 0) return "0 min";
  return parts.join(" ");
};

export function TimeTrackingSummary({ timeTracking }) {
  if (!timeTracking) return null;

  const { summary } = timeTracking;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-hidden mt-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-orange-500" />
        <h2 className="text-lg font-bold text-slate-900">Time Logged</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today", value: summary.today },
          { label: "This Week", value: summary.week },
          { label: "This Month", value: summary.month },
          { label: "This Quarter", value: summary.quarter }
        ].map((item, i) => (
          <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-1">{item.label}</div>
            <div className="text-xl font-bold text-slate-900 mt-2">{formatDuration(item.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeTrackingCharts({ timeTracking }) {
  if (!timeTracking) return null;
  const { activityChart, inputChart } = timeTracking;

  // Recharts requires colors for RadialBar
  const sortedRadialData = [...inputChart].sort((a, b) => a.minutes - b.minutes).slice(-3); // Get top 3, smallest first
  const radialData = sortedRadialData.map((item, index) => ({
    ...item,
    fill: RADIAL_COLORS[index % RADIAL_COLORS.length]
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      
      {/* Daily Smooth Line Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-semibold text-slate-800">Balance Overview</h3>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 7 Days</span>
        </div>
        <div className="h-64 w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <RechartsTooltip 
                formatter={(value) => [formatDuration(value), 'Time']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 600 }}
              />
              <Line name="Last Week" type="monotone" dataKey="lastWeekMins" stroke="#60a5fa" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line name="This Week" type="monotone" dataKey="currentWeekMins" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Half Donut Radial Chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col">
        <h3 className="text-base font-semibold text-slate-800 mb-2">Accounts summary</h3>
        <div className="h-64 w-full flex-1 flex flex-col relative">
          {radialData.length > 0 ? (
            <>
              <div className="h-40 w-full absolute top-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" cy="100%" 
                    innerRadius="40%" outerRadius="100%" 
                    barSize={16} 
                    data={radialData} 
                    startAngle={180} endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      background={{ fill: '#f1f5f9' }}
                      clockWise
                      dataKey="minutes"
                      cornerRadius={10}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [formatDuration(value), 'Time']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-40 w-full px-4">
                <div className="flex flex-col gap-3">
                  {[...radialData].reverse().map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: entry.fill }} />
                        <span className="text-slate-500 font-medium">{entry.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatDuration(entry.minutes)}</span>
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
  );
}
