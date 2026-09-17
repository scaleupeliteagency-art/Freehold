"use client";
import React from "react";
import Link from "next/link";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function HeroWidget({ hero }) {
  if (!hero) return null;
  const { primary } = hero;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6">
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Current Position</h2>
          <h1 className="text-3xl font-bold text-gray-900">{primary.name}</h1>
        </div>
        <div className="text-right mt-4 md:mt-0">
          <div className="text-3xl font-bold text-gray-900">{primary.current} <span className="text-lg text-gray-500">/ {primary.target} {primary.unit}</span></div>
          <div className="text-sm text-gray-500">{primary.pct.toFixed(1)}% complete</div>
        </div>
      </div>
      
      <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
        <div className="bg-orange-500 h-3 rounded-full" style={{ width: `${Math.min(100, primary.pct)}%` }}></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
        <div>
          <span className="block text-gray-400 mb-1">Remaining</span>
          <span className="font-semibold text-gray-900">{primary.remaining} {primary.unit}</span>
        </div>
        <div>
          <span className="block text-gray-400 mb-1">Current Pace</span>
          <span className="font-semibold text-gray-900">{primary.pace.toFixed(1)} / mo</span>
        </div>
        <div>
          <span className="block text-gray-400 mb-1">Required Pace</span>
          <span className="font-semibold text-gray-900">{primary.reqPace > 0 ? `${primary.reqPace.toFixed(1)} / mo` : 'N/A'}</span>
        </div>
        <div>
          <span className="block text-gray-400 mb-1">Status</span>
          <span className="font-semibold text-gray-900">{primary.pace >= primary.reqPace && primary.reqPace > 0 ? 'On Track' : 'Below Pace'}</span>
        </div>
      </div>
    </div>
  );
}

export function YearlyWidget({ yearly }) {
  if (!yearly) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">{yearly.year} Position</h3>
      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-gray-600">Time Elapsed</span>
        <span className="font-medium text-gray-900">{yearly.timeElapsedPct.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${Math.min(100, yearly.timeElapsedPct)}%` }}></div>
      </div>

      <div className="flex justify-between items-center mb-2 text-sm">
        <span className="text-gray-600">Goal Progress</span>
        <span className="font-medium text-gray-900">{yearly.goalProgressPct.toFixed(0)}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, yearly.goalProgressPct)}%` }}></div>
      </div>
    </div>
  );
}

export function QuarterlyCommand({ quarterly }) {
  if (!quarterly) return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-gray-500 text-sm">No active quarter found.</p>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
         <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-1">{quarterly.name} Command Center</h3>
            <p className="text-lg font-medium text-gray-900">{quarterly.objective || 'No objective set'}</p>
         </div>
         <div className="text-right">
            <div className="text-sm text-gray-500">{quarterly.daysRem} days remaining</div>
         </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
           <span className="block text-gray-400 mb-1">Current Rock</span>
           <span className="font-medium text-gray-900">{quarterly.rock || 'None'}</span>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
           <span className="block text-gray-400 mb-1">Current Milestone</span>
           <span className="font-medium text-gray-900">{quarterly.milestone || 'None'}</span>
        </div>
      </div>

      {quarterly.chartData && quarterly.chartData.length > 0 && (
         <div className="h-48 w-full mt-4">
            <p className="text-xs text-gray-400 mb-2 font-medium">Quarterly Performance (Expected vs Actual)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={quarterly.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#9ca3af" />
                <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                />
                <Line type="monotone" dataKey="expected" stroke="#9ca3af" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Expected" />
                <Line type="monotone" dataKey="actual" stroke="#ea580c" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
              </LineChart>
            </ResponsiveContainer>
         </div>
      )}
    </div>
  );
}

export function MilestoneFocus({ milestone, execution }) {
  if (!milestone) return null;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-sm font-semibold text-gray-500 mb-4">Current Milestone</h3>
      <div className="mb-6">
         <div className="flex justify-between items-end mb-2">
           <span className="text-xl font-semibold text-gray-900">{milestone.name}</span>
           <span className="text-sm text-gray-500">{milestone.current} / {milestone.target}</span>
         </div>
         <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${Math.min(100, (milestone.current/milestone.target)*100)}%` }}></div>
         </div>
      </div>

      <div className="mt-8 mb-4 border-t border-gray-100 pt-6">
         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">What Drives This?</h3>
         <div className="space-y-3">
           {execution?.drivingInputs?.map((inp, idx) => (
             <Link href="/inputs" key={idx} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer group">
               <div>
                 <span className="block text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors">{inp.name}</span>
                 <span className="block text-xs text-gray-500">Target: {inp.target} {inp.unit}</span>
               </div>
               <div className="text-right">
                 <span className="block text-sm font-medium text-gray-900">{inp.actual} / {inp.target}</span>
                 <span className={`block text-xs ${inp.status === 'Done' ? 'text-green-600' : 'text-gray-400'}`}>{inp.status}</span>
               </div>
             </Link>
           ))}
           {(!execution?.drivingInputs || execution.drivingInputs.length === 0) && (
             <p className="text-sm text-gray-500">No inputs configured.</p>
           )}
         </div>
      </div>
    </div>
  );
}

export function ExecutionAndMomentum({ execution, momentum }) {
  if (!execution || !momentum) return null;
  
  const getColor = (val) => {
    if (val === 0) return "bg-gray-100";
    if (val < 40) return "bg-orange-200";
    if (val < 80) return "bg-orange-300";
    if (val < 100) return "bg-orange-400";
    return "bg-orange-500";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
       <div className="flex justify-between items-start mb-6">
         <div>
           <h3 className="text-sm font-semibold text-gray-500 mb-1">Today's Execution</h3>
           <div className="text-3xl font-bold text-gray-900">{execution.todayScore}%</div>
         </div>
         <div className="text-right">
           <h3 className="text-sm font-semibold text-gray-500 mb-1">Current Streak</h3>
           <div className="text-3xl font-bold text-gray-900">{momentum.streak} <span className="text-base font-normal text-gray-500">days</span></div>
         </div>
       </div>

       <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
         <div className="p-3 bg-gray-50 rounded-lg">
           <span className="block text-gray-400 mb-1">Last 7 Days</span>
           <span className="font-semibold text-gray-900">{momentum.last7}% Avg</span>
         </div>
         <div className="p-3 bg-gray-50 rounded-lg">
           <span className="block text-gray-400 mb-1">Prev 7 Days</span>
           <span className="font-semibold text-gray-900">{momentum.prev7}% Avg</span>
         </div>
       </div>

       <div>
         <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">90-Day Activity Heatmap</h3>
         <div className="flex flex-wrap gap-[3px]">
           {momentum.heatmap?.map((day, idx) => (
             <div 
               key={idx} 
               className={`w-3 h-3 rounded-[2px] ${getColor(day.score)}`}
               title={`${day.date}: ${day.score}% (${day.inputsCompleted}/${day.inputsExpected})`}
             />
           ))}
           {(!momentum.heatmap || momentum.heatmap.length === 0) && (
             <p className="text-sm text-gray-500">Momentum starts building once you record execution.</p>
           )}
         </div>
       </div>
    </div>
  );
}

export function SystemStateWidgets({ gap, mattersNow, evolution }) {
  return (
    <div className="space-y-6">
      {/* GAP */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">Current Gap</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="text-gray-600">5-Year Remaining</span>
            <span className="font-medium text-gray-900">{gap?.fiveYear ?? 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-50 pb-2">
            <span className="text-gray-600">Milestone Remaining</span>
            <span className="font-medium text-gray-900">{gap?.milestone ?? 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* MATTERS NOW */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">What Matters Now</h3>
        <p className="text-gray-900 font-medium mb-2">{mattersNow?.action || 'No action identified'}</p>
        <p className="text-xs text-gray-500 mb-4">Deadline: {mattersNow?.deadline ? new Date(mattersNow.deadline).toLocaleDateString() : 'None'}</p>
        <Link href="/inputs" className="inline-block px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black transition-colors w-full text-center">
          Open Inputs →
        </Link>
      </div>

      {/* EVOLUTION */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-sm font-semibold text-gray-500 mb-4">System Evolution</h3>
        {evolution ? (
          <div className="text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Operating Version</span>
              <span className="font-medium text-gray-900">{evolution.currentVersion}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Previous</span>
              <span className="text-gray-500">{evolution.previousVersion || 'None'}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link href="/history" className="text-orange-600 font-medium text-xs hover:text-orange-700">View History →</Link>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No version history yet.</p>
        )}
      </div>
    </div>
  );
}
