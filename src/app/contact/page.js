"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Twitter } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <div className="max-w-[800px] mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-6">Contact Us</h1>
        <p className="text-xl text-gray-500 font-medium mb-12 leading-relaxed">
          Questions about your operating system? Need support with your billing? We're here to help.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-8">
          <a href="mailto:support@workingledger.com" className="bg-gray-50 border border-gray-200 p-8 rounded-xl hover:border-orange-200 hover:shadow-lg transition-all group block">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-900 shadow-sm mb-6 group-hover:text-orange-600 transition-colors">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Email Support</h3>
            <p className="text-gray-500 font-medium">support@workingledger.com</p>
          </a>

          <a href="#" className="bg-gray-50 border border-gray-200 p-8 rounded-xl hover:border-orange-200 hover:shadow-lg transition-all group block">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-900 shadow-sm mb-6 group-hover:text-orange-600 transition-colors">
              <Twitter className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Twitter / X</h3>
            <p className="text-gray-500 font-medium">@workingledger</p>
          </a>
        </div>
      </div>
    </div>
  );
}
