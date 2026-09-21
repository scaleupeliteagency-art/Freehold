"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import TimeTracker from "./components/TimeTracker";
import TimeCharts from "./components/TimeCharts";

import ActiveTimerScreen from "./components/ActiveTimerScreen";

const getLocalISODate = (d = new Date()) => {
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

export default function TimeTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [inputs, setInputs] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTimer, setActiveTimer] = useState(null);

  const getLocalEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase.from('profiles').select('preferences').eq('user_id', user.id).single();
      if (data?.preferences?.time_entries) {
        return data.preferences.time_entries;
      }
    } catch {}
    return [];
  };

  const saveLocalEntries = async (entries) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase.from('profiles').select('preferences').eq('user_id', user.id).single();
      const prefs = data?.preferences || {};
      prefs.time_entries = entries;
      
      await supabase.from('profiles').update({ preferences: prefs }).eq('user_id', user.id);
      setTimeEntries(entries);
    } catch {}
  };

  const fetchData = async () => {
    try {
      const { data: systems } = await supabase
        .from("systems")
        .select("id, status")
        .in("status", ["active", "scheduled"])
        .limit(1);

      if (!systems || systems.length === 0) {
        setLoading(false);
        return;
      }
      
      const activeSystem = systems[0];

      const { data: inputDefs } = await supabase
        .from("input_definitions")
        .select("*")
        .eq("system_id", activeSystem.id)
        .eq("active_status", true);

      setInputs(inputDefs || []);

      const entries = await getLocalEntries();
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const minDate = getLocalISODate(thirtyDaysAgo);
      
      const filtered = entries
        .filter(e => e.date >= minDate)
        .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

      setTimeEntries(filtered);
      
      const active = entries.find(e => e.end_time === null);
      if (active) {
        setActiveTimer({
          id: active.id,
          input_definition_id: active.input_definition_id,
          startTime: new Date(active.start_time)
        });
      }

    } catch (err) {
      console.error(err);
      alert("Error loading time tracking data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartTimer = async (inputId) => {
    const todayStr = getLocalISODate(new Date());
    const startTime = new Date().toISOString();
    
    const newEntry = {
      id: crypto.randomUUID(),
      input_definition_id: inputId,
      date: todayStr,
      start_time: startTime,
      end_time: null,
      duration_minutes: 0
    };

    const entries = await getLocalEntries();
    entries.push(newEntry);
    await saveLocalEntries(entries);

    setActiveTimer({
      id: newEntry.id,
      input_definition_id: inputId,
      startTime: new Date(startTime)
    });
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    
    const endTime = new Date();
    const durationMinutes = Math.round((endTime - activeTimer.startTime) / 60000);
    
    const entries = await getLocalEntries();
    const updated = entries.map(e => {
      if (e.id === activeTimer.id) {
        return { ...e, end_time: endTime.toISOString(), duration_minutes: durationMinutes };
      }
      return e;
    });

    await saveLocalEntries(updated);
    setActiveTimer(null);
  };
  
  const handleManualAdd = async (inputId, date, durationMinutes) => {
    const newEntry = {
      id: crypto.randomUUID(),
      input_definition_id: inputId,
      date: date,
      start_time: new Date(date).toISOString(),
      end_time: new Date(new Date(date).getTime() + durationMinutes * 60000).toISOString(),
      duration_minutes: durationMinutes
    };

    const entries = await getLocalEntries();
    entries.push(newEntry);
    await saveLocalEntries(entries);
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><div className="text-sm font-medium animate-pulse text-orange-500">Loading Time Tracking...</div></div>;
  }

  // If a timer is currently active, show the full-screen counting page
  if (activeTimer) {
    const activeInput = inputs.find(i => i.id === activeTimer.input_definition_id);
    return (
      <div className="w-full h-full pb-24">
        <ActiveTimerScreen 
          activeTimer={activeTimer} 
          inputName={activeInput?.name || "Unknown"}
          onStop={handleStopTimer}
        />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Time Tracking</h1>
        <p className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        <p className="text-sm text-slate-500 mt-2">Log and analyze where your time is going based on your active inputs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <TimeTracker 
            inputs={inputs} 
            activeTimer={activeTimer}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
            onManualAdd={handleManualAdd}
          />
        </div>
        <div className="lg:col-span-2">
          <TimeCharts entries={timeEntries} inputs={inputs} />
        </div>
      </div>
    </div>
  );
}
