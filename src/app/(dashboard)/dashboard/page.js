"use client";
import React from "react";
import { useDashboardEngine } from "@/lib/hooks/useDashboardEngine";
import { 
  HeroWidget, 
  YearlyWidget, 
  QuarterlyCommand, 
  MilestoneFocus, 
  ExecutionAndMomentum, 
  SystemStateWidgets 
} from "@/components/dashboard/DashboardWidgets";
import { TimeTrackingSummary, TimeTrackingCharts } from "@/components/dashboard/TimeTrackingWidgets";

export default function DashboardPage() {
  const { 
    loading, 
    system, 
    isFrozen, 
    hero, 
    yearly, 
    quarterly, 
    milestone, 
    execution, 
    momentum, 
    gap, 
    mattersNow, 
    evolution,
    timeTracking
  } = useDashboardEngine();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full"></div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="p-8 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center max-w-2xl mx-auto mt-20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Active System</h2>
          <p className="text-gray-500 mb-8">You need to initialize a system to view the dashboard.</p>
          <a href="/system/new" className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors">
            Initialize System
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-24">
      {/* 1. HERO - Current Position */}
      <HeroWidget hero={hero} />

      {/* Time Tracking Section */}
      {timeTracking && (
        <>
          <TimeTrackingSummary timeTracking={timeTracking} />
          <TimeTrackingCharts timeTracking={timeTracking} />
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Column - Strategy & Trajectory (2/3 width) */}
        <div className="lg:col-span-2 space-y-8">
          {/* 2. YEARLY */}
          <YearlyWidget yearly={yearly} />
          
          {/* 3. QUARTERLY */}
          <QuarterlyCommand quarterly={quarterly} />

          {/* 4. CURRENT MILESTONE & DRIVERS */}
          <MilestoneFocus milestone={milestone} execution={execution} />

          {/* 5. EXECUTION & MOMENTUM (Heatmap) */}
          <ExecutionAndMomentum execution={execution} momentum={momentum} />
        </div>

        {/* Right Column - Status & Actions (1/3 width) */}
        <div className="lg:col-span-1">
          {/* GAP, NEXT ACTION, EVOLUTION */}
          <SystemStateWidgets gap={gap} mattersNow={mattersNow} evolution={evolution} />
        </div>
      </div>

      {isFrozen && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-md flex items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Review Required</h2>
            <p className="text-gray-500 text-sm mb-6">Your system is frozen. You must complete your scheduled review before continuing execution.</p>
            <a href="/reviews" className="block w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors">
              Initialize Diagnostic Review
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
