import React, { useState } from 'react';
import { 
  Layers, 
  MapPin, 
  Tag, 
  Sparkles, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Bookmark, 
  Search,
  Filter,
  BarChart,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import OpportunityBadge from '../components/OpportunityBadge';
import BusinessDetailsModal from '../components/BusinessDetailsModal';
import LeadSaveModal from '../components/LeadSaveModal';

export default function BulkSearchPage() {
  const { subscription, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    city: 'Chennai',
    category: 'Restaurants',
    limit: 20
  });

  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [leadToSave, setLeadToSave] = useState(null);
  const [bulkSavedCount, setBulkSavedCount] = useState(0);

  const popularCategories = [
    'Restaurants', 
    'Bakeries', 
    'Hospitals', 
    'Salons', 
    'Digital Marketing', 
    'Gyms & Fitness', 
    'Pharmacies', 
    'Hotels'
  ];

  const handleBulkSearch = async (e) => {
    e.preventDefault();
    setError('');
    setScanning(true);
    setProgress(15);
    setProgressStage('Querying business listings directory...');
    setBulkSavedCount(0);

    try {
      // Simulate real-world stepped progress
      const p1 = setTimeout(() => {
        setProgress(45);
        setProgressStage('Performing SSRF-safe DNS resolution on identified domains...');
      }, 500);

      const p2 = setTimeout(() => {
        setProgress(75);
        setProgressStage('Probing HTTP/HTTPS endpoints and redirect chains...');
      }, 900);

      const res = await api.post('/search/bulk', formData);

      clearTimeout(p1);
      clearTimeout(p2);
      setProgress(100);
      setProgressStage('Analysis complete! Opportunities categorized.');

      if (res.data.success) {
        setResults(res.data.results || []);
        refreshProfile();
      }
    } catch (err) {
      if (err.response?.data?.code === 'QUOTA_EXCEEDED') {
        setError('Search credit limit reached. Please upgrade your subscription plan.');
      } else {
        setError(err.response?.data?.message || err.message || 'Bulk search failed');
      }
    } finally {
      setTimeout(() => {
        setScanning(false);
      }, 600);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await api.post(
        '/search/export',
        { results, format },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv;charset=utf-8;'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bizwebcheck_bulk_${formData.category}_${formData.city}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  // Bulk save all opportunity businesses directly into CRM
  const handleBulkSaveAllOpportunities = async () => {
    const opps = results.filter(r => r.websiteStatus === 'Website Not Listed' || r.websiteStatus === 'Website Unreachable');
    if (opps.length === 0) return;

    let saved = 0;
    for (const item of opps) {
      try {
        await api.post('/leads', {
          businessName: item.businessName,
          location: item.location,
          city: item.city || formData.city,
          category: item.category,
          websiteStatus: item.websiteStatus,
          websiteUrl: item.websiteUrl || '',
          googleMapsUri: item.googleMapsUri || '',
          leadStatus: 'New',
          estimatedValue: 25000,
          notes: item.recommendation || ''
        });
        saved++;
      } catch (err) {
        // continue
      }
    }
    setBulkSavedCount(saved);
  };

  const remainingCredits = subscription ? Math.max(0, subscription.searchLimit - subscription.searchesUsed) : 0;
  const filtered = activeTab === 'All' ? results : results.filter(r => r.websiteStatus === activeTab);
  const opportunitiesCount = results.filter(r => r.websiteStatus === 'Website Not Listed' || r.websiteStatus === 'Website Unreachable').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5" />
            Batch Opportunity Discovery
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Bulk Business Search
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover dozens of businesses across entire categories and identify website opportunities in bulk.
          </p>
        </div>

        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <div className="text-xs">
            <p className="font-bold text-slate-800">{remainingCredits} Search Credits Left</p>
            <p className="text-slate-400">Deducts credits equal to returned results</p>
          </div>
        </div>
      </div>

      {/* Main Bulk Filter Configuration Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleBulkSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Business Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Restaurants, Bakeries, Salons"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target City / Region *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Chennai, Bangalore, Coimbatore"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Maximum Results Limit
              </label>
              <select
                value={formData.limit}
                onChange={e => setFormData({ ...formData, limit: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value={10}>10 Businesses</option>
                <option value={20}>20 Businesses</option>
                <option value={30}>30 Businesses</option>
                <option value={50}>50 Businesses</option>
              </select>
            </div>
          </div>

          {/* Quick Categories Bar */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Popular High-Opportunity Niches:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {popularCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    formData.category === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Scans directory & safely verifies DNS + HTTP accessibility.
            </span>
            <button
              type="submit"
              disabled={scanning}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {scanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Bulk Discovery...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" />
                  Run Bulk Discovery Scan
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress Indicator */}
        {scanning && (
          <div className="mt-6 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
              <span>{progressStage}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-indigo-200/60 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Results Section */}
      {results.length > 0 && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-semibold block">Total Scanned</span>
              <span className="text-2xl font-extrabold text-slate-900">{results.length}</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 shadow-sm">
              <span className="text-xs text-amber-700 font-semibold block">Website Not Listed</span>
              <span className="text-2xl font-extrabold text-amber-800">
                {results.filter(r => r.websiteStatus === 'Website Not Listed').length}
              </span>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 shadow-sm">
              <span className="text-xs text-rose-700 font-semibold block">Website Unreachable</span>
              <span className="text-2xl font-extrabold text-rose-800">
                {results.filter(r => r.websiteStatus === 'Website Unreachable').length}
              </span>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
              <span className="text-xs text-emerald-700 font-semibold block">Website Found</span>
              <span className="text-2xl font-extrabold text-emerald-800">
                {results.filter(r => r.websiteStatus === 'Website Found').length}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2">
              {['All', 'Website Not Listed', 'Website Unreachable', 'Website Found'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab} ({tab === 'All' ? results.length : results.filter(r => r.websiteStatus === tab).length})
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkSaveAllOpportunities}
                className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {bulkSavedCount > 0 ? `Saved ${bulkSavedCount} Leads!` : `Save All Opportunities (${opportunitiesCount})`}
              </button>

              <button
                onClick={() => handleExport('csv')}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>

              <button
                onClick={() => handleExport('xlsx')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3.5">Business Name</th>
                    <th className="px-4 py-3.5">Location</th>
                    <th className="px-4 py-3.5">Website Status</th>
                    <th className="px-4 py-3.5">Opportunity Score</th>
                    <th className="px-4 py-3.5">Strategic Pitch</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filtered.map((item, idx) => (
                    <tr key={item.placeId || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-slate-900">{item.businessName}</td>
                      <td className="px-4 py-3.5 max-w-xs truncate">{item.location}</td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={item.websiteStatus} />
                      </td>
                      <td className="px-4 py-3.5">
                        <OpportunityBadge score={item.opportunityScore || 0} />
                      </td>
                      <td className="px-4 py-3.5 max-w-sm truncate text-slate-600">
                        {item.recommendation}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBiz(item)}
                          className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded text-xs font-semibold"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setLeadToSave(item)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold"
                        >
                          Save Lead
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedBiz && (
        <BusinessDetailsModal
          business={selectedBiz}
          onClose={() => setSelectedBiz(null)}
          onSaveLead={(b) => setLeadToSave(b)}
        />
      )}

      {leadToSave && (
        <LeadSaveModal
          business={leadToSave}
          onClose={() => setLeadToSave(null)}
        />
      )}
    </div>
  );
}
