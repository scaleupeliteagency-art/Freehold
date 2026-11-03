"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDashboardEngine } from "@/lib/hooks/useDashboardEngine";
import CloseDayModal from "@/app/(dashboard)/inputs/components/CloseDayModal";
import TimeAndBalanceSection from "@/components/dashboard/TimeAndBalanceSection";
import PerformanceAnalyticsSection from "@/components/dashboard/PerformanceAnalyticsSection";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Target,
  LockKeyhole,
  Flame,
  Zap,
  Award,
  Crown,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus,
  Minus,
  Check,
  Flag,
  Milestone,
  Compass,
  FileText,
  History,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const {
    loading,
    error,
    system,
    hero,
    gamification,
    execution,
    missions,
    strategy,
    focus,
    rawInputs,
    rawEntries,
    rawClosings,
    rawTimeEntries,
    analyticsFilter,
    setAnalyticsFilter,
    updateInputExecution,
    closeDayFromDashboard,
  } = useDashboardEngine();

  const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full" />
          <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
            Loading Personal Command Center...
          </span>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="p-8 w-full max-w-xl mx-auto mt-20 text-center bg-white rounded-2xl border border-slate-200 p-10 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4 font-black">
          OS
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active System Initialized</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The Personal Command Center requires an active operating system specification.
        </p>
        <Link
          href="/system/new"
          className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all"
        >
          Launch System Configuration Wizard →
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 animate-in fade-in duration-500 pb-24">
      {/* SECTION 01 — SYSTEM COMMAND HEADER */}
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Active OS • {hero.domain}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Started: <strong className="text-white">{hero.startDate}</strong> • Expiration: <strong className="text-white">{hero.expirationDate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-orange-400 bg-orange-950/60 border border-orange-800/80 px-3 py-1 rounded-full">
              {hero.daysRemaining} Days Remaining
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {hero.name}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base italic max-w-2xl leading-relaxed">
              "{hero.identityStatement}"
            </p>
            <div className="text-xs text-slate-400 pt-1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Mission: {hero.mission}</span>
            </div>
          </div>

          {/* North Star Progress Gauge */}
          {hero.primaryGoal && (
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                  North Star Progress
                </span>
                <span className="text-sm font-black text-white">{hero.primaryGoal.progressPct}%</span>
              </div>

              <div className="text-sm font-bold text-white truncate">
                {hero.primaryGoal.name}
              </div>

              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${hero.primaryGoal.progressPct}%` }}
                />
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Current: {hero.primaryGoal.current} {hero.primaryGoal.unit}</span>
                <span>Target: {hero.primaryGoal.target} {hero.primaryGoal.unit}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* SECTION 02 — PLAYER PROGRESSION (Gamification Engine) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center">
          {/* Callsign & Rank */}
          <div className="col-span-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">
                Operator Callsign
              </span>
              <div className="text-base font-extrabold text-slate-900 truncate">
                {gamification.playerCallsign}
              </div>
              <div className="text-xs font-semibold text-orange-600 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Rank: {gamification.rank}
              </div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">Level {gamification.level}</span>
              <span className="text-orange-600">{gamification.totalXp} XP</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-orange-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${gamification.levelProgressPct}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
              <span>Progress to Next Level</span>
              <span>{gamification.levelProgressPct}%</span>
            </div>
          </div>

          {/* Commitment Streak */}
          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200 text-center">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">
              Commitment Streak
            </span>
            <div className="text-xl font-black text-amber-950 flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              {gamification.commitmentStreak}d
            </div>
            <span className="text-[9px] text-amber-700 block">Bad-Day Floor Met</span>
          </div>

          {/* Normal Performance Streak */}
          <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">
              Normal Streak
            </span>
            <div className="text-xl font-black text-emerald-950 flex items-center justify-center gap-1 mt-0.5">
              <Flame className="w-4 h-4 text-emerald-600" />
              {gamification.normalStreak}d
            </div>
            <span className="text-[9px] text-emerald-700 block">All 3 Targets Met</span>
          </div>
        </div>
      </section>

      {/* SECTION 03 — TODAY'S EXECUTION (Core Inputs & Quick Progress Steppers) */}
      <section className="bg-white rounded-3xl border-2 border-orange-200 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white font-bold">
                <LockKeyhole className="h-4 w-4" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Today's Execution Control
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Record daily execution directly. All updates immediately persist to the ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              execution.dailyClassification === "NORMAL_SUCCESS"
                ? "bg-emerald-600 text-white border-emerald-700"
                : execution.dailyClassification === "BAD_DAY_SUCCESS"
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              {execution.classificationLabel}
            </div>

            <button
              onClick={() => setIsCloseDayModalOpen(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Close Day
            </button>
          </div>
        </div>

        {/* The 3 Core Inputs Direct Recording Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {execution.coreInputs.map((input) => (
            <div
              key={input.id}
              className="rounded-2xl border border-orange-200/80 bg-gradient-to-b from-orange-50/40 via-white to-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-100/80 px-2 py-0.5 rounded">
                    Core Commitment
                  </span>
                  <span className="text-xs font-bold text-slate-900">{input.pct}%</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{input.name}</h3>
                {input.description && (
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{input.description}</p>
                )}

                {/* 3 Commitment Levels Grid */}
                <div className="grid grid-cols-3 gap-1.5 my-4 text-center text-xs">
                  <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                    <span className="text-[9px] font-bold text-amber-800 block">Min</span>
                    <span className="font-extrabold text-slate-900">{input.badDayMinimum}</span>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
                    <span className="text-[9px] font-bold text-orange-800 block">Normal</span>
                    <span className="font-extrabold text-slate-900">{input.normalTarget}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <span className="text-[9px] font-bold text-emerald-800 block">Stretch</span>
                    <span className="font-extrabold text-slate-900">{input.stretchTarget}</span>
                  </div>
                </div>
              </div>

              {/* Direct Stepper Controls */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => updateInputExecution(input.id, Math.max(0, input.actual - 1))}
                  className="h-9 w-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 text-center font-black text-lg text-slate-900">
                  {input.actual} <span className="text-[10px] font-normal text-slate-400">{input.unit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateInputExecution(input.id, input.actual + 1)}
                  className="h-9 w-9 rounded-lg bg-orange-600 text-white flex items-center justify-center hover:bg-orange-700 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Inputs Compact Strip */}
        {execution.additionalInputs.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              Additional Supporting Inputs
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {execution.additionalInputs.map((inp) => (
                <div key={inp.id} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block truncate max-w-[150px]">{inp.name}</span>
                    <span className="text-slate-400 text-[10px]">Target: {inp.target} {inp.unit} ({inp.frequency})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{inp.actual}</span>
                    <button
                      type="button"
                      onClick={() => updateInputExecution(inp.id, inp.actual + 1)}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 04 & 05 — MISSIONS & STRATEGIC COMMAND CENTER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missions & Quests */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Missions & Active Quests</h2>
          </div>

          <div className="space-y-3">
            {missions.dailyMissions.map((m) => (
              <div key={m.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{m.title}</span>
                  <span className="text-slate-500 text-[11px]">{m.description}</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  m.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                }`}>
                  {m.status}
                </span>
              </div>
            ))}

            {missions.weeklyQuests.map((q) => (
              <div key={q.id} className="p-3 rounded-xl border border-blue-100 bg-blue-50/40 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-blue-950 block">{q.title}</span>
                  <span className="text-blue-700 text-[11px]">{q.description}</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Weekly Quest
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic Command Center */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Flag className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Strategic Command Center</h2>
          </div>

          <div className="space-y-3 text-xs">
            {strategy.activeRock ? (
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-1">
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                  Active Monthly Rock Focus
                </span>
                <div className="text-sm font-extrabold text-slate-900">{strategy.activeRock.name}</div>
                <p className="text-xs text-slate-600">{strategy.activeRock.description || "Core strategic pillar for current month."}</p>
              </div>
            ) : null}

            {strategy.activeMilestone ? (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Weekly Milestone</span>
                  <div className="text-xs font-bold text-slate-900">{strategy.activeMilestone.name}</div>
                </div>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {strategy.activeMilestone.deadline ? strategy.activeMilestone.deadline.split("T")[0] : "Active"}
                </span>
              </div>
            ) : null}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Next Critical Action: <strong className="text-slate-900">{strategy.nextAction}</strong></span>
            </div>
          </div>
        </section>
      </div>

      {/* SECTION 06 — FOCUS AND SYSTEM DISCIPLINE */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <h2 className="text-base font-bold text-slate-900">Focus & System Discipline</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
            Status: {focus.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Deep Work Sessions</span>
            <div className="text-xl font-bold text-slate-900">
              {focus.completedSessions} / {focus.plannedSessions}
              <span className="text-xs font-normal text-slate-500 ml-1">sessions</span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Total Focus Logged</span>
            <div className="text-xl font-bold text-slate-900">
              {Math.round(focus.totalFocusMinutesToday / 60)}h {focus.totalFocusMinutesToday % 60}m
            </div>
          </div>

          <div className="bg-red-50/60 p-4 rounded-xl border border-red-100">
            <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Active No-To-Do Rules</span>
            <div className="text-xs font-bold text-red-950">
              {focus.noTodoList.length > 0 ? `${focus.noTodoList.length} Prohibited Constraints Active` : "Zero Violations Committed"}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 07 — TIME LOGGED AND BALANCE OVERVIEW (Upgraded with shared filters) */}
      <TimeAndBalanceSection
        rawTimeEntries={rawTimeEntries}
        rawInputs={rawInputs}
        analyticsFilter={analyticsFilter}
        setAnalyticsFilter={setAnalyticsFilter}
      />

      {/* SECTION 08 — PERFORMANCE ANALYTICS & EXECUTION INTELLIGENCE */}
      <PerformanceAnalyticsSection
        rawEntries={rawEntries}
        rawClosings={rawClosings}
        rawInputs={rawInputs}
        analyticsFilter={analyticsFilter}
      />

      {/* Close Day Modal Container */}
      <CloseDayModal
        isOpen={isCloseDayModalOpen}
        onClose={() => setIsCloseDayModalOpen(false)}
        score={execution.todayScore}
        completedInputs={execution.coreInputs.filter((i) => i.actual >= i.normalTarget).length}
        totalInputs={execution.coreInputs.length}
        inputs={execution.coreInputs}
        onConfirm={async ({ note, outcomes, classification }) => {
          await closeDayFromDashboard({ note, outcomes, classification });
          setIsCloseDayModalOpen(false);
        }}
      />
    </div>
  );
}
