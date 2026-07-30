'use client';

import React from 'react';
import { SummaryCategoryBreakdownProps } from '@/types/components/services.types';

const SCOPE_BAR: Record<string, string> = {
  'Scope 1': 'bg-amber-500',
  'Scope 2': 'bg-sky-500',
  'Scope 3': 'bg-emerald-500',
};

export function SummaryCategoryBreakdown({ summaryData }: SummaryCategoryBreakdownProps) {
  const categories = summaryData?.emissionsByCategory;
  if (!categories || categories.length === 0) return null;

  const sorted = [...categories].sort((a, b) => b.emission - a.emission);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
      <h3 className="text-sm font-bold text-foreground mb-4">Category Emissions</h3>
      <div className="space-y-3">
        {sorted.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  cat.scope === 'Scope 1'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : cat.scope === 'Scope 2'
                    ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                }`}>
                  {cat.scope === 'Scope 1' ? 'S1' : cat.scope === 'Scope 2' ? 'S2' : 'S3'}
                </span>
                <span className="font-semibold text-foreground truncate" title={cat.category}>
                  {cat.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-medium text-muted-foreground">{cat.count} rec.</span>
                <span className="font-bold text-foreground w-20 text-right">{cat.emission.toFixed(1)} t</span>
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${SCOPE_BAR[cat.scope] || 'bg-muted-foreground'} transition-all`}
                style={{ width: `${Math.min(100, cat.percentage)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
