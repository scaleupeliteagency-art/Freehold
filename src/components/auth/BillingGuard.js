"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function BillingGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkBillingStatus() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // Exclude the billing page and system creation page (if you want them to configure before paying, 
        // but the prompt says: "redirect direcly to the billing page" for no active plan).
        // Let's exclude admin pages and billing page from the check.
        if (pathname.startsWith("/billing") || pathname.startsWith("/admin")) {
          setHasAccess(true);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_status, subscription_end_date, is_admin")
          .eq("user_id", user.id)
          .single();

        if (profile?.is_admin) {
          setHasAccess(true);
        } else if (profile?.subscription_status === "active") {
          // Check if it's expired
          const end = new Date(profile.subscription_end_date);
          const now = new Date();
          if (end < now) {
             router.push("/billing");
          } else {
             setHasAccess(true);
          }
        } else {
          router.push("/billing");
        }
      } catch (err) {
        console.error("Billing check error:", err);
      } finally {
        setLoading(false);
      }
    }

    checkBillingStatus();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="text-sm font-bold animate-pulse uppercase tracking-widest text-ink/50">Verifying Ledger Access...</div>
      </div>
    );
  }

  if (!hasAccess && !pathname.startsWith("/billing") && !pathname.startsWith("/admin")) {
    return null; // Will redirect
  }

  return children;
}
