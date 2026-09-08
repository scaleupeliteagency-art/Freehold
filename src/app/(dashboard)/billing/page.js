"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubscribe = async (plan) => {
    setLoading(true);
    // Because no payment gateway is integrated yet, this creates a "pending" request for the admin
    // Or we could mock it as instantly active for testing. Let's make it a request that tells the user
    // to contact admin, or we can just mock an active state if we want to bypass for testing.
    // Given the prompt "create another page for me to manage subscriptions", it implies manual management.
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      // We will set status to "pending_payment" and let the admin activate it from the admin dashboard.
      await supabase
        .from("profiles")
        .update({ 
          subscription_plan: plan,
          subscription_status: "pending_payment" 
        })
        .eq("user_id", user.id);
        
      alert(`Subscription request for the ${plan} plan sent. The admin will activate your account once payment is received.`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500 text-ink">
      <div className="text-center mb-16">
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
            <span className="text-4xl font-serif font-bold text-ink">45</span>
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
            onClick={() => handleSubscribe("monthly")}
            disabled={loading}
            className="w-full border-2 border-ink text-ink py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Select Monthly Plan"}
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
              <span className="text-4xl font-serif font-bold text-ink">432</span>
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
            onClick={() => handleSubscribe("yearly")}
            disabled={loading}
            className="w-full bg-ink text-paper py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-ink/80 transition-colors disabled:opacity-50"
          >
            {loading ? "Processing..." : "Select Yearly Plan"}
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-center">
         <p className="text-xs text-ink/40 max-w-md mx-auto uppercase tracking-widest">
           Billing is managed manually by the administrator. Selecting a plan will notify the admin to provision your account.
         </p>
      </div>
    </div>
  );
}
