"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import TimelineEvent from "@/components/history/TimelineEvent";
import Link from "next/link";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState([]);
  
  const [metrics, setMetrics] = useState({
    total: 0,
    reviews: 0,
    versions: 0,
    insights: 0
  });

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id")
          .eq("status", "active")
          .limit(1);

        if (!systems || systems.length === 0) {
          setLoading(false);
          return;
        }

        const systemId = systems[0].id;
        const allEvents = [];

        const { data: versions } = await supabase.from("system_versions").select("*").eq("system_id", systemId);
        if (versions) {
          versions.forEach(v => {
            allEvents.push({
              id: `v-${v.id}`, 
              type: "SYSTEM_VERSION", 
              date: v.created_at, 
              title: `System ${v.version_number} Activated`, 
              description: "System structure was snapshotted and activated.", 
              version: v.version_number, 
              link: "/history/evolution",
              snapshot: v.snapshot
            });
          });
        }

        const { data: reviews } = await supabase.from("reviews").select("*").eq("system_id", systemId).eq("status", "COMPLETED");
        if (reviews) {
          reviews.forEach(r => {
            allEvents.push({
              id: `rev-${r.id}`, type: "REVIEW", date: r.completed_at || r.created_at, title: `${r.type} Review Completed`, description: `Diagnostic review for the period covering ${r.period_start} to ${r.period_end}.`, meta: { "Type": r.type }, link: `/reviews/${r.id}`
            });
          });
        }

        const { data: insights } = await supabase.from("insights").select("*").eq("system_id", systemId);
        if (insights) {
          insights.forEach(i => {
            let type = "INSIGHT";
            if (i.status === 'VALIDATED') type = "VALIDATION";
            allEvents.push({
              id: `ins-${i.id}`, type: type, date: i.created_at, title: i.title, description: i.description || "System identified a new pattern.", meta: { "Confidence": i.confidence || "Unknown", "Insight Type": i.type }, link: `/insights/${i.id}`
            });
          });
        }

        const { data: experiments } = await supabase.from("experiments").select("*").eq("system_id", systemId);
        if (experiments) {
          experiments.forEach(e => {
            allEvents.push({
              id: `exp-${e.id}`, type: "EXPERIMENT", date: e.created_at, title: `Experiment: ${e.status}`, description: e.hypothesis, meta: { "Status": e.status, "Metric": e.measurement_metric || "N/A" }, link: `/insights` 
            });
          });
        }

        allEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(allEvents);
        setMetrics({ total: allEvents.length, reviews: (reviews || []).length, versions: (versions || []).length, insights: (insights || []).length });

      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter !== 'ALL' && event.type !== filter) return false;
    if (search && !event.title.toLowerCase().includes(search.toLowerCase()) && !event.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-medium animate-pulse text-gray-500">Loading History...</div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-12">
      
      <div className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">History</h1>
            <p className="text-sm text-gray-500">The historical record of system events and evolution.</p>
          </div>
          <Link 
            href="/history/evolution"
            className="bg-orange-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
          >
            How I Got Here →
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">Total Records</div>
            <div className="text-gray-900 font-semibold text-2xl">{metrics.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">Completed Reviews</div>
            <div className="text-gray-900 font-semibold text-2xl">{metrics.reviews}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">System Versions</div>
            <div className="text-gray-900 font-semibold text-2xl">{metrics.versions}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-xs font-medium text-gray-500 mb-1">Total Insights</div>
            <div className="text-gray-900 font-semibold text-2xl">{metrics.insights}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sticky top-0 bg-gray-50/80 backdrop-blur-md z-40 py-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['ALL', 'SYSTEM_VERSION', 'REVIEW', 'INSIGHT', 'EXPERIMENT', 'VALIDATION'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${filter === f ? 'bg-gray-900 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:text-gray-900'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 shrink-0 relative">
          <input 
            type="text" 
            placeholder="Search history..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="w-full ml-2">
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
            <p className="text-gray-500 text-sm">Your history starts here. As you complete reviews and learn, this timeline will grow.</p>
          </div>
        ) : (
          <div>
            {filteredEvents.map((event, idx) => (
              <TimelineEvent 
                key={event.id} 
                event={event} 
                isLast={idx === filteredEvents.length - 1} 
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
