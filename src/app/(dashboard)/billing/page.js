"use client";

import { useState, useEffect } from "react";
import { Check, Upload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [payments, setPayments] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null); // 'monthly' or 'yearly'
  
  // Checkout State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [proofFile, setProofFile] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Choose plan, 2: Checkout, 3: Success

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const router = useRouter();

  const BASE_MONTHLY = 45;
  const BASE_YEARLY = 432; // (540 - 20%)

  useEffect(() => {
    fetchPayments();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setCurrentUser(data.user.email);
        supabase.from("profiles").select("*").eq("user_id", data.user.id).single().then(res => {
          if (res.data) setProfile(res.data);
        });
      }
    });
  }, []);

  const fetchPayments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setPayments(data);
    } catch (err) {
      console.error("Error fetching payments", err);
    } finally {
      setFetching(false);
    }
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) return;
    setPromoError("");
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .eq("code", promoCode.trim().toUpperCase())
        .single();
        
      if (error || !data || !data.is_active || (data.expires_at && new Date(data.expires_at) < new Date())) {
        setPromoError("Invalid or expired promo code.");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoError("");
      }
    } catch (err) {
      setPromoError("Error validating code.");
    } finally {
      setLoading(false);
    }
  };

  const getFinalPrice = (plan) => {
    const base = plan === "monthly" ? BASE_MONTHLY : BASE_YEARLY;
    if (!appliedPromo) return base;
    const discount = (base * appliedPromo.discount_percentage) / 100;
    return Math.max(0, base - discount);
  };

  const handleFileUpload = async (file) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment_proofs')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('payment_proofs')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmitPayment = async () => {
    if (paymentMethod === 'bank_transfer' && !proofFile) {
      alert("Please upload your payment proof receipt.");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      let proofUrl = null;
      if (proofFile) {
        proofUrl = await handleFileUpload(proofFile);
      }

      const activePlan = selectedPlan || "monthly";
      const finalAmount = getFinalPrice(activePlan);

      // 1. Create Payment Record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: finalAmount,
          currency: "MAD",
          payment_method: paymentMethod,
          plan_type: activePlan,
          promo_code_id: appliedPromo ? appliedPromo.id : null,
          proof_url: proofUrl,
          transaction_id: transactionId || null,
          status: "pending"
        });

      if (paymentError) throw paymentError;

      // 2. Update Profile
      await supabase
        .from("profiles")
        .update({ 
          subscription_plan: activePlan,
          subscription_status: "pending_payment" 
        })
        .eq("user_id", user.id);
        
      setCheckoutStep(3);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert("Error submitting payment. Make sure the 'payment_proofs' storage bucket exists and allows uploads.");
    } finally {
      setLoading(false);
    }
  };

  const resetCheckout = () => {
    setSelectedPlan(null);
    setCheckoutStep(1);
    setPromoCode("");
    setAppliedPromo(null);
    setProofFile(null);
    setTransactionId("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleMakeAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      if (existingProfile) {
        await supabase.from("profiles").update({ is_admin: true, subscription_status: 'active' }).eq("user_id", user.id);
      } else {
        await supabase.from("profiles").insert([{ user_id: user.id, is_admin: true, subscription_status: 'active', name: 'Admin User' }]);
      }
      
      alert(`Success! Profile for ${user.email} verified as Admin. Redirecting to dashboard...`);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Error making admin: " + err.message);
    }
  };

  const isActive = profile?.subscription_status === 'active' || profile?.is_admin;
  const currentPlan = profile?.is_admin ? "LIFETIME (ADMIN)" : (profile?.subscription_plan || "None");
  const expirationStr = profile?.is_admin ? "Never Expires" : (profile?.subscription_end_date ? new Date(profile.subscription_end_date).toLocaleDateString() : "—");

  const statusDisplay = (status) => {
    switch (status) {
      case 'approved': return { text: 'PAID', style: 'bg-moss/10 text-moss border-moss/20' };
      case 'pending': return { text: 'WAITING FOR CONFIRMATION', style: 'bg-ochre/10 text-ochre border-ochre/20' };
      case 'rejected': return { text: 'UNPAID', style: 'bg-red-500/10 text-red-600 border-red-500/20' };
      default: return { text: status, style: 'bg-ink/10 text-ink border-ink/20' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500 text-ink">
      
      <div className="text-center mb-16 relative">
        <div className="absolute -top-6 left-0 text-xs text-ink/50 font-mono">
          Logged in as: <strong>{currentUser || 'Loading...'}</strong>
          <button onClick={handleLogout} className="ml-4 underline hover:text-ink">Sign Out</button>
        </div>

        <button 
          onClick={handleMakeAdmin}
          className="absolute -top-6 right-0 text-[10px] bg-ink text-paper px-3 py-1 uppercase tracking-widest font-bold"
        >
          🛠️ Force Admin Access (Dev)
        </button>

        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 uppercase tracking-tight">
           Your Ledger Subscription
        </h1>
        <p className="text-lg text-ink/70 max-w-2xl mx-auto">
          Manage your billing, view your current plan, and access payment history.
        </p>
      </div>

      {checkoutStep === 1 && (
        <>
          <div className="border border-divider bg-white p-8 mb-16 max-w-2xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Current Status</div>
                <div className={`text-2xl font-serif font-bold flex items-center gap-2 ${isActive ? 'text-moss' : 'text-ochre'}`}>
                  {isActive ? <CheckCircle2 className="w-6 h-6" /> : null}
                  {isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Plan</div>
                <div className="font-bold text-lg uppercase tracking-widest text-ink">
                   {currentPlan}
                </div>
              </div>
            </div>
            
            <hr className="border-divider mb-6" />
            
            <div className="flex justify-between items-center">
               <div>
                 <div className="text-xs text-ink/70 mb-1">Expiration Date</div>
                 <div className="font-mono text-sm font-bold text-ink">
                   {expirationStr}
                 </div>
               </div>
               
               {!profile?.is_admin && (
                  <button onClick={() => setCheckoutStep(2)} className="border border-divider bg-ink text-paper px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors">
                    Submit New Payment
                  </button>
               )}
            </div>
          </div>

          {/* Payment History Table */}
          <div className="mt-8 max-w-4xl mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink mb-4">Payment History</h3>
            {payments.length > 0 ? (
              <div className="bg-white border border-divider overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-divider bg-paper text-[10px] uppercase tracking-widest text-ink/50">
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Plan</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Method</th>
                      <th className="p-4 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => {
                      const display = statusDisplay(p.status);
                      return (
                        <tr key={p.id} className="border-b border-divider last:border-0 hover:bg-paper/50">
                          <td className="p-4 text-xs font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-xs font-bold uppercase tracking-widest">{p.plan_type || 'Custom'}</td>
                          <td className="p-4 text-sm font-serif font-bold">{p.amount} {p.currency}</td>
                          <td className="p-4 text-xs font-mono">{p.payment_method.replace('_', ' ')}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${display.style}`}>
                              {display.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-sm text-ink/50 border border-divider p-8 text-center bg-white">
                No transactions found.
              </div>
            )}
          </div>
        </>
      )}

      {checkoutStep === 2 && (
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setCheckoutStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink mb-6">← Back to dashboard</button>
          
          <h2 className="text-3xl font-serif font-bold mb-6 uppercase tracking-tight">Complete Payment</h2>
          
          <div className="border border-divider bg-white p-6 mb-8 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Select Plan</div>
              <select 
                value={selectedPlan || "monthly"} 
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="font-serif font-bold text-xl bg-transparent border-b border-divider focus:outline-none cursor-pointer"
              >
                <option value="monthly">Monthly Commitment</option>
                <option value="yearly">Yearly Commitment</option>
              </select>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-bold">{getFinalPrice(selectedPlan || "monthly")} MAD</div>
              {appliedPromo && <div className="text-xs text-ochre font-bold uppercase tracking-widest mt-1">Discount Applied (-{appliedPromo.discount_percentage}%)</div>}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Promo Code (Optional)</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={promoCode} 
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter code" 
                className="flex-1 bg-paper border border-divider py-3 px-4 text-sm focus:outline-none focus:border-ink uppercase placeholder:normal-case"
              />
              <button 
                onClick={applyPromoCode}
                disabled={loading || !promoCode}
                className="bg-ink text-paper px-6 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-red-600 mt-2 font-medium">{promoError}</p>}
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-4">Select Payment Method</h3>
          
          <div className="space-y-4 mb-8">
            <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'bank_transfer' ? 'border-ochre bg-white' : 'border-divider bg-paper'}`}>
              <div className="flex items-center gap-3 mb-2">
                <input type="radio" name="payment_method" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} className="accent-ochre" />
                <span className="font-bold text-sm uppercase tracking-widest">Bank Transfer (RIB)</span>
              </div>
              {paymentMethod === 'bank_transfer' && (
                <div className="ml-7 mt-4 text-sm text-ink/80 border-l-2 border-divider pl-4">
                  <p className="mb-2">Send payment to:</p>
                  <p className="font-mono bg-paper/50 p-2 mb-2 select-all text-xs">RIB: 000000000000000000000000</p>
                  <p className="font-mono bg-paper/50 p-2 mb-4 select-all text-xs">Holder: Ayoub Elyoussfi</p>
                  <p className="mb-2 text-xs text-ink/60">Upload a screenshot or photo of your transfer receipt below:</p>
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="text-xs w-full bg-paper border border-divider p-2" 
                  />
                </div>
              )}
            </label>

            <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-ochre bg-white' : 'border-divider bg-paper'}`}>
              <div className="flex items-center gap-3 mb-2">
                <input type="radio" name="payment_method" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="accent-ochre" />
                <span className="font-bold text-sm uppercase tracking-widest">PayPal</span>
              </div>
              {paymentMethod === 'paypal' && (
                <div className="ml-7 mt-4 text-sm text-ink/80 border-l-2 border-divider pl-4">
                  <p className="mb-2">Send payment to:</p>
                  <p className="font-mono bg-paper/50 p-2 mb-4 select-all text-xs">paypal.me/yourusername</p>
                  <p className="mb-2 text-xs text-ink/60">Enter your PayPal Transaction ID or upload a screenshot:</p>
                  <input 
                    type="text" 
                    placeholder="Transaction ID"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-paper border border-divider py-2 px-3 text-sm focus:outline-none focus:border-ink mb-2"
                  />
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="text-xs w-full bg-paper border border-divider p-2" 
                  />
                </div>
              )}
            </label>

            <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'binance' ? 'border-ochre bg-white' : 'border-divider bg-paper'}`}>
              <div className="flex items-center gap-3 mb-2">
                <input type="radio" name="payment_method" checked={paymentMethod === 'binance'} onChange={() => setPaymentMethod('binance')} className="accent-ochre" />
                <span className="font-bold text-sm uppercase tracking-widest">Binance Pay (Crypto)</span>
              </div>
              {paymentMethod === 'binance' && (
                <div className="ml-7 mt-4 text-sm text-ink/80 border-l-2 border-divider pl-4">
                  <p className="mb-2">Send payment to Binance ID (USDT):</p>
                  <p className="font-mono bg-paper/50 p-2 mb-4 select-all text-xs">Binance ID: 123456789</p>
                  <p className="mb-2 text-xs text-ink/60">Enter your TXID or upload a screenshot:</p>
                  <input 
                    type="text" 
                    placeholder="Transaction ID / Hash"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full bg-paper border border-divider py-2 px-3 text-sm focus:outline-none focus:border-ink mb-2"
                  />
                  <input 
                    type="file" 
                    accept="image/*,.pdf"
                    onChange={(e) => setProofFile(e.target.files[0])}
                    className="text-xs w-full bg-paper border border-divider p-2" 
                  />
                </div>
              )}
            </label>
          </div>

          <button
            onClick={handleSubmitPayment}
            disabled={loading}
            className="w-full bg-ink text-paper py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting Payment..." : `Submit Payment of ${getFinalPrice(selectedPlan)} MAD`}
          </button>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="max-w-xl mx-auto border border-divider bg-white p-12 text-center flex flex-col items-center">
          <CheckCircle2 className="w-12 h-12 text-moss mb-4" />
          <h2 className="text-2xl font-serif font-bold uppercase mb-4">Payment Received</h2>
          <p className="text-sm text-ink/70 mb-8 leading-relaxed">
            Your payment proof has been successfully submitted. Our team will verify the payment and activate your system within <strong>2 business hours</strong>.
          </p>
          <button 
            onClick={resetCheckout}
            className="border border-divider text-ink px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:border-ink transition-colors"
          >
            View Dashboard / Wait
          </button>
        </div>
      )}

    </div>
  );
}
