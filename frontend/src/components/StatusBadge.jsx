import React from 'react';
import { Globe, AlertCircle, XCircle, HelpCircle, SearchX } from 'lucide-react';

export default function StatusBadge({ status, className = '' }) {
  switch (status) {
    case 'Website Found':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          <Globe className="w-3.5 h-3.5 text-emerald-600" />
          Website Found
        </span>
      );

    case 'Website Not Listed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Website Not Listed
        </span>
      );

    case 'Website Unreachable':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Website Unreachable
        </span>
      );

    case 'Unable to Verify':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 ${className}`}>
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Unable to Verify
        </span>
      );

    case 'Business Not Found':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-300 ${className}`}>
          <SearchX className="w-3.5 h-3.5 text-zinc-500" />
          Business Not Found
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 ${className}`}>
          {status || 'Unknown'}
        </span>
      );
  }
}
