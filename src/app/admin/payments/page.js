"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchPayments = async () => {
    setLoading(true);
    setLoadError("");
    const { data: paymentRows, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (paymentError) {
      console.error(paymentError);
      setLoadError(paymentError.message);
      setPayments([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set((paymentRows || []).map((payment) => payment.user_id).filter(Boolean))];
    let profilesByUserId = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);

      if (profilesError) {
        console.error(profilesError);
        setLoadError(profilesError.message);
      } else {
        profilesByUserId = Object.fromEntries((profiles || []).map((profile) => [profile.user_id, profile]));
      }
    }

    setPayments((paymentRows || []).map((payment) => ({
      ...payment,
      profile: profilesByUserId[payment.user_id] || null
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (payment) => {
    const isYearly = payment.plan_type === 'yearly';
    const durationMonths = isYearly ? 12 : 1;
    
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationMonths);

    // 1. Update Payment Status
    const { error: paymentError } = await supabase
      .from("payments")
      .update({ status: 'approved' })
      .eq("id", payment.id);

    if (paymentError) {
      alert("Error approving payment: " + paymentError.message);
      return;
    }

    // 2. Activate Profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_plan: payment.plan_type,
        subscription_end_date: endDate.toISOString()
      })
      .eq("user_id", payment.user_id);

    if (profileError) {
      alert("Payment approved but failed to activate user profile.");
    } else {
      fetchPayments();
    }
  };

  const handleReject = async (paymentId) => {
    await supabase
      .from("payments")
      .update({ status: 'rejected' })
      .eq("id", paymentId);
    
    fetchPayments();
  };

  const handleViewProof = async (proofPath) => {
    const { data, error } = await supabase.storage
      .from("payment_proofs")
      .createSignedUrl(proofPath, 600);
    if (error || !data?.signedUrl) {
      alert("Unable to open payment proof: " + (error?.message || "No signed URL returned."));
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-ink uppercase mb-2">Payment Verification</h1>
        <p className="text-sm text-ink/70">Verify manual payments and activate subscriptions.</p>
      </div>

      {loadError && (
        <div className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Unable to load payment data from Supabase: {loadError}
        </div>
      )}

      <div className="bg-white border border-divider overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider bg-paper text-[10px] uppercase tracking-widest text-ink/50">
                <th className="p-4 font-bold">Date & User</th>
                <th className="p-4 font-bold">Plan & Amount</th>
                <th className="p-4 font-bold">Method & Proof</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-sm font-mono text-ink/50">No payments found.</td>
                </tr>
              ) : (
                payments.map(payment => (
                  <tr key={payment.id} className="border-b border-divider hover:bg-paper/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-sm text-ink">{payment.profile?.name || "Unnamed User"}</div>
                      <div className="text-[10px] font-mono text-ink/50 mt-1">{new Date(payment.created_at).toLocaleString()}</div>
                      <div className="text-[10px] font-mono text-ink/40 mt-1" title={payment.user_id}>UID: {payment.user_id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold uppercase tracking-widest text-ink mb-1">
                        {payment.plan_type}
                      </div>
                      <div className="font-serif font-bold text-ink">{payment.amount} {payment.currency}</div>
                      {payment.promo_code_used && (
                        <div className="text-[9px] font-mono text-ochre mt-1">Promo: {payment.promo_code_used}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-mono uppercase tracking-widest text-ink/70 mb-2">
                        {payment.payment_method.replace('_', ' ')}
                      </div>
                      <div className="flex flex-col gap-1">
                        {payment.transaction_reference && (
                           <span className="text-[10px] font-mono bg-white border border-divider px-2 py-1 truncate max-w-[150px]">
                             TXID: {payment.transaction_reference}
                           </span>
                        )}
                        {payment.proof_url ? (
                           <button onClick={() => handleViewProof(payment.proof_url)} className="text-[10px] font-bold text-ochre hover:underline uppercase tracking-widest">
                             View Proof ↗
                           </button>
                        ) : (
                           <span className="text-[10px] font-mono text-ink/40">No file attached</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        payment.status === 'approved' ? 'bg-moss/10 text-moss border-moss/20' :
                        payment.status === 'pending' ? 'bg-ochre/10 text-ochre border-ochre/20' :
                        'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {payment.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleReject(payment.id)}
                            className="px-3 py-1 border border-ink text-ink text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
                          >
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApprove(payment)}
                            className="px-3 py-1 bg-ink text-paper text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors"
                          >
                            Approve & Activate
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
