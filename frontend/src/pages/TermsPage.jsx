import React from 'react';
import { FileText, AlertTriangle, Scale, ShieldCheck } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Scale className="w-3.5 h-3.5" />
          Commercial Agreement
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms and Conditions of Service</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: November 6, 2026 • Version 1.0</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800 mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Important Disclaimer on Website Availability
          </div>
          <p className="text-xs leading-relaxed">
            BizWebCheck checks whether an official website URL is listed in third-party business directories. The status <strong>"Website Not Listed"</strong> indicates that the business data provider has no URL on file; it does <em>not</em> guarantee that the business definitely lacks any website or internet presence. Users must market to prospective businesses responsibly and professionally.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By creating an account, accessing BizWebCheck, or subscribing to any paid plan, you agree to be bound by these Terms and Conditions. If you do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Subscription Plans & Search Quotas</h2>
          <p>
            BizWebCheck offers Free Trial, Starter, Professional, Business, and Enterprise plans with allocated search limits:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Search limits reset on the monthly or annual renewal date based on your active billing cycle.</li>
            <li>Users may not bypass search limits through unauthorized automated scripting or multiple account generation.</li>
            <li>Failed, invalid, or blocked queries are not unfairly deducted from user quotas.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Billing & Razorpay Payments</h2>
          <p>
            Paid subscriptions are processed through Razorpay. All fees are specified in Indian Rupees (INR) plus applicable taxes. Subscription upgrades are activated only upon cryptographically verified server-side payment capture.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Prohibited Uses</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Attempt Server-Side Request Forgery (SSRF) against internal networks or cloud metadata IP addresses.</li>
            <li>Use BizWebCheck data to engage in unlawful harassment or spamming.</li>
            <li>Resell or republish raw directory databases in violation of Google Places API terms.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">5. Governing Law</h2>
          <p>
            These terms shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction in Chennai, Tamil Nadu.
          </p>
        </section>
      </div>
    </div>
  );
}
