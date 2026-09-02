"use client";

import { useState } from "react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const TREND_DATA = [
  { date: 'Mon', completion: 80, target: 100 },
  { date: 'Tue', completion: 95, target: 100 },
  { date: 'Wed', completion: 100, target: 100 },
  { date: 'Thu', completion: 60, target: 100 },
  { date: 'Fri', completion: 110, target: 100 },
  { date: 'Sat', completion: 100, target: 100 },
  { date: 'Sun', completion: 40, target: 100 },
];

const PERFORMANCE_DATA = [
  { name: 'Cold Calls', actual: 120, target: 140 },
  { name: 'Follow-ups', actual: 65, target: 70 },
  { name: 'Deep Work', actual: 22, target: 20 },
  { name: 'Prospects', actual: 30, target: 35 },
];

export default function ExecutionHistory() {
  const [view, setView] = useState("week"); // day, week, month, quarter

  return (
    <div className="space-y-8 mt-12">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h2 className="text-lg font-bold text-gray-900">Execution History</h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['day', 'week', 'month', 'quarter'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Execution Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Execution Consistency Trend</h3>
            <p className="text-xs text-gray-500">Are you improving or declining over time?</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f3f4f6', strokeWidth: 2 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="completion" stroke="#B8862E" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Actual %" />
                <Line type="dashed" dataKey="target" stroke="#9ca3af" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target (100%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Input Performance Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900">Input Performance</h3>
            <p className="text-xs text-gray-500">Which input is weakest?</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="actual" fill="#111827" radius={[4, 4, 0, 0]} maxBarSize={40} name="Actual" />
                <Bar dataKey="target" fill="#e5e7eb" radius={[4, 4, 0, 0]} maxBarSize={40} name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
