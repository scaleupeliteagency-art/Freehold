
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useSystemCreationStore from "@/lib/store/useSystemCreationStore";
import {
  Plus,
  Trash2,
  ShieldCheck,
  LockKeyhole,
  Target,
} from "lucide-react";

const createCoreInput = (index) => ({
  id: `core-input-${index + 1}`,
  name: "",
  minimumTarget: "",
  normalTarget: "",
  stretchTarget: "",
  frequency: "DAILY",
  rockIndex: 0,
  isCore: true,
});

const createOptionalInput = () => ({
  name: "",
  minimumTarget: "",
  normalTarget: "",
  stretchTarget: "",
  frequency: "DAILY",
  rockIndex: 0,
  isCore: false,
});

export default function Step4Inputs() {
  const { inputs, setInputs, setStep, roadmap } =
    useSystemCreationStore();

  // Always preserve the first three core inputs.
  // Existing optional inputs remain available.
  const defaultInputs =
    inputs && inputs.length > 0
      ? [
          ...Array.from({ length: 3 }, (_, index) => {
            const existingCore = inputs.find(
              (input) =>
                input.isCore &&
                input.id === `core-input-${index + 1}`
            );

            // Backward compatibility with previously saved systems:
            // use the first three existing inputs if no core IDs exist.
            const legacyInput =
              inputs.some((input) => input.isCore)
                ? undefined
                : inputs[index];

            return {
              ...createCoreInput(index),
              ...(existingCore || legacyInput || {}),
              id: `core-input-${index + 1}`,
              isCore: true,
            };
          }),
          ...inputs
            .filter((input) => !input.isCore)
            .filter((input) => !/^core-input-[1-3]$/.test(input.id || ""))
            .map((input) => ({
              ...input,
              isCore: false,
            })),
        ]
      : [
          createCoreInput(0),
          createCoreInput(1),
          createCoreInput(2),
        ];

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { inputs: defaultInputs },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "inputs",
  });

  // Keep the form synchronized if the store is hydrated after mount.
  useEffect(() => {
    reset({ inputs: defaultInputs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs, reset]);

  const coreFields = fields.slice(0, 3);
  const optionalFields = fields.slice(3);

  const onSubmit = (data) => {
    const normalizedInputs = data.inputs.map((input, index) => ({
      ...input,
      id:
        index < 3
          ? `core-input-${index + 1}`
          : input.id,
      isCore: index < 3,
      minimumTarget:
        input.minimumTarget === ""
          ? ""
          : Number(input.minimumTarget),
      normalTarget:
        input.normalTarget === ""
          ? ""
          : Number(input.normalTarget),
      stretchTarget:
        input.stretchTarget === ""
          ? ""
          : Number(input.stretchTarget),
      rockIndex: Number(input.rockIndex ?? 0),
    }));

    setInputs(normalizedInputs);
    setStep(5);
  };

  const inputCard = (item, index, isCore) => (
    <div
      key={item.id}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        isCore
          ? "border-orange-200 bg-gradient-to-br from-orange-50/80 to-white shadow-sm"
          : "border-gray-200 bg-white shadow-sm"
      }`}
    >
      {isCore && (
        <div className="absolute left-0 top-0 h-full w-1 bg-orange-500" />
      )}

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isCore
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isCore ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Target className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {isCore
                  ? `Core Input ${index + 1}`
                  : `Optional Input ${index - 2}`}
              </span>

              {isCore && (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-white px-2 py-1 text-[10px] font-semibold text-orange-700">
                  <LockKeyhole className="h-3 w-3" />
                  Permanent
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-gray-500">
              {isCore
                ? "A permanent execution metric. You can adjust its targets, but it cannot be removed."
                : "An additional metric you can remove whenever it is no longer useful."}
            </p>
          </div>
        </div>

        {!isCore && (
          <button
            type="button"
            onClick={() => remove(index)}
            aria-label={`Remove optional input ${index - 2}`}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="mb-5">
        <label className="mb-2 block text-xs font-semibold text-gray-600">
          Input name
        </label>
        <input
          type="text"
          {...register(`inputs.${index}.name`, {
            required: "Give this input a name.",
            validate: (value) =>
              value.trim().length > 0 || "Give this input a name.",
          })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base font-semibold text-gray-900 outline-none transition-all placeholder:font-normal placeholder:text-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder={
            isCore
              ? "e.g. Sales calls"
              : "e.g. Follow-up messages"
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600">
            Connected Rock
          </label>
          <select
            {...register(`inputs.${index}.rockIndex`, {
              required: true,
              valueAsNumber: true,
            })}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            {(roadmap?.rocks || []).map((rock, rockIndex) => (
              <option key={rockIndex} value={rockIndex}>
                {rock.name || `Rock ${rockIndex + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-600">
            Frequency
          </label>
          <select
            {...register(`inputs.${index}.frequency`, {
              required: true,
            })}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
          </select>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Target volume
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-3">
            <label className="mb-2 block text-xs font-semibold text-red-700">
              Minimum
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register(`inputs.${index}.minimumTarget`, {
                required: "Set a minimum target.",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Target cannot be negative.",
                },
              })}
              className="w-full rounded-lg border border-red-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder="10"
            />
            <p className="mt-1.5 text-[11px] text-red-700/80">
              Bare minimum
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3">
            <label className="mb-2 block text-xs font-semibold text-blue-700">
              Normal
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register(`inputs.${index}.normalTarget`, {
                required: "Set a normal target.",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Target cannot be negative.",
                },
              })}
              className="w-full rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="20"
            />
            <p className="mt-1.5 text-[11px] text-blue-700/80">
              Standard commitment
            </p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50/60 p-3">
            <label className="mb-2 block text-xs font-semibold text-green-700">
              Stretch
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register(`inputs.${index}.stretchTarget`, {
                setValueAs: (value) =>
                  value === "" ? "" : Number(value),
                min: {
                  value: 0,
                  message: "Target cannot be negative.",
                },
              })}
              className="w-full rounded-lg border border-green-100 bg-white px-3 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              placeholder="30"
            />
            <p className="mt-1.5 text-[11px] text-green-700/80">
              High-performance target
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-7">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
          <ShieldCheck className="h-4 w-4" />
          Permanent execution standards
        </div>

        <h2 className="mb-2 text-2xl font-semibold tracking-tight text-gray-900">
          Define Your Core Inputs
        </h2>

        <p className="max-w-2xl text-sm leading-relaxed text-gray-500">
          Choose three actions that consistently drive your Rocks forward.
          Their names and targets can evolve, but the three core input slots
          remain part of your system for its entire lifecycle.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/60 px-3 py-3"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-xs font-bold text-orange-700">
              {number}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-800">
                Core Input {number}
              </p>
              <p className="text-[10px] text-gray-500">Permanent</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {coreFields.map((item, index) =>
          inputCard(item, index, true)
        )}

        {optionalFields.length > 0 && (
          <div className="pt-4">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900">
                Additional Inputs
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Optional supporting activities. These can be removed without
                affecting your three core inputs.
              </p>
            </div>

            <div className="space-y-4">
              {optionalFields.map((item, index) =>
                inputCard(item, index + 3, false)
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => append(createOptionalInput())}
          className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-5 text-gray-500 transition-all hover:border-orange-400 hover:bg-orange-50/50 hover:text-orange-700"
        >
          <Plus className="mb-2 h-5 w-5" />
          <span className="text-sm font-semibold">Add Optional Input</span>
          <span className="mt-1 text-xs">
            Add supporting activities without changing your core three
          </span>
        </button>

        <hr className="border-gray-100" />

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={() => setStep(3)}
            className="rounded-xl border border-gray-200 bg-white px-6 py-3 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            Back
          </button>

          <button
            type="submit"
            className="rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-orange-700"
          >
            Preview System
          </button>
        </div>
      </form>
    </div>
  );
}
