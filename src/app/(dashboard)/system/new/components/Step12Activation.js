"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import useToastStore from "@/lib/store/useToastStore";
import { supabase } from "@/lib/supabase/client";
import { CheckCircle2, LockKeyhole, AlertTriangle, ArrowLeft, ShieldCheck, Calendar, Star } from "lucide-react";

function validDateOrNull(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
    ? value
    : null;
}

export default function Step12Activation() {
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
    resetSystem,
    setStep,
  } = useSystemCreationStore();

  const { addToast } = useToastStore();
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();

  const [confirmedLocked, setConfirmedLocked] = useState(false);

  const handleActivate = async () => {
    if (!confirmedLocked) {
      addToast("Please confirm your acknowledgment that configuration will be locked until expiration.", "error");
      return;
    }

    setIsActivating(true);
    addToast("Committing complete operating system to ledger...", "info");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addToast("You must be logged in to activate a system. Draft saved.", "error");
        setIsActivating(false);
        router.push("/login");
        return;
      }

      const userId = user.id;

      // 1. Archive existing active systems for this user
      await supabase.from("systems").update({ status: "archived" }).eq("user_id", userId).eq("status", "active");

      // 2. Calculate review date
      const startDateVal = systemConfig.startDate || new Date().toISOString().split("T")[0];
      const expirationDateVal = systemConfig.expirationDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const reviewDate = new Date(startDateVal);
      reviewDate.setDate(reviewDate.getDate() + 7);

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const start = new Date(startDateVal);
      start.setHours(0, 0, 0, 0);
      const initialStatus = start > now ? "scheduled" : "active";

      // 3. Insert system with all extended configurations
      const systemInsertPayload = {
        user_id: userId,
        name: systemIdentity.name || "Personal Operating System",
        why: systemIdentity.mission || systemIdentity.why || "",
        description: systemConfig.description || systemIdentity.mission || systemIdentity.why || "",
        category: systemConfig.primaryDomain || "General",
        status: initialStatus,
        start_date: new Date(startDateVal).toISOString(),
        deadline: new Date(expirationDateVal).toISOString(),
        next_review_date: reviewDate.toISOString(),
        is_frozen: true, // locked upon activation until expiration

        // Extended configuration columns (gracefully handled if schema migrated)
        expiration_date: new Date(expirationDateVal).toISOString(),
        domain: systemConfig.primaryDomain,
        timezone: systemConfig.timeZone,
        weekly_review_day: systemConfig.preferredWeeklyReviewDay,
        daily_closing_time: systemConfig.preferredDailyClosingTime,
        success_outcome: goals.systemSuccessOutcome || "",
        identity_config: systemIdentity,
        no_todo_config: noTodoList,
        focus_config: focusArchitecture,
        perfect_week_config: perfectWeek,
        accountability_config: accountability,
        gamification_config: gamification,
      };

      let { data: sysData, error: sysErr } = await supabase
        .from("systems")
        .insert(systemInsertPayload)
        .select()
        .single();

      if (sysErr) {
        // Fallback without newly added optional columns in case DB hasn't run migration yet
        console.warn("Retrying with base system schema...", sysErr.message);
        const baseInsert = {
          user_id: userId,
          name: systemIdentity.name || "Personal Operating System",
          why: systemIdentity.mission || systemIdentity.why || "",
          description: systemConfig.description || systemIdentity.mission || systemIdentity.why || "",
          category: systemConfig.primaryDomain || "General",
          status: initialStatus,
          start_date: new Date(startDateVal).toISOString(),
          deadline: new Date(expirationDateVal).toISOString(),
          next_review_date: reviewDate.toISOString(),
          is_frozen: true,
        };
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from("systems")
          .insert(baseInsert)
          .select()
          .single();

        if (fallbackErr) throw fallbackErr;
        sysData = fallbackData;
      }

      const systemId = sysData.id;

      // 4. Insert North Star Goals
      const { error: goalErr } = await supabase.from("north_star_goals").insert({
        system_id: systemId,
        name: goals.primary.name || "North Star Goal",
        outcome: goals.primary.description || goals.systemSuccessOutcome || "",
        starting_value: goals.primary.baseline != null ? Number(goals.primary.baseline) : null,
        target_value: goals.primary.target != null ? Number(goals.primary.target) : null,
        unit: goals.primary.unit || "",
        deadline: goals.primary.deadline ? new Date(goals.primary.deadline).toISOString() : null,
        success_definition: goals.primary.successCriteria || goals.systemSuccessOutcome || "",
      });
      if (goalErr) throw goalErr;

      // 5. Insert Year Plan
      const { data: yearData, error: yearErr } = await supabase
        .from("year_plans")
        .insert({
          system_id: systemId,
          year_number: roadmap.year || new Date().getFullYear(),
          status: "active",
        })
        .select()
        .single();

      if (yearErr) throw yearErr;

      // 6. Insert Quarter
      const { data: quarterData, error: quarterErr } = await supabase
        .from("quarters")
        .insert({
          year_plan_id: yearData.id,
          quarter_number: roadmap.quarter || 1,
          objective: roadmap.quarterlyObjective?.name || "Quarterly Objective",
          status: "active",
        })
        .select()
        .single();

      if (quarterErr) throw quarterErr;

      // 7. Insert Rocks & Milestones
      if (roadmap.rocks && roadmap.rocks.length > 0) {
        for (const [index, rock] of roadmap.rocks.entries()) {
          if (!rock.name) continue;

          const { data: rockData, error: rockErr } = await supabase
            .from("monthly_rocks")
            .insert({
              quarter_id: quarterData.id,
              name: rock.name,
              description: rock.desiredOutcome || rock.description || "",
              success_criteria: rock.successCriteria || null,
              month: ((Number(roadmap.quarter) || 1) - 1) * 3 + index + 1,
              deadline: validDateOrNull(rock.deadline),
              status: "active",
            })
            .select()
            .single();

          if (rockErr) throw rockErr;
          if (!rockData) throw new Error(`Rock "${rock.name}" could not be saved.`);

          if (rock.milestones && rock.milestones.length > 0) {
            const milestoneInserts = rock.milestones
              .filter((m) => m.name)
              .map((m, i) => ({
                monthly_rock_id: rockData.id,
                name: m.name,
                week_number: i + 1,
                status: "pending",
              }));

            if (milestoneInserts.length > 0) {
              const { error: milestoneErr } = await supabase
                .from("weekly_milestones")
                .insert(milestoneInserts);
              if (milestoneErr) throw milestoneErr;
            }
          }
        }
      }

      // 8. Insert Input Definitions (Enforcing is_core flag and targets)
      if (inputs && inputs.length > 0) {
        const inputInserts = inputs
          .filter((inp) => inp.name)
          .map((inp, idx) => ({
            system_id: systemId,
            name: inp.name,
            target: inp.normalTarget ? Number(inp.normalTarget) : null,
            frequency: inp.frequency || "DAILY",
            unit: inp.unit || "",
            active_status: true,
            is_core: idx < 3,
            description: inp.description || "",
          }));

        if (inputInserts.length > 0) {
          const { error: inpErr } = await supabase.from("input_definitions").insert(inputInserts);
          if (inpErr) {
            // If is_core column doesn't exist in older table versions, retry without is_core
            console.warn("Input insertion retry:", inpErr.message);
            const basicInputInserts = inputs.filter((inp) => inp.name).map((inp) => ({
              system_id: systemId,
              name: inp.name,
              target: inp.normalTarget ? Number(inp.normalTarget) : null,
              frequency: inp.frequency || "DAILY",
              unit: inp.unit || "",
              active_status: true,
            }));
            await supabase.from("input_definitions").insert(basicInputInserts);
          }
        }
      }

      // 9. Insert initial System Version with comprehensive snapshot
      await supabase.from("system_versions").insert({
        system_id: systemId,
        version_number: "1.0",
        snapshot: {
          systemConfig,
          identity: systemIdentity,
          goals,
          roadmap,
          inputs,
          noTodoList,
          focusArchitecture,
          perfectWeek,
          accountability,
          gamification,
          activatedAt: new Date().toISOString(),
          expirationDate: expirationDateVal,
        },
      });

      resetSystem();
      addToast("Personal Operating System activated and locked into Ledger!", "success", 4000);
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to activate system:", error);
      addToast("Failed to activate system: " + error.message, "error");
      setIsActivating(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-4 shadow-sm">
          <LockKeyhole className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Activate & Lock Operating System</h2>
        <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto">
          You are committing Version 1.0 to the immutable execution ledger. Once activated, your core configuration is locked until its expiration date to enforce operational discipline.
        </p>
      </div>

      {/* Expiration & Duration Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-bold text-gray-900">Operating System Lifecycle</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 bg-orange-50 text-orange-700 rounded-md border border-orange-200">
            Locked Until Expiration
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">Tracking Start Date</span>
            <span className="font-bold text-gray-900">{systemConfig.startDate}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">System Expiration Date</span>
            <span className="font-bold text-orange-600">{systemConfig.expirationDate}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">North Star Goal</span>
            <span className="font-semibold text-gray-900 truncate block">{goals.primary?.name || "Not defined"}</span>
          </div>
          <div>
            <span className="text-xs text-gray-400 block mb-0.5">Daily Protocols</span>
            <span className="font-semibold text-gray-900">3 Core Inputs + {Math.max(0, (inputs?.length || 0) - 3)} Additional</span>
          </div>
        </div>
      </div>

      {/* Lock Notice Warning Box */}
      <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 mb-8 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold block mb-1">Execution Rule Acknowledgment</span>
          Casual modifications to your identity, roadmap, 3 core inputs, and execution rules are prohibited after activation. You will execute daily inputs, complete reviews, earn XP, and track progress against these exact commitments.
        </div>
      </div>

      {/* Checkbox Acknowledgment */}
      <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer mb-8 hover:bg-gray-100 transition-colors">
        <input
          type="checkbox"
          checked={confirmedLocked}
          onChange={(e) => setConfirmedLocked(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
        />
        <span className="text-xs font-medium text-gray-700 leading-snug">
          I understand and accept that this operating system will be locked until <span className="font-bold text-gray-900">{systemConfig.expirationDate}</span>, and I commit to executing my daily inputs without excuses.
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleActivate}
          disabled={isActivating || !confirmedLocked}
          className="w-full py-4 rounded-xl font-bold text-base bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isActivating ? "Writing to Ledger & Initializing..." : "Activate & Lock Operating System"}
        </button>

        <button
          type="button"
          onClick={() => setStep(11)}
          disabled={isActivating}
          className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Wait, return to Blueprint Preview
        </button>
      </div>
    </div>
  );
}
