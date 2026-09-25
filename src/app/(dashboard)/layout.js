"use client";

import { LedgerSidebar } from "@/components/layout/LedgerSidebar";
import BillingGuard from "@/components/auth/BillingGuard";
import { GlobalReviewBlocker } from "@/components/layout/GlobalReviewBlocker";

export default function DashboardLayout({ children }) {
  return (
    <BillingGuard>
      <GlobalReviewBlocker>
        <LedgerSidebar>{children}</LedgerSidebar>
      </GlobalReviewBlocker>
    </BillingGuard>
  );
}
