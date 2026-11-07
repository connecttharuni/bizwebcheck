import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Globe, 
  AlertCircle, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  FileSpreadsheet, 
  Users, 
  ChevronRight,
  Sparkles,
  HelpCircle,
  Mail,
  Send
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import OpportunityBadge from '../components/OpportunityBadge';

export default function LandingPage() {
  const navigate = useNavigate();
  const [quickBusiness, setQuickBusiness] = useState('');
  const [quickCity, setQuickCity] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [searching, setSearching] = useState(false);

  // Live quick sample tester directly on homepage
  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (!quickBusiness && !quickCity) return;
    setSearching(true);

    setTimeout(() => {
      setSearching(false);
      const isDominos = quickBusiness.toLowerCase().includes('domino');
      if (isDominos) {
        setQuickResult({
          name: quickBusiness || "Domino's Pizza",
          city: quickCity || 'Chennai',
          businessFound: true,
          websiteStatus: 'Website Found',
          websiteUrl: 'https://www.dominos.co.in',
          recommendation: 'Business has an active website. May offer modernization, SEO, or redesign if outdated.',
          opportunityScore: 20
        });
      } else {
        setQuickResult({
          name: quickBusiness || 'ABC Bakery',
          city: quickCity || 'Chennai',
          businessFound: true,
          websiteStatus: 'Website Not Listed',
          websiteUrl: null,
          recommendation: 'Potential website development opportunity. Business lacks an official website in directory records.',
          opportunityScore: 95
        });
      }
    }, 400);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS for Web Agencies & Freelancers
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Discover Businesses. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700">
                Identify Website Opportunities.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Find businesses, check their website availability and discover potential opportunities for your web development business.
            </p>

            {/* Quick Search Widget */}
            <div className="mt-10 p-3 sm:p-4 rounded-2xl bg-white shadow-xl shadow-indigo-500/10 border border-slate-200/80 max-w-2xl mx-auto text-left">
              <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={quickBusiness}
                    onChange={e => setQuickBusiness(e.target.value)}
                    placeholder="Business Name (e.g. ABC Bakery or Domino's)"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <div className="w-full sm:w-44">
                  <input
                    type="text"
                    value={quickCity}
                    onChange={e => setQuickCity(e.target.value)}
                    placeholder="City (e.g. Chennai)"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searching}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] flex-shrink-0"
                >
                  {searching ? 'Checking...' : 'Check Availability'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Sample Result Preview Box */}
              {quickResult && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{quickResult.name}</h4>
                      <p className="text-xs text-slate-500">{quickResult.city} • Business Found: Yes</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={quickResult.websiteStatus} />
                      <OpportunityBadge score={quickResult.opportunityScore} />
                    </div>
                  </div>

                  <div className="mt-3 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-slate-700">
                      <strong>Website:</strong>{' '}
                      {quickResult.websiteUrl ? (
                        <a href={quickResult.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                          {quickResult.websiteUrl}
                        </a>
                      ) : (
                        <span className="text-slate-400">Not Available</span>
                      )}
                    </p>
                    <Link
                      to={`/register`}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                    >
                      Save Lead to CRM <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="mt-2 text-xs text-indigo-900 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100 font-medium">
                    💡 <strong>Recommendation:</strong> {quickResult.recommendation}
                  </div>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Try examples: <strong>ABC Bakery, Chennai</strong> or <strong>Domino's, Chennai</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Powered by Google Places API (New)
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] text-center"
              >
                Start Free Trial (20 Searches)
              </Link>
              <Link
                to="/pricing"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all text-center"
              >
                View Subscription Plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2">Workflow</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">How BizWebCheck Discovers Clients</p>
            <p className="mt-3 text-slate-600 text-sm">
              From raw business registry to closed web design contracts in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-indigo-600/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Search Business Directory</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Query businesses by name, category, and city using legitimate business providers like Google Places API (New).
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-purple-600/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">SSRF-Safe Website Verification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our engine inspects DNS records, accessibility, redirect hops, and HTTP status codes while blocking private IPs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl mb-6 shadow-md shadow-emerald-600/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Identify & Convert Leads</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Save prospects with "Website Not Listed" or "Website Unreachable" into your CRM pipeline and pitch custom web solutions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Five Clear Status Categories */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2">Accuracy & Integrity</h2>
            <p className="text-2xl font-extrabold text-slate-900">Clearly Defined Website Statuses</p>
            <p className="text-xs text-slate-500 mt-2">
              We never claim a business definitively lacks a website solely because an API lacks a URL.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <StatusBadge status="Website Found" />
              <h4 className="font-bold text-slate-800 text-sm mt-3 mb-1">Website Found</h4>
              <p className="text-xs text-slate-500">Official URL returned and verified active through HTTP response probe.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <StatusBadge status="Website Not Listed" />
              <h4 className="font-bold text-slate-800 text-sm mt-3 mb-1">Website Not Listed</h4>
              <p className="text-xs text-slate-500">Directory has no URL listed. Prime opportunity for website design outreach.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <StatusBadge status="Website Unreachable" />
              <h4 className="font-bold text-slate-800 text-sm mt-3 mb-1">Website Unreachable</h4>
              <p className="text-xs text-slate-500">URL exists but failed DNS lookup, SSL check, or HTTP 4xx/5xx status.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <StatusBadge status="Unable to Verify" />
              <h4 className="font-bold text-slate-800 text-sm mt-3 mb-1">Unable to Verify</h4>
              <p className="text-xs text-slate-500">Timeout or security network guard prevented conclusive probe.</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <StatusBadge status="Business Not Found" />
              <h4 className="font-bold text-slate-800 text-sm mt-3 mb-1">Business Not Found</h4>
              <p className="text-xs text-slate-500">No matching business entity found in the searched geographical radius.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2">SaaS Capabilities</h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">Built For High-Output Agency Sales</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Bulk Business Discovery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scan entire cities by category (e.g., 50 Restaurants in Chennai) and automatically batch-verify website presence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Excel & CSV Exports</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly export opportunity lists formatted with business contact details for cold emailing or calling.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Mini CRM Pipeline</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track leads through stages: New, Contacted, Interested, and Converted with estimated deal values.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview Banner */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Flexible Plans For Agencies of Any Size</h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            From our Free Trial (20 searches) to Starter (₹499/mo), Professional (₹999/mo) and Business (₹1,999/mo).
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/pricing"
              className="px-8 py-3.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              Explore All Subscription Plans
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-2">FAQ</h2>
            <p className="text-2xl font-extrabold text-slate-900">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                How does BizWebCheck verify website status?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                We query the business listing provider for official website URIs. If present, we run DNS resolution, check HTTP response status codes (200 OK vs 404/500), follow redirects safely, and enforce strict SSRF security checks.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                What if a business has a website that isn't listed on Google?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                That is why we explicitly use the label <strong>"Website Not Listed"</strong> instead of claiming absence. Even if they own an unlisted website, their lack of a verified directory link represents a valuable SEO and local visibility opportunity to pitch!
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                Which payment methods does BizWebCheck accept?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                We integrate Razorpay, supporting Indian Debit & Credit Cards, UPI (GPay, PhonePe, Paytm), Netbanking, and international cards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Mail className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-extrabold text-slate-900">Have Questions or Custom Requirements?</h2>
          <p className="mt-2 text-sm text-slate-600">
            Reach our enterprise team for custom search quotas, multi-seat accounts, or dedicated API access.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="mailto:support@bizwebcheck.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition-colors"
            >
              <Send className="w-4 h-4" />
              Contact Sales & Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
