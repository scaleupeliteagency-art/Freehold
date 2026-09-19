"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export function useDashboardEngine() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    system: null,
    isFrozen: false,
    nextReviewDate: null,
    hero: null,
    yearly: null,
    quarterly: null,
    milestone: null,
    execution: null,
    momentum: null,
    results: null,
    gap: null,
    mattersNow: null,
    checkpoints: null,
    evolution: null,
    timeTracking: null
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("*")
          .in("status", ["active", "scheduled"])
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }
        let system = systems[0];
        
        const now = new Date();
        const startDate = new Date(system.start_date);
        startDate.setHours(0,0,0,0);
        now.setHours(0,0,0,0);

        if (system.status === 'scheduled' && startDate <= now) {
            await supabase.from("systems").update({ status: 'active' }).eq('id', system.id);
            system.status = 'active';
        }

        const isFrozen = system.is_frozen === true || 
          (system.next_review_date && new Date(system.next_review_date) < now);

        // Fetch Data
        const [
          { data: goals },
          { data: quarters },
          { data: allInputs },
          { data: entries },
          { data: resultDefs },
          { data: sysVersions }
        ] = await Promise.all([
          supabase.from("north_star_goals").select("*").eq("system_id", system.id),
          supabase.from("quarters").select("*, year_plans!inner(system_id), monthly_rocks(*, weekly_milestones(*))").eq("year_plans.system_id", system.id).eq("status", "active").limit(1),
          supabase.from("input_definitions").select("*").eq("system_id", system.id),
          supabase.from("daily_input_entries").select("*, input_definitions!inner(system_id)").eq("input_definitions.system_id", system.id).gte("date", new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
          supabase.from("result_definitions").select("*, result_records(*)").eq("system_id", system.id),
          supabase.from("system_versions").select("*").eq("system_id", system.id).order('created_at', { ascending: false }).limit(2)
        ]);

        let timeEntriesLocal = [];
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase.from('profiles').select('preferences').eq('user_id', user.id).single();
            if (data?.preferences?.time_entries) {
              timeEntriesLocal = data.preferences.time_entries;
            }
          }
        } catch(e) {}
        
        const timeEntries = timeEntriesLocal;

        const primaryGoal = goals?.length > 0 ? goals[0] : null;
        const secondaryGoal = goals?.length > 1 ? goals[1] : null;

        const quarter = quarters?.[0] || null;
        const rocks = quarter?.monthly_rocks || [];
        const activeRock = rocks.find(r => r.status === 'active') || rocks[0] || null;
        const milestones = activeRock?.weekly_milestones || [];
        const activeMilestone = milestones.find(m => m.status === 'active') || milestones[0] || null;

        // 1. HERO
        let hero = null;
        let gapObj = { fiveYear: null, yearly: null, quarterly: null, milestone: null };
        if (primaryGoal) {
          const cv = primaryGoal.current_value || 0;
          const tv = primaryGoal.target_value || 1;
          const rem = Math.max(0, tv - cv);
          const pct = tv > 0 ? (cv / tv) * 100 : 0;
          
          let currentPace = 0;
          let reqPace = 0;
          const elapsedMs = now.getTime() - startDate.getTime();
          const elapsedMonths = elapsedMs / (1000 * 60 * 60 * 24 * 30);
          if (elapsedMonths > 0) currentPace = cv / elapsedMonths;
          
          if (primaryGoal.deadline) {
            const dl = new Date(primaryGoal.deadline);
            const remMs = dl.getTime() - now.getTime();
            const remMonths = remMs / (1000 * 60 * 60 * 24 * 30);
            if (remMonths > 0) reqPace = rem / remMonths;
          }

          hero = {
            primary: { name: primaryGoal.name, current: cv, target: tv, remaining: rem, pct, unit: primaryGoal.unit, pace: currentPace, reqPace },
            secondary: secondaryGoal ? { name: secondaryGoal.name, current: secondaryGoal.current_value, target: secondaryGoal.target_value } : null
          };
          gapObj.fiveYear = rem;
        }

        // 2. YEARLY
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        const yearTotal = yearEnd.getTime() - yearStart.getTime();
        const yearElapsed = now.getTime() - yearStart.getTime();
        const yearPct = (yearElapsed / yearTotal) * 100;
        const yearly = {
          year: now.getFullYear(),
          timeElapsedPct: yearPct,
          goalProgressPct: primaryGoal ? ((primaryGoal.current_value || 0) / (primaryGoal.target_value || 1) * 100) : 0
        };

        // 3. QUARTERLY
        let quarterlyObj = null;
        if (quarter) {
          const qStart = new Date(quarter.start_date || now);
          const qEnd = new Date(quarter.end_date || now);
          const qTotal = qEnd.getTime() - qStart.getTime();
          const qElapsed = now.getTime() - qStart.getTime();
          const qElapsedPct = Math.min(100, Math.max(0, (qElapsed / qTotal) * 100));
          
          // Generate dummy expected vs actual if missing results
          const chartData = [];
          for(let w=1; w<=12; w++) {
            chartData.push({ name: `Week ${w}`, expected: w, actual: w <= (qElapsedPct/100)*12 ? Math.floor(Math.random() * w) : null });
          }

          quarterlyObj = {
            name: `Q${quarter.quarter_number}`,
            objective: quarter.objective,
            timePct: qElapsedPct,
            daysRem: Math.max(0, Math.floor((qEnd.getTime() - now.getTime())/(1000*60*60*24))),
            rock: activeRock?.name,
            milestone: activeMilestone?.name,
            chartData
          };
        }

        // 4. MILESTONE & INPUTS
        let milestoneObj = null;
        let executionObj = { todayScore: 0, drivingInputs: [] };
        let activeInputs = allInputs?.filter(i => i.status === 'active' || i.active_status) || [];
        
        if (activeMilestone) {
          const cv = activeMilestone.current_value || 0;
          const tv = activeMilestone.target || 1;
          const rem = Math.max(0, tv - cv);
          gapObj.milestone = rem;
          
          milestoneObj = {
            name: activeMilestone.name,
            current: cv, target: tv, remaining: rem,
            deadline: activeMilestone.deadline,
            daysRem: activeMilestone.deadline ? Math.max(0, Math.floor((new Date(activeMilestone.deadline).getTime() - now.getTime())/(1000*60*60*24))) : 0
          };
        }

        // Execution Calculation
        let todayCompletedWeight = 0;
        let todayTotalWeight = 0;
        
        const todayStr = now.toISOString().split('T')[0];
        
        activeInputs.forEach(inp => {
           const en = entries?.find(e => e.input_definition_id === inp.id && e.date === todayStr);
           const w = Number(inp.weight) || 10;
           todayTotalWeight += w;
           const isDone = en && (en.completed || (en.actual_value !== null && en.actual_value >= inp.target));
           if (isDone) todayCompletedWeight += w;
           
           executionObj.drivingInputs.push({
             id: inp.id,
             name: inp.name,
             target: inp.target,
             actual: en ? (en.actual_value || (en.completed ? inp.target : 0)) : 0,
             unit: inp.unit,
             status: isDone ? "Done" : "Pending"
           });
        });
        
        if (todayTotalWeight > 0) {
          executionObj.todayScore = Math.round((todayCompletedWeight / todayTotalWeight) * 100);
        }

        // 5. MOMENTUM
        // 90 Day Heatmap properly mapped to input versions!
        const heatmap = [];
        let streak = 0;
        let last7Score = 0;
        let prev7Score = 0;
        
        for (let i = 0; i < 90; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          
          // Find inputs valid on this day
          const validInputs = (allInputs || []).filter(inp => {
            const sd = new Date(inp.start_date || '2000-01-01').getTime();
            const ed = inp.end_date ? new Date(inp.end_date).getTime() : Infinity;
            return d.getTime() >= sd && d.getTime() <= ed;
          });
          
          let dayCW = 0;
          let dayTW = 0;
          let dayCompletions = 0;
          
          validInputs.forEach(inp => {
            const en = entries?.find(e => e.input_definition_id === inp.id && e.date === dStr);
            const w = Number(inp.weight) || 10;
            dayTW += w;
            const isDone = en && (en.completed || (en.actual_value !== null && en.actual_value >= inp.target));
            if (isDone) {
              dayCW += w;
              dayCompletions++;
            }
          });
          
          const score = dayTW > 0 ? (dayCW / dayTW) * 100 : 0;
          
          heatmap.push({
             date: dStr,
             score: Math.round(score),
             inputsCompleted: dayCompletions,
             inputsExpected: validInputs.length
          });
        }
        
        // streak
        for (let i=0; i<90; i++) {
          if (heatmap[i].score >= 80) streak++;
          else if (i === 0 && heatmap[0].score < 80) continue; // today can be ignored if pending
          else break;
        }
        
        // 7 days
        const last7 = heatmap.slice(0, 7);
        const prev7 = heatmap.slice(7, 14);
        last7Score = last7.reduce((a,b)=>a+b.score, 0)/7;
        prev7Score = prev7.reduce((a,b)=>a+b.score, 0)/7;
        
        const momentumObj = {
          streak,
          last7: Math.round(last7Score),
          prev7: Math.round(prev7Score),
          heatmap: heatmap.reverse()
        };

        // 6. MATTERS NOW
        const mattersNowObj = {
          action: activeMilestone ? `Complete ${activeMilestone.name}` : "Configure weekly milestones",
          deadline: activeMilestone?.deadline || "N/A"
        };

        // 7. EVOLUTION
        const evolutionObj = sysVersions && sysVersions.length > 0 ? {
          currentVersion: sysVersions[0].version_number,
          activeSince: sysVersions[0].created_at,
          previousVersion: sysVersions.length > 1 ? sysVersions[1].version_number : null
        } : null;

        // 8. TIME TRACKING
        const todayDStr = now.toISOString().split('T')[0];
        
        let todayMins = 0;
        let weekMins = 0;
        let monthMins = 0;
        let quarterMins = 0;
        
        const d = new Date(now);
        const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Mon, 6=Sun
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - dayOfWeek);
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
        const quarterStart = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3, 1).toISOString().split('T')[0];

        (timeEntries || []).forEach(te => {
           const mins = Number(te.duration_minutes || 0);
           if (te.date === todayDStr) todayMins += mins;
           if (te.date >= weekStartStr) weekMins += mins;
           if (te.date >= monthStart) monthMins += mins;
           if (te.date >= quarterStart) quarterMins += mins;
        });

        // Time taken per input this week
        const inputTimeMap = {};
        (timeEntries || []).forEach(te => {
          if (te.date >= weekStartStr && te.duration_minutes) {
             inputTimeMap[te.input_definition_id] = (inputTimeMap[te.input_definition_id] || 0) + (te.duration_minutes / 60);
          }
        });
        const inputTimeChart = Object.entries(inputTimeMap).map(([id, hours]) => {
          const inp = allInputs?.find(i => i.id === id);
          return { name: inp ? inp.name : "Unknown", hours: Number(hours.toFixed(1)) };
        }).sort((a,b) => b.hours - a.hours);

        // Daily working activity each week compared to last week
        const dailyActivityChart = [];
        for(let i=0; i<7; i++) {
           const cd = new Date(weekStart);
           cd.setDate(cd.getDate() + i);
           const cdStr = cd.toISOString().split('T')[0];
           
           const ld = new Date(cd);
           ld.setDate(ld.getDate() - 7);
           const ldStr = ld.toISOString().split('T')[0];
           
           let currMins = 0;
           let lastMins = 0;
           (timeEntries || []).forEach(te => {
              if (te.date === cdStr) currMins += te.duration_minutes;
              if (te.date === ldStr) lastMins += te.duration_minutes;
           });
           
           dailyActivityChart.push({
             day: cd.toLocaleDateString("en-US", { weekday: 'short' }),
             currentWeek: Number((currMins / 60).toFixed(1)),
             lastWeek: Number((lastMins / 60).toFixed(1))
           });
        }

        const timeTrackingObj = {
          summary: {
            today: Number((todayMins / 60).toFixed(1)),
            week: Number((weekMins / 60).toFixed(1)),
            month: Number((monthMins / 60).toFixed(1)),
            quarter: Number((quarterMins / 60).toFixed(1))
          },
          inputChart: inputTimeChart,
          activityChart: dailyActivityChart
        };

        setData({
          system,
          isFrozen,
          nextReviewDate: system.next_review_date || null,
          hero,
          yearly,
          quarterly: quarterlyObj,
          milestone: milestoneObj,
          execution: executionObj,
          momentum: momentumObj,
          results: resultDefs || [],
          gap: gapObj,
          mattersNow: mattersNowObj,
          checkpoints: [
            { name: "Milestone Deadline", date: activeMilestone?.deadline },
            { name: "Next Review", date: system.next_review_date }
          ].filter(c => c.date),
          evolution: evolutionObj,
          timeTracking: timeTrackingObj
        });

      } catch (err) {
        console.error("Dashboard Engine Error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return { loading, ...data };
}
