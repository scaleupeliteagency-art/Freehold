"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";

export default function EvolutionView() {
  const [loading, setLoading] = useState(true);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    async function fetchEvolution() {
      try {
        const { data: systems } = await supabase.from("systems").select("id, created_at").eq("status", "active").limit(1);
        if (!systems || systems.length === 0) { setLoading(false); return; }

        const systemId = systems[0].id;
        const allEvents = [];

        allEvents.push({ id: `sys-${systemId}`, type: "system", date: systems[0].created_at, title: "SYSTEM CREATED", desc: "Initial operating structure", style: "border-ink bg-ink text-paper" });

        const { data: versions } = await supabase.from("system_versions").select("*").eq("system_id", systemId);
        if (versions) versions.forEach(v => allEvents.push({ id: `v-${v.id}`, type: "system_version", date: v.created_at, title: `SYSTEM ${v.version_number}`, desc: "New system configuration activated", style: "border-ink bg-ink text-paper" }));

        const { data: reviews } = await supabase.from("reviews").select("*").eq("system_id", systemId).eq("status", "COMPLETED");
        if (reviews) reviews.forEach(r => allEvents.push({ id: `rev-${r.id}`, type: "review", date: r.completed_at || r.created_at, title: `${r.type} REVIEW`, desc: "Diagnostic analysis completed", style: "border-ochre bg-white text-ochre" }));

        const { data: insights } = await supabase.from("insights").select("*").eq("system_id", systemId);
        if (insights) insights.forEach(i => {
          if (i.status === 'VALIDATED') allEvents.push({ id: `ins-${i.id}`, type: "validated", date: i.created_at, title: "VALIDATED INSIGHT", desc: i.title, style: "border-moss/30 bg-white text-moss" });
          else allEvents.push({ id: `ins-${i.id}`, type: "insight", date: i.created_at, title: `NEW ${i.type}`, desc: i.title, style: "border-divider bg-white text-ink/70" });
        });

        const { data: experiments } = await supabase.from("experiments").select("*").eq("system_id", systemId);
        if (experiments) experiments.forEach(e => allEvents.push({ id: `exp-${e.id}`, type: "experiment", date: e.created_at, title: "EXPERIMENT", desc: e.hypothesis, style: "border-divider bg-white text-ink/50" }));

        allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
        setNodes(allEvents);
      } catch (err) { console.error("Error fetching evolution:", err); } finally { setLoading(false); }
    }
    fetchEvolution();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Tracing Evolution...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500">
      
      <div className="mb-16">
        <Link href="/history" className="text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink transition-colors mb-4 inline-block">
          ← Back to Ledger
        </Link>
        <h1 className="text-3xl font-serif font-bold text-ink mb-2">System Evolution</h1>
        <p className="text-ink/70 text-sm mb-6">The causal chain of the active system.</p>
        <hr className="border-divider" />
      </div>

      <div className="relative flex flex-col pl-8">
        {nodes.length === 0 ? (
           <div className="text-ink/50 italic text-sm">No evolution data available.</div>
        ) : (
          <>
            <div className="absolute top-0 bottom-0 left-[39px] w-px bg-divider -z-10" />

            {nodes.map((node, idx) => (
              <div key={node.id} className="flex mb-12 group w-full max-w-sm">
                
                <div className={`w-full p-4 border ${node.style} bg-paper`}>
                  <div className="text-[9px] font-bold uppercase tracking-widest opacity-80 mb-2">{node.title}</div>
                  <div className="text-sm font-semibold leading-snug">{node.desc}</div>
                  <div className="text-[9px] font-mono opacity-50 mt-4 pt-3 border-t border-current/20">
                    {new Date(node.date).toLocaleDateString()}
                  </div>
                </div>
                
              </div>
            ))}
            
            <div className="flex items-center gap-4 mt-4">
              <div className="w-2 h-2 bg-ink ml-[1px]" />
              <div className="text-[10px] font-bold text-ink/50 uppercase tracking-widest">Current System State</div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
