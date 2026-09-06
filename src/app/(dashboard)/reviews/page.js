"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { useRouter } from "next/navigation";

export default function ReviewCenter() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [activeSystem, setActiveSystem] = useState(null);
  const router = useRouter();
  const initReview = useReviewEngineStore(state => state.initReview);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id, name")
          .eq("status", "active")
          .limit(1);

        if (systems && systems.length > 0) {
          setActiveSystem(systems[0]);
          
          const { data: history } = await supabase
            .from("reviews")
            .select("*")
            .eq("system_id", systems[0].id)
            .order("created_at", { ascending: false });
            
          if (history) setReviews(history);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  const handleStartReview = async (type) => {
    const mockId = `draft-${Date.now()}`;
    const mockSnapshots = {
      goals: [{ name: "Revenue", target: 100, actual: 72 }],
      inputs: [{ name: "Calls", target: 20, actual: 12 }],
      milestones: [{ name: "Get 10 leads", target: 10, actual: 6 }]
    };

    initReview({
      id: mockId,
      type: type,
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0]
    }, mockSnapshots);

    router.push(`/reviews/${mockId}`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold animate-pulse uppercase tracking-widest text-moss">Loading Ledger...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="max-w-2xl py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-serif font-bold text-ink mb-4">No Active System</h2>
        <hr className="border-divider mb-8" />
        <p className="text-ink max-w-md">You need an active system before you can review performance.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl animate-in fade-in duration-500">
      
      <div className="mb-12">
        <h1 className="text-3xl font-serif font-bold text-ink mb-1">Diagnostic Review</h1>
        <p className="text-ink/70 text-sm mb-6">Understand what happened. Find the constraint. Decide what changes next.</p>
        <hr className="border-divider mb-8" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Pending Diagnostic</h2>
          
          <div className="border-2 border-ink p-6 bg-white relative">
            <div className="absolute top-0 right-0 bg-ink text-paper px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              DUE NOW
            </div>
            <h3 className="text-xl font-serif font-bold text-ink mb-2">Weekly Review</h3>
            <div className="text-sm text-ink/70 mb-8 font-mono">Sep 1 — Sep 7</div>
            
            <button 
              onClick={() => handleStartReview('WEEKLY')}
              className="bg-ink text-paper px-6 py-2 text-sm font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors w-full"
            >
              Start Investigation →
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-[10px] font-bold text-ink/50 uppercase tracking-widest mb-4">Upcoming Schedule</h2>
          
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-divider/50 opacity-50">
                <td className="py-4 font-bold text-ink">Monthly Review</td>
                <td className="py-4 text-right text-ink font-mono">Opens in 14 days</td>
              </tr>
              <tr className="border-b border-divider/50 opacity-50">
                <td className="py-4 font-bold text-ink">Quarterly Review</td>
                <td className="py-4 text-right text-ink font-mono">Opens in 45 days</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-serif font-bold text-ink mb-2">Historical Records</h2>
        <hr className="border-divider mb-4" />
        
        {reviews.length === 0 ? (
          <p className="text-ink/50 text-sm italic py-4">No past reviews found in the ledger.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-divider">
                <th className="py-3 font-normal text-[10px] uppercase tracking-widest text-ink/50">Type</th>
                <th className="py-3 font-normal text-[10px] uppercase tracking-widest text-ink/50">Period</th>
                <th className="py-3 font-normal text-[10px] uppercase tracking-widest text-ink/50">Status</th>
                <th className="py-3 font-normal text-[10px] uppercase tracking-widest text-ink/50 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b border-divider/50 hover:bg-white/30 transition-colors">
                  <td className="py-4 font-bold text-ink">{review.type}</td>
                  <td className="py-4 font-mono text-ink/70">{review.period_start} — {review.period_end}</td>
                  <td className="py-4">
                    {review.status === 'COMPLETED' ? (
                      <span className="text-moss text-[10px] font-bold uppercase tracking-widest">Completed</span>
                    ) : (
                      <span className="text-ochre text-[10px] font-bold uppercase tracking-widest">Draft</span>
                    )}
                  </td>
                  <td className="py-4 text-right">
                    <Link href={`/reviews/${review.id}`} className="text-xs font-bold uppercase tracking-widest text-ink/50 hover:text-ink transition-colors">
                      View Record →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
