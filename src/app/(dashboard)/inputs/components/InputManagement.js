"use client";

import { useState, useEffect } from "react";
import {
  X,
  LockKeyhole,
  ShieldAlert,
  Target,
  AlertTriangle,
  Info,
} from "lucide-react";

export default function InputManagement({
  isOpen,
  onClose,
  editingInput,
  onSave,
  context,
}) {
  const isCore = editingInput?.isCore === true || editingInput?.is_core === true;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    measurementType: "numeric",
    target: "",
    badDayMinimum: "",
    normalTarget: "",
    stretchTarget: "",
    unit: "",
    frequency: "DAILY",
    weight: 10,
    correctionReason: "",
  });

  useEffect(() => {
    if (editingInput) {
      const normal =
        editingInput.normalTarget ??
        editingInput.normal_target ??
        editingInput.normal ??
        editingInput.target ??
        "";

      const badDay =
        editingInput.badDayMinimum ??
        editingInput.bad_day_minimum ??
        editingInput.minimumTarget ??
        editingInput.minimum ??
        "";

      const stretch =
        editingInput.stretchTarget ??
        editingInput.stretch_target ??
        editingInput.stretch ??
        "";

      setFormData({
        name: editingInput.name || "",
        description: editingInput.description || "",
        measurementType: editingInput.measurementType || editingInput.measurement_type || "numeric",
        target: editingInput.target ?? normal,
        badDayMinimum: badDay,
        normalTarget: normal,
        stretchTarget: stretch,
        unit: editingInput.unit || "",
        frequency: (editingInput.frequency || "DAILY").toUpperCase(),
        weight: editingInput.weight ?? 10,
        correctionReason: "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        measurementType: "numeric",
        target: "",
        badDayMinimum: "",
        normalTarget: "",
        stretchTarget: "",
        unit: "",
        frequency: "DAILY",
        weight: 10,
        correctionReason: "",
      });
    }
  }, [editingInput, isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    if (!name) return;

    if (isCore) {
      // Core Input Validation
      const badDay = Number(formData.badDayMinimum);
      const normal = Number(formData.normalTarget);
      const stretch = Number(formData.stretchTarget);

      if (
        formData.badDayMinimum === "" ||
        formData.normalTarget === "" ||
        formData.stretchTarget === "" ||
        !Number.isFinite(badDay) ||
        !Number.isFinite(normal) ||
        !Number.isFinite(stretch) ||
        badDay < 0 ||
        normal < badDay ||
        stretch < normal
      ) {
        alert(
          "Enter valid targets with Bad-Day Minimum ≤ Normal Target ≤ Stretch Target."
        );
        return;
      }

      if (!formData.correctionReason) {
        alert("An auditable correction reason is required when adjusting active core input targets.");
        return;
      }

      onSave(
        {
          ...formData,
          name,
          isCore: true,
          is_core: true,
          target: normal,
          badDayMinimum: badDay,
          bad_day_minimum: badDay,
          normalTarget: normal,
          normal_target: normal,
          stretchTarget: stretch,
          stretch_target: stretch,
          frequency: "DAILY",
          change_reason: formData.correctionReason,
        },
        editingInput,
        false
      );
      return;
    }

    // Additional Input Validation
    if (
      formData.target === "" ||
      !Number.isFinite(Number(formData.target)) ||
      Number(formData.target) < 0
    ) {
      alert("Enter a valid non-negative target.");
      return;
    }

    onSave(
      {
        ...formData,
        name,
        target: Number(formData.target),
        isCore: false,
        is_core: false,
        frequency: formData.frequency,
        change_reason: formData.correctionReason,
      },
      editingInput,
      false
    );
  };

  const handleStatusAction = (status) => {
    if (isCore) {
      alert(
        "Core inputs are permanent non-negotiables and cannot be paused, archived, or deactivated."
      );
      return;
    }

    onSave(
      {
        ...formData,
        status,
        isCore: false,
        is_core: false,
      },
      editingInput,
      true
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-xs">
      <div className="relative my-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            {isCore ? (
              <span className="inline-flex items-center gap-1.5 rounded-md border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-900">
                <LockKeyhole className="h-3.5 w-3.5 text-orange-600" />
                Authorized Core Correction
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {editingInput ? "Edit Additional Input" : "Create Supporting Input"}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            {isCore
              ? `Correct Targets: ${editingInput.name}`
              : editingInput
              ? `Edit Input: ${editingInput.name}`
              : "New Supporting Input"}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isCore
              ? "Core inputs are permanent. All target adjustments are logged to the version audit ledger."
              : "Configure secondary operational routines that support your monthly milestones."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Input Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              disabled={isCore}
              placeholder="e.g. Sales Calls, Deep Work, Training"
              className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 ${
                isCore ? "bg-slate-100 text-slate-600 cursor-not-allowed" : ""
              }`}
            />
            {isCore && (
              <span className="text-[11px] text-slate-400 mt-1 block">
                Core input name is locked to protect historical integrity.
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Operational Protocol / Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="e.g. Zero distraction environment, phone locked in drawer"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Unit & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Measurement Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => updateField("unit", e.target.value)}
                placeholder="e.g. calls, minutes, words"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => updateField("frequency", e.target.value)}
                disabled={isCore}
                className={`w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 ${
                  isCore ? "bg-slate-100 text-slate-600 cursor-not-allowed" : ""
                }`}
              >
                <option value="DAILY">Daily</option>
                {!isCore && <option value="WEEKLY">Weekly</option>}
                {!isCore && <option value="MONTHLY">Monthly</option>}
              </select>
              {isCore && (
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Core inputs are permanently daily.
                </span>
              )}
            </div>
          </div>

          {/* Core Targets (Bad-Day Minimum, Normal Target, Stretch Target) */}
          {isCore ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-900 uppercase tracking-wider">
                <Target className="h-4 w-4 text-orange-600" />
                Authorized Target Hierarchy
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-amber-200">
                  <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">
                    1. Bad-Day Min
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.badDayMinimum}
                    onChange={(e) => updateField("badDayMinimum", e.target.value)}
                    className="w-full font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-amber-500"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Daily floor</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-emerald-200">
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    2. Normal Target
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.normalTarget}
                    onChange={(e) => updateField("normalTarget", e.target.value)}
                    className="w-full font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-emerald-500"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Expected</span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-orange-200">
                  <label className="block text-[10px] font-bold text-orange-800 uppercase tracking-wider mb-1">
                    3. Stretch Target
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.stretchTarget}
                    onChange={(e) => updateField("stretchTarget", e.target.value)}
                    className="w-full font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 text-sm outline-none focus:border-orange-500"
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Peak</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Target Value
              </label>
              <input
                type="number"
                step="any"
                value={formData.target}
                onChange={(e) => updateField("target", e.target.value)}
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Auditable Reason for Adjustment */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              {isCore ? "Auditable Reason for Target Correction (Required)" : "Change Reason (Optional)"}
            </label>
            <select
              value={formData.correctionReason}
              onChange={(e) => updateField("correctionReason", e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm bg-white text-slate-900 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select reason...</option>
              <option value="Calibration based on 14-day execution baseline">Calibration based on 14-day execution baseline</option>
              <option value="Operational capacity expansion (Upward stretch)">Operational capacity expansion (Upward stretch)</option>
              <option value="Temporary physical recovery or external constraint">Temporary physical recovery or external constraint</option>
              <option value="Quarterly milestone re-alignment">Quarterly milestone re-alignment</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {!isCore && editingInput ? (
              <button
                type="button"
                onClick={() => handleStatusAction(editingInput.status === "active" ? "paused" : "active")}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {editingInput.status === "active" ? "Pause Input" : "Resume Input"}
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                {isCore ? "Save Authorized Correction" : editingInput ? "Save Changes" : "Create Input"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
