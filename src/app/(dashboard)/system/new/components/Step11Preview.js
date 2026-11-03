"use client";

import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import {
  Shield,
  Target,
  Layers,
  LockKeyhole,
  Ban,
  Sparkles,
  Calendar,
  ShieldAlert,
  Gamepad2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Flame,
  Zap,
} from "lucide-react";

export default function Step11Preview() {
  const {
    systemIdentity,
    systemConfig,
    goals,
    roadmap,
    inputs,
    noTodoList,
    focusArchitecture,
    perfectWeek,
    accountability,
    gamification,
    setStep,
  } = useSystemCreationStore();

  const coreInputs = inputs?.filter((i) => i.isCore) || [];
  const additionalInputs = inputs?.filter((i) => !i.isCore) || [];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Layers className="w-3.5 h-3.5" />
            Stage 11 of 12 — Holistic Operating System Preview
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Review Full Operating Blueprint</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Verify every dimension of your personal operating system. Once you proceed to Stage 12 and activate the system, this configuration will be committed to the ledger and locked until <span className="font-semibold text-gray-800">{systemConfig.expirationDate || "expiration"}</span>.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <div className="space-y-8">
        {/* Core Header Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-lg border border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
              System Specification v1.0
            </span>
            <div className="text-xs text-slate-400">
              Active Lifecycle: <span className="text-white font-semibold">{systemConfig.startDate}</span> → <span className="text-white font-semibold">{systemConfig.expirationDate}</span>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-2">{systemIdentity.name || "Unnamed System"}</h1>
          <p className="text-slate-300 text-base italic max-w-2xl mb-6">"{systemIdentity.identityStatement || "No identity statement defined"}"</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-700/80">
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Primary Domain</div>
              <div className="text-sm font-bold text-white mt-0.5">{systemConfig.primaryDomain}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Weekly Review Day</div>
              <div className="text-sm font-bold text-white mt-0.5">{systemConfig.preferredWeeklyReviewDay} at {accountability.weeklyReviewTime || "17:00"}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Daily Closing Cutoff</div>
              <div className="text-sm font-bold text-white mt-0.5">{systemConfig.preferredDailyClosingTime} ({systemConfig.timeZone})</div>
            </div>
          </div>
        </div>

        {/* Dimension 1 & 2: Mission, Principles, Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Shield className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">Mission & Purpose</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{systemIdentity.mission || systemIdentity.why}</p>

            <div className="pt-2">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Core Principles</div>
              <ul className="space-y-1.5 text-xs text-gray-700">
                {systemIdentity.principles?.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded bg-orange-100 text-orange-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-bold text-gray-900">Anti-Identity & Standards</h3>
            </div>

            <div className="bg-red-50/60 p-3.5 rounded-lg border border-red-100">
              <div className="text-xs font-bold text-red-700 uppercase mb-1">Repudiated Anti-Identity</div>
              <p className="text-xs text-red-900">{systemIdentity.antiIdentity || "—"}</p>
            </div>

            <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-100">
              <div className="text-xs font-bold text-emerald-700 uppercase mb-1">Personal Standards</div>
              <p className="text-xs text-emerald-900">{systemIdentity.personalStandards || "—"}</p>
            </div>
          </div>
        </div>

        {/* Dimension 3: Goals */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">North Star Goals & Expiration Success</h3>
            </div>
            <span className="text-xs font-semibold text-gray-500">100% Weight Total</span>
          </div>

          {goals.systemSuccessOutcome && (
            <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 text-xs text-orange-950">
              <span className="font-bold block mb-1">Success Criteria by Expiration Date:</span>
              {goals.systemSuccessOutcome}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-orange-200 bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-orange-600 uppercase">Primary North Star</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-800 rounded">{goals.primary?.weight}%</span>
              </div>
              <div className="text-base font-bold text-gray-900 mb-1">{goals.primary?.name}</div>
              <div className="text-xs text-gray-600">
                Target: <span className="font-semibold text-gray-900">{goals.primary?.target} {goals.primary?.unit}</span> (Baseline: {goals.primary?.baseline})
              </div>
              <div className="text-xs text-gray-500 mt-2">Deadline: {goals.primary?.deadline}</div>
            </div>

            {goals.secondary?.enabled ? (
              <div className="p-4 rounded-xl border border-blue-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-600 uppercase">Secondary Counter-Goal</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{goals.secondary?.weight}%</span>
                </div>
                <div className="text-base font-bold text-gray-900 mb-1">{goals.secondary?.name}</div>
                <div className="text-xs text-gray-600">
                  Target: <span className="font-semibold text-gray-900">{goals.secondary?.target} {goals.secondary?.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">Deadline: {goals.secondary?.deadline}</div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400">
                Single Goal Architecture (100% Primary Focus)
              </div>
            )}
          </div>
        </div>

        {/* Dimension 4: Strategic Roadmap */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Layers className="w-4 h-4 text-orange-600" />
            <h3 className="text-sm font-bold text-gray-900">Roadmap: Year {roadmap.year} → Q{roadmap.quarter} ({roadmap.quarterlyObjective?.name})</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roadmap.rocks?.map((rock, idx) => (
              <div key={rock.id || idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-2">
                <div className="text-xs font-bold text-orange-600 uppercase">Rock #{idx + 1}</div>
                <div className="text-sm font-bold text-gray-900">{rock.name || `Rock #${idx + 1}`}</div>
                <div className="text-xs text-gray-600">{rock.desiredOutcome}</div>
                <div className="text-[11px] text-gray-500 pt-2 border-t border-gray-200">
                  {rock.milestones?.filter((m) => m.name).length || 4} Weekly Milestones mapped
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dimension 5: The 3 Core Inputs */}
        <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <LockKeyhole className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-bold text-gray-900">Three Permanent Core Daily Inputs</h3>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded border border-orange-200">
              Non-Negotiable Daily Commitments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {coreInputs.map((inp, idx) => (
              <div key={inp.id || idx} className="p-4 rounded-xl border border-orange-100 bg-orange-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-700">Core Input #{idx + 1}</span>
                  <span className="text-[10px] font-semibold text-gray-500">{inp.unit || "units"}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">{inp.name}</div>
                <div className="grid grid-cols-3 gap-1 pt-2 text-center text-xs">
                  <div className="bg-white p-1.5 rounded border border-amber-200">
                    <span className="text-[9px] text-amber-700 block font-semibold">Min</span>
                    <span className="font-bold">{inp.minimumTarget}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-orange-200">
                    <span className="text-[9px] text-orange-700 block font-semibold">Normal</span>
                    <span className="font-bold">{inp.normalTarget}</span>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-emerald-200">
                    <span className="text-[9px] text-emerald-700 block font-semibold">Stretch</span>
                    <span className="font-bold">{inp.stretchTarget}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {additionalInputs.length > 0 && (
            <div className="text-xs text-gray-500 pt-2">
              + {additionalInputs.length} optional additional inputs configured.
            </div>
          )}
        </div>

        {/* Dimension 6, 7, 8, 9, 10 Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
              <Ban className="w-3.5 h-3.5" /> No-To-Do Firewalls
            </div>
            <div className="text-xs text-gray-700">{noTodoList?.rules?.length || 0} Prohibited Rules defined</div>
            <div className="text-[11px] text-gray-500">{noTodoList?.restrictedApps?.length || 0} restricted apps locked</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <Sparkles className="w-3.5 h-3.5" /> Focus Architecture
            </div>
            <div className="text-xs text-gray-700">{focusArchitecture?.focusSessions?.sessionDuration}m Sessions / {focusArchitecture?.focusSessions?.breakDuration}m Breaks</div>
            <div className="text-[11px] text-gray-500">Max {focusArchitecture?.focusSessions?.maxDeepWorkSessionsPerDay} blocks/day</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
              <Calendar className="w-3.5 h-3.5" /> Perfect Week
            </div>
            <div className="text-xs text-gray-700">{perfectWeek?.workingDays?.length || 5} Active Days ({perfectWeek?.workingHours})</div>
            <div className="text-[11px] text-gray-500">{perfectWeek?.blocks?.length || 0} scheduled time blocks</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
              <ShieldAlert className="w-3.5 h-3.5" /> Accountability
            </div>
            <div className="text-xs text-gray-700">Closing at {accountability?.dailyClosingTime}</div>
            <div className="text-[11px] text-gray-500">Recovery: {accountability?.recoveryAction?.slice(0, 45)}...</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1.5 sm:col-span-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600">
              <Gamepad2 className="w-3.5 h-3.5" /> Gamification & Progression
            </div>
            <div className="text-xs text-gray-700">Callsign: <span className="font-bold">{gamification?.playerCallsign}</span> • Tier: <span className="font-bold">{gamification?.difficulty}</span></div>
            <div className="text-[11px] text-gray-500">Theme: {gamification?.theme} • 6 Duration-Aware Ranks initialized</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(10)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Gamification
          </button>
          <button
            type="button"
            onClick={() => setStep(12)}
            className="flex items-center gap-2 px-7 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-md"
          >
            Proceed to Final Activation
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
