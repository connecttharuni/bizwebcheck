import React from 'react';
import { Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

export default function OpportunityBadge({ score = 0, className = '' }) {
  if (score >= 80) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border border-amber-300 ${className}`}>
        <Sparkles className="w-3 h-3 text-amber-600 fill-amber-500" />
        High Opportunity ({score}%)
      </span>
    );
  }

  if (score >= 50) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
        <TrendingUp className="w-3 h-3 text-blue-600" />
        Medium Opportunity ({score}%)
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 ${className}`}>
      <ShieldCheck className="w-3 h-3 text-slate-400" />
      Low ({score}%)
    </span>
  );
}
