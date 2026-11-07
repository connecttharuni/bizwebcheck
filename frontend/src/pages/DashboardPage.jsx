import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Layers, 
  Bookmark, 
  TrendingUp, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  Clock
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import OpportunityBadge from '../components/OpportunityBadge';

export default function DashboardPage() {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    recentHistory: [],
    recentLeads: [],
    totalLeads: 0,
    totalPipelineValue: 0,
    loading: true
  });

  const [quickQuery, setQuickQuery] = useState('');
  const [quickCity, setQuickCity] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [historyRes, leadsRes] = await Promise.all([
          api.get('/search/history').catch(() => ({ data: { history: [] } })),
          api.get('/leads').catch(() => ({ data: { leads: [] } }))
        ]);

        const history = historyRes.data?.history || [];
        const leads = leadsRes.data?.leads || [];

        const totalPipeline = leads
          .filter(l => l.leadStatus !== 'Not Interested')
          .reduce((sum, l) => sum + (l.estimatedValue || 25000), 0);

        setStats({
          recentHistory: history.slice(0, 5),
          recentLeads: leads.slice(0, 5),
          totalLeads: leads.length,
          totalPipelineValue: totalPipeline,
          loading: false
        });
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setStats(prev => ({ ...prev, loading: false }));
      }
    }

    loadDashboardData();
  }, []);

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!quickQuery && !quickCity) return;
    navigate(`/search?name=${encodeURIComponent(quickQuery)}&city=${encodeURIComponent(quickCity)}`);
  };

  const remainingCredits = subscription ? Math.max(0, subscription.searchLimit - subscription.searchesUsed) : 0;
  const usagePercentage = subscription ? Math.min(100, Math.round((subscription.searchesUsed / subscription.searchLimit) * 100)) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Greeting & Plan Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SaaS Opportunity Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl">
              {user?.company ? `${user.company} • ` : ''}
              Identify local businesses without an official website and turn them into paying clients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Search className="w-4 h-4" />
              New Business Search
            </Link>

            <Link
              to="/bulk-search"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 backdrop-blur-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              Bulk Discovery
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Credits Remaining Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Search Credits</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{remainingCredits}</span>
            <span className="text-xs text-slate-400">/ {subscription?.searchLimit || 20} remaining</span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all ${usagePercentage > 85 ? 'bg-amber-500' : 'bg-indigo-600'}`}
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">{usagePercentage}% used</span>
            <Link to="/pricing" className="text-indigo-600 hover:text-indigo-800 font-bold">
              Upgrade →
            </Link>
          </div>
        </div>

        {/* Saved Leads Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved CRM Leads</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalLeads}</span>
            <span className="text-xs text-emerald-600 font-semibold">Active Pipeline</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Prospects saved from search results ready for personalized outreach.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <Link to="/leads" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
              Manage Pipeline →
            </Link>
          </div>
        </div>

        {/* Pipeline Value Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pipeline Value</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{stats.totalPipelineValue.toLocaleString()}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Calculated opportunity deal pipeline for potential web projects.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <Link to="/reports" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
              View Analytics →
            </Link>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Plan</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 uppercase">
              {subscription?.plan?.replace('_', ' ') || 'Free Trial'}
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Status: <span className="font-semibold text-emerald-600 capitalize">{subscription?.status || 'Active'}</span>
            {subscription?.endDate && ` • Renews ${new Date(subscription.endDate).toLocaleDateString()}`}
          </p>
          <div className="mt-3 pt-2 border-t border-slate-100">
            <Link to="/pricing" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
              Change Plan →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Search Launcher Bar */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-1">Quick Business Availability Check</h2>
        <p className="text-xs text-slate-500 mb-4">
          Instantly verify whether a business has an official listed website and safe HTTP accessibility.
        </p>

        <form onSubmit={handleQuickSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={quickQuery}
              onChange={e => setQuickQuery(e.target.value)}
              placeholder="Business Name (e.g. ABC Bakery, Apollo Hospital)"
              className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-4">
            <input
              type="text"
              value={quickCity}
              onChange={e => setQuickCity(e.target.value)}
              placeholder="City or Location (e.g. Chennai, Bangalore)"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full h-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              Verify Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Two Columns: Recent Saved Leads & Recent Search Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Saved Leads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Pipeline Leads</h2>
            </div>
            <Link to="/leads" className="text-xs font-bold text-indigo-600 hover:underline">
              View All ({stats.totalLeads}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {stats.recentLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No leads saved yet. Run a search to find businesses without websites and save them here!
              </div>
            ) : (
              stats.recentLeads.map(lead => (
                <div key={lead._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{lead.businessName}</h3>
                    <p className="text-xs text-slate-500 truncate">{lead.category} • {lead.city || lead.location}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {lead.leadStatus}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        ₹{(lead.estimatedValue || 25000).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <StatusBadge status={lead.websiteStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Search History */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Searches</h2>
            </div>
            <Link to="/history" className="text-xs font-bold text-indigo-600 hover:underline">
              Full History →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {stats.recentHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No recent searches. Search a business name or category to start detecting website opportunities!
              </div>
            ) : (
              stats.recentHistory.map(hist => (
                <div key={hist._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {hist.searchType}
                      </span>
                      <h3 className="font-bold text-slate-800 text-sm truncate">
                        {hist.query?.businessName || hist.query?.category || 'General Search'}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {hist.query?.city ? `In ${hist.query.city} • ` : ''}
                      Found {hist.resultsCount} business{hist.resultsCount !== 1 ? 'es' : ''} •{' '}
                      <strong className="text-amber-600">{hist.opportunitiesFound || 0} opportunities</strong>
                    </p>
                  </div>

                  <Link
                    to={`/search?name=${encodeURIComponent(hist.query?.businessName || '')}&city=${encodeURIComponent(hist.query?.city || '')}&category=${encodeURIComponent(hist.query?.category || '')}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 flex-shrink-0"
                  >
                    Re-run
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
