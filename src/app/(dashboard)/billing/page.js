"use client";

import { useState, useEffect, useRef } from "react";
import { Check, CheckCircle2, ChevronDown, FileCheck2, ImagePlus, LockKeyhole, ShieldCheck, Upload, WalletCards } from "lucide-react";
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
  const [paymentNote, setPaymentNote] = useState("");
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const paypalContainerRef = useRef(null);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Choose plan, 2: Checkout, 3: Success

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const router = useRouter();

  const BASE_MONTHLY = 5;
  const BASE_YEARLY = 47;
  const CURRENCY = "USD";
  const PAYPAL_CURRENCY = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD";
  const CURRENCY_SYMBOL = "$";
  const BANK_DETAILS = {
    holder: process.env.NEXT_PUBLIC_BANK_HOLDER || "Working Ledger",
    rib: process.env.NEXT_PUBLIC_BANK_RIB || "007395000984530040029175",
    bank: process.env.NEXT_PUBLIC_BANK_NAME || "SIMPLE BY ATTIJARYWAFABANK"
  };
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

  useEffect(() => {
    if (checkoutStep !== 2 || paymentMethod !== "paypal" || getFinalPrice(selectedPlan || "monthly") === 0) return;

    let cancelled = false;
    const renderButtons = (clientId, paypalCurrency) => {
      if (!window.paypal || !paypalContainerRef.current) return;
      paypalContainerRef.current.innerHTML = "";
      window.paypal.Buttons({
        style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
        createOrder: async () => {
          const response = await fetch("/api/paypal/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: selectedPlan || "monthly", amount: getFinalPrice(selectedPlan || "monthly"), currency: paypalCurrency })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Unable to start PayPal checkout.");
          return result.orderId;
        },
        onApprove: async (data) => {
          setLoading(true);
          setPaypalError("");
          try {
            const response = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID, plan: selectedPlan || "monthly", amount: getFinalPrice(selectedPlan || "monthly"), currency: paypalCurrency })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "PayPal payment could not be captured.");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Your session expired. Please sign in again.");
            const activePlan = selectedPlan || "monthly";
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (activePlan === "yearly" ? 12 : 1));
            const { error: paymentError } = await supabase.from("payments").insert({
              user_id: user.id,
              amount: getFinalPrice(activePlan),
              currency: CURRENCY,
              payment_method: "paypal",
              plan_type: activePlan,
              promo_code_used: appliedPromo?.code || null,
              transaction_reference: data.orderID,
              status: "approved"
            });
            if (paymentError) throw paymentError;
            const { error: profileError } = await supabase.from("profiles").update({
              subscription_plan: activePlan,
              subscription_status: "active",
              subscription_end_date: endDate.toISOString()
            }).eq("user_id", user.id);
            if (profileError) throw profileError;
            setCheckoutStep(3);
            fetchPayments();
          } catch (error) {
            setPaypalError(error.message);
          } finally {
            setLoading(false);
          }
        },
        onError: (error) => setPaypalError(error?.message || "PayPal checkout failed. Please try again.")
      }).render(paypalContainerRef.current);
      setPaypalReady(true);
    };

    const loadPayPal = async () => {
      try {
        const configResponse = await fetch("/api/paypal/config");
        const config = await configResponse.json();
        if (!configResponse.ok || !config.clientId) {
          setPaypalError("PayPal is not configured yet. Add PAYPAL_CLIENT_ID in Vercel.");
          return;
        }
        if (cancelled) return;

        const paypalCurrency = config.currency || PAYPAL_CURRENCY;
        const existingScript = document.getElementById("paypal-checkout-sdk");
        if (existingScript) {
          if (window.paypal) renderButtons(config.clientId, paypalCurrency);
          return;
        }

        const script = document.createElement("script");
        script.id = "paypal-checkout-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(config.clientId)}&currency=${paypalCurrency}&intent=capture`;
        script.onload = () => renderButtons(config.clientId, paypalCurrency);
        script.onerror = () => setPaypalError("Unable to load PayPal. Check your client ID and network connection.");
        document.body.appendChild(script);
      } catch {
        setPaypalError("Unable to load PayPal configuration.");
      }
    };

    loadPayPal();
    return () => {
      cancelled = true;
      if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = "";
      setPaypalReady(false);
    };
  }, [checkoutStep, paymentMethod, selectedPlan, appliedPromo]);

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

  const handleFileUpload = async (file, userId) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('payment_proofs')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }
    
    return filePath;
  };

  const handleSubmitPayment = async () => {
    const activePlan = selectedPlan || "monthly";
    const finalAmount = getFinalPrice(activePlan);
    const isFreeCheckout = finalAmount === 0;

    if (!isFreeCheckout && paymentMethod === 'bank_transfer' && !proofFile) {
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
        proofUrl = await handleFileUpload(proofFile, user.id);
      }

      // 1. Create Payment Record
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user.id,
          amount: finalAmount,
          currency: CURRENCY,
          payment_method: paymentMethod,
          plan_type: activePlan,
          proof_url: proofUrl,
          transaction_reference: transactionId || null,
          promo_code_used: appliedPromo?.code || null,
          notes: paymentNote || null,
          status: isFreeCheckout ? "approved" : "pending"
        });

      if (paymentError) throw paymentError;

      // 2. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          subscription_plan: activePlan,
          subscription_status: isFreeCheckout ? "active" : "pending_payment",
          ...(isFreeCheckout ? { subscription_end_date: (() => {
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + (activePlan === "yearly" ? 12 : 1));
            return endDate.toISOString();
          })() } : {})
        })
        .eq("user_id", user.id);

      if (profileError) throw profileError;
        
      setCheckoutStep(3);
      fetchPayments();
    } catch (err) {
      console.error(err);
      alert(`Error submitting payment: ${err.message || "Unknown error"}`);
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
    setPaymentNote("");
    setPaypalError("");
    setDragActive(false);
  };

  const setSelectedProof = (file) => {
    if (file) setProofFile(file);
  };

  const qrUrl = (data) => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(data)}`;
  const bankQrData = `Bank: ${BANK_DETAILS.bank}\nHolder: ${BANK_DETAILS.holder}\nRIB: ${BANK_DETAILS.rib}`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const isActive = profile?.subscription_status === 'active' || profile?.is_admin;
  const isFreeCheckout = getFinalPrice(selectedPlan || "monthly") === 0;
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
                          <td className="p-4 text-sm font-serif font-bold">${Number(p.amount).toFixed(2)} USD</td>
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
        <div className="max-w-6xl mx-auto">
          <button onClick={() => setCheckoutStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-ink/50 hover:text-ink mb-6">← Back to billing</button>
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ochre mb-2">Secure checkout / 01</p>
              <h2 className="text-4xl font-serif font-bold uppercase tracking-tight">Subscribe to Working Ledger</h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/50"><LockKeyhole size={14} /> Encrypted payment</div>
          </div>

          <div className="grid lg:grid-cols-[0.82fr_1.5fr] border border-divider bg-white shadow-[12px_12px_0_rgba(30,42,36,0.06)]">
            <section className="p-8 md:p-10 bg-ink text-paper">
              <p className="text-[10px] uppercase tracking-[0.25em] text-paper/50 mb-8">Your subscription</p>
              <div className="relative mb-10">
                <label id="billing-plan-label" className="block text-[10px] uppercase tracking-[0.2em] text-paper/50 mb-2">Billing cadence</label>
                <button type="button" aria-haspopup="listbox" aria-expanded={planMenuOpen} aria-labelledby="billing-plan-label" onClick={() => setPlanMenuOpen((open) => !open)} className={`relative flex w-full items-center justify-between border bg-paper/[0.06] px-4 py-4 text-left transition-colors focus:outline-none focus:ring-1 focus:ring-ochre ${planMenuOpen ? "border-ochre" : "border-paper/25 hover:border-paper/50"}`}>
                  <span>
                    <span className="block font-serif text-2xl font-bold">{selectedPlan === "yearly" ? "Yearly" : "Monthly"}</span>
                    <span className="mt-1 block text-[10px] uppercase tracking-widest text-paper/45">{selectedPlan === "yearly" ? "Billed once per year" : "Billed every month"}</span>
                  </span>
                  <span className="flex items-center gap-3"><span className="font-mono text-sm text-ochre">${selectedPlan === "yearly" ? "47" : "5"}</span><ChevronDown aria-hidden="true" className={`text-ochre transition-transform duration-200 ${planMenuOpen ? "rotate-180" : ""}`} size={20} /></span>
                </button>

                {planMenuOpen && (
                  <div role="listbox" aria-labelledby="billing-plan-label" className="absolute left-0 right-0 top-full z-30 mt-2 border border-ochre/60 bg-[#26352d] p-2 shadow-[8px_8px_0_rgba(0,0,0,0.25)] animate-in fade-in slide-in-from-top-2 duration-200">
                    {[{ id: "monthly", name: "Monthly", price: "$5", detail: "Flexible monthly access" }, { id: "yearly", name: "Yearly", price: "$47", detail: "One annual payment", badge: "BEST VALUE" }].map((plan) => {
                      const isSelected = (selectedPlan || "monthly") === plan.id;
                      return (
                        <button key={plan.id} type="button" role="option" aria-selected={isSelected} onClick={() => { setSelectedPlan(plan.id); setPlanMenuOpen(false); }} className={`group flex w-full items-center justify-between border p-4 text-left transition-all ${isSelected ? "border-ochre bg-ochre/15" : "border-transparent hover:border-paper/30 hover:bg-paper/[0.08]"}`}>
                          <span className="flex items-center gap-3"><span className={`flex h-5 w-5 items-center justify-center border ${isSelected ? "border-ochre bg-ochre text-ink" : "border-paper/35 text-transparent"}`}><Check size={13} /></span><span><span className="flex items-center gap-2 font-serif text-lg font-bold text-paper">{plan.name}{plan.badge && <span className="font-sans text-[8px] font-bold tracking-widest text-ochre">{plan.badge}</span>}</span><span className="block text-[10px] uppercase tracking-widest text-paper/45">{plan.detail}</span></span></span>
                          <span className="font-mono text-sm font-bold text-ochre">{plan.price}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="flex justify-between px-1 pt-2 text-[10px] uppercase tracking-widest text-paper/40">
                  <span>{selectedPlan === "yearly" ? "One annual payment" : "Flexible monthly access"}</span>
                  {selectedPlan === "yearly" && <span className="text-ochre">Best value</span>}
                </div>
              </div>
              <div className="flex items-baseline gap-2 mb-1"><span className="text-5xl font-serif font-bold">{CURRENCY_SYMBOL}{getFinalPrice(selectedPlan || "monthly")}</span><span className="text-sm uppercase tracking-widest text-paper/60">{CURRENCY}</span></div>
              <p className="text-sm text-paper/60 mb-12">{selectedPlan === "yearly" ? "Billed once per year" : "Billed every month"}</p>
              <div className="mb-10">
                <label htmlFor="promo-code" className="block text-[10px] font-bold uppercase tracking-widest text-paper/50 mb-2">Promo code (optional)</label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value.toUpperCase());
                      setAppliedPromo(null);
                      if (promoError) setPromoError("");
                    }}
                    placeholder="Enter code"
                    aria-describedby={promoError ? "promo-code-error" : undefined}
                    className="min-w-0 flex-1 bg-paper/[0.06] border border-paper/25 px-3 py-3 text-sm uppercase text-paper focus:outline-none focus:border-ochre placeholder:text-paper/40 placeholder:normal-case"
                  />
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={loading || !promoCode.trim()}
                    className="border border-ochre bg-ochre px-4 text-[10px] font-bold uppercase tracking-widest text-ink hover:bg-ochre/80 disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && <p className="text-xs text-ochre mt-2 font-medium">{appliedPromo.discount_percentage}% discount applied.</p>}
                {promoError && <p id="promo-code-error" className="text-xs text-red-300 mt-2 font-medium">{promoError}</p>}
              </div>
              <div className="space-y-4 border-t border-paper/20 pt-6 text-sm text-paper/75">
                <div className="flex gap-3"><Check size={16} className="text-ochre shrink-0" /> Full Working Ledger access</div>
                <div className="flex gap-3"><Check size={16} className="text-ochre shrink-0" /> Structured reviews and insights</div>
                <div className="flex gap-3"><Check size={16} className="text-ochre shrink-0" /> Subscription support</div>
              </div>
              <div className="mt-12 pt-5 border-t border-paper/20 flex items-center gap-3 text-[10px] uppercase tracking-widest text-paper/50"><ShieldCheck size={17} /> Payment verified by Working Ledger</div>
            </section>

            <section className="p-6 md:p-10">
              {!isFreeCheckout && <div className="flex gap-1 border-b border-divider mb-8">
                {[{ id: "bank_transfer", label: "Bank transfer", icon: WalletCards }, { id: "paypal", label: "PayPal", icon: WalletCards }].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setPaymentMethod(id)} className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-colors ${paymentMethod === id ? "border-ochre text-ink" : "border-transparent text-ink/40 hover:text-ink"}`}><Icon size={15} /> {label}</button>
                ))}
              </div>}

              {isFreeCheckout ? (
                <div className="border border-ochre/40 bg-ochre/5 p-6 text-center">
                  <p className="text-sm text-ink/70 mb-5">Your discount covers the full subscription amount.</p>
                  <button onClick={handleSubmitPayment} disabled={loading} className="w-full bg-ink text-paper py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ochre hover:text-ink transition-colors disabled:opacity-40">
                    {loading ? "Activating subscription..." : "Activate subscription for free"}
                  </button>
                </div>
              ) : paymentMethod === "bank_transfer" && (
                <div className="animate-in fade-in duration-300">
                  <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1 space-y-3 text-xs"><p className="text-[10px] font-bold uppercase tracking-widest text-ink/50">Transfer details</p>{[["Bank", BANK_DETAILS.bank], ["Account holder", BANK_DETAILS.holder], ["RIB", BANK_DETAILS.rib]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-divider py-2"><span className="text-ink/50">{label}</span><span className="font-mono text-right select-all">{value}</span></div>)}</div>
                    <div className="border border-divider p-3 self-start"><img src={qrUrl(bankQrData)} alt="QR code with bank transfer details" className="w-36 h-36" /><p className="text-[9px] text-center uppercase tracking-widest text-ink/50 mt-2">Scan to copy details</p></div>
                  </div>
                </div>
              )}

              {!isFreeCheckout && (paymentMethod === "paypal" ? (
                <div className="animate-in fade-in duration-300"><p className="text-sm text-ink/70 mb-5">Pay securely with PayPal. Your account will activate automatically after PayPal confirms the payment.</p><div ref={paypalContainerRef} className="min-h-12" />{!paypalReady && !paypalError && <div className="text-xs text-ink/50 py-4">Loading secure PayPal checkout...</div>}{paypalError && <p className="text-xs text-red-600 mt-3">{paypalError}</p>}</div>
              ) : (
                <div className="space-y-5">
                  <div onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragActive(false)} onDrop={(e) => { e.preventDefault(); setDragActive(false); setSelectedProof(e.dataTransfer.files[0]); }} onClick={() => document.getElementById("proof-upload").click()} className={`border border-dashed p-6 text-center cursor-pointer transition-colors ${dragActive ? "border-ochre bg-ochre/5" : "border-divider hover:border-ink"}`}>
                    <input id="proof-upload" type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setSelectedProof(e.target.files[0])} />
                    {proofFile ? <><FileCheck2 className="mx-auto text-moss mb-2" size={25} /><p className="text-sm font-bold">{proofFile.name}</p><p className="text-[10px] text-ink/50 mt-1">Click to replace file</p></> : <><ImagePlus className="mx-auto text-ink/40 mb-2" size={25} /><p className="text-sm font-bold">Drop payment proof here</p><p className="text-[10px] text-ink/50 mt-1">PNG, JPG or PDF up to 10 MB</p></>}
                  </div>
                  <input type="text" placeholder="Transaction ID or hash (optional)" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full bg-paper border border-divider py-3 px-4 text-sm focus:outline-none focus:border-ink" />
                  <textarea placeholder="Add a note for our payment team (optional)" value={paymentNote} onChange={(e) => setPaymentNote(e.target.value)} rows={3} className="w-full bg-paper border border-divider py-3 px-4 text-sm focus:outline-none focus:border-ink resize-none" />
                  <button onClick={handleSubmitPayment} disabled={loading || !proofFile} className="w-full bg-ink text-paper py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ochre transition-colors disabled:opacity-40">{loading ? "Submitting for review..." : `Confirm ${CURRENCY_SYMBOL}${getFinalPrice(selectedPlan || "monthly")} payment`}</button>
                  <p className="text-[10px] leading-relaxed text-ink/50">After confirmation, our team will review your proof and activate your account. You will see the result in Payment History.</p>
                </div>
              ))}
              <div className="mt-8 pt-5 border-t border-divider flex items-center gap-2 text-[10px] uppercase tracking-widest text-ink/40"><LockKeyhole size={13} /> Your payment details stay private</div>
            </section>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-ink/50"><Upload size={14} /> Manual payments are reviewed by the Working Ledger team before activation.</div>
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
