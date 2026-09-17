"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, AlertTriangle, Check } from "lucide-react";

export default function SystemSettingsPage() {
  const router = useRouter();
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function fetchSystem() {
      const { data: systems } = await supabase
        .from("systems")
        .select("*")
        .eq("status", "active")
        .limit(1);
      if (systems && systems.length > 0) {
        setSystem(systems[0]);
        setStartDate(systems[0].start_date ? systems[0].start_date.split("T")[0] : new Date().toISOString().split("T")[0]);
      }
      setLoading(false);
    }
    fetchSystem();
  }, []);

  const handleUpdateStartDate = async () => {
    if (!system || !startDate) return;
    setSaving(true);
    const reviewDate = new Date(startDate);
    reviewDate.setDate(reviewDate.getDate() + 7);

    const { error } = await supabase
      .from("systems")
      .update({
        start_date: new Date(startDate).toISOString(),
        next_review_date: reviewDate.toISOString(),
        is_frozen: false,
      })
      .eq("id", system.id);

    setSaving(false);
    if (!error) {
      setSuccessMsg("Start date updated. Next review scheduled for " + reviewDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + ".");
    }
  };

  const handleResetSystem = async () => {
    if (!system) return;
    setResetting(true);
    // Archive current system
    await supabase.from("systems").update({ status: "archived" }).eq("id", system.id);
    setResetting(false);
    router.push("/system/new");
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!system) {
    return (
      <div className="max-w-xl py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">No Active System</h2>
        <p className="text-gray-500 mb-6">You need an active system to configure settings.</p>
        <Link href="/system/new" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white font-medium rounded-lg shadow-sm hover:bg-orange-700 transition-colors">
          Initialize System
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <Link href="/system" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to System
        </Link>
        <div className="text-sm font-medium text-orange-600 mb-2">System Configuration</div>
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">{system.name}</h1>
      </div>

      {/* Success message */}
      {successMsg && (
        <div className="mb-8 rounded-lg bg-green-50 p-4 border border-green-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Check className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMsg}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* START DATE SECTION */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <Calendar size={18} className="text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">System Start Date</h2>
            </div>
            <p className="text-sm text-gray-500">
              Change the official start date of your system. This will also reschedule your next mandatory review to 7 days from the new start date and unfreeze the system if it is currently frozen.
            </p>
          </div>

          <div className="px-6 py-6 bg-gray-50/50">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="block w-full sm:w-auto rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 transition-shadow"
              />
              <button
                onClick={handleUpdateStartDate}
                disabled={saving}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update Date"}
              </button>
            </div>

            {system.next_review_date && (
              <p className="text-sm text-gray-500 mt-4 flex items-center gap-2">
                <Calendar size={14} />
                Next review scheduled for: <span className="font-medium text-gray-900">{new Date(system.next_review_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </p>
            )}
          </div>
        </section>

        {/* RESET SYSTEM SECTION */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-1">
              <RefreshCw size={18} className="text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">Reset System</h2>
            </div>
            <p className="text-sm text-gray-500">
              Archive the current system and start fresh. All current data (goals, rocks, inputs, results) will be archived and you will be taken through the System Architect to build a new one.
            </p>
          </div>

          <div className="px-6 py-6 bg-gray-50/50">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center justify-center px-6 py-2.5 bg-white border border-gray-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors"
              >
                Archive &amp; Reset System
              </button>
            ) : (
              <div className="space-y-5">
                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Are you absolutely sure?</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Your current system will be archived (not deleted). You can still view its history. This action cannot be undone.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetSystem}
                    disabled={resetting}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
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
