"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import SystemContext from "./components/SystemContext";
import ExecutionBoard from "./components/ExecutionBoard";
import InputManagement from "./components/InputManagement";
import InputEvolution from "./components/InputEvolution";
import VersionHistoryModal from "./components/VersionHistoryModal";
import CloseDayModal from "./components/CloseDayModal";
import { Plus, CheckCircle2, AlertTriangle, Flame, ShieldCheck, Target, Calendar } from "lucide-react";

const getLocalISODate = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset)
    .toISOString()
    .split("T")[0];
};

export default function DailyInputsPage() {
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState(null);
  const [context, setContext] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCloseDayOpen, setIsCloseDayOpen] = useState(false);
  const [editingInput, setEditingInput] = useState(null);
  const [viewingHistoryInput, setViewingHistoryInput] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: systems,
        error: systemsError,
      } = await supabase
        .from("systems")
        .select(`
          *,
          north_star_goals(name),
          year_plans(
            year_number,
            status,
            quarters(
              objective,
              status,
              monthly_rocks(
                name,
                status,
                weekly_milestones(
                  id,
                  name,
                  status
                )
              )
            )
          )
        `)
        .in("status", ["active", "scheduled"])
        .limit(1);

      if (systemsError) throw systemsError;

      if (!systems?.length) {
        setSystem(null);
        setContext(null);
        setInputs([]);
        return;
      }

      const activeSystem = systems[0];

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const startDate = activeSystem.start_date
        ? new Date(activeSystem.start_date)
        : null;

      if (startDate) startDate.setHours(0, 0, 0, 0);

      if (
        activeSystem.status === "scheduled" &&
        startDate &&
        startDate <= now
      ) {
        const { error } = await supabase
          .from("systems")
          .update({ status: "active" })
          .eq("id", activeSystem.id);

        if (error) throw error;
        activeSystem.status = "active";
      }

      setSystem(activeSystem);

      const ctx = {
        northStar: "",
        yearPlan: "",
        quarterObjective: "",
        currentRock: "",
        currentMilestone: "",
        milestoneId: null,
      };

      if (activeSystem.north_star_goals?.length) {
        ctx.northStar = activeSystem.north_star_goals[0].name;
      }

      const activeYear =
        activeSystem.year_plans?.find(
          (year) => year.status === "active"
        ) || activeSystem.year_plans?.[0];

      if (activeYear) {
        ctx.yearPlan = activeYear.year_number;

        const activeQuarter =
          activeYear.quarters?.find(
            (quarter) => quarter.status === "active"
          ) || activeYear.quarters?.[0];

        if (activeQuarter) {
          ctx.quarterObjective = activeQuarter.objective;

          const activeRock =
            activeQuarter.monthly_rocks?.find(
              (rock) => rock.status === "active"
            ) || activeQuarter.monthly_rocks?.[0];

          if (activeRock) {
            ctx.currentRock = activeRock.name;

            const activeMilestone =
              activeRock.weekly_milestones?.find(
                (milestone) => milestone.status === "active"
              ) || activeRock.weekly_milestones?.[0];

            if (activeMilestone) {
              ctx.currentMilestone = activeMilestone.name;
              ctx.milestoneId = activeMilestone.id;
            }
          }
        }
      }

      setContext(ctx);

      // Fetch input definitions
      const {
        data: inputDefs,
        error: inputDefsError,
      } = await supabase
        .from("input_definitions")
        .select("*")
        .eq("system_id", activeSystem.id);

      if (inputDefsError) throw inputDefsError;

      const definitions = inputDefs || [];

      if (!definitions.length) {
        setInputs([]);
        return;
      }

      // Fetch today's execution entries
      const {
        data: entries,
        error: entriesError,
      } = await supabase
        .from("daily_input_entries")
        .select("*")
        .in(
          "input_definition_id",
          definitions.map((definition) => definition.id)
        )
        .eq("date", getLocalISODate());

      if (entriesError) throw entriesError;

      // Map definitions with semantically explicit targets
      const formatted = definitions
        .filter(
          (definition) =>
            definition.is_core === true ||
            definition.isCore === true ||
            definition.active_status === true
        )
        .map((definition) => {
          const entry = entries?.find(
            (item) => item.input_definition_id === definition.id
          );

          const isCore =
            definition.is_core === true ||
            definition.isCore === true;

          const normalTarget = Number(
            definition.normal_target ??
            definition.normalTarget ??
            definition.target ??
            1
          );

          const badDayMinimum = Number(
            definition.bad_day_minimum ??
            definition.badDayMinimum ??
            definition.minimumTarget ??
            definition.minimum ??
            (isCore ? Math.max(1, Math.floor(normalTarget * 0.5)) : 0)
          );

          const stretchTarget = Number(
            definition.stretch_target ??
            definition.stretchTarget ??
            definition.stretch ??
            (isCore ? Math.round(normalTarget * 1.5) : normalTarget)
          );

          return {
            ...definition,
            isCore,
            is_core: isCore,
            badDayMinimum,
            normalTarget,
            stretchTarget,
            target: normalTarget,
            actual: Number(entry?.actual_value) || 0,
            milestoneName: ctx.currentMilestone,
            connectedRock: ctx.currentRock,
            status: isCore
              ? "active"
              : definition.active_status
              ? "active"
              : "archived",
          };
        });

      setInputs(formatted);
    } catch (error) {
      console.error("Error loading Daily Inputs:", error);
      alert("Error loading Daily Inputs: " + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Daily Overview Metrics
  const overviewMetrics = useMemo(() => {
    const coreList = inputs.filter((i) => i.isCore);
    const addlList = inputs.filter((i) => !i.isCore);

    let completedCoreCount = 0;
    let completedAddlCount = 0;
    let badDayCoreCount = 0;

    coreList.forEach((inp) => {
      const act = Number(inp.actual || 0);
      if (act >= inp.normalTarget && inp.normalTarget > 0) completedCoreCount++;
      if (act >= inp.badDayMinimum && inp.badDayMinimum > 0) badDayCoreCount++;
    });

    addlList.forEach((inp) => {
      const act = Number(inp.actual || 0);
      if (act >= (inp.target || 1)) completedAddlCount++;
    });

    let dailyClassification = "Not Started";
    let classificationBadge = "bg-slate-100 text-slate-700 border-slate-200";

    if (coreList.length >= 3) {
      if (completedCoreCount === 3) {
        dailyClassification = "Normal Success";
        classificationBadge = "bg-emerald-600 text-white border-emerald-700";
      } else if (badDayCoreCount === 3) {
        dailyClassification = "Bad-Day Success";
        classificationBadge = "bg-amber-500 text-white border-amber-600";
      } else {
        const hasStarted = coreList.some((i) => Number(i.actual || 0) > 0);
        dailyClassification = hasStarted ? "In Progress" : "Not Started";
        classificationBadge = hasStarted
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-slate-100 text-slate-700 border-slate-200";
      }
    }

    // Normal performance progress
    const totalNormalTarget = coreList.reduce((acc, i) => acc + (i.normalTarget || 0), 0);
    const totalNormalActual = coreList.reduce((acc, i) => acc + Math.min(i.normalTarget || 0, Number(i.actual || 0)), 0);
    const normalProgressPct = totalNormalTarget > 0 ? Math.round((totalNormalActual / totalNormalTarget) * 100) : 0;

    return {
      coreList,
      addlList,
      completedCoreCount,
      completedAddlCount,
      dailyClassification,
      classificationBadge,
      normalProgressPct,
    };
  }, [inputs]);

  const handleUpdateExecution = async (id, newValue) => {
    const input = inputs.find((item) => item.id === id);
    if (!input) {
      alert("Input not found.");
      return;
    }

    const numericValue = Number(newValue);
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      alert("Enter a valid non-negative number.");
      return;
    }

    const previousValue = input.actual;

    setInputs((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actual: numericValue } : item
      )
    );

    try {
      const today = getLocalISODate();

      const {
        data: existing,
        error: lookupError,
      } = await supabase
        .from("daily_input_entries")
        .select("id")
        .eq("input_definition_id", id)
        .eq("date", today)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existing) {
        const { error } = await supabase
          .from("daily_input_entries")
          .update({
            actual_value: numericValue,
            completed: true,
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("daily_input_entries")
          .insert({
            input_definition_id: id,
            date: today,
            actual_value: numericValue,
            completed: true,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving execution:", error);
      setInputs((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, actual: previousValue } : item
        )
      );
      alert("Could not save execution: " + error.message);
    }
  };

  const handleSaveInput = async (
    formData,
    inputBeingEdited,
    isStateChange = false
  ) => {
    try {
      if (!system) {
        alert("No active system found.");
        return;
      }

      const isCore =
        inputBeingEdited?.isCore === true ||
        inputBeingEdited?.is_core === true;

      if (inputBeingEdited && isStateChange && isCore) {
        alert("Core inputs are permanent and cannot be paused or archived.");
        return;
      }

      if (inputBeingEdited && isStateChange) {
        const { data, error } = await supabase
          .from("input_definitions")
          .update({
            active_status: formData.status === "active",
          })
          .eq("id", inputBeingEdited.id)
          .eq("system_id", system.id)
          .eq("is_core", false)
          .select("id");

        if (error) throw error;
      } else if (inputBeingEdited) {
        // Target correction / update
        const updates = {
          name: formData.name,
          target: Number(formData.target),
          unit: formData.unit,
          frequency: formData.frequency,
          description: formData.description,
          change_reason: formData.change_reason || formData.correctionReason,
        };

        if (isCore) {
          updates.bad_day_minimum = Number(formData.badDayMinimum);
          updates.normal_target = Number(formData.normalTarget);
          updates.stretch_target = Number(formData.stretchTarget);
        }

        const { error } = await supabase
          .from("input_definitions")
          .update(updates)
          .eq("id", inputBeingEdited.id)
          .eq("system_id", system.id);

        if (error) throw error;
      } else {
        // Additional input creation
        const { error } = await supabase
          .from("input_definitions")
          .insert({
            system_id: system.id,
            name: formData.name,
            target: Number(formData.target),
            unit: formData.unit,
            frequency: formData.frequency,
            weekly_milestone_id: context?.milestoneId || null,
            active_status: true,
            is_core: false,
            description: formData.description || "",
          });

        if (error) throw error;
      }

      setIsManageOpen(false);
      setEditingInput(null);
      await fetchData();
    } catch (error) {
      console.error("Error saving input:", error);
      alert("Could not save input: " + error.message);
    }
  };

  const handleViewHistory = async (input) => {
    setViewingHistoryInput(input);
    setHistoryData([]);
    setIsHistoryOpen(true);
  };

  const calculateScore = () => {
    if (!inputs.length) return 0;
    let totalWeight = 0;
    let earnedWeight = 0;

    inputs.forEach((input) => {
      const weight = Number(input.weight) || 10;
      const target = Number(input.normalTarget || input.target || 1);
      const actual = Number(input.actual || 0);

      totalWeight += weight;
      earnedWeight += Math.min(1, actual / target) * weight;
    });

    return totalWeight > 0
      ? Math.round((earnedWeight / totalWeight) * 100)
      : 0;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-medium animate-pulse text-orange-500">
          Loading Execution Dashboard...
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">
          No Active System
        </h2>
        <p className="text-slate-600 max-w-md">
          You need an active system to track daily inputs.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      {/* DAILY OVERVIEW BANNER */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 sm:p-8 shadow-md border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-700/70">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Execution Control Center
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Track daily non-negotiables, fulfill expected performance targets, and close your ledger.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingInput(null);
                setIsManageOpen(true);
              }}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add Supporting Input
            </button>
          </div>
        </div>

        {/* 4 Metric Badges in Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Core Commitments
            </span>
            <div className="text-xl font-black text-white">
              {overviewMetrics.completedCoreCount} / 3
              <span className="text-xs font-normal text-slate-400 ml-1">Normal Met</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all"
                style={{ width: `${(overviewMetrics.completedCoreCount / 3) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Additional Inputs
            </span>
            <div className="text-xl font-black text-white">
              {overviewMetrics.completedAddlCount} / {overviewMetrics.addlList.length}
              <span className="text-xs font-normal text-slate-400 ml-1">Complete</span>
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-blue-400 h-full rounded-full transition-all"
                style={{
                  width: `${
                    overviewMetrics.addlList.length > 0
                      ? (overviewMetrics.completedAddlCount / overviewMetrics.addlList.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Daily Classification
            </span>
            <div className="mt-1">
              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-extrabold border ${overviewMetrics.classificationBadge}`}>
                {overviewMetrics.dailyClassification}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Normal Target Velocity
            </span>
            <div className="text-xl font-black text-white">
              {overviewMetrics.normalProgressPct}%
            </div>
            <div className="w-full bg-slate-700 h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${overviewMetrics.normalProgressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <SystemContext context={context} />

      <ExecutionBoard
        inputs={inputs}
        onUpdate={handleUpdateExecution}
        onEdit={(input) => {
          setEditingInput(input);
          setIsManageOpen(true);
        }}
        onViewHistory={handleViewHistory}
      />

      <div className="mt-12">
        <InputEvolution
          inputs={inputs}
          onEdit={(input) => {
            setEditingInput(input);
            setIsManageOpen(true);
          }}
        />
      </div>

      {/* Floating / Prominent Close Day Action */}
      <div className="mt-14 text-center border-t border-slate-200 pt-8">
        <button
          onClick={() => setIsCloseDayOpen(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg active:scale-98"
        >
          Review & Close Day to Ledger
        </button>
      </div>

      <InputManagement
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        editingInput={editingInput}
        onSave={handleSaveInput}
        context={context}
      />

      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        input={viewingHistoryInput}
        history={historyData}
      />

      <CloseDayModal
        isOpen={isCloseDayOpen}
        onClose={() => setIsCloseDayOpen(false)}
        score={calculateScore()}
        completedInputs={overviewMetrics.completedCoreCount}
        totalInputs={overviewMetrics.coreList.length}
        inputs={inputs}
        onConfirm={() => {
          setIsCloseDayOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
