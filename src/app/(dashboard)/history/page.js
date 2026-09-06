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
              id: `v-${v.id}`, type: "SYSTEM_VERSION", date: v.created_at, title: `System ${v.version_number} Activated`, description: "System structure was snapshotted and activated.", version: v.version_number, link: "/history/evolution"
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
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Loading Ledger...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink mb-1">History</h1>
            <p className="text-sm text-ink/70">The immutable historical record of the entire operating system.</p>
          </div>
          <Link 
            href="/history/evolution"
            className="border border-ink bg-white text-ink px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
          >
            How I Got Here →
          </Link>
        </div>
        <hr className="border-divider mb-6" />
        
        <div className="flex flex-wrap gap-12 text-sm border-b border-divider pb-6">
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Total Records</div>
            <div className="text-ink font-semibold text-lg">{metrics.total}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Completed Reviews</div>
            <div className="text-ink font-semibold text-lg">{metrics.reviews}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">System Versions</div>
            <div className="text-ochre font-semibold text-lg">{metrics.versions}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-1">Total Insights</div>
            <div className="text-moss font-semibold text-lg">{metrics.insights}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-divider pb-6 sticky top-0 bg-paper z-40 pt-4">
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {['ALL', 'SYSTEM_VERSION', 'REVIEW', 'INSIGHT', 'EXPERIMENT', 'VALIDATION'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${filter === f ? 'bg-ink text-paper border-ink' : 'bg-white text-ink/70 border-divider hover:bg-white/50'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64 shrink-0">
          <input 
            type="text" 
            placeholder="Search history..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-1.5 bg-white border border-divider text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      <div className="max-w-3xl">
        {filteredEvents.length === 0 ? (
          <p className="text-ink/50 text-sm italic py-4">Your history starts here. As you complete reviews and learn, this timeline will grow.</p>
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
