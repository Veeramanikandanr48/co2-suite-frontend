'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { CarbonSummaryData } from '@/types/carbon-summary';

interface SummaryCategoryBreakdownProps {
  summaryData: CarbonSummaryData | null;
}

export function SummaryCategoryBreakdown({ summaryData }: SummaryCategoryBreakdownProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">
            Emissions Breakdown by Activity Category (Database)
          </h3>
        </div>
        <span className="text-xs font-semibold text-muted-foreground">
          {summaryData?.emissionsByCategory?.length || 0} Active Categories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {summaryData?.emissionsByCategory && summaryData.emissionsByCategory.length > 0 ? (
          summaryData.emissionsByCategory.map((cat, idx) => {
            const isScope1 = cat.scope === 'Scope 1';
            const isScope2 = cat.scope === 'Scope 2';
            return (
              <div
                key={idx}
                className="p-3.5 bg-muted rounded-xl border border-border hover:border-muted-foreground/30 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      isScope1
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                        : isScope2
                        ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-800 dark:text-sky-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400'
                    }`}
                  >
                    {cat.scope}
                  </span>
                  <span className="text-xs font-black text-foreground">{cat.emission} t CO₂-e</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-foreground truncate" title={cat.category}>
                    {cat.category}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {cat.count} entry record{cat.count > 1 ? 's' : ''} ({cat.percentage}% of total)
                  </p>
                </div>

                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isScope1 ? 'bg-amber-500' : isScope2 ? 'bg-sky-500' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-6 text-center text-xs text-muted-foreground">
            No category data recorded in database.
          </div>
        )}
      </div>
    </div>
  );
}
