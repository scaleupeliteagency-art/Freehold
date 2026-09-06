"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Calendar, AlertTriangle } from "lucide-react";

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
        <div className="text-sm animate-pulse uppercase tracking-widest text-ink/50">Loading...</div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="max-w-xl py-12">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-6" />
        <p className="text-ink/70 mb-6">You need an active system to configure settings.</p>
        <Link href="/system/new" className="border border-ink text-ink px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors">
          Initialize System
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <Link href="/system" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink transition-colors mb-6">
          <ArrowLeft size={12} /> Back to System
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">System Configuration</div>
        <h1 className="text-3xl font-serif font-bold text-ink uppercase">{system.name}</h1>
      </div>

      <hr className="border-divider mb-10" />

      {/* Success message */}
      {successMsg && (
        <div className="mb-8 border-l-2 border-moss pl-4 py-2">
          <p className="text-sm text-ink font-medium">{successMsg}</p>
        </div>
      )}

      {/* START DATE SECTION */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Calendar size={16} className="text-ochre" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink">System Start Date</h2>
        </div>
        <p className="text-sm text-ink/60 mb-6 leading-relaxed pl-7">
          Change the official start date of your system. This will also reschedule your next mandatory review to 7 days from the new start date and unfreeze the system if it is currently frozen.
        </p>

        <div className="border border-divider bg-white p-6 pl-7">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Start Date</label>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-paper border border-divider text-ink font-mono text-sm py-2 px-4 focus:outline-none focus:border-ink transition-colors"
            />
            <button
              onClick={handleUpdateStartDate}
              disabled={saving}
              className="bg-ink text-paper px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update →"}
            </button>
          </div>

          {system.next_review_date && (
            <p className="text-xs text-ink/50 mt-3 font-mono">
              Next review: {new Date(system.next_review_date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          )}
        </div>
      </section>

      <hr className="border-divider mb-10" />

      {/* RESET SYSTEM SECTION */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <RefreshCw size={16} className="text-ink/50" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-ink">Reset System</h2>
        </div>
        <p className="text-sm text-ink/60 mb-6 leading-relaxed pl-7">
          Archive the current system and start fresh. All current data (goals, rocks, inputs, results) will be archived and you will be taken through the System Architect to build a new one.
        </p>

        <div className="border border-divider p-6 pl-7">
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="border border-divider text-ink/60 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-ink hover:text-ink transition-colors"
            >
              Archive &amp; Reset System
            </button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-3 border border-ochre/40 bg-ochre/5 p-4">
                <AlertTriangle size={16} className="text-ochre shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-ink mb-1">Are you sure?</p>
                  <p className="text-xs text-ink/60">Your current system will be archived (not deleted). You can still view its history. This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="border border-divider text-ink/60 px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-ink hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetSystem}
                  disabled={resetting}
                  className="bg-ink text-paper px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors disabled:opacity-50"
                >
                  {resetting ? "Archiving..." : "Confirm Reset →"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="border-divider" />
    </div>
  );
}
