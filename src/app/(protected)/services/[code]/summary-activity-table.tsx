'use client';

import React from 'react';
import { Activity, Building2 } from 'lucide-react';
import { SummaryActivityTableProps } from '@/types/components/services.types';

const statusStyle = (status: string) => {
  const ok = status?.toLowerCase() === 'approved' || status?.toLowerCase() === 'completed';
  return ok
    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
    : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
};

export function SummaryActivityTable({ summaryData }: SummaryActivityTableProps) {
  const activities = summaryData?.latestActivities;

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Recent Activity</h3>
        </div>
        <span className="bg-muted text-muted-foreground text-xs font-bold px-2.5 py-1 rounded-lg">
          Latest {activities?.length || 0} entries
        </span>
      </div>

      {activities && activities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-muted-foreground font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Emissions</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-accent/50 transition-colors">
                  <td className="py-3 px-3 font-bold text-foreground">{act.name}</td>
                  <td className="py-3 px-3 text-muted-foreground">{act.category}</td>
                  <td className="py-3 px-3 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span>{act.facility}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-foreground whitespace-nowrap">
                    {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">{act.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-primary whitespace-nowrap">
                    {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle(act.status)}`}>
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
          <p className="text-xs text-muted-foreground font-medium">No inventory entries logged yet.</p>
        </div>
      )}
    </div>
  );
}
