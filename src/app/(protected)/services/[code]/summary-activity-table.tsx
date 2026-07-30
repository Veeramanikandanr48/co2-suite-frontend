'use client';

import React from 'react';
import { Activity, Building2, CheckCircle2 } from 'lucide-react';
import { CarbonSummaryData } from '@/types/carbon-summary';

interface SummaryActivityTableProps {
  summaryData: CarbonSummaryData | null;
}

export function SummaryActivityTable({ summaryData }: SummaryActivityTableProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Latest Inventory Entry Activities (Database Logs)
          </h3>
        </div>
        <span className="bg-muted text-muted-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
          Showing Top {summaryData?.latestActivities?.length || 0} Entries
        </span>
      </div>

      {summaryData?.latestActivities && summaryData.latestActivities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Fuel / Activity Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Emission Factor</th>
                <th className="py-2.5 px-3 text-right">Emissions (t CO₂-e)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {summaryData.latestActivities.map((act) => (
                <tr key={act.id} className="hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-foreground flex items-center gap-1.5">
                    <span>{act.name}</span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground font-medium">{act.category}</td>
                  <td className="py-3 px-3 text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-muted-foreground/60" />
                      <span>{act.facility}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground">
                    {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{act.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-muted-foreground text-[11px]">
                    <span className="font-mono">{act.ef}</span>{' '}
                    <span className="text-[10px] text-muted-foreground/60">({act.efSource || 'Default'})</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-primary">
                    {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.status?.toLowerCase() === 'approved' || act.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-10 text-center space-y-2">
          <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-xs text-muted-foreground font-medium">No inventory entries logged in database yet.</p>
        </div>
      )}
    </div>
  );
}
