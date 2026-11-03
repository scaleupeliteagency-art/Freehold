"use client";

import React, { useMemo } from "react";
import {
  TrendingUp,
  Activity,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

export default function PerformanceAnalyticsSection({
  rawEntries = [],
  rawClosings = [],
  rawInputs = [],
  analyticsFilter,
}) {
  const coreInputs = rawInputs.filter((i) => i.is_core || i.isCore);

  // Analyze 90-day execution consistency & heat calendar
  const analyticsData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const daysCount = analyticsFilter.dateRange === "7d" ? 7 : analyticsFilter.dateRange === "90d" ? 90 : 30;

    let normalSuccessDays = 0;
    let badDaySuccessDays = 0;
    let failedDays = 0;
    let inProgressDays = 0;

    // Group entries by date
    const entriesByDate = {};
    rawEntries.forEach((e) => {
      if (!entriesByDate[e.date]) entriesByDate[e.date] = [];
      entriesByDate[e.date].push(e);
    });

    const executionTrend = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];

      const dayEntries = entriesByDate[dStr] || [];
      const dayClosing = rawClosings.find((c) => c.date === dStr);

      let coreNormalMet = 0;
      let coreBadDayMet = 0;

      coreInputs.forEach((def) => {
        const en = dayEntries.find((e) => e.input_definition_id === def.id);
        const actual = Number(en?.actual_value || 0);
        const normal = Number(def.normal_target ?? def.normalTarget ?? def.target ?? 1);
        const badDay = Number(def.bad_day_minimum ?? def.badDayMinimum ?? Math.max(1, Math.floor(normal * 0.5)));

        if (actual >= normal && normal > 0) coreNormalMet++;
        if (actual >= badDay && badDay > 0) coreBadDayMet++;
      });

      let status = "IN_PROGRESS";
      let statusScore = 0;

      if (coreInputs.length >= 3) {
        if (coreNormalMet === 3) {
          status = "NORMAL_SUCCESS";
          statusScore = 100;
          normalSuccessDays++;
        } else if (coreBadDayMet === 3) {
          status = "BAD_DAY_SUCCESS";
          statusScore = 60;
          badDaySuccessDays++;
        } else if (dayClosing || i > 0) {
          status = "FAILED_DAY";
          statusScore = 20;
          failedDays++;
        } else {
          status = "IN_PROGRESS";
          inProgressDays++;
        }
      }

      executionTrend.push({
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: statusScore,
        status,
        normalCount: coreNormalMet,
      });
    }

    const totalEvaluatedDays = normalSuccessDays + badDaySuccessDays + failedDays;
    const normalSuccessRate = totalEvaluatedDays > 0 ? Math.round((normalSuccessDays / totalEvaluatedDays) * 100) : 0;
    const badDaySuccessRate = totalEvaluatedDays > 0 ? Math.round((badDaySuccessDays / totalEvaluatedDays) * 100) : 0;
    const failedDayRate = totalEvaluatedDays > 0 ? Math.round((failedDays / totalEvaluatedDays) * 100) : 0;

    return {
      executionTrend,
      normalSuccessDays,
      badDaySuccessDays,
      failedDays,
      normalSuccessRate,
      badDaySuccessRate,
      failedDayRate,
      totalEvaluatedDays,
    };
  }, [rawEntries, rawClosings, rawInputs, analyticsFilter]);

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Performance Analytics & Execution Intelligence
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Measuring whether daily behavior converts into verifiable strategic momentum.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
          {analyticsData.totalEvaluatedDays} Evaluated Days
        </span>
      </div>

      {/* A. Daily Execution Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
            Normal Success Rate
          </span>
          <div className="text-2xl font-black text-emerald-950">
            {analyticsData.normalSuccessRate}%
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            {analyticsData.normalSuccessDays} Days meeting standard target
          </span>
        </div>

        <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
          <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
            Bad-Day Success Rate
          </span>
          <div className="text-2xl font-black text-amber-950">
            {analyticsData.badDaySuccessRate}%
          </div>
          <span className="text-[11px] text-amber-700 font-medium mt-1 block">
            {analyticsData.badDaySuccessDays} Days protecting minimum floor
          </span>
        </div>

        <div className="bg-red-50/70 p-4 rounded-xl border border-red-200">
          <span className="text-[10px] font-bold text-red-800 uppercase block mb-1">
            Failed Day Rate
          </span>
          <div className="text-2xl font-black text-red-950">
            {analyticsData.failedDayRate}%
          </div>
          <span className="text-[11px] text-red-700 font-medium mt-1 block">
            {analyticsData.failedDays} Days below commitment floor
          </span>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
            Overall Reliability
          </span>
          <div className="text-2xl font-black text-slate-900">
            {analyticsData.normalSuccessRate + analyticsData.badDaySuccessRate}%
          </div>
          <span className="text-[11px] text-slate-600 font-medium mt-1 block">
            Commitment protected days
          </span>
        </div>
      </div>

      {/* B. Core Input Evolution Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Daily Execution Trajectory</h3>
            <p className="text-[11px] text-slate-500">Daily classification score trend over time (100 = Normal Met, 60 = Bad-Day Met).</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.executionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} dy={10} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
              <RechartsTooltip
                formatter={(val, name, item) => [
                  item.payload.status === "NORMAL_SUCCESS"
                    ? "Normal Success (3/3 Core Met)"
                    : item.payload.status === "BAD_DAY_SUCCESS"
                    ? "Bad-Day Success (Floor Protected)"
                    : "Below Bad-Day Floor",
                  "Execution Status",
                ]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
              />
              <Bar dataKey="score" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
