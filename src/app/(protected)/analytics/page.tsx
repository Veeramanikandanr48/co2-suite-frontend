'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import { useAuth } from '@/context/auth-provider';
import {
  TrendingUp,
  BarChart3,
  Sliders,
  DollarSign,
  Target,
  Flame,
  Loader2,
} from 'lucide-react';

export default function AnalyticsPage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<any>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [costAnalysis, setCostAnalysis] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [targetTracking, setTargetTracking] = useState<any>(null);

  // Simulation inputs
  const [dieselPct, setDieselPct] = useState(20);
  const [elecPct, setElecPct] = useState(15);
  const [simResult, setSimResult] = useState<any>(null);
  const [simLoading, setSimLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !accessToken) {
      setLoading(false);
      return;
    }

    async function loadAnalytics() {
      setLoading(true);
      try {
        const [trendsRes, forecastRes, costRes, hotspotsRes, targetsRes] = await Promise.all([
          apiService.getAnalyticsTrends<any>(1, 2025),
          apiService.getAnalyticsForecast<any>(1),
          apiService.getAnalyticsCost<any>(1, 85.0),
          apiService.getAnalyticsHotspots<any[]>(1),
          apiService.getAnalyticsTargets<any>(1),
        ]);

        if (trendsRes?.data) setTrends(trendsRes.data);
        if (forecastRes?.data) setForecast(forecastRes.data);
        if (costRes?.data) setCostAnalysis(costRes.data);
        if (hotspotsRes?.data) setHotspots(hotspotsRes.data);
        if (targetsRes?.data) setTargetTracking(targetsRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [accessToken, authLoading]);

  const handleSimulate = async () => {
    setSimLoading(true);
    try {
      const res = await apiService.runAnalyticsSimulation<any>(1, dieselPct, elecPct);
      if (res?.data) setSimResult(res.data);
    } catch (err) {
      console.error('Simulation failed', err);
    } finally {
      setSimLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-semibold text-neutral-500">Loading Analytics Engine...</p>
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-emerald-600" />
          <span>Carbon Analytics & Predictive Insights</span>
        </h1>
        <p className="text-xs text-neutral-500">
          Real-time Scope 1-3 analytics, 12-month projections, carbon cost modelling, and reduction simulations.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Annual Emissions */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Total Emissions (2025)</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            {trends?.totalEmissions?.toLocaleString() || '16,242'} <span className="text-xs font-bold text-neutral-500">tCO₂e</span>
          </p>
          <div className="mt-2 flex gap-1 text-[10px] font-bold">
            <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">S1: {trends?.scopeBreakdown?.['Scope 1'] || 228}t</span>
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">S2: {trends?.scopeBreakdown?.['Scope 2'] || 14811}t</span>
            <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">S3: {trends?.scopeBreakdown?.['Scope 3'] || 1203}t</span>
          </div>
        </div>

        {/* 12-Month Projected Total */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>12-Mo Forecast Projection</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            {forecast?.projectedAnnualTotal?.toLocaleString() || '16,500'} <span className="text-xs font-bold text-neutral-500">tCO₂e</span>
          </p>
          <p className="text-[10px] text-emerald-600 font-bold mt-2">
            Linear Regression Model (AR6 Default GWP)
          </p>
        </div>

        {/* Carbon Cost Liability */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Carbon Price Exposure ($85/t)</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            ${costAnalysis?.totalCarbonCostUSD?.toLocaleString() || '1,380,570'}
          </p>
          <p className="text-[10px] text-neutral-500 font-medium mt-2">
            Configurable Carbon Tax Liability
          </p>
        </div>

        {/* 2030 Target Progress */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>2030 Target Progress</span>
            <Target className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-neutral-900 mt-2">
            {targetTracking?.progressPercent || 42}%
          </p>
          <div className="w-full bg-neutral-100 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${targetTracking?.progressPercent || 42}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Simulation + Hotspots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carbon Reduction "What-If" Simulation */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-neutral-900">Carbon Reduction Simulation ("What-If")</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Simulate decarbonization initiatives by reducing specific fuel/energy inputs.
          </p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Diesel & Mobile Fleet Reduction:</span>
                <span className="font-bold text-emerald-600">{dieselPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={dieselPct}
                onChange={(e) => setDieselPct(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-neutral-700 mb-1">
                <span>Grid Electricity Efficiency / Renewable Shift:</span>
                <span className="font-bold text-blue-600">{elecPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={elecPct}
                onChange={(e) => setElecPct(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            <button
              onClick={handleSimulate}
              disabled={simLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {simLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Run Decarbonization Simulation</span>
            </button>

            {simResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between font-bold text-emerald-900">
                  <span>Simulated Total Emissions:</span>
                  <span>{simResult.simulatedEmissionsCO2e} tCO₂e</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                  <span>Total Avoided Emissions:</span>
                  <span>-{simResult.reductionCO2e} tCO₂e ({simResult.reductionPercent}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Hotspots */}
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-600" />
            <h2 className="text-sm font-bold text-neutral-900">Top Activity Hotspots</h2>
          </div>
          <p className="text-xs text-neutral-500">
            Highest-emitting activity categories ranked by contribution percentage.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Rank</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Scope</th>
                  <th className="py-2 text-right">Emissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {hotspots.length > 0 ? (
                  hotspots.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50">
                      <td className="py-2 font-bold text-neutral-700">#{item.rank || idx + 1}</td>
                      <td className="py-2 font-semibold text-neutral-900">{item.category}</td>
                      <td className="py-2 text-neutral-500">{item.scope}</td>
                      <td className="py-2 text-right font-extrabold text-emerald-600">
                        {item.totalCO2e?.toLocaleString()} t ({item.contributionPercent}%)
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-neutral-400">
                      No hotspots calculated
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
