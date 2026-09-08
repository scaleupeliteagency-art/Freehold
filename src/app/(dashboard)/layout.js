"use client";

import { LedgerSidebar } from "@/components/layout/LedgerSidebar";
import BillingGuard from "@/components/auth/BillingGuard";

export default function DashboardLayout({ children }) {
  return (
    <BillingGuard>
      <LedgerSidebar>{children}</LedgerSidebar>
    </BillingGuard>
  );
}
