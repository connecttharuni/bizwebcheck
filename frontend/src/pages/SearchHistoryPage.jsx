import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Search, RefreshCw, ArrowRight, ExternalLink, Filter, Calendar } from 'lucide-react';
import api from '../services/api';

export default function SearchHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadHistory() {
      try {
        setLoading(true);
        const res = await api.get('/search/history');
        if (res.data.success) {
          setHistory(res.data.history || []);
        }
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, []);

  const handleRerun = (item) => {
    if (item.searchType === 'bulk') {
      navigate('/bulk-search');
    } else {
      navigate(`/search?name=${encodeURIComponent(item.query?.businessName || '')}&city=${encodeURIComponent(item.query?.city || '')}&category=${encodeURIComponent(item.query?.category || '')}`);
    }
  };

  const filtered = filterType === 'All' 
    ? history 
    : history.filter(h => h.searchType.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Clock className="w-3.5 h-3.5" />
            Audit & Search Logs
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Search History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review past searches and re-run queries to check for updated website statuses.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          {['All', 'Single', 'Bulk'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type} Searches
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading search history...</div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-base">No Searches Recorded</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your previous single and bulk business searches will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Query Parameters</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Results Found</th>
                  <th className="px-4 py-3.5">Opportunities</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.searchType === 'bulk' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {item.searchType}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {item.query?.businessName || item.query?.category || 'General Search'}
                      {item.query?.category && item.query?.businessName && (
                        <span className="block text-[11px] text-slate-400 font-normal">
                          Category: {item.query.category}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {item.query?.city || 'Not specified'}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {item.resultsCount} business{item.resultsCount !== 1 ? 'es' : ''}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md font-bold text-amber-700 bg-amber-50 border border-amber-200">
                        {item.opportunitiesFound || 0}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleRerun(item)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Re-run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
