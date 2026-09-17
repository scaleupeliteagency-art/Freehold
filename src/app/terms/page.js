"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-500 font-mono text-xs mb-12">LAST UPDATED: SEPTEMBER 17, 2026</p>
        <div className="prose prose-gray max-w-none prose-headings:font-extrabold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
          <h2>1. Introduction</h2>
          <p>Welcome to Working Ledger ("we," "our," or "us"). By accessing or using our website, services, and software provided through Working Ledger (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.</p>
          <h2>2. The Service</h2>
          <p>Working Ledger is a goal operating system designed to help you track, analyze, and evolve your long-term objectives and daily execution data. We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.</p>
          <h2>3. Accounts and Registration</h2>
          <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.</p>
          <h2>4. Subscription and Billing</h2>
          <p>Access to the core operating features requires a paid subscription ($5/month). By subscribing, you authorize us to charge your payment method on a recurring basis. You may cancel your subscription at any time; however, there are no refunds for partially used billing periods.</p>
          <h2>5. User Data and Ownership</h2>
          <p>You retain all rights and ownership to the goals, input definitions, reviews, and execution data you submit. By submitting User Data, you grant us a non-exclusive license to use, host, and store such data solely for the purpose of providing and improving the Service.</p>
        </div>
      </div>
    </div>
  );
}
