'use client';

import React from 'react';
import { Activity, Building2, CheckCircle2 } from 'lucide-react';
import { CarbonSummaryData } from '@/types/carbon-summary';

interface SummaryActivityTableProps {
  summaryData: CarbonSummaryData | null;
}

export function SummaryActivityTable({ summaryData }: SummaryActivityTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00C9A7]" />
          <h3 className="text-sm font-bold text-neutral-800">
            Latest Inventory Entry Activities (Database Logs)
          </h3>
        </div>
        <span className="bg-neutral-100 text-neutral-700 text-xs font-bold px-2.5 py-1 rounded-lg">
          Showing Top {summaryData?.latestActivities?.length || 0} Entries
        </span>
      </div>

      {summaryData?.latestActivities && summaryData.latestActivities.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E6E8EB] bg-[#F8FAFC] text-neutral-500 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Fuel / Activity Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Facility</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Emission Factor</th>
                <th className="py-2.5 px-3 text-right">Emissions (t CO₂-e)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2F5]">
              {summaryData.latestActivities.map((act) => (
                <tr key={act.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-neutral-800 flex items-center gap-1.5">
                    <span>{act.name}</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-600 font-medium">{act.category}</td>
                  <td className="py-3 px-3 text-neutral-600 font-medium">
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-neutral-400" />
                      <span>{act.facility}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-neutral-800">
                    {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">{act.unit}</span>
                  </td>
                  <td className="py-3 px-3 text-neutral-500 text-[11px]">
                    <span className="font-mono">{act.ef}</span>{' '}
                    <span className="text-[10px] text-neutral-400">({act.efSource || 'Default'})</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-[#00C9A7]">
                    {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.status?.toLowerCase() === 'approved' || act.status?.toLowerCase() === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
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
          <Activity className="w-8 h-8 text-neutral-300 mx-auto" />
          <p className="text-xs text-neutral-500 font-medium">No inventory entries logged in database yet.</p>
        </div>
      )}
    </div>
  );
}
