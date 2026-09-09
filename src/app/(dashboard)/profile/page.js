"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, Medal, Save, ShieldCheck, Target, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const tabs = [
  { id: "personal", label: "Personal info", icon: UserRound },
  { id: "password", label: "Change password", icon: LockKeyhole },
  { id: "leaderboard", label: "Leaderboard", icon: Medal }
];

const getDisplayName = (profile, user) => profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "User";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setUser(currentUser);
      const { data: currentProfile } = await supabase
        .from("profiles")
        .select("name, timezone")
        .eq("user_id", currentUser.id)
        .single();
      setProfile(currentProfile);
      setName(getDisplayName(currentProfile, currentUser));
      setTimezone(currentProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setLoading(false);
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTab !== "leaderboard") return;

    const loadLeaderboard = async () => {
      setError("");
      const { data, error: leaderboardError } = await supabase.rpc("get_goal_leaderboard");
      if (leaderboardError) {
        setError("The leaderboard is not available yet. Apply the latest database migration to enable it.");
        return;
      }
      setLeaderboard(data || []);
    };

    loadLeaderboard();
  }, [activeTab]);

  const savePersonalInfo = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name: name.trim(), timezone: timezone.trim() || null, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) setError(updateError.message);
    else {
      setProfile((current) => ({ ...current, name: name.trim(), timezone: timezone.trim() }));
      setMessage("Personal information saved.");
    }
    setSaving(false);
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordError) setError(passwordError.message);
    else {
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    }
    setSaving(false);
  };

  const displayName = getDisplayName(profile, user);
  const currentUserRank = leaderboard.find((entry) => entry.user_id === user?.id);

  if (loading) return <div className="text-xs font-mono uppercase tracking-widest text-ink/50 animate-pulse">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="border-b border-divider pb-8 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-ochre mb-3">Account / Identity</p>
          <h1 className="text-4xl font-serif font-bold uppercase tracking-tight">Your profile</h1>
          <p className="text-sm text-ink/60 mt-3">Keep your identity, access, and progress in one place.</p>
        </div>
        <div className="flex items-center gap-3 border border-divider bg-white px-4 py-3">
          <div className="w-9 h-9 bg-ink text-paper flex items-center justify-center font-serif font-bold">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <div className="text-sm font-bold">{displayName}</div>
            <div className="text-[10px] text-ink/50 font-mono">{user?.email}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 border-b border-divider mb-8 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => { setActiveTab(id); setMessage(""); setError(""); }} className={`shrink-0 flex items-center gap-2 px-4 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === id ? "border-ochre text-ink" : "border-transparent text-ink/40 hover:text-ink"}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {message && <div className="mb-6 border border-moss/30 bg-moss/5 px-4 py-3 text-xs text-moss">{message}</div>}
      {error && <div className="mb-6 border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

      {activeTab === "personal" && (
        <form onSubmit={savePersonalInfo} className="border border-divider bg-white p-6 md:p-10">
          <div className="flex items-center gap-3 border-b border-divider pb-5 mb-8"><UserRound size={20} className="text-ochre" /><div><h2 className="text-xl font-serif font-bold">Personal information</h2><p className="text-xs text-ink/50 mt-1">This is how your identity appears across the ledger.</p></div></div>
          <div className="grid md:grid-cols-2 gap-6">
            <label className="block"><span className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Full name</span><input value={name} onChange={(event) => setName(event.target.value)} required className="w-full bg-paper border border-divider px-4 py-3 text-sm focus:outline-none focus:border-ink" /></label>
            <label className="block"><span className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Email address</span><input value={user?.email || ""} readOnly className="w-full bg-paper/60 border border-divider px-4 py-3 text-sm text-ink/50 cursor-not-allowed" /></label>
            <label className="block"><span className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Timezone</span><input value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Africa/Casablanca" className="w-full bg-paper border border-divider px-4 py-3 text-sm font-mono focus:outline-none focus:border-ink" /></label>
          </div>
          <button type="submit" disabled={saving} className="mt-8 flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-ochre hover:text-ink transition-colors disabled:opacity-50"><Save size={14} /> {saving ? "Saving..." : "Save changes"}</button>
        </form>
      )}

      {activeTab === "password" && (
        <form onSubmit={changePassword} className="border border-divider bg-white p-6 md:p-10 max-w-2xl">
          <div className="flex items-center gap-3 border-b border-divider pb-5 mb-8"><ShieldCheck size={20} className="text-ochre" /><div><h2 className="text-xl font-serif font-bold">Change password</h2><p className="text-xs text-ink/50 mt-1">Use a password you do not reuse elsewhere.</p></div></div>
          <div className="space-y-5">
            <label className="block"><span className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">New password</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required className="w-full bg-paper border border-divider px-4 py-3 text-sm focus:outline-none focus:border-ink" /></label>
            <label className="block"><span className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Confirm new password</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className="w-full bg-paper border border-divider px-4 py-3 text-sm focus:outline-none focus:border-ink" /></label>
          </div>
          <button type="submit" disabled={saving} className="mt-8 flex items-center gap-2 bg-ink text-paper px-5 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-ochre hover:text-ink transition-colors disabled:opacity-50"><LockKeyhole size={14} /> {saving ? "Updating..." : "Update password"}</button>
        </form>
      )}

      {activeTab === "leaderboard" && (
        <div>
          <div className="flex items-end justify-between mb-6"><div><div className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-2">Collective progress</div><h2 className="text-2xl font-serif font-bold">Closest to the finish</h2><p className="text-sm text-ink/60 mt-2">Members are ranked by how close they are to their targets.</p></div>{currentUserRank && <div className="text-right"><div className="text-[10px] uppercase tracking-widest text-ink/50">Your rank</div><div className="text-3xl font-serif font-bold">#{currentUserRank.rank}</div></div>}</div>
          <div className="border border-divider bg-white overflow-hidden">
            {leaderboard.length === 0 ? <div className="p-10 text-center text-sm text-ink/50">No goal progress has been recorded yet.</div> : leaderboard.map((entry, index) => (
              <div key={entry.user_id} className={`flex items-center gap-4 px-5 py-5 border-b border-divider last:border-0 ${entry.user_id === user?.id ? "bg-ochre/5" : ""}`}>
                <div className={`w-8 h-8 flex items-center justify-center font-mono text-xs font-bold ${index < 3 ? "bg-ochre text-paper" : "bg-paper text-ink/60"}`}>{entry.rank}</div>
                <div className="w-9 h-9 bg-ink text-paper flex items-center justify-center font-serif font-bold">{entry.display_name.charAt(0).toUpperCase()}</div>
                <div className="min-w-0 flex-1"><div className="font-bold text-sm truncate">{entry.display_name}{entry.user_id === user?.id && <span className="ml-2 text-[9px] uppercase tracking-widest text-ochre">You</span>}</div></div>
                <div className="font-mono text-lg font-bold text-ochre">{entry.progress}%</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 text-[10px] text-ink/50 uppercase tracking-widest"><Target size={14} className="text-ochre" /> Progress is measured against each member's primary north-star target.</div>
        </div>
      )}
    </div>
  );
}