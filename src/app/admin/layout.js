"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Tag } from "lucide-react";

export default function AdminLayout({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("user_id", user.id)
        .single();
        
      const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        
      if (isSuperAdmin || profile?.is_admin) {
        setIsAdmin(true);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    }
    checkAdmin();
  }, [router]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-paper text-ink uppercase tracking-widest text-xs font-bold animate-pulse">Loading Admin...</div>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r border-divider bg-white p-6 flex flex-col">
        <div className="mb-10 flex items-center gap-2">
          <div className="w-6 h-6 border border-ink flex items-center justify-center text-[10px] font-bold text-ink">
            A
          </div>
          <span className="font-serif font-bold text-ink uppercase tracking-widest text-sm">Admin Control</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin/subscriptions" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-ink bg-paper border border-divider">
            <Users size={16} className="text-ochre" />
            Users & Subs
          </Link>
          <Link href="/admin/payments" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-ink bg-paper border border-divider">
            <CreditCard size={16} className="text-ochre" />
            Payments
          </Link>
          <Link href="/admin/promos" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-ink bg-paper border border-divider">
            <Tag size={16} className="text-ochre" />
            Promo Codes
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-ink/50 hover:text-ink transition-colors mt-auto">
            <LayoutDashboard size={16} />
            Back to App
          </Link>
        </nav>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
