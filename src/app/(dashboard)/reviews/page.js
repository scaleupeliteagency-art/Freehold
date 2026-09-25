"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import useReviewEngineStore from "@/lib/store/useReviewEngineStore";
import { useRouter } from "next/navigation";

export default function ReviewCenter() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [dueReviews, setDueReviews] = useState([]);
  const [activeSystem, setActiveSystem] = useState(null);
  const router = useRouter();
  const initReview = useReviewEngineStore(state => state.initReview);

  const calculateDueReviews = (system, existingReviews) => {
    if (!system.start_date) return [];
    const startDate = new Date(system.start_date);
    const now = new Date();
    startDate.setHours(0,0,0,0);
    const due = [];
    
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const weeksElapsed = Math.floor(daysDiff / 7);
    for (let i = 0; i < weeksElapsed; i++) {
      const pStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      const pEnd = new Date(startDate.getTime() + ((i + 1) * 7 * 24 * 60 * 60 * 1000) - 1);
      const periodStart = pStart.toISOString().split("T")[0];
      const periodEnd = pEnd.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "WEEKLY" && r.period_start === periodStart)) {
        due.push({ id: `due_weekly_${i}`, type: "WEEKLY", period_start: periodStart, period_end: periodEnd, status: "DUE" });
      }
    }

    const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth();
    for (let i = 0; i < monthsElapsed; i++) {
      const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const pEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0);
      const periodStart = pStart.toISOString().split("T")[0];
      const periodEnd = pEnd.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "MONTHLY" && r.period_start === periodStart)) {
        due.push({ id: `due_monthly_${i}`, type: "MONTHLY", period_start: periodStart, period_end: periodEnd, status: "DUE" });
      }
    }

    const quartersElapsed = Math.floor(monthsElapsed / 3);
    for (let i = 0; i < quartersElapsed; i++) {
      const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3), 1);
      const pEnd = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3) + 3, 0);
      const periodStart = pStart.toISOString().split("T")[0];
      const periodEnd = pEnd.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "QUARTERLY" && r.period_start === periodStart)) {
        due.push({ id: `due_quarterly_${i}`, type: "QUARTERLY", period_start: periodStart, period_end: periodEnd, status: "DUE" });
      }
    }

    const yearsElapsed = now.getFullYear() - startDate.getFullYear();
    for (let i = 0; i < yearsElapsed; i++) {
      const pStart = new Date(startDate.getFullYear() + i, startDate.getMonth(), startDate.getDate());
      const pEnd = new Date(startDate.getFullYear() + i + 1, startDate.getMonth(), startDate.getDate() - 1);
      const periodStart = pStart.toISOString().split("T")[0];
      const periodEnd = pEnd.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "YEARLY" && r.period_start === periodStart)) {
        due.push({ id: `due_yearly_${i}`, type: "YEARLY", period_start: periodStart, period_end: periodEnd, status: "DUE" });
      }
    }

    return due.reverse();
  };

  useEffect(() => {
    async function fetchReviews() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id, name, start_date")
          .eq("status", "active")
          .limit(1);

        if (systems && systems.length > 0) {
          setActiveSystem(systems[0]);
          
          const { data: history } = await supabase
            .from("reviews")
            .select("*")
            .eq("system_id", systems[0].id)
            .order("created_at", { ascending: false });
            
          if (history) {
              setReviews(history);
              setDueReviews(calculateDueReviews(systems[0], history));
          }
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
    // Generate an ID for the new review
    const newId = `rev_${Date.now()}`;
    
    // We will initialize a basic context and redirect. 
    // The actual data fetching will happen inside the review engine [id] route.
    initReview({
      id: newId,
      systemId: activeSystem.id,
      type: type,
      periodStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      periodEnd: new Date().toISOString().split("T")[0]
    }, { goals: [], inputs: [], milestones: [] });

    router.push(`/reviews/${newId}`);
  };

  const handleStartPendingReview = (dueReview) => {
    const newId = `rev_${Date.now()}`;
    initReview({
      id: newId,
      systemId: activeSystem.id,
      type: dueReview.type,
      periodStart: dueReview.period_start,
      periodEnd: dueReview.period_end
    }, { goals: [], inputs: [], milestones: [] });
    router.push(`/reviews/${newId}`);
  };

  const allReviews = [...dueReviews, ...reviews];
  const hasPending = allReviews.some(r => r.status !== "COMPLETED");

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-sm font-semibold animate-pulse text-gray-500">Loading Ledger...</div>
      </div>
    );
  }

  if (!activeSystem) {
    return (
      <div className="w-full py-12 animate-in fade-in duration-500">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Active System</h2>
        <hr className="border-gray-200 mb-8" />
        <p className="text-gray-600 max-w-md">You need an active system before you can review performance.</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-24">
      
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Diagnostic Review</h1>
        <p className="text-gray-500 text-sm mb-6">Investigate what happened. Evolve your operating inputs.</p>
        <hr className="border-gray-200 mb-8" />
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 ${hasPending ? 'opacity-50 pointer-events-none' : ''}`}>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Analyze execution consistency and milestone progress over the past 7 days.</p>
          </div>
          <button disabled={hasPending} onClick={() => handleStartReview("WEEKLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full disabled:opacity-50">Start Weekly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Aggregate the entire month. Identify bottlenecks and structural changes.</p>
          </div>
          <button disabled={hasPending} onClick={() => handleStartReview("MONTHLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full disabled:opacity-50">Start Monthly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Major checkpoint. Compare expected vs actual for the entire quarterly goal.</p>
          </div>
          <button disabled={hasPending} onClick={() => handleStartReview("QUARTERLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full disabled:opacity-50">Start Quarterly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Yearly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Deep analysis of strategic performance and long-term operating evolution.</p>
          </div>
          <button disabled={hasPending} onClick={() => handleStartReview("YEARLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full disabled:opacity-50">Start Yearly</button>
        </div>

      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Historical Records</h2>
        <hr className="border-gray-200 mb-4" />
        
        {hasPending && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800 font-medium">You must complete your scheduled and draft reviews before initiating new ones.</p>
          </div>
        )}
        
        {allReviews.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No past reviews found in the ledger.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Period</th>
                  <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {allReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{review.type}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{review.period_start} → {review.period_end}</td>
                    <td className="px-6 py-4">
                      {review.status === "COMPLETED" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>
                      ) : review.status === "DUE" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Due</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {review.status === "DUE" ? (
                        <button onClick={() => handleStartPendingReview(review)} className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                          Start Review →
                        </button>
                      ) : review.status === "COMPLETED" ? (
                        <Link href={`/reviews/${review.id}`} className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                          View Record →
                        </Link>
                      ) : (
                        <Link href={`/reviews/${review.id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                          Continue Draft →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
