import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Sparkles, CreditCard, Shield, Zap, ArrowRight, HelpCircle } from 'lucide-react';

export default function SubscriptionPlansPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  const plans = [
    {
      id: 'FREE_TRIAL',
      name: 'Free Trial',
      description: 'Ideal for testing accuracy and verifying single local businesses.',
      priceMonthly: 0,
      priceYearly: 0,
      searchLimit: 20,
      features: [
        '20 Single Business Searches',
        'Basic Website Verification',
        'Standard Search History',
        'SSRF & DNS Security Shield'
      ],
      popular: false,
      cta: 'Current Plan'
    },
    {
      id: 'STARTER',
      name: 'Starter',
      description: 'Perfect for freelance web developers prospecting regional clients.',
      priceMonthly: 499,
      priceYearly: 4990,
      searchLimit: 500,
      features: [
        '500 Searches / Month',
        'Website Availability Statuses',
        'Search History Log',
        'CSV Export',
        'Lead Opportunity Scoring',
        'Email Support'
      ],
      popular: false,
      cta: 'Upgrade to Starter'
    },
    {
      id: 'PROFESSIONAL',
      name: 'Professional',
      description: 'Best for growing digital agencies and outreach consultants.',
      priceMonthly: 999,
      priceYearly: 9990,
      searchLimit: 2000,
      features: [
        '2,000 Searches / Month',
        'Bulk Business Discovery (50/batch)',
        'Saved Leads CRM Pipeline',
        'Excel (.xlsx) & CSV Exports',
        'Advanced Opportunity Filters',
        'Priority Verification Engine'
      ],
      popular: true,
      badge: 'Most Popular',
      cta: 'Upgrade to Professional'
    },
    {
      id: 'BUSINESS',
      name: 'Business',
      description: 'For established web design & SEO firms scaling lead acquisition.',
      priceMonthly: 1999,
      priceYearly: 19990,
      searchLimit: 5000,
      features: [
        '5,000 Searches / Month',
        'Unlimited CRM Leads Management',
        'Multi-member Team Workspace',
        'Opportunity Analytics Reports',
        'Faster Verification Concurrency',
        '24/7 Priority Support'
      ],
      popular: false,
      cta: 'Upgrade to Business'
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise',
      description: 'Custom high-volume API access and custom search quotas.',
      priceMonthly: 4999,
      priceYearly: 49990,
      searchLimit: 25000,
      features: [
        'Custom Search Quotas (25,000+)',
        'Direct REST API Access',
        'Dedicated Account Manager',
        'Custom Webhooks & Integrations',
        '99.9% Uptime Guarantee SLA',
        'Custom Billing & Invoicing'
      ],
      popular: false,
      cta: 'Contact Enterprise'
    }
  ];

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate('/register');
      return;
    }
    if (plan.id === 'FREE_TRIAL') {
      return;
    }
    navigate(`/payment?plan=${plan.id}&billing=${billingCycle}`);
  };

  const currentPlanId = subscription?.plan || 'FREE_TRIAL';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Title & Toggle */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <CreditCard className="w-3.5 h-3.5" />
          Transparent & Scalable Pricing
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Invest in High-Margin Client Opportunities
        </h1>
        <p className="mt-3 text-base text-slate-600">
          Find businesses without websites. Close just one client project and pay for an entire year of BizWebCheck!
        </p>

        {/* Monthly vs Yearly Billing Switch */}
        <div className="mt-8 inline-flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
              Save 17% (2 Mo Free)
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {plans.map(plan => {
          const isCurrent = currentPlanId === plan.id;
          const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 scale-105 z-10'
                  : 'bg-white border border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-sm">
                  {plan.badge}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-base">{plan.name}</h3>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-2 min-h-[32px] leading-relaxed">
                  {plan.description}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">
                      {price === 0 ? 'Free' : `₹${price.toLocaleString()}`}
                    </span>
                    {price > 0 && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        /{billingCycle === 'yearly' ? 'yr' : 'mo'}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 block mt-1">
                    {plan.searchLimit.toLocaleString()} searches
                  </span>
                </div>

                <div className="mt-6 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    What's Included:
                  </span>
                  {plan.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-xs text-slate-700">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : plan.cta}
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Guarantee Trust Banner */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          <span>SSRF-Safe & Verified Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          <span>Secure Razorpay Checkout</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>Instant Credit Activation</span>
        </div>
      </div>
    </div>
  );
}
