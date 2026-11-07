import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  Bookmark, 
  Download, 
  FileSpreadsheet, 
  Filter, 
  Sparkles, 
  ArrowLeft,
  LayoutGrid,
  Table as TableIcon,
  Info,
  Clock,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import OpportunityBadge from '../components/OpportunityBadge';
import LeadSaveModal from '../components/LeadSaveModal';
import BusinessDetailsModal from '../components/BusinessDetailsModal';
import api from '../services/api';

export default function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};
  const initialResults = stateData.results || [];
  const searchQuery = stateData.searchQuery || {};

  const [results] = useState(initialResults);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [leadToSave, setLeadToSave] = useState(null);
  const [exporting, setExporting] = useState(false);

  // If page accessed directly without search state
  if (!results || results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">No Search Results Active</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
          Start a new business search to verify website availability and uncover web development opportunities.
        </p>
        <div className="mt-6">
          <Link
            to="/search"
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/30 hover:bg-indigo-700"
          >
            Go to Business Search
          </Link>
        </div>
      </div>
    );
  }

  // Filter & Search Logic
  const filteredResults = results.filter(item => {
    // Status Filter
    if (activeFilter !== 'All' && item.websiteStatus !== activeFilter) {
      return false;
    }
    // Text search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = (item.businessName || '').toLowerCase().includes(term);
      const matchLoc = (item.location || '').toLowerCase().includes(term);
      const matchCat = (item.category || '').toLowerCase().includes(term);
      return matchName || matchLoc || matchCat;
    }
    return true;
  });

  const handleExport = async (format = 'csv') => {
    setExporting(true);
    try {
      const response = await api.post(
        '/search/export',
        { results: filteredResults, format },
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
      link.setAttribute('download', `bizwebcheck_results_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + (err.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const statusFilters = ['All', 'Website Found', 'Website Not Listed', 'Website Unreachable', 'Unable to Verify'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Search Form
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search Results for{' '}
            <span className="text-indigo-600">
              "{searchQuery.businessName || searchQuery.category || 'Businesses'}"
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Location: <strong>{searchQuery.city || 'All'}</strong> • Found {results.length} record{results.length !== 1 ? 's' : ''} •{' '}
            <strong className="text-amber-600">{stateData.opportunitiesCount || 0} opportunity targets</strong>
          </p>
        </div>

        {/* Action Buttons: Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            CSV Export
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-emerald-300 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Excel Export
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {statusFilters.map(status => {
            const count = status === 'All' 
              ? results.length 
              : results.filter(r => r.websiteStatus === status).length;
            
            return (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeFilter === status ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search in Results & View Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Filter by name..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg ${viewMode === 'cards' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Result Highlight Banner (If Single Search) */}
      {stateData.primaryResult && activeFilter === 'All' && !searchTerm && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-lg border border-indigo-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Target Verification Match
                </span>
                <StatusBadge status={stateData.primaryResult.websiteStatus} />
                <OpportunityBadge score={stateData.primaryResult.opportunityScore || 0} />
              </div>
              <h2 className="text-xl font-extrabold text-white">{stateData.primaryResult.businessName}</h2>
              <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {stateData.primaryResult.location}
              </p>
              <p className="text-xs text-indigo-200 mt-2 font-medium">
                💡 <strong>Opportunity Strategy:</strong> {stateData.primaryResult.recommendation}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setSelectedBusiness(stateData.primaryResult)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all"
              >
                Inspect Diagnostics
              </button>
              <button
                onClick={() => setLeadToSave(stateData.primaryResult)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5 fill-white" />
                Save as Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD VIEW */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((item, idx) => (
            <div
              key={item.placeId || idx}
              className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <StatusBadge status={item.websiteStatus} />
                  <OpportunityBadge score={item.opportunityScore || 0} />
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {item.businessName}
                </h3>
                
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{item.location}</span>
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Category:</span>
                    <span className="font-semibold">{item.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Website:</span>
                    {item.websiteUrl ? (
                      <a
                        href={item.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:underline flex items-center gap-1 font-medium truncate max-w-[160px]"
                      >
                        {item.websiteUrl}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not Listed</span>
                    )}
                  </div>
                </div>

                {item.recommendation && (
                  <p className="mt-3 text-xs text-indigo-900 bg-indigo-50/60 p-2 rounded-lg border border-indigo-100/60">
                    {item.recommendation}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBusiness(item)}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5" /> Details
                </button>

                <button
                  onClick={() => setLeadToSave(item)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1 transition-all"
                >
                  <Bookmark className="w-3 h-3 fill-white" />
                  Save Lead
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Business Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Website Status</th>
                  <th className="px-4 py-3.5">Website URL</th>
                  <th className="px-4 py-3.5">Opportunity</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredResults.map((item, idx) => (
                  <tr key={item.placeId || idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{item.businessName}</td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{item.location}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={item.websiteStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {item.websiteUrl ? (
                        <a href={item.websiteUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[140px]">
                          {item.websiteUrl}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <OpportunityBadge score={item.opportunityScore || 0} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedBusiness(item)}
                        className="px-2.5 py-1 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded text-xs font-semibold"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setLeadToSave(item)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedBusiness && (
        <BusinessDetailsModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSaveLead={(biz) => setLeadToSave(biz)}
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
