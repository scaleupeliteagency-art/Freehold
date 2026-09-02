"use client";

import { useDashboardEngine } from "@/lib/hooks/useDashboardEngine";
import { 
  DashboardHeader,
  NorthStarLedger,
  QuarterLedger,
  RocksLedger,
  TodayLedger,
  ResultsLedger,
  BusinessBuild,
  ConstraintAndActions,
  ExecutionLedger,
  SystemHealthDiagnostic,
  SystemIntelligence
} from "@/components/dashboard/DashboardWidgets";
import { GoalTrajectory } from "@/components/dashboard/GoalTrajectory";
import Link from "next/link";

export default function DashboardPage() {
  const { 
    loading, system, goals, quarter, rocks, inputs, entries, results, health, constraint, priority, actions,
    daysRemainingYear, daysRemainingQuarter
  } = useDashboardEngine();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Loading Ledger...</div>
      </div>
    );
  }

  if (!system) {
    const draftExists = typeof window !== 'undefined' && localStorage.getItem('system-creation-storage');
    let hasDraft = false;
    try {
      if (draftExists) {
        const parsed = JSON.parse(draftExists);
        if (parsed?.state?.currentStep > 1) hasDraft = true;
      }
    } catch(e) {}

    return (
      <div className="max-w-2xl py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-8" />
        <p className="text-ink max-w-md mb-8 leading-relaxed">
          The working ledger requires an active operating system to begin tracking execution.
        </p>
        <Link 
          href="/system/new"
          className="border border-ink text-ink px-6 py-2 text-sm font-semibold hover:bg-ink hover:text-paper transition-colors uppercase tracking-widest"
        >
          {hasDraft ? "Continue Draft" : "Initialize System"}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl pb-24">
      {/* 1. HEADER */}
      <DashboardHeader system={system} quarter={quarter} />

      {/* 2. NORTH STAR */}
      <NorthStarLedger goals={goals} daysRemainingYear={daysRemainingYear} />

      {/* 3. CURRENT QUARTER */}
      <QuarterLedger quarter={quarter} daysRemainingQuarter={daysRemainingQuarter} />

      {/* 4. CURRENT ROCKS */}
      <RocksLedger rocks={rocks} />

      {/* 5 & 6. TODAY'S EXECUTION & PRIORITY */}
      <TodayLedger inputs={inputs} priority={priority} />

      {/* 7. RESULTS */}
      <ResultsLedger results={results} />

      {/* 8. BUSINESS BUILD */}
      <BusinessBuild />

      {/* 9 & 10. CURRENT CONSTRAINT & NEXT ACTIONS */}
      <ConstraintAndActions constraint={constraint} actions={actions} />

      {/* 11. EXECUTION */}
      <ExecutionLedger inputs={inputs} entries={entries} />

      {/* 12. GOAL TRAJECTORY */}
      <div className="mb-12">
        <h2 className="text-xl font-serif font-bold text-ink mb-4 uppercase">Goal Trajectory</h2>
        <hr className="border-divider border-t-2 mb-6" />
        <GoalTrajectory goal={goals[0]} />
      </div>

      {/* 13. SYSTEM HEALTH */}
      <SystemHealthDiagnostic health={health} />

      {/* 14. SYSTEM INTELLIGENCE */}
      <SystemIntelligence />
    </div>
  );
}
