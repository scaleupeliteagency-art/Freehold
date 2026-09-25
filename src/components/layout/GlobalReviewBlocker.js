"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export function GlobalReviewBlocker({ children }) {
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState(null);
  const [dueReviews, setDueReviews] = useState([]);
  const [resetting, setResetting] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function checkReviews() {
      try {
        const { data: systems } = await supabase
          .from("systems")
          .select("id, name, start_date")
          .eq("status", "active")
          .limit(1);

        if (systems && systems.length > 0) {
          const activeSys = systems[0];
          setSystem(activeSys);
          
          const { data: history } = await supabase
            .from("reviews")
            .select("*")
            .eq("system_id", activeSys.id);
            
          const due = calculateDueReviews(activeSys, history || []);
          setDueReviews(due);
        }
      } catch (err) {
        console.error("Error checking reviews:", err);
      } finally {
        setLoading(false);
      }
    }
    
    checkReviews();
  }, [pathname]); // Re-check on navigation

  const calculateDueReviews = (sys, existingReviews) => {
    if (!sys.start_date) return [];
    const startDate = new Date(sys.start_date);
    const now = new Date();
    startDate.setHours(0,0,0,0);
    const due = [];
    
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Weekly
    const weeksElapsed = Math.floor(daysDiff / 7);
    for (let i = 0; i < weeksElapsed; i++) {
      const pStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      const periodStart = pStart.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "WEEKLY" && r.period_start === periodStart)) {
        due.push({ type: "WEEKLY", periodStart });
      }
    }

    // Monthly
    const monthsElapsed = (now.getFullYear() - startDate.getFullYear()) * 12 + now.getMonth() - startDate.getMonth();
    for (let i = 0; i < monthsElapsed; i++) {
      const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      const periodStart = pStart.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "MONTHLY" && r.period_start === periodStart)) {
        due.push({ type: "MONTHLY", periodStart });
      }
    }

    // Quarterly
    const quartersElapsed = Math.floor(monthsElapsed / 3);
    for (let i = 0; i < quartersElapsed; i++) {
      const pStart = new Date(startDate.getFullYear(), startDate.getMonth() + (i * 3), 1);
      const periodStart = pStart.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "QUARTERLY" && r.period_start === periodStart)) {
        due.push({ type: "QUARTERLY", periodStart });
      }
    }

    // Yearly
    const yearsElapsed = now.getFullYear() - startDate.getFullYear();
    for (let i = 0; i < yearsElapsed; i++) {
      const pStart = new Date(startDate.getFullYear() + i, startDate.getMonth(), startDate.getDate());
      const periodStart = pStart.toISOString().split("T")[0];
      if (!existingReviews.some(r => r.type === "YEARLY" && r.period_start === periodStart)) {
        due.push({ type: "YEARLY", periodStart });
      }
    }

    // Include existing Drafts as due
    const drafts = existingReviews.filter(r => r.status === 'DRAFT');
    return [...due, ...drafts];
  };

  const handleResetSystem = async () => {
    setResetting(true);
    try {
      await fetch('/api/system/reset', { method: 'POST' });
      window.location.href = '/dashboard';
    } catch (err) {
      console.error("Reset failed", err);
      setResetting(false);
    }
  };

  // Skip blocking on the review page itself or if no system exists yet
  if (loading || !system || pathname.startsWith("/reviews")) {
    return children;
  }

  const isFrozen = dueReviews.length >= 2;
  const isBlocked = dueReviews.length === 1;

  if (isFrozen) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="pointer-events-none blur-sm opacity-50 h-full w-full absolute inset-0">
          {children}
        </div>
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">System Frozen</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              You missed {dueReviews.length} successive scheduled reviews. To ensure operating integrity, the system has been frozen. You must reset the system to continue.
            </p>
            <button 
              onClick={handleResetSystem}
              disabled={resetting}
              className="block w-full py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {resetting ? 'Resetting System...' : 'Reset System To Today'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="pointer-events-none blur-sm opacity-50 h-full w-full absolute inset-0">
          {children}
        </div>
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl border border-orange-100 max-w-md w-full text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Review Required</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              You have a pending scheduled review. You must complete your diagnostic review before you can proceed with other actions.
            </p>
            <button 
              onClick={() => router.push('/reviews')}
              className="block w-full py-3.5 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors shadow-sm"
            >
              Go to Review Center
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
