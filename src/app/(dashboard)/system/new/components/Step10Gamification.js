"use client";

import { useForm } from "react-hook-form";
import useSystemCreationStore, { XP_ECONOMY_CONFIG, RANKS } from "@/lib/store/useSystemCreationStore";
import { Gamepad2, Award, Shield, Flame, Target, Crown, Zap, Swords, ArrowLeft, ArrowRight, Info, CheckCircle2 } from "lucide-react";

const AVATARS = [
  { id: "shield", label: "Aegis Shield", icon: Shield },
  { id: "flame", label: "Ignition Flame", icon: Flame },
  { id: "target", label: "Apex Target", icon: Target },
  { id: "crown", label: "Sovereign Crown", icon: Crown },
  { id: "bolt", label: "Kinetic Bolt", icon: Zap },
  { id: "swords", label: "Duelist Blades", icon: Swords },
];

const THEMES = [
  { id: "tactical-dark", name: "Tactical Charcoal", desc: "Military HUD aesthetics with high-contrast ochre indicators" },
  { id: "clean-slate", name: "Industrial Slate", desc: "Minimalist executive monochrome with precision typography" },
  { id: "cyber-amber", name: "Amber Terminal", desc: "Retro-futuristic command deck and glowing milestone tracks" },
];

export default function Step10Gamification() {
  const { gamification, setGamification, setStep } = useSystemCreationStore();

  const { register, watch, setValue, handleSubmit } = useForm({
    defaultValues: {
      playerCallsign: gamification?.playerCallsign || "Operator-One",
      avatar: gamification?.avatar || "shield",
      theme: gamification?.theme || "tactical-dark",
      characterDescription: gamification?.characterDescription || "A disciplined strategist relentlessly compounding daily execution.",
      difficulty: gamification?.difficulty || "STANDARD",
    },
  });

  const selectedAvatar = watch("avatar");
  const selectedTheme = watch("theme");
  const selectedDifficulty = watch("difficulty");

  const onSubmit = (data) => {
    setGamification({
      playerCallsign: data.playerCallsign,
      avatar: data.avatar,
      theme: data.theme,
      characterDescription: data.characterDescription,
      difficulty: data.difficulty,
      xpEconomy: { ...XP_ECONOMY_CONFIG },
    });
    setStep(11);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100 mb-3">
            <Gamepad2 className="w-3.5 h-3.5" />
            Stage 10 of 12 — Gamification Engine & Progression
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Configure Operational Gamification</h2>
          <p className="mt-1 text-sm text-gray-500 max-w-2xl leading-relaxed">
            Gamification reinforces real-world execution. The system provides a centralized XP economy, difficulty levels, and duration-aware ranks.
          </p>
        </div>
      </div>

      <hr className="border-gray-100 mb-8" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* A. Player Identity */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Award className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">A. Player Identity (Cosmetic)</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Player Callsign / Operational Alias
              </label>
              <input
                type="text"
                {...register("playerCallsign", { required: true })}
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Character Persona / Archetype
              </label>
              <input
                type="text"
                {...register("characterDescription")}
                placeholder="e.g. Master architect compounder"
                className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Avatar Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">Avatar Emblem</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATARS.map((av) => {
                  const Icon = av.icon;
                  const isSelected = selectedAvatar === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setValue("avatar", av.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-200"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-[10px] font-semibold">{av.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Theme */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-2">HUD Visual Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = selectedTheme === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setValue("theme", theme.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/50 ring-2 ring-orange-200"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="font-bold text-sm text-gray-900 mb-1">{theme.name}</div>
                      <div className="text-xs text-gray-500">{theme.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* B. Operational Difficulty */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Shield className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">B. Difficulty Tier</h3>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Difficulty controls progression pace and threshold demands without modifying truthful historical records.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: "STANDARD", title: "STANDARD", desc: "Balanced XP progression and forgiving streak buffer. Ideal for sustained multi-month consistency." },
              { id: "HARD", title: "HARD", desc: "Demands 90%+ target consistency, stricter milestone delivery criteria, and higher streak requirements." },
              { id: "EXTREME", title: "EXTREME", desc: "Zero tolerance for unexcused failed days. Stringent quest requirements for battle-hardened operators." },
            ].map((d) => {
              const isSelected = selectedDifficulty === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setValue("difficulty", d.id)}
                  className={`p-5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-orange-600 bg-orange-50/70 ring-2 ring-orange-300"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">{d.title}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600" />}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* C. XP Economy Rules */}
        <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-400" />
              <h3 className="text-base font-bold text-white">C. Centralized XP Economy Matrix</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 text-orange-400 rounded-md border border-slate-700">
              Deterministic Scoring Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Bad-Day Minimum</div>
              <div className="text-xl font-bold text-amber-400">+{XP_ECONOMY_CONFIG.coreBadDayMinimum} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Per Core Input</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Normal Target</div>
              <div className="text-xl font-bold text-emerald-400">+{XP_ECONOMY_CONFIG.coreNormalTarget} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Final Total (not added)</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Stretch Target</div>
              <div className="text-xl font-bold text-orange-400">+{XP_ECONOMY_CONFIG.coreStretchTarget} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Peak Reward Total</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Additional Input</div>
              <div className="text-xl font-bold text-blue-400">+{XP_ECONOMY_CONFIG.additionalInputCompleted} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Per Completed Input</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Daily Review</div>
              <div className="text-xl font-bold text-purple-400">+{XP_ECONOMY_CONFIG.dailyReviewCompleted} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Ledger Closing</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Weekly Review</div>
              <div className="text-xl font-bold text-cyan-400">+{XP_ECONOMY_CONFIG.weeklyReviewCompleted} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Strategic Audit</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Monthly Rock</div>
              <div className="text-xl font-bold text-yellow-400">+{XP_ECONOMY_CONFIG.monthlyRockCompleted} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Strategic Milestone</div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div className="text-[11px] text-slate-400 uppercase font-semibold mb-1">Quarterly Objective</div>
              <div className="text-xl font-bold text-orange-500">+{XP_ECONOMY_CONFIG.quarterlyObjectiveAchieved} XP</div>
              <div className="text-[10px] text-slate-400 mt-1">Major Achievement</div>
            </div>
          </div>

          <div className="text-xs text-slate-400 pt-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Anti-inflation policy: XP cannot be manufactured by editing goals or reopening closed days. Outcomes are awarded strictly once.</span>
          </div>
        </div>

        {/* D. Level Progression & Ranks */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Crown className="w-5 h-5 text-orange-600" />
            <h3 className="text-base font-bold text-gray-900">D. Level Progression & Ranks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {RANKS.map((r, i) => (
              <div key={r.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-gray-900">{r.name}</span>
                    <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Lvl {r.levelMin}–{r.levelMax}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{r.description}</p>
                </div>
                <div className="text-[11px] font-bold text-gray-700">
                  Threshold: {r.minXp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep(9)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Accountability
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm transition-all shadow-sm"
          >
            Proceed to Holistic System Preview
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
