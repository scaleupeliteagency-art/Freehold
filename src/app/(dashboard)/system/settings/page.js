
"use client";

import { useState, useEffect } from "react";
import CoreInputsSettings from "./CoreInputsSettings";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  AlertTriangle,
  Check,
} from "lucide-react";

export default function SystemSettingsPage() {
  const router = useRouter();

  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSystem() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("systems")
        .select("*")
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error("Failed to load active system:", error);
        setLoadError(error.message || "Could not load your active system.");
      } else if (data) {
        setSystem(data);
        setStartDate(
          data.start_date
            ? data.start_date.split("T")[0]
            : new Date().toISOString().split("T")[0]
        );
      }

      setLoading(false);
    }

    fetchSystem();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateStartDate = async () => {
    if (!system || !startDate) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const start = new Date(`${startDate}T00:00:00`);
    const reviewDate = new Date(start);
    reviewDate.setDate(reviewDate.getDate() + 7);

    const { error } = await supabase
      .from("systems")
      .update({
        start_date: start.toISOString(),
        next_review_date: reviewDate.toISOString(),
        is_frozen: false,
      })
      .eq("id", system.id);

    setSaving(false);

    if (error) {
      console.error("Failed to update system start date:", error);
      setErrorMsg(error.message || "Could not update the start date.");
      return;
    }

    setSystem((current) =>
      current
        ? {
            ...current,
            start_date: start.toISOString(),
            next_review_date: reviewDate.toISOString(),
            is_frozen: false,
          }
        : current
    );

    setSuccessMsg(
      "Start date updated. Next review scheduled for " +
        reviewDate.toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }) +
        "."
    );
  };

  const handleResetSystem = async () => {
    if (!system) return;

    setResetting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const { error } = await supabase
      .from("systems")
      .update({ status: "archived" })
      .eq("id", system.id);

    setResetting(false);

    if (error) {
      console.error("Failed to archive system:", error);
      setErrorMsg(error.message || "Could not archive the current system.");
      return;
    }

    router.push("/system/new");
  };

  const handleInputsSaved = (updatedSystem) => {
    setSystem((current) =>
      current
        ? { ...current, inputs: updatedSystem.inputs }
        : updatedSystem
    );

    setSuccessMsg("Core inputs saved successfully.");
    setErrorMsg("");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-orange-500" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl py-12">
        <h2 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900">
          Could not load settings
        </h2>
        <p className="mb-6 text-sm text-red-600">{loadError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gray-900 px-5 py-2.5 font-medium text-white hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="max-w-xl py-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">
          No Active System
        </h2>
        <p className="mb-6 text-gray-500">
          You need an active system to configure settings.
        </p>
        <Link
          href="/system/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-orange-700"
        >
          Initialize System
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/system"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to System
        </Link>

        <div className="mb-2 text-sm font-medium text-orange-600">
          System Configuration
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          {system.name}
        </h1>
      </div>

      {/* Success message */}
      {successMsg && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
        >
          <div className="flex items-start gap-3">
            <Check
              className="mt-0.5 h-5 w-5 shrink-0 text-green-600"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-green-800">
              {successMsg}
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {errorMsg && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
              aria-hidden="true"
            />
            <p className="text-sm text-red-800">{errorMsg}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* CORE INPUTS SECTION */}
        <CoreInputsSettings
          supabase={supabase}
          system={system}
          onSaved={handleInputsSaved}
        />

        {/* START DATE SECTION */}
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="mb-1 flex items-center gap-3">
              <Calendar size={18} className="text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                System Start Date
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              Change the official start date of your system. The next
              mandatory review will be scheduled for seven days after the
              selected date, and the system will be unfrozen.
            </p>
          </div>

          <div className="bg-gray-50/50 px-6 py-6">
            <label
              htmlFor="system-start-date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>

            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                id="system-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 transition-shadow focus:border-orange-500 focus:ring-2 focus:ring-orange-500 sm:w-auto"
              />

              <button
                type="button"
                onClick={handleUpdateStartDate}
                disabled={saving || !startDate}
                className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-6 py-2.5 font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Date"}
              </button>
            </div>

            {system.next_review_date && (
              <p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                Next review scheduled for:
                <span className="font-medium text-gray-900">
                  {new Date(system.next_review_date).toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </span>
              </p>
            )}
          </div>
        </section>

        {/* RESET SYSTEM SECTION */}
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="mb-1 flex items-center gap-3">
              <RefreshCw size={18} className="text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Reset System
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              Archive the current system and start fresh. Your current
              system will be archived, and you will be taken through the
              System Architect to build a new one.
            </p>
          </div>

          <div className="bg-gray-50/50 px-6 py-6">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-6 py-2.5 font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                Archive &amp; Reset System
              </button>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Are you absolutely sure?
                      </h3>

                      <p className="mt-2 text-sm text-red-700">
                        Your current system will be archived, not deleted.
                        This action cannot be undone from this screen.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    disabled={resetting}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSystem}
                    disabled={resetting}
                    className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    {resetting ? "Archiving..." : "Yes, Archive & Reset"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
