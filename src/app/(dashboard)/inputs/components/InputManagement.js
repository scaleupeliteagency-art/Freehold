
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  LockKeyhole,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function InputManagement({
  isOpen,
  onClose,
  editingInput,
  onSave,
  context,
}) {
  const isCore = editingInput?.isCore === true;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "numeric",
    target: "",
    minimumTarget: "",
    normalTarget: "",
    stretchTarget: "",
    unit: "",
    frequency: "DAILY",
    weight: 10,
    change_reason: "",
  });

  useEffect(() => {
    if (editingInput) {
      const normal =
        editingInput.normalTarget ??
        editingInput.normal ??
        editingInput.target ??
        "";

      setFormData({
        name: editingInput.name || "",
        description: editingInput.description || "",
        type: editingInput.type || "numeric",
        target: editingInput.target ?? normal,
        minimumTarget:
          editingInput.minimumTarget ?? editingInput.minimum ?? "",
        normalTarget: normal,
        stretchTarget:
          editingInput.stretchTarget ?? editingInput.stretch ?? "",
        unit: editingInput.unit || "",
        frequency: (editingInput.frequency || "DAILY").toUpperCase(),
        weight: editingInput.weight ?? 10,
        change_reason: "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        type: "numeric",
        target: "",
        minimumTarget: "",
        normalTarget: "",
        stretchTarget: "",
        unit: "",
        frequency: "DAILY",
        weight: 10,
        change_reason: "",
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
      const minimum = Number(formData.minimumTarget);
      const normal = Number(formData.normalTarget || formData.target);
      const stretch = Number(formData.stretchTarget);

      if (
        formData.minimumTarget === "" ||
        formData.normalTarget === "" ||
        formData.stretchTarget === "" ||
        !Number.isFinite(minimum) ||
        !Number.isFinite(normal) ||
        !Number.isFinite(stretch) ||
        minimum < 0 ||
        normal < minimum ||
        stretch < normal
      ) {
        alert(
          "Enter valid targets with minimum ≤ normal ≤ stretch."
        );
        return;
      }

      onSave(
        {
          ...formData,
          name,
          isCore: true,
          target: normal,
          minimumTarget: minimum,
          normalTarget: normal,
          stretchTarget: stretch,
          weight: Number(formData.weight) || 0,
          frequency: formData.frequency,
        },
        editingInput,
        false
      );

      return;
    }

    if (
      formData.target === "" ||
      !Number.isFinite(Number(formData.target)) ||
      Number(formData.target) < 0
    ) {
      alert("Enter a valid non-negative target.");
      return;
    }

    if (editingInput && !formData.change_reason) {
      alert("Select a reason for changing this input.");
      return;
    }

    onSave(
      {
        ...formData,
        name,
        target: Number(formData.target),
        weight: Number(formData.weight) || 0,
        isCore: false,
        frequency: formData.frequency,
      },
      editingInput,
      false
    );
  };

  const handleStatusAction = (status) => {
    if (isCore) {
      alert(
        "Core inputs are permanent and cannot be archived, paused, or replaced. You can still edit their targets."
      );
      return;
    }

    onSave(
      {
        ...formData,
        status,
        isCore: false,
      },
      editingInput,
      true
    );
  };

  const fieldClass =
    "w-full rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

  const labelClass =
    "mb-1.5 block text-sm font-medium text-slate-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-orange-600/40 p-4 backdrop-blur-sm">
      <div className="relative my-8 w-full max-w-2xl rounded-2xl border border-slate-100 bg-white/95 p-6 shadow-xl backdrop-blur-xl sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
          aria-label="Close input management"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingInput
                ? isCore
                  ? "Edit Core Input"
                  : "Evolve Input"
                : "Add New Input"}
            </h2>

            {isCore && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800">
                <LockKeyhole className="h-3.5 w-3.5" />
                Permanent Core
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            {isCore
              ? "Adjust the input and its targets without removing its permanent core status."
              : "Translate strategy into operational behavior."}
          </p>
        </div>

        {/* Core protection notice */}
        {isCore && (
          <div className="mb-6 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-700" />

            <div>
              <p className="text-sm font-semibold text-orange-900">
                This input is protected
              </p>
              <p className="mt-1 text-sm text-orange-800">
                You can edit its name, description, frequency, measurement
                type, weight, and targets. Its core designation cannot be
                removed, and it cannot be archived or paused.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}
            <div className="md:col-span-2">
              <label className={labelClass}>Input Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                className={fieldClass}
                placeholder="e.g. Cold Calls"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className={fieldClass}
                placeholder="What exactly does this entail?"
              />
            </div>

            {/* Measurement Type */}
            <div>
              <label className={labelClass}>Measurement Type</label>
              <select
                value={formData.type}
                onChange={(event) =>
                  updateField("type", event.target.value)
                }
                className={fieldClass}
              >
                <option value="numeric">Numeric (Count)</option>
                <option value="duration">Duration (Time)</option>
                <option value="binary">Binary (Done/Not Done)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="currency">Currency</option>
                <option value="quantity">Quantity</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className={labelClass}>Frequency</label>
              <select
                value={formData.frequency}
                onChange={(event) =>
                  updateField("frequency", event.target.value)
                }
                className={fieldClass}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {/* Core target settings */}
            {isCore ? (
              <>
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <TargetIcon />
                    <h3 className="text-sm font-semibold text-slate-900">
                      Core Input Targets
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Minimum is the floor. Normal is the expected target.
                    Stretch is the ambitious target.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Minimum Target</label>
                  <input
                    required
                    min="0"
                    type="number"
                    value={formData.minimumTarget}
                    onChange={(event) =>
                      updateField("minimumTarget", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Normal Target</label>
                  <input
                    required
                    min="0"
                    type="number"
                    value={formData.normalTarget}
                    onChange={(event) => {
                      updateField("normalTarget", event.target.value);
                      updateField("target", event.target.value);
                    }}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Stretch Target</label>
                  <input
                    required
                    min="0"
                    type="number"
                    value={formData.stretchTarget}
                    onChange={(event) =>
                      updateField("stretchTarget", event.target.value)
                    }
                    className={fieldClass}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className={labelClass}>Target per Frequency</label>
                <input
                  required
                  min="0"
                  type="number"
                  value={formData.target}
                  onChange={(event) =>
                    updateField("target", event.target.value)
                  }
                  className={fieldClass}
                  placeholder="e.g. 20"
                />
              </div>
            )}

            {/* Unit */}
            <div>
              <label className={labelClass}>Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(event) =>
                  updateField("unit", event.target.value)
                }
                className={fieldClass}
                placeholder="e.g. calls, min, %"
              />
            </div>

            {/* Weight */}
            <div className="md:col-span-2">
              <label className={labelClass}>Weight (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.weight}
                onChange={(event) =>
                  updateField("weight", event.target.value)
                }
                className={fieldClass}
                placeholder="10"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Determines how much this input contributes to the daily
                execution score.
              </p>
            </div>

            {/* Change reason */}
            {editingInput && (
              <div className="mt-2 rounded-xl border border-orange-100 bg-orange-50 p-5 md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-orange-800">
                  Reason for Changing
                </label>

                <p className="mb-3 text-sm text-orange-700/80">
                  {isCore
                    ? "Record why this permanent core input is changing. Its identity and history should remain traceable."
                    : "You are modifying an active input. Your application should preserve its version history."}
                </p>

                <select
                  required
                  value={formData.change_reason}
                  onChange={(event) =>
                    updateField("change_reason", event.target.value)
                  }
                  className="w-full rounded-xl border border-orange-200 bg-white p-3 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="" disabled>
                    Select a reason...
                  </option>
                  <option value="Target was too easy">
                    Target was too easy
                  </option>
                  <option value="Target was unrealistic">
                    Target was unrealistic
                  </option>
                  <option value="Strategy changed">
                    Strategy changed
                  </option>
                  <option value="Circumstances changed">
                    Circumstances changed
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-slate-100 pt-6 md:flex-row">
            {editingInput && !isCore ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handleStatusAction("archived")}
                  className="rounded-lg bg-red-50 px-5 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  Archive
                </button>

                <button
                  type="button"
                  onClick={() => handleStatusAction("paused")}
                  className="rounded-lg bg-orange-50 px-5 py-2.5 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100"
                >
                  Pause
                </button>
              </div>
            ) : isCore ? (
              <div className="flex items-center gap-2 text-xs text-orange-800">
                <LockKeyhole className="h-4 w-4" />
                Archive and pause disabled
              </div>
            ) : (
              <div />
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
              >
                {editingInput
                  ? isCore
                    ? "Save Core Input"
                    : "Evolve Input"
                  : "Add Input"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function TargetIcon() {
  return <AlertTriangle className="h-4 w-4 text-orange-600" />;
}
