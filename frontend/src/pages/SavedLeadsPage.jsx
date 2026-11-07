import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Search, 
  Filter, 
  Download, 
  FileSpreadsheet, 
  Phone, 
  Mail, 
  User, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  DollarSign, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';

export default function SavedLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesLead, setEditingNotesLead] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const leadStatuses = ['All', 'New', 'Contacted', 'Interested', 'Converted', 'Not Interested'];

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leads');
      if (res.data.success) {
        setLeads(res.data.leads || []);
      }
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await api.put(`/leads/${leadId}`, { leadStatus: newStatus });
      if (res.data.success) {
        setLeads(leads.map(l => l._id === leadId ? { ...l, leadStatus: newStatus } : l));
      }
    } catch (err) {
      alert('Failed to update lead status: ' + err.message);
    }
  };

  const handleDelete = async (leadId) => {
    if (!window.confirm('Are you sure you want to remove this lead from your CRM?')) return;
    try {
      const res = await api.delete(`/leads/${leadId}`);
      if (res.data.success) {
        setLeads(leads.filter(l => l._id !== leadId));
      }
    } catch (err) {
      alert('Failed to delete lead: ' + err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!editingNotesLead) return;
    try {
      const res = await api.put(`/leads/${editingNotesLead._id}`, { notes: tempNotes });
      if (res.data.success) {
        setLeads(leads.map(l => l._id === editingNotesLead._id ? { ...l, notes: tempNotes } : l));
        setEditingNotesLead(null);
      }
    } catch (err) {
      alert('Failed to update notes');
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await api.get(`/leads/export?format=${format}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: format === 'xlsx' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
          : 'text/csv;charset=utf-8;'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bizwebcheck_leads_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'All' && l.leadStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = l.businessName.toLowerCase().includes(q);
      const matchLoc = (l.location || '').toLowerCase().includes(q);
      const matchCat = (l.category || '').toLowerCase().includes(q);
      return matchName || matchLoc || matchCat;
    }
    return true;
  });

  const totalPipelineValue = leads
    .filter(l => l.leadStatus !== 'Not Interested')
    .reduce((sum, l) => sum + (l.estimatedValue || 25000), 0);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contacted': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Interested': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Converted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Not Interested': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            Agency CRM Pipeline
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Saved Leads Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track business prospects, pitch notes, contact details, and deal status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block pr-3 border-r border-slate-200">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Pipeline Value</span>
            <span className="text-lg font-extrabold text-slate-900">₹{totalPipelineValue.toLocaleString()}</span>
          </div>
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {leadStatuses.map(status => {
            const count = status === 'All' ? leads.length : leads.filter(l => l.leadStatus === status).length;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{status}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === status ? 'bg-indigo-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading your leads...</div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-base">No Saved Leads Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {leads.length === 0 
                ? "You haven't saved any leads yet. Perform a business search to discover businesses and click 'Save Lead'."
                : "No leads match your current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3.5">Business & Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Website Status</th>
                  <th className="px-4 py-3.5">Pipeline Stage</th>
                  <th className="px-4 py-3.5">Est. Value</th>
                  <th className="px-4 py-3.5">Notes & Strategy</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLeads.map(lead => (
                  <tr key={lead._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 text-sm">{lead.businessName}</div>
                      <span className="text-[11px] text-slate-500">{lead.category}</span>
                      {lead.contactDetails?.phone && (
                        <div className="text-[11px] text-indigo-600 mt-1 flex items-center gap-1 font-medium">
                          <Phone className="w-3 h-3" /> {lead.contactDetails.phone}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">
                      {lead.location || lead.city}
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusBadge status={lead.websiteStatus} />
                    </td>

                    <td className="px-4 py-3.5">
                      <select
                        value={lead.leadStatus}
                        onChange={e => handleStatusChange(lead._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusColor(lead.leadStatus)}`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Converted">Converted</option>
                        <option value="Not Interested">Not Interested</option>
                      </select>
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      ₹{(lead.estimatedValue || 25000).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="flex items-center justify-between gap-1 text-slate-600">
                        <span className="truncate italic text-[11px]">{lead.notes || 'No notes yet.'}</span>
                        <button
                          onClick={() => {
                            setEditingNotesLead(lead);
                            setTempNotes(lead.notes || '');
                          }}
                          className="text-slate-400 hover:text-indigo-600 p-1"
                          title="Edit Strategy Notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Notes Modal */}
      {editingNotesLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Outreach Strategy Notes: {editingNotesLead.businessName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add private notes about conversations, proposal details, or pitched services.
            </p>
            <textarea
              rows={4}
              value={tempNotes}
              onChange={e => setTempNotes(e.target.value)}
              placeholder="e.g. Discussed 5-page responsive site with WhatsApp booking for ₹35,000. Follow-up next Tuesday."
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setEditingNotesLead(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
