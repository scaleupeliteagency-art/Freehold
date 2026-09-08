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

  const router = useRouter();

  const BASE_MONTHLY = 45;
  const BASE_YEARLY = 432; // (540 - 20%)

  useEffect(() => {
    fetchPayments();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUser(data.user.email);
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

      const finalAmount = getFinalPrice(selectedPlan);

      // 1. Insert Payment Record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          plan_type: selectedPlan,
          amount: finalAmount,
          currency: "MAD",
          payment_method: paymentMethod,
          proof_url: proofUrl,
          transaction_reference: transactionId,
          promo_code_used: appliedPromo?.code || null,
          status: "pending"
        });

      if (paymentError) throw paymentError;

      // 2. Update Profile
      await supabase
        .from("profiles")
        .update({ 
          subscription_plan: selectedPlan,
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

  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const handleMakeAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Try to select first
      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("user_id", user.id).single();
      
      if (existingProfile) {
        await supabase.from("profiles").update({ is_admin: true, subscription_status: 'active' }).eq("user_id", user.id);
      } else {
        await supabase.from("profiles").insert([{ user_id: user.id, is_admin: true, subscription_status: 'active', name: 'Admin User' }]);
      }
      
      // Verify
      const { data: profile } = await supabase.from("profiles").select("is_admin, subscription_status").eq("user_id", user.id).single();
      if (!profile?.is_admin) {
         alert(`Warning: Database did not save the admin state for ${user.email}. Please run the SQL migration in Supabase.`);
         return;
      }

      alert(`Success! Profile for ${user.email} verified as Admin. Redirecting to dashboard...`);
      window.location.href = "/dashboard";
    } catch (err) {
      alert("Error making admin: " + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500 text-ink">
      
      {checkoutStep === 1 && (
        <>
          <div className="text-center mb-16 relative">
            <div className="absolute -top-6 left-0 text-xs text-ink/50 font-mono">
              Logged in as: <strong>{currentUser || 'Loading...'}</strong>
              <button onClick={handleLogout} className="ml-4 underline hover:text-ink">Sign Out</button>
            </div>

            {/* Hidden Dev Button */}
            <button 
              onClick={handleMakeAdmin}
              className="absolute -top-6 right-0 text-[10px] bg-ink text-paper px-3 py-1 uppercase tracking-widest font-bold"
            >
              🛠️ Force Admin Access (Dev)
            </button>

            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 uppercase tracking-tight">Activate Your Ledger</h1>
            <p className="text-lg text-ink/70 max-w-2xl mx-auto">
              Choose a plan to continue accessing your system. Built for serious execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly Plan */}
            <div className="border border-divider bg-paper p-8 flex flex-col relative">
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-2">Standard</div>
              <h2 className="text-2xl font-serif font-bold mb-4">Monthly Commitment</h2>
              <div className="mb-6">
                <span className="text-4xl font-serif font-bold text-ink">{BASE_MONTHLY}</span>
                <span className="text-sm font-bold text-ink/50 uppercase ml-2 tracking-widest">MAD / month</span>
              </div>
              
              <ul className="space-y-3 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Full access to the Working Ledger</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Goal & rock tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Weekly diagnostic reviews</span>
                </li>
              </ul>

              <button
                onClick={() => { setSelectedPlan("monthly"); setCheckoutStep(2); }}
                className="w-full border-2 border-ink text-ink py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors"
              >
                Select Monthly Plan
              </button>
            </div>

            {/* Yearly Plan */}
            <div className="border-2 border-ochre bg-white p-8 flex flex-col relative shadow-[8px_8px_0px_0px_rgba(30,42,36,0.1)]">
              <div className="absolute top-0 right-0 bg-ochre text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 m-4">
                Save 20%
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ochre mb-2">Professional</div>
              <h2 className="text-2xl font-serif font-bold mb-4">Yearly Commitment</h2>
              <div className="mb-6 flex flex-col">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-serif font-bold text-ink">{BASE_YEARLY}</span>
                  <span className="text-sm font-bold text-ink/50 uppercase tracking-widest mb-1">MAD / year</span>
                </div>
                <span className="text-xs text-ink/40 line-through mt-1">540 MAD</span>
              </div>
              
              <ul className="space-y-3 mb-10 flex-1">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Full access to the Working Ledger</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Goal & rock tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm text-ink/80">Weekly diagnostic reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-ochre mt-0.5 shrink-0" />
                  <span className="text-sm font-bold text-ink">Locked-in 20% discount</span>
                </li>
              </ul>

              <button
                onClick={() => { setSelectedPlan("yearly"); setCheckoutStep(2); }}
                className="w-full bg-ink text-paper py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors"
              >
                Select Yearly Plan
              </button>
            </div>
          </div>
        </>
      )}

      {checkoutStep === 2 && (
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setCheckoutStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink mb-6">← Back to plans</button>
          
          <h2 className="text-3xl font-serif font-bold mb-6 uppercase tracking-tight">Complete Payment</h2>
          
          <div className="border border-divider bg-white p-6 mb-8 flex justify-between items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink/50 mb-1">Selected Plan</div>
              <div className="font-serif font-bold text-xl capitalize">{selectedPlan} Commitment</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-serif font-bold">{getFinalPrice(selectedPlan)} MAD</div>
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

      {/* Payment History Table */}
      {checkoutStep === 1 && payments.length > 0 && (
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-sm font-bold uppercase tracking-widest text-ink mb-4">Payment History</h3>
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
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-divider last:border-0 hover:bg-paper/50">
                    <td className="p-4 text-xs font-mono">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-xs font-bold uppercase tracking-widest">{p.plan_type}</td>
                    <td className="p-4 text-sm font-serif font-bold">{p.amount} {p.currency}</td>
                    <td className="p-4 text-xs font-mono">{p.payment_method.replace('_', ' ')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        p.status === 'approved' ? 'bg-moss/10 text-moss border-moss/20' :
                        p.status === 'pending' ? 'bg-ochre/10 text-ochre border-ochre/20' :
                        'bg-red-500/10 text-red-600 border-red-500/20'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
