import React from 'react';
import { Shield, Lock, FileText, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
          <Shield className="w-3.5 h-3.5" />
          Compliance & Legal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-1">Effective Date: November 6, 2026 • Version 1.0</p>
      </div>

      <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-6 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            BizWebCheck collects information necessary to provide business website availability checking and lead management services:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Full name, business email address, company name, and encrypted password credentials.</li>
            <li><strong>Search Queries:</strong> Search terms, business names, geographic locations, and categories queried against our providers.</li>
            <li><strong>Saved Leads:</strong> Business names, contact details, and strategic outreach notes saved explicitly by users.</li>
            <li><strong>Payment & Billing Data:</strong> Transaction tokens, Razorpay Order IDs, and payment verification signatures. Credit card details are never stored directly on our servers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">2. Third-Party Provider Integration & Attribution</h2>
          <p>
            BizWebCheck integrates with legitimate commercial business directories including the Google Places API (New). We adhere strictly to provider data policies:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>We request only strictly authorized fields (Place ID, display name, formatted address, category, website URI, and Google Maps URI) using field masks.</li>
            <li>We do not scrape, harvest, or republish full proprietary directory databases.</li>
            <li>Verification queries inspect only the returned website URI to establish accessibility.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">3. Safe Website Verification (SSRF Protection)</h2>
          <p>
            Our website detection engine implements stringent Server-Side Request Forgery (SSRF) protections. Automated HTTP probes:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Block all private IP address ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 127.0.0.0/8, and cloud metadata 169.254.169.254).</li>
            <li>Enforce strict request timeouts (maximum 6,000ms) and payload limits.</li>
            <li>Do not execute client scripts, download binaries, or scan systems for security vulnerabilities.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">4. Contact & Inquiries</h2>
          <p>
            If you have questions regarding our privacy practices or data handling, please contact our privacy compliance officer at: <a href="mailto:privacy@bizwebcheck.com" className="text-indigo-600 font-semibold underline">privacy@bizwebcheck.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
