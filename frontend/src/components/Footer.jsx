import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                BizWeb<span className="text-indigo-400">Check</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Business Website Availability & Opportunity Finder. Empowering web agencies, freelance developers, and sales teams to discover high-value client leads.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>SSRF-Safe & Verified Detection Engine</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-3">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/search" className="hover:text-white transition-colors">Business Search</Link>
              </li>
              <li>
                <Link to="/bulk-search" className="hover:text-white transition-colors">Bulk Opportunity Finder</Link>
              </li>
              <li>
                <Link to="/leads" className="hover:text-white transition-colors">Saved Leads CRM</Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-white transition-colors">Opportunity Analytics</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">Subscription Plans</Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-3">Compliance & Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
              <li>
                <a href="#attribution" className="hover:text-white transition-colors">Google Places Attribution</a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">Data Retention & SLA</a>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Policy Notice */}
          <div>
            <h3 className="text-xs font-semibold text-slate-200 tracking-wider uppercase mb-3">Notice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              BizWebCheck distinguishes between missing directory listings and active website absence. Never assume a business definitively lacks a website solely because a directory URL is absent.
            </p>
            <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/50 text-[11px] text-slate-400">
              Supported payment gateway: <strong>Razorpay</strong> (INR Cards, UPI, Netbanking).
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BizWebCheck SaaS. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center gap-1">
            Built with modern architecture for digital agencies & developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
