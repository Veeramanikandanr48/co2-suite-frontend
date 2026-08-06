'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import { useAuth } from '@/context/auth-provider';
import {
  FileSpreadsheet,
  FileText,
  Play,
  Download,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function ReportsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [definitions, setDefinitions] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<any[]>([]);
  const [executingId, setExecutingId] = useState<number | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  useEffect(() => {
    if (authLoading || !accessToken) {
      setLoading(false);
      return;
    }

    async function loadReports() {
      setLoading(true);
      try {
        const [defsRes, summariesRes] = await Promise.all([
          apiService.getReportDefinitions<any[]>(1),
          apiService.get<any[]>('reports/summaries?organizationId=1'),
        ]);

        if (defsRes?.data) setDefinitions(defsRes.data);
        if (summariesRes?.data) setSummaries(summariesRes.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [accessToken, authLoading]);

  const handleExecuteReport = async (defId: number) => {
    setExecutingId(defId);
    setLastResult(null);
    try {
      const res = await apiService.executeReport<any>(defId);
      if (res?.data) {
        setLastResult(res.data);
      }
    } catch (err) {
      console.error('Report execution failed', err);
    } finally {
      setExecutingId(null);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-semibold text-neutral-500">Loading Report Engine...</p>
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          <span>Reporting & Audit Center</span>
        </h1>
        <p className="text-xs text-neutral-500">
          Generate corporate GHG disclosures, Scope breakdowns, and audit-ready line-item compliance reports.
        </p>
      </div>

      {/* Execution Alert Banner */}
      {lastResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">
                Report Generated Successfully: {lastResult.reportName}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Calculated over pre-aggregated OLAP summaries ({lastResult.summaryData?.length || 0} scope categories)
              </p>
            </div>
          </div>
          <button className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Download Report</span>
          </button>
        </div>
      )}

      {/* Report Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {definitions.map((def) => (
          <div
            key={def.id}
            className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-neutral-300 transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {def.reportType}
                </span>
                <span className="text-xs font-bold text-neutral-400">{def.outputFormat}</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900">{def.name}</h3>
              <p className="text-xs text-neutral-500 line-clamp-2">
                Format: {def.outputFormat} • Schedule: {def.scheduleCron || 'On-Demand'}
              </p>
            </div>

            <button
              onClick={() => handleExecuteReport(def.id)}
              disabled={executingId === def.id}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {executingId === def.id ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span>{executingId === def.id ? 'Generating...' : 'Execute & Render'}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Pre-Aggregated OLAP Summaries Table */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          <h2 className="text-sm font-bold text-neutral-900">Pre-Aggregated OLAP Summaries</h2>
        </div>
        <p className="text-xs text-neutral-500">
          Real-time aggregates pre-computed on calculation.completed domain events.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                <th className="py-2">Year</th>
                <th className="py-2">Scope</th>
                <th className="py-2">Category</th>
                <th className="py-2">Entries</th>
                <th className="py-2 text-right">Total CO₂e</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {summaries.length > 0 ? (
                summaries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50">
                    <td className="py-2 font-semibold text-neutral-700">{item.reportingYear}</td>
                    <td className="py-2 font-bold text-neutral-800">{item.scope}</td>
                    <td className="py-2 text-neutral-900 font-medium">{item.category}</td>
                    <td className="py-2 text-neutral-500">{item.entryCount} entries</td>
                    <td className="py-2 text-right font-extrabold text-emerald-600">
                      {item.totalCO2e?.toLocaleString()} tCO₂e
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-neutral-400">
                    No summaries computed yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
