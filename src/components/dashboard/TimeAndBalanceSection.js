"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Filter,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CATEGORY_COLORS = {
  "Business / Work": "#f97316",
  "Product Engineering": "#ea580c",
  "Deep Work": "#0284c7",
  "Priority Activity": "#38bdf8",
  "Administrative": "#94a3b8",
  "Learning": "#8b5cf6",
  "Training / Fitness": "#10b981",
  "Recovery / Review": "#64748b",
  "General": "#f59e0b",
};

const PALETTE = ["#f97316", "#0284c7", "#10b981", "#8b5cf6", "#f59e0b", "#64748b", "#ec4899", "#14b8a6"];

const formatMins = (totalMinutes) => {
  if (!totalMinutes || totalMinutes <= 0) return "0h 0m";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
};

export default function TimeAndBalanceSection({
  rawTimeEntries = [],
  rawInputs = [],
  analyticsFilter,
  setAnalyticsFilter,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'charts' | 'balance'

  // Date Filtering Calculation
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let filterStartDate = new Date(now);
  let filterPrevStartDate = new Date(now);
  let daysSpan = 30;

  if (analyticsFilter.dateRange === "7d") {
    daysSpan = 7;
    filterStartDate.setDate(now.getDate() - 7);
    filterPrevStartDate.setDate(now.getDate() - 14);
  } else if (analyticsFilter.dateRange === "30d") {
    daysSpan = 30;
    filterStartDate.setDate(now.getDate() - 30);
    filterPrevStartDate.setDate(now.getDate() - 60);
  } else if (analyticsFilter.dateRange === "90d") {
    daysSpan = 90;
    filterStartDate.setDate(now.getDate() - 90);
    filterPrevStartDate.setDate(now.getDate() - 180);
  } else if (analyticsFilter.dateRange === "custom" && analyticsFilter.customStart) {
    filterStartDate = new Date(analyticsFilter.customStart);
    const end = analyticsFilter.customEnd ? new Date(analyticsFilter.customEnd) : now;
    daysSpan = Math.max(1, Math.round((end.getTime() - filterStartDate.getTime()) / (1000 * 60 * 60 * 24)));
    filterPrevStartDate = new Date(filterStartDate);
    filterPrevStartDate.setDate(filterPrevStartDate.getDate() - daysSpan);
  } else {
    // All time
    daysSpan = 365;
    filterStartDate = new Date(2020, 0, 1);
  }

  const startIso = filterStartDate.toISOString().split("T")[0];
  const prevStartIso = filterPrevStartDate.toISOString().split("T")[0];
  const todayIso = now.toISOString().split("T")[0];

  // Filter time entries for current period vs previous period
  const currentPeriodEntries = rawTimeEntries.filter((te) => te.date >= startIso && te.date <= todayIso);
  const previousPeriodEntries = rawTimeEntries.filter((te) => te.date >= prevStartIso && te.date < startIso);

  // Today and Week metrics
  const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const weekStartDate = new Date(now);
  weekStartDate.setDate(now.getDate() - dayOfWeek);
  const weekStartIso = weekStartDate.toISOString().split("T")[0];

  let todayMins = 0;
  let thisWeekMins = 0;
  let totalPeriodMins = 0;
  let prevPeriodMins = 0;

  currentPeriodEntries.forEach((te) => {
    const mins = Number(te.duration_minutes || 0);
    totalPeriodMins += mins;
    if (te.date === todayIso) todayMins += mins;
    if (te.date >= weekStartIso) thisWeekMins += mins;
  });

  previousPeriodEntries.forEach((te) => {
    prevPeriodMins += Number(te.duration_minutes || 0);
  });

  const avgDailyMins = daysSpan > 0 ? Math.round(totalPeriodMins / daysSpan) : 0;
  const avgPrevDailyMins = daysSpan > 0 ? Math.round(prevPeriodMins / daysSpan) : 0;

  const periodDeltaPct = prevPeriodMins > 0
    ? Math.round(((totalPeriodMins - prevPeriodMins) / prevPeriodMins) * 100)
    : 0;

  // Category distribution analysis
  const categoryMap = {};
  currentPeriodEntries.forEach((te) => {
    const linkedInput = rawInputs.find((i) => i.id === te.input_definition_id);
    const category = linkedInput?.category || (linkedInput?.is_core ? "Deep Work" : "Priority Activity");
    categoryMap[category] = (categoryMap[category] || 0) + Number(te.duration_minutes || 0);
  });

  const categoryDistribution = Object.entries(categoryMap).map(([name, mins], idx) => ({
    name,
    minutes: mins,
    pct: totalPeriodMins > 0 ? Math.round((mins / totalPeriodMins) * 100) : 0,
    color: CATEGORY_COLORS[name] || PALETTE[idx % PALETTE.length],
  })).sort((a, b) => b.minutes - a.minutes);

  // Daily logged time trend line chart
  const dailyTimeTrend = [];
  const daysToRender = Math.min(30, daysSpan);
  for (let i = daysToRender - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split("T")[0];

    let currentDayMins = 0;
    currentPeriodEntries.forEach((te) => {
      if (te.date === dStr) currentDayMins += Number(te.duration_minutes || 0);
    });

    // Match with corresponding previous period date if comparison is requested
    const prevD = new Date(d);
    prevD.setDate(prevD.getDate() - daysToRender);
    const prevDStr = prevD.toISOString().split("T")[0];

    let prevDayMins = 0;
    previousPeriodEntries.forEach((te) => {
      if (te.date === prevDStr) prevDayMins += Number(te.duration_minutes || 0);
    });

    dailyTimeTrend.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      hours: Number((currentDayMins / 60).toFixed(1)),
      prevHours: Number((prevDayMins / 60).toFixed(1)),
      minutes: currentDayMins,
    });
  }

  // Planned vs Actual Comparison
  const plannedVsActualData = rawInputs.slice(0, 5).map((inp) => {
    let actualMins = 0;
    currentPeriodEntries.forEach((te) => {
      if (te.input_definition_id === inp.id) actualMins += Number(te.duration_minutes || 0);
    });
    const plannedTarget = Number(inp.normal_target || inp.target || 1) * daysSpan;
    return {
      name: inp.name.length > 14 ? inp.name.slice(0, 14) + "..." : inp.name,
      actualHours: Number((actualMins / 60).toFixed(1)),
      plannedHours: Number((plannedTarget / 60).toFixed(1)),
    };
  });

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header with Shared Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-100 text-orange-600 font-bold">
              <Clock className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Time Logged & Balance Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Truthful audit of where your cognitive focus and physical hours compound.
          </p>
        </div>

        {/* Global Shared Analytics Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {["7d", "30d", "90d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setAnalyticsFilter((f) => ({ ...f, dateRange: range }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                analyticsFilter.dateRange === range
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : range === "90d" ? "90 Days" : "All Time"}
            </button>
          ))}

          {/* Toggle comparison */}
          <button
            onClick={() => setAnalyticsFilter((f) => ({ ...f, comparePrevious: !f.comparePrevious }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              analyticsFilter.comparePrevious
                ? "border-orange-300 bg-orange-50 text-orange-800"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            vs Previous Period
          </button>
        </div>
      </div>

      {/* A. TIME LOGGED SUMMARY METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Total Logged ({analyticsFilter.dateRange})
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatMins(totalPeriodMins)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-1">
            {periodDeltaPct >= 0 ? (
              <span className="text-emerald-600">+{periodDeltaPct}% vs prev period</span>
            ) : (
              <span className="text-red-600">{periodDeltaPct}% vs prev period</span>
            )}
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Logged Today
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatMins(todayMins)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Active work sessions</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Logged This Week
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatMins(thisWeekMins)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Weekly accumulation</span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
            Daily Average
          </span>
          <div className="text-2xl font-black text-slate-900">
            {formatMins(avgDailyMins)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Prev avg: {formatMins(avgPrevDailyMins)}
          </span>
        </div>
      </div>

      {/* B & C. CHARTS & BALANCE OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        {/* Chart 1: Total Time Logged Over Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Total Time Logged Over Time</h3>
              <p className="text-[11px] text-slate-500">Daily hours logged across the selected window.</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Hours / Day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <RechartsTooltip
                  formatter={(val, name) => [`${val} hrs`, name === "hours" ? "Current Period" : "Previous Period"]}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Line name="hours" type="monotone" dataKey="hours" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                {analyticsFilter.comparePrevious && (
                  <Line name="prevHours" type="monotone" dataKey="prevHours" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Category Distribution Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category Balance Overview</h3>
              <p className="text-[11px] text-slate-500">Proportional allocation of logged hours.</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Distribution %
            </span>
          </div>

          {categoryDistribution.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <AlertCircle className="w-6 h-6 mb-2 text-slate-300" />
              No time entries recorded for this date range.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center flex-1">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      dataKey="minutes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v) => formatMins(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Legend & Breakdown */}
              <div className="space-y-2 text-xs">
                {categoryDistribution.slice(0, 4).map((c) => (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-700 font-medium truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{c.pct}% ({formatMins(c.minutes)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
