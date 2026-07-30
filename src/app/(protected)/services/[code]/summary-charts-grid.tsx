'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { SummaryChartsGridProps } from '@/types/components/services.types';

const COLORS = {
  scope1: '#f59e0b',
  scope2: '#0ea5e9',
  scope3: '#059669',
};

const SCOPE_LABELS: Record<string, string> = {
  'Scope 1': 'Direct Emissions',
  'Scope 2': 'Indirect Energy',
  'Scope 3': 'Value Chain',
};

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground text-background text-xs p-3 rounded-xl shadow-lg border border-border font-mono">
      <p className="font-bold border-b border-border/20 pb-1 mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {Number(entry.value).toFixed(1)} t
        </p>
      ))}
      <p className="font-extrabold pt-1 border-t border-border/20 mt-1">
        Total: {payload.reduce((s: number, e: any) => s + (Number(e.value) || 0), 0).toFixed(1)} t CO-e
      </p>
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-foreground text-background text-xs p-3 rounded-xl shadow-lg border border-border">
      <p className="font-bold">{d.name}</p>
      <p>{Number(d.value).toFixed(1)} t ({d.percentage}%)</p>
    </div>
  );
}

export function SummaryChartsGrid({ summaryData }: SummaryChartsGridProps) {
  const trend = summaryData?.emissionsTrend;
  const facilities = summaryData?.emissionsByFacility;

  const scopePie = [
    { name: 'Scope 1', value: summaryData?.kpis?.scope1Emissions || 0, percentage: summaryData?.kpis?.scope1Percentage || 0 },
    { name: 'Scope 2', value: summaryData?.kpis?.scope2Emissions || 0, percentage: summaryData?.kpis?.scope2Percentage || 0 },
    { name: 'Scope 3', value: summaryData?.kpis?.scope3Emissions || 0, percentage: summaryData?.kpis?.scope3Percentage || 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-foreground">Emissions Trend</h3>
          <div className="flex items-center gap-3 text-[11px] font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.scope1 }} />
              S1
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.scope2 }} />
              S2
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS.scope3 }} />
              S3
            </span>
          </div>
        </div>

        {trend && trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trend} barGap={2} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                width={45}
                tickFormatter={(v: number) => v.toFixed(0)}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
              <Bar dataKey="scope1" name="Scope 1" stackId="a" fill={COLORS.scope1} radius={[0, 0, 0, 0]} />
              <Bar dataKey="scope2" name="Scope 2" stackId="a" fill={COLORS.scope2} radius={[0, 0, 0, 0]} />
              <Bar dataKey="scope3" name="Scope 3" stackId="a" fill={COLORS.scope3} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
            No emissions trend data
          </div>
        )}
      </div>

      <div className="space-y-5">
        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <h3 className="text-sm font-bold text-foreground mb-4">Scope Distribution</h3>
          {scopePie.some((s) => s.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={scopePie}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {scopePie.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[entry.name.replace(' ', '').toLowerCase() as keyof typeof COLORS] || '#888'} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No emission data
            </div>
          )}
          <div className="space-y-2 mt-3 pt-3 border-t border-border">
            {scopePie.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.value > 0 ? COLORS[s.name.replace(' ', '').toLowerCase() as keyof typeof COLORS] : '#888' }} />
                  <span className="font-semibold text-muted-foreground">{SCOPE_LABELS[s.name] || s.name}</span>
                </div>
                <span className="font-bold text-foreground">{s.value.toFixed(1)} t ({s.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">Facilities</h3>
            <span className="text-xs text-muted-foreground font-medium">{facilities?.length || 0}</span>
          </div>
          <div className="space-y-3">
            {facilities && facilities.length > 0 ? (
              facilities.slice(0, 5).map((fac, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[120px]" title={fac.facility}>
                      {fac.facility}
                    </span>
                    <span className="font-bold text-foreground">{fac.emission.toFixed(1)} t</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-primary transition-all"
                      style={{ width: `${Math.min(100, fac.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No facility data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
