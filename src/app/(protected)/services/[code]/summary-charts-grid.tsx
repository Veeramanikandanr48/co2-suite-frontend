'use client';

import React from 'react';
import { BarChart3, Building2, Activity } from 'lucide-react';
import { CarbonSummaryData } from '@/types/carbon-summary';

interface SummaryChartsGridProps {
  summaryData: CarbonSummaryData | null;
  maxTrendTotal: number;
}

export function SummaryChartsGrid({ summaryData, maxTrendTotal }: SummaryChartsGridProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Graph 1: Dynamic Monthly / Period Emissions Trend Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#00C9A7]" />
            <h3 className="text-sm font-bold text-neutral-800">
              Emissions Trend & Monthly Breakdown (DB Data)
            </h3>
          </div>

          {/* Chart Legend */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-neutral-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Scope 1</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Scope 2</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Scope 3</span>
            </div>
          </div>
        </div>

        {/* Dynamic Bar Chart Visualization driven 100% by DB */}
        <div className="py-6 flex-1 flex flex-col justify-end">
          {summaryData?.emissionsTrend && summaryData.emissionsTrend.length > 0 ? (
            <div className="h-48 w-full flex items-end justify-around gap-4 px-4 border-b border-l border-[#E6E8EB] relative">
              {summaryData.emissionsTrend.map((item, idx) => {
                const barHeightPercent = Math.max(8, Math.min(100, (item.total / maxTrendTotal) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] p-2 rounded-lg font-mono pointer-events-none whitespace-nowrap z-20 shadow-lg border border-neutral-700">
                      <p className="font-bold border-b border-neutral-700 pb-1 mb-1">{item.period}</p>
                      <p className="text-amber-400">Scope 1: {item.scope1} t</p>
                      <p className="text-sky-400">Scope 2: {item.scope2} t</p>
                      <p className="text-emerald-400">Scope 3: {item.scope3} t</p>
                      <p className="font-extrabold text-white pt-1 border-t border-neutral-700">Total: {item.total} t CO₂-e</p>
                    </div>

                    <div
                      className="w-12 bg-neutral-100 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:ring-2 group-hover:ring-[#00C9A7]/50 transition-all cursor-pointer"
                      style={{ height: `${barHeightPercent}%` }}
                    >
                      {item.scope3 > 0 && (
                        <div
                          className="bg-emerald-600 w-full transition-all"
                          style={{ height: `${(item.scope3 / item.total) * 100}%` }}
                        />
                      )}
                      {item.scope2 > 0 && (
                        <div
                          className="bg-sky-500 w-full transition-all"
                          style={{ height: `${(item.scope2 / item.total) * 100}%` }}
                        />
                      )}
                      {item.scope1 > 0 && (
                        <div
                          className="bg-amber-500 w-full transition-all"
                          style={{ height: `${(item.scope1 / item.total) * 100}%` }}
                        />
                      )}
                    </div>

                    <span className="text-[10px] font-bold text-neutral-500 truncate max-w-[70px]">
                      {item.period}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center p-4">
              <Activity className="w-8 h-8 text-neutral-300 mb-2" />
              <p className="text-xs font-semibold text-neutral-500">No trend data found in database</p>
              <p className="text-[11px] text-neutral-400">Add inventory entries to render carbon trend charts.</p>
            </div>
          )}
        </div>
      </div>

      {/* Graph 2: Facility Emissions Footprint Breakdown (DB Data) */}
      <div className="bg-white rounded-2xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-bold text-neutral-800">
              Emissions by Facility Site
            </h3>
          </div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase">
            DB Sites ({summaryData?.emissionsByFacility?.length || 0})
          </span>
        </div>

        <div className="py-3 flex-1 flex flex-col justify-start space-y-3.5 overflow-y-auto max-h-[220px] pr-1">
          {summaryData?.emissionsByFacility && summaryData.emissionsByFacility.length > 0 ? (
            summaryData.emissionsByFacility.map((fac, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700">
                  <span className="truncate max-w-[160px]" title={fac.facility}>
                    {fac.facility}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-neutral-900">{fac.emission} t</span>
                    <span className="text-[10px] text-neutral-400">({fac.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-[#00C9A7] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, fac.percentage)}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Building2 className="w-6 h-6 text-neutral-300 mb-1" />
              <p className="text-xs text-neutral-400 font-medium">No facility emissions logged yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
