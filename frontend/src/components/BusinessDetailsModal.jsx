import React from 'react';
import { X, ExternalLink, ShieldCheck, MapPin, Globe, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import OpportunityBadge from './OpportunityBadge';

export default function BusinessDetailsModal({ business, onClose, onSaveLead }) {
  if (!business) return null;

  const details = business.verificationDetails || {};

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <Globe className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{business.businessName || business.name}</h3>
              <p className="text-xs text-indigo-200">{business.category || 'Business'} • {business.city || 'Verified Location'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status & Opportunity Hero */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Website Status</span>
              <StatusBadge status={business.websiteStatus} className="text-sm py-1.5 px-3" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Opportunity Score</span>
              <OpportunityBadge score={business.opportunityScore || 0} className="text-sm py-1.5 px-3" />
            </div>
          </div>

          {/* Strategic Recommendation */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              Strategic Business Opportunity
            </h4>
            <p className="text-sm text-indigo-950 leading-relaxed font-medium">
              {business.recommendation || 'Potential opportunity for web presence and digital marketing services.'}
            </p>
          </div>

          {/* Verification Diagnostics Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Technical Verification Report
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">HTTP Response</span>
                <span className="text-sm font-bold text-slate-800">
                  {details.httpStatus ? `HTTP ${details.httpStatus}` : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">DNS Resolution</span>
                <span className={`text-sm font-bold ${details.dnsResolved ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {details.dnsResolved ? 'Resolved' : (business.websiteUrl ? 'Failed' : 'N/A')}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Latency</span>
                <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {business.responseTimeMs || 0}ms
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[11px] text-slate-500 block">SSRF Guard</span>
                <span className="text-sm font-bold text-emerald-600">
                  Protected
                </span>
              </div>
            </div>

            {details.details && (
              <p className="mt-2 text-xs text-slate-500 italic">
                Note: {details.details}
              </p>
            )}
          </div>

          {/* URLs & External Links */}
          <div className="space-y-2 text-sm border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 text-xs">Official Website URL</span>
              {business.websiteUrl ? (
                <a
                  href={business.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate max-w-xs"
                >
                  {business.websiteUrl}
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              ) : (
                <span className="text-slate-400 font-medium">None listed in registry</span>
              )}
            </div>

            <div className="flex items-center justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500 text-xs">Formatted Address</span>
              <span className="text-slate-700 text-right truncate max-w-sm">{business.location}</span>
            </div>

            {business.googleMapsUri && (
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 text-xs">Google Maps Profile</span>
                <a
                  href={business.googleMapsUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  View on Google Maps
                </a>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                if (onSaveLead) onSaveLead(business);
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              Save as Potential Lead
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
