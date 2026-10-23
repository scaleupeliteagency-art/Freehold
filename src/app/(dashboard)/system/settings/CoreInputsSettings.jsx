
"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Plus, Save, Trash2, Target } from "lucide-react";

const createInput = () => ({
  id: crypto.randomUUID(),
  name: "",
  minimumTarget: 1,
  normalTarget: 3,
  stretchTarget: 5,
  frequency: "Daily",
  rockIndex: null,
  isCore: false,
});

const normalizeInput = (input) => ({
  id: input.id || crypto.randomUUID(),
  name: input.name || "",
  minimumTarget: input.minimumTarget ?? input.minimum ?? 1,
  normalTarget: input.normalTarget ?? input.normal ?? 3,
  stretchTarget: input.stretchTarget ?? input.stretch ?? 5,
  frequency: input.frequency || "Daily",
  rockIndex: input.rockIndex ?? null,
  isCore: input.isCore === true,
});

export default function CoreInputsSettings({
  supabase,
  system,
  onSaved,
}) {
  const [inputs, setInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setInputs(
      Array.isArray(system?.inputs)
        ? system.inputs.map(normalizeInput)
        : []
    );
    setLoading(false);
  }, [system?.id, system?.inputs]);

  const coreInputs = inputs.filter((input) => input.isCore);
  const remainingSlots = 3 - coreInputs.length;

  function updateInput(id, field, value) {
    setInputs((current) =>
      current.map((input) =>
        input.id === id ? { ...input, [field]: value } : input
      )
    );
    setError("");
    setSuccess("");
  }

  function toggleCore(id, checked) {
    const input = inputs.find((item) => item.id === id);

    // Once designated, core inputs cannot be unassigned here.
    if (input?.isCore && !checked) return;

    if (checked && coreInputs.length >= 3) {
      setError("You can have exactly three core inputs.");
      return;
    }

    updateInput(id, "isCore", checked);
  }

  function addInput(makeCore = false) {
    if (makeCore && coreInputs.length >= 3) {
      setError("You already have three core inputs.");
      return;
    }

    setInputs((current) => [
      ...current,
      { ...createInput(), isCore: makeCore },
    ]);
    setError("");
    setSuccess("");
  }

  function removeInput(id) {
    const input = inputs.find((item) => item.id === id);

    if (input?.isCore) {
      setError("Core inputs cannot be deleted.");
      return;
    }

    setInputs((current) => current.filter((item) => item.id !== id));
    setError("");
    setSuccess("");
  }

  async function handleSave() {
    setError("");
    setSuccess("");

    if (!system?.id) {
      setError("No active system was found.");
      return;
    }

    if (coreInputs.length !== 3) {
      setError(
        `Designate exactly three core inputs before saving. Currently: ${coreInputs.length}/3.`
      );
      return;
    }

    const invalidInput = inputs.find(
      (input) =>
        !input.name.trim() ||
        !Number.isFinite(Number(input.minimumTarget)) ||
        !Number.isFinite(Number(input.normalTarget)) ||
        !Number.isFinite(Number(input.stretchTarget)) ||
        Number(input.minimumTarget) < 0 ||
        Number(input.normalTarget) < Number(input.minimumTarget) ||
        Number(input.stretchTarget) < Number(input.normalTarget)
    );

    if (invalidInput) {
      setError(
        `Check "${invalidInput.name || "unnamed input"}": enter a name and ensure 0 ≤ minimum ≤ normal ≤ stretch.`
      );
      return;
    }

    const normalizedInputs = inputs.map((input) => ({
      ...input,
      name: input.name.trim(),
      minimumTarget: Number(input.minimumTarget),
      normalTarget: Number(input.normalTarget),
      stretchTarget: Number(input.stretchTarget),
    }));

    setSaving(true);

    try {
      const { error: saveError } = await supabase
        .from("systems")
        .update({ inputs: normalizedInputs })
        .eq("id", system.id);

      if (saveError) throw saveError;

      setInputs(normalizedInputs);
      onSaved?.({ ...system, inputs: normalizedInputs });
      setSuccess("Core inputs and targets saved.");
    } catch (err) {
      console.error("Failed to save core inputs:", err);
      setError(
        err?.message ||
          "Could not save the inputs. Check your database schema and permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading inputs...</p>;
  }

  return (
    <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <Target size={22} />
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Core Inputs
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Define the three daily execution inputs your system depends on.
            Their targets can change, but core inputs cannot be deleted.
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200">
          {coreInputs.length}/3
        </span>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <strong>Rule:</strong> Exactly three inputs must be designated as core.
        You can edit their names and targets, but their core status is permanent.
      </div>

      <div className="space-y-4">
        {inputs.map((input) => (
          <div
            key={input.id}
            className={`space-y-4 rounded-xl border p-4 ${
              input.isCore
                ? "border-blue-300 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/20"
                : "border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Input name
                </label>
                <input
                  value={input.name}
                  onChange={(e) =>
                    updateInput(input.id, "name", e.target.value)
                  }
                  placeholder="e.g. Sales calls completed"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-7">
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={input.isCore}
                    disabled={input.isCore}
                    onChange={(e) => toggleCore(input.id, e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Core
                  </span>
                </label>

                {input.isCore ? (
                  <LockKeyhole
                    size={17}
                    className="text-blue-700 dark:text-blue-300"
                    aria-label="Permanent core input"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeInput(input.id)}
                    title="Delete input"
                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Frequency
                </label>
                <select
                  value={input.frequency}
                  onChange={(e) =>
                    updateInput(input.id, "frequency", e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  {["Daily", "Weekly", "Monthly"].map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {frequency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Minimum target
                </label>
                <input
                  type="number"
                  min="0"
                  value={input.minimumTarget}
                  onChange={(e) =>
                    updateInput(
                      input.id,
                      "minimumTarget",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Normal target
                </label>
                <input
                  type="number"
                  min="0"
                  value={input.normalTarget}
                  onChange={(e) =>
                    updateInput(
                      input.id,
                      "normalTarget",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  Stretch target
                </label>
                <input
                  type="number"
                  min="0"
                  value={input.stretchTarget}
                  onChange={(e) =>
                    updateInput(
                      input.id,
                      "stretchTarget",
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
              </div>
            </div>

            {input.isCore && (
              <p className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                <LockKeyhole size={13} />
                Core input — permanent designation
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addInput(remainingSlots > 0)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          <Plus size={16} />
          {remainingSlots > 0 ? "Add core input" : "Add extra input"}
        </button>

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={() => addInput(false)}
            className="rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white"
          >
            Add non-core input
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {success && (
        <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          {success}
        </p>
      )}

      <div className="flex justify-end border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save core inputs"}
        </button>
      </div>
    </section>
  );
}
