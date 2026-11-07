import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Tag, Globe, Sparkles, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BusinessSearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    businessName: searchParams.get('name') || '',
    city: searchParams.get('city') || '',
    state: '',
    country: 'India',
    category: searchParams.get('category') || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle immediate auto-search if query params passed
  useEffect(() => {
    const qName = searchParams.get('name');
    const qCity = searchParams.get('city');
    if (qName || qCity) {
      handleSearch(null, {
        businessName: qName || '',
        city: qCity || '',
        category: searchParams.get('category') || '',
        country: 'India'
      });
    }
  }, []);

  const handleSearch = async (e, overrideData = null) => {
    if (e) e.preventDefault();
    setError('');

    const target = overrideData || formData;
    if (!target.businessName && !target.category) {
      return setError('Please enter either a business name or a business category.');
    }

    setLoading(true);
    try {
      const res = await api.post('/search/single', target);
      if (res.data.success) {
        refreshProfile(); // update remaining search credits in auth context
        // Navigate to results page with data in state
        navigate('/results', {
          state: {
            searchQuery: target,
            results: res.data.results,
            primaryResult: res.data.primaryResult,
            businessFound: res.data.businessFound,
            count: res.data.count,
            opportunitiesCount: res.data.opportunitiesCount
          }
        });
      }
    } catch (err) {
      if (err.response?.data?.code === 'QUOTA_EXCEEDED') {
        setError('Search credit limit reached. Please upgrade your subscription plan.');
      } else {
        setError(err.response?.data?.message || err.message || 'Search failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (name, city, category = '') => {
    setFormData({
      businessName: name,
      city,
      state: '',
      country: 'India',
      category
    });
  };

  const remainingCredits = subscription ? Math.max(0, subscription.searchLimit - subscription.searchesUsed) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
          <Globe className="w-3.5 h-3.5" />
          Verified Business Website Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Single Business Search
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter a business name and location to check its directory record, DNS resolution, and live website status.
        </p>
      </div>

      {/* Main Search Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {error.includes('credit limit') && (
              <button
                onClick={() => navigate('/pricing')}
                className="text-xs font-bold bg-rose-600 text-white px-3 py-1.5 rounded-lg hover:bg-rose-700"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Name *
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. ABC Bakery, Domino's, Apollo Hospital"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* City or Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                City / Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Chennai, Coimbatore, Bangalore"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Business Category (Optional)
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Bakery, Restaurant, Salon"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                State (Optional)
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                placeholder="e.g. Tamil Nadu, Karnataka"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                placeholder="India"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Uses 1 search credit ({remainingCredits} credits remaining)</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? 'Verifying Website...' : 'Verify Website Availability'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Test Scenario Presets */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Quick Verification Presets (Click to test):
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => applyPreset('ABC Bakery', 'Chennai', 'Bakery')}
              className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-xs font-semibold text-amber-800 transition-colors"
            >
              🍰 ABC Bakery (Chennai) • Not Listed Opportunity
            </button>

            <button
              type="button"
              onClick={() => applyPreset("Domino's Pizza", 'Chennai', 'Restaurant')}
              className="px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-xs font-semibold text-emerald-800 transition-colors"
            >
              🍕 Domino's (Chennai) • Website Found
            </button>

            <button
              type="button"
              onClick={() => applyPreset('Apollo Hospital', 'Coimbatore', 'Hospital')}
              className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-xs font-semibold text-blue-800 transition-colors"
            >
              🏥 Apollo Hospital (Coimbatore) • Active Website
            </button>

            <button
              type="button"
              onClick={() => applyPreset('Apex Digital Marketing Agency', 'Chennai', 'Digital Marketing')}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 text-xs font-semibold text-rose-800 transition-colors"
            >
              ⚠️ Apex Digital Agency • Unreachable Domain Test
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Search Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-950">Need to discover dozens of businesses at once?</h3>
            <p className="text-xs text-indigo-800">
              Use Bulk Search to scan an entire category in any city and batch-verify website opportunities.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/bulk-search')}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm whitespace-nowrap"
        >
          Open Bulk Search →
        </button>
      </div>
    </div>
  );
}
