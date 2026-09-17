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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Analyze execution consistency and milestone progress over the past 7 days.</p>
          </div>
          <button onClick={() => handleStartReview("WEEKLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full">Start Weekly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Monthly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Aggregate the entire month. Identify bottlenecks and structural changes.</p>
          </div>
          <button onClick={() => handleStartReview("MONTHLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full">Start Monthly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Quarterly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Major checkpoint. Compare expected vs actual for the entire quarterly goal.</p>
          </div>
          <button onClick={() => handleStartReview("QUARTERLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full">Start Quarterly</button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Yearly</h3>
            <p className="text-sm text-gray-600 mb-8 leading-relaxed">Deep analysis of strategic performance and long-term operating evolution.</p>
          </div>
          <button onClick={() => handleStartReview("YEARLY")} className="bg-orange-600 text-white rounded-lg px-4 py-3 text-sm font-semibold hover:bg-orange-700 transition-colors w-full">Start Yearly</button>
        </div>

      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Historical Records</h2>
        <hr className="border-gray-200 mb-4" />
        
        {reviews.length === 0 ? (
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
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{review.type}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{review.period_start} → {review.period_end}</td>
                    <td className="px-6 py-4">
                      {review.status === "COMPLETED" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Completed</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">Draft</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/reviews/${review.id}`} className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition-colors">
                        View Record →
                      </Link>
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
