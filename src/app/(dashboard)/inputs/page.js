
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import SystemContext from "./components/SystemContext";
import ExecutionBoard from "./components/ExecutionBoard";
import InputManagement from "./components/InputManagement";
import InputEvolution from "./components/InputEvolution";
import VersionHistoryModal from "./components/VersionHistoryModal";
import CloseDayModal from "./components/CloseDayModal";
import { Plus } from "lucide-react";

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

      // Fetch all definitions so inactive core inputs aren't hidden.
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

      const formatted = definitions
        .filter(
          (definition) =>
            definition.is_core === true ||
            definition.isCore === true ||
            definition.active_status === true
        )
        .map((definition) => {
          const entry = entries?.find(
            (item) =>
              item.input_definition_id === definition.id
          );

          const isCore =
            definition.is_core === true ||
            definition.isCore === true;

          return {
            ...definition,
            isCore,
            is_core: isCore,
            target: Number(definition.target) || 0,
            actual: Number(entry?.actual_value) || 0,
            milestoneName: ctx.currentMilestone,
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

    setInputs((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, actual: numericValue }
          : item
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

      setInputs((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, actual: previousValue }
            : item
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

      // Core inputs cannot be paused or deactivated.
      if (inputBeingEdited && isStateChange && isCore) {
        alert(
          "Core inputs are permanent and cannot be paused, archived, or deactivated."
        );
        return;
      }

      if (inputBeingEdited && isStateChange) {
        // State changes are only allowed for additional inputs.
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

        if (!data?.length) {
          alert(
            "The input was not changed. It may be a core input or may no longer exist."
          );
          return;
        }
      } else if (inputBeingEdited) {
        // Edit the existing record instead of replacing it.
        const updates = {
          name: formData.name,
          target: Number(formData.target),
          unit: formData.unit,
          frequency: formData.frequency,
        };

        let query = supabase
          .from("input_definitions")
          .update(updates)
          .eq("id", inputBeingEdited.id)
          .eq("system_id", system.id);

        if (isCore) {
          query = query.eq("is_core", true);
        }

        const { error } = await query;

        if (error) throw error;
      } else {
        // New inputs are always additional inputs, never core inputs.
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
      const target = Number(input.target) || 1;
      const actual = Number(input.actual) || 0;

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
          Loading Dashboard...
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
        <hr className="border-slate-200 mb-8" />
        <p className="text-slate-600 max-w-md">
          You need an active system to track daily inputs.
        </p>
      </div>
    );
  }

  if (system.status === "scheduled") {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <div className="mb-10 bg-orange-50 border border-orange-100 rounded-2xl p-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-orange-600 mb-2">
            System Scheduled
          </div>

          <h2 className="text-2xl font-semibold mb-2 text-slate-900">
            Awaiting Start Date
          </h2>

          <p className="text-sm text-slate-600 max-w-xl leading-relaxed mb-6">
            Your system is scheduled to start on{" "}
            <strong>
              {new Date(system.start_date).toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </strong>
            . Daily inputs will be unlocked on that day.
          </p>

          <SystemContext context={context} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">
            Daily Inputs
          </h1>

          <p className="text-sm font-medium text-slate-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>

          <p className="text-sm text-slate-500 mt-2">
            The actions you repeatedly perform to move your system forward.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInput(null);
            setIsManageOpen(true);
          }}
          className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Input
        </button>
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

      <InputEvolution
        inputs={inputs}
        onEdit={(input) => {
          setEditingInput(input);
          setIsManageOpen(true);
        }}
      />

      <div className="mt-16 text-center border-t border-slate-200 pt-10">
        <button
          onClick={() => setIsCloseDayOpen(true)}
          className="bg-orange-600 text-white px-12 py-4 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
        >
          Close Day
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
        completedInputs={
          inputs.filter(
            (input) =>
              Number(input.actual) / (Number(input.target) || 1) >= 1
          ).length
        }
        totalInputs={inputs.length}
        onConfirm={() => {
          setIsCloseDayOpen(false);
        }}
      />
    </div>
  );
}
