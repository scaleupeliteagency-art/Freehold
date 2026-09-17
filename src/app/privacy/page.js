"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 font-mono text-xs mb-12">LAST UPDATED: SEPTEMBER 17, 2026</p>
        <div className="prose prose-gray max-w-none prose-headings:font-extrabold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, update your profile, use the Service to log goals and inputs, or communicate with us. This includes your name, email address, payment information, and your proprietary system data.</p>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to operate, maintain, and improve the Service. We also use your data to power the AI investigation features that synthesize insights and correlations specifically for your account. We do not sell your personal data to third parties.</p>
          <h2>3. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no method of transmission over the internet or method of electronic storage is 100% secure.</p>
          <h2>4. Third-Party Services</h2>
          <p>We may use third-party service providers (such as Supabase for database hosting and Stripe for payment processing) to facilitate our Service. These third parties have access to your Personal Information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          <h2>5. Your Rights</h2>
          <p>You have the right to access, update, or delete the information we have on you. Whenever made possible, you can access, update, or request deletion of your Personal Data directly within your account settings section.</p>
        </div>
      </div>
    </div>
  );
}
