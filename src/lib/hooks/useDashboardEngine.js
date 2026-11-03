"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { XP_ECONOMY_CONFIG, RANKS } from "@/lib/store/useSystemCreationStore";

const getLocalISODate = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split("T")[0];
};

export function useDashboardEngine() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsFilter, setAnalyticsFilter] = useState({
    dateRange: "30d", // '7d' | '30d' | '90d' | 'all' | 'custom'
    customStart: "",
    customEnd: "",
    category: "ALL",
    goalId: "ALL",
    rockId: "ALL",
    inputId: "ALL",
    aggregation: "daily", // 'daily' | 'weekly' | 'monthly'
    comparePrevious: true,
  });

  const [state, setState] = useState({
    system: null,
    isFrozen: false,
    nextReviewDate: null,
    hero: null,
    gamification: null,
    execution: {
      todayScore: 0,
      coreInputs: [],
      additionalInputs: [],
      dailyClassification: "IN_PROGRESS",
      classificationLabel: "In Progress",
      isClosedToday: false,
    },
    missions: {
      dailyMissions: [],
      weeklyQuests: [],
      monthlyRock: null,
      quarterlyCampaign: null,
    },
    strategy: {
      northStar: null,
      secondaryGoal: null,
      yearlyObjective: null,
      quarterlyObjective: null,
      activeRock: null,
      activeMilestone: null,
      nextAction: "",
    },
    focus: {
      status: "Idle",
      plannedSessions: 4,
      completedSessions: 0,
      totalFocusMinutesToday: 0,
      noTodoList: [],
      upcomingDeadlines: [],
    },
    timeTracking: null,
    performance: null,
    historicalReports: [],
  });

  const loadDashboard = useCallback(async () => {
    try {
      const { data: systems, error: sysError } = await supabase
        .from("systems")
        .select(`
          *,
          north_star_goals(*),
          year_plans(
            *,
            quarters(
              *,
              monthly_rocks(
                *,
                weekly_milestones(*)
              )
            )
          )
        `)
        .in("status", ["active", "scheduled"])
        .limit(1);

      if (sysError) throw sysError;
      if (!systems || systems.length === 0) {
        setState((s) => ({ ...s, system: null }));
        setLoading(false);
        return;
      }

      let system = systems[0];
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const startDate = system.start_date ? new Date(system.start_date) : now;
      startDate.setHours(0, 0, 0, 0);

      if (system.status === "scheduled" && startDate <= now) {
        await supabase.from("systems").update({ status: "active" }).eq("id", system.id);
        system.status = "active";
      }

      const isFrozen = system.is_frozen === true ||
        (system.next_review_date && new Date(system.next_review_date) < now);

      // Parallel queries across execution, versions, result definitions, and daily closings
      const todayStr = getLocalISODate(now);

      const [
        { data: allInputs },
        { data: allDailyEntries },
        { data: sysVersions },
        { data: dailyClosings },
      ] = await Promise.all([
        supabase.from("input_definitions").select("*").eq("system_id", system.id),
        supabase
          .from("daily_input_entries")
          .select("*, input_definitions!inner(system_id, is_core, name, unit)")
          .eq("input_definitions.system_id", system.id)
          .order("date", { ascending: false }),
        supabase.from("system_versions").select("*").eq("system_id", system.id).order("created_at", { ascending: false }).limit(2),
        supabase.from("daily_closings").select("*").eq("system_id", system.id).order("date", { ascending: false }),
      ]);

      // User time entries from both time_entries table and profiles.preferences
      let timeEntries = [];
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const [{ data: dbTimeEntries }, { data: profile }] = await Promise.all([
            supabase.from("time_entries").select("*").eq("user_id", user.id),
            supabase.from("profiles").select("preferences").eq("user_id", user.id).single(),
          ]);

          if (dbTimeEntries && dbTimeEntries.length > 0) {
            timeEntries = dbTimeEntries;
          } else if (profile?.preferences?.time_entries) {
            timeEntries = profile.preferences.time_entries;
          }
        }
      } catch (e) {
        console.warn("Time entries lookup fallback:", e);
      }

      // Structure Goals & Strategic Hierarchy
      const goals = system.north_star_goals || [];
      const primaryGoal = goals[0] || null;
      const secondaryGoal = goals[1] || null;

      const activeYear =
        system.year_plans?.find((y) => y.status === "active") || system.year_plans?.[0] || null;
      const activeQuarter =
        activeYear?.quarters?.find((q) => q.status === "active") || activeYear?.quarters?.[0] || null;
      const rocks = activeQuarter?.monthly_rocks || [];
      const activeRock = rocks.find((r) => r.status === "active") || rocks[0] || null;
      const milestones = activeRock?.weekly_milestones || [];
      const activeMilestone = milestones.find((m) => m.status === "active") || milestones[0] || null;

      // SECTION 01 — System Command Header Data
      const expirationDate = system.expiration_date || system.deadline;
      let daysRemaining = 0;
      if (expirationDate) {
        const exp = new Date(expirationDate);
        daysRemaining = Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      }

      let primaryGoalProgressPct = 0;
      if (primaryGoal && primaryGoal.target_value) {
        const cv = primaryGoal.current_value || 0;
        const tv = primaryGoal.target_value || 1;
        primaryGoalProgressPct = Math.min(100, Math.round((cv / tv) * 100));
      }

      const hero = {
        name: system.name || "Personal Operating System",
        identityStatement: system.identity_config?.identityStatement || system.why || "Relentless execution toward strategic mastery.",
        mission: system.why || system.identity_config?.mission || "Executing daily non-negotiables.",
        domain: system.domain || system.category || "Execution",
        status: system.status,
        startDate: system.start_date?.split("T")[0] || todayStr,
        expirationDate: expirationDate ? expirationDate.split("T")[0] : "—",
        daysRemaining,
        primaryGoal: primaryGoal ? {
          name: primaryGoal.name,
          current: primaryGoal.current_value || 0,
          target: primaryGoal.target_value || 1,
          unit: primaryGoal.unit || "",
          progressPct: primaryGoalProgressPct,
        } : null,
      };

      // SECTION 02 — Player Progression & XP Engine (Fully integrated from system config & real records)
      const gamifConfig = system.gamification_config || {};
      const playerCallsign = gamifConfig.playerCallsign || "Operator-One";
      const avatar = gamifConfig.avatar || "shield";

      // Calculate Total Honest XP from database records
      const xpConfig = gamifConfig.xpEconomy || XP_ECONOMY_CONFIG;
      let totalXp = 0;

      // 1. Daily closings XP
      (dailyClosings || []).forEach((c) => {
        totalXp += Number(c.xp_earned || 0);
      });

      // 2. Input executions XP from entries
      (allDailyEntries || []).forEach((e) => {
        const isCore = e.input_definitions?.is_core;
        if (!isCore && (e.completed || e.actual_value > 0)) {
          totalXp += xpConfig.additionalInputCompleted;
        }
      });

      // Determine level and rank based on totalXp and centralized RANKS
      const currentRank = RANKS.slice().reverse().find((r) => totalXp >= r.minXp) || RANKS[0];
      const nextRank = RANKS.find((r) => r.minXp > totalXp) || null;
      const currentLevel = Math.min(100, Math.floor(totalXp / 200) + 1);
      const nextLevelXp = currentLevel * 200;
      const levelProgressPct = Math.min(100, Math.round(((totalXp % 200) / 200) * 100));

      // Calculate the two distinct streaks:
      // - Commitment streak: consecutive days all 3 core inputs met bad-day minimums
      // - Normal performance streak: consecutive days all 3 core inputs met normal targets
      let commitmentStreak = 0;
      let normalStreak = 0;

      // Group historical daily entries by date
      const entriesByDate = {};
      (allDailyEntries || []).forEach((e) => {
        if (!entriesByDate[e.date]) entriesByDate[e.date] = [];
        entriesByDate[e.date].push(e);
      });

      const coreDefs = (allInputs || []).filter((i) => i.is_core || i.isCore);

      for (let i = 0; i < 90; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStr = getLocalISODate(d);
        const dayEntries = entriesByDate[dStr] || [];

        if (dayEntries.length === 0) {
          if (i === 0) continue; // Today can be in progress
          break;
        }

        let badDayMetCount = 0;
        let normalMetCount = 0;

        coreDefs.forEach((coreDef) => {
          const en = dayEntries.find((e) => e.input_definition_id === coreDef.id);
          const act = Number(en?.actual_value || 0);
          const badDay = Number(coreDef.bad_day_minimum ?? coreDef.badDayMinimum ?? (coreDef.target * 0.5) ?? 1);
          const normal = Number(coreDef.normal_target ?? coreDef.normalTarget ?? coreDef.target ?? 1);

          if (act >= badDay && badDay > 0) badDayMetCount++;
          if (act >= normal && normal > 0) normalMetCount++;
        });

        if (badDayMetCount === 3) {
          commitmentStreak++;
        } else if (i !== 0) {
          break;
        }

        if (normalMetCount === 3) {
          normalStreak++;
        } else if (i !== 0) {
          break;
        }
      }

      const gamification = {
        playerCallsign,
        avatar,
        level: currentLevel,
        rank: currentRank.name,
        rankDescription: currentRank.description,
        totalXp,
        nextRank: nextRank ? nextRank.name : "Maximum Rank",
        nextRankXp: nextRank ? nextRank.minXp : totalXp,
        levelProgressPct,
        commitmentStreak,
        normalStreak,
      };

      // SECTION 03 — Today's Execution Data (Core Inputs & Additional Inputs)
      const todayEntries = allDailyEntries?.filter((e) => e.date === todayStr) || [];
      const isClosedToday = (dailyClosings || []).some((c) => c.date === todayStr);

      const coreInputs = coreDefs.map((def) => {
        const en = todayEntries.find((e) => e.input_definition_id === def.id);
        const actual = Number(en?.actual_value || 0);
        const normal = Number(def.normal_target ?? def.normalTarget ?? def.target ?? 1);
        const badDay = Number(def.bad_day_minimum ?? def.badDayMinimum ?? Math.max(1, Math.floor(normal * 0.5)));
        const stretch = Number(def.stretch_target ?? def.stretchTarget ?? Math.round(normal * 1.5));

        return {
          id: def.id,
          name: def.name,
          description: def.description || "",
          unit: def.unit || "",
          badDayMinimum: badDay,
          normalTarget: normal,
          stretchTarget: stretch,
          actual,
          pct: normal > 0 ? Math.min(100, Math.round((actual / normal) * 100)) : 0,
          connectedRock: activeRock?.name || "Quarter Rock",
          isCore: true,
        };
      });

      const additionalInputs = (allInputs || [])
        .filter((i) => !i.is_core && !i.isCore && i.active_status !== false)
        .map((def) => {
          const en = todayEntries.find((e) => e.input_definition_id === def.id);
          const actual = Number(en?.actual_value || 0);
          const target = Number(def.target || 1);
          return {
            id: def.id,
            name: def.name,
            description: def.description || "",
            unit: def.unit || "",
            target,
            actual,
            pct: target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0,
            frequency: def.frequency || "DAILY",
            isCore: false,
          };
        });

      // Daily Classification calculation
      let coreNormalCount = 0;
      let coreBadDayCount = 0;
      coreInputs.forEach((inp) => {
        if (inp.actual >= inp.normalTarget && inp.normalTarget > 0) coreNormalCount++;
        if (inp.actual >= inp.badDayMinimum && inp.badDayMinimum > 0) coreBadDayCount++;
      });

      let dailyClassification = "IN_PROGRESS";
      let classificationLabel = "In Progress";
      if (coreInputs.length >= 3) {
        if (coreNormalCount === 3) {
          dailyClassification = "NORMAL_SUCCESS";
          classificationLabel = "Normal Success";
        } else if (coreBadDayCount === 3) {
          dailyClassification = "BAD_DAY_SUCCESS";
          classificationLabel = "Bad-Day Success";
        } else if (isClosedToday) {
          dailyClassification = "FAILED_DAY";
          classificationLabel = "Failed Day";
        }
      }

      // SECTION 04 — Missions & Quests (Connecting actual objectives and weekly milestones)
      const dailyMissions = coreInputs.map((inp) => ({
        id: `m-core-${inp.id}`,
        title: `Execute ${inp.name}`,
        description: `Deliver expected target (${inp.normalTarget} ${inp.unit})`,
        progress: inp.actual,
        target: inp.normalTarget,
        unit: inp.unit,
        pct: inp.pct,
        status: inp.actual >= inp.normalTarget ? "Completed" : "Active",
        deadline: "Today 23:59",
      }));

      const weeklyQuests = milestones.map((m) => ({
        id: `q-wm-${m.id}`,
        title: m.name,
        description: `Weekly deliverable for ${activeRock?.name || "Active Rock"}`,
        progress: m.status === "completed" ? 100 : 50,
        status: m.status || "active",
        deadline: m.deadline || "End of week",
      }));

      // SECTION 05 — Strategic Command Center
      const strategy = {
        northStar: primaryGoal,
        secondaryGoal,
        yearlyObjective: activeYear,
        quarterlyObjective: activeQuarter,
        activeRock,
        activeMilestone,
        nextAction: activeMilestone ? `Complete ${activeMilestone.name}` : "Audit strategic objectives",
      };

      // SECTION 06 — Focus & Discipline (Derived from system.focus_config & system.no_todo_config)
      const focusConfig = system.focus_config || {};
      const noTodoConfig = system.no_todo_config || {};
      const perfectWeekConfig = system.perfect_week_config || {};

      let todayLoggedMins = 0;
      timeEntries.forEach((te) => {
        if (te.date === todayStr) todayLoggedMins += Number(te.duration_minutes || 0);
      });

      const focus = {
        status: todayLoggedMins > 0 ? "Deep Work Active" : "Operational",
        plannedSessions: focusConfig.focusSessions?.maxDeepWorkSessionsPerDay || 4,
        completedSessions: Math.floor(todayLoggedMins / (focusConfig.focusSessions?.sessionDuration || 50)),
        totalFocusMinutesToday: todayLoggedMins,
        noTodoList: noTodoConfig.rules || [],
        scheduledBlocks: perfectWeekConfig.blocks || [],
        upcomingDeadlines: [
          { label: "Weekly Milestone", date: activeMilestone?.deadline },
          { label: "Weekly Review", date: system.next_review_date },
          { label: "Quarterly Close", date: activeQuarter?.end_date },
          { label: "System Expiration", date: expirationDate },
        ].filter((d) => d.date),
      };

      // SECTION 07 & 08 — Centralized Time Intelligence & Performance Analytics
      setState({
        system,
        isFrozen,
        nextReviewDate: system.next_review_date,
        hero,
        gamification,
        execution: {
          todayScore: coreInputs.length > 0 ? Math.round((coreNormalCount / 3) * 100) : 0,
          coreInputs,
          additionalInputs,
          dailyClassification,
          classificationLabel,
          isClosedToday,
        },
        missions: {
          dailyMissions,
          weeklyQuests,
          monthlyRock: activeRock,
          quarterlyCampaign: activeQuarter,
        },
        strategy,
        focus,
        rawInputs: allInputs || [],
        rawEntries: allDailyEntries || [],
        rawClosings: dailyClosings || [],
        rawTimeEntries: timeEntries || [],
      });
    } catch (err) {
      console.error("Dashboard Engine Load Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Direct progress execution recorder from the dashboard using central persistence
  const updateInputExecution = async (inputId, newValue) => {
    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue) || numericValue < 0) return;

    const today = getLocalISODate();

    try {
      const { data: existing } = await supabase
        .from("daily_input_entries")
        .select("id")
        .eq("input_definition_id", inputId)
        .eq("date", today)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("daily_input_entries")
          .update({ actual_value: numericValue, completed: true })
          .eq("id", existing.id);
      } else {
        await supabase.from("daily_input_entries").insert({
          input_definition_id: inputId,
          date: today,
          actual_value: numericValue,
          completed: true,
        });
      }

      await loadDashboard();
    } catch (e) {
      console.error("Failed to update execution from dashboard:", e);
    }
  };

  // Direct Daily Close Action from Dashboard
  const closeDayFromDashboard = async ({ note, outcomes, classification }) => {
    if (!state.system) return;
    const today = getLocalISODate();
    const xpReward = classification === "NORMAL_SUCCESS" ? 30 : classification === "BAD_DAY_SUCCESS" ? 15 : 5;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("daily_closings").upsert({
        user_id: user.id,
        system_id: state.system.id,
        date: today,
        classification,
        score: state.execution.todayScore,
        note,
        outcomes,
        xp_earned: xpReward,
      });

      await loadDashboard();
    } catch (e) {
      console.error("Failed to close day:", e);
    }
  };

  return {
    loading,
    error,
    analyticsFilter,
    setAnalyticsFilter,
    updateInputExecution,
    closeDayFromDashboard,
    refreshDashboard: loadDashboard,
    ...state,
  };
}
