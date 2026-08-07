'use client';

import React, { useMemo } from 'react';
import {
  LayoutDashboard, CheckCircle2, AlertTriangle, Clock, ArrowRight,
  Database, Layers, FlameKindling, FlaskConical, Globe, TrendingUp,
} from 'lucide-react';
import { useFetchList } from '@/hooks/use-fetch-list';
import { API_LIST } from '@/lib/api/endpoints';
import { MasterItem, MASTER_ITEM_TYPES } from '@/types/master-management.types';
import { StatsCard } from '@/components/ui/stats-card';
import { SectionCard } from '@/components/ui/page-layout';
import { StatusBadge } from '@/components/ui/status-badge';
import { TypeBadge } from '@/components/ui/type-badge';
import { cn } from '@/lib/utils';

// Coverage target by type — how many items are "expected" for a healthy MDM
const COVERAGE_TARGETS: Record<string, { label: string; icon: React.ElementType; target: number; color: string }> = {
  SCOPE:             { label: 'GHG Scopes',         icon: Layers,       target: 3,   color: 'text-purple-600' },
  ACTIVITY_CATEGORY: { label: 'Activity Categories', icon: Database,     target: 20,  color: 'text-blue-600' },
  FUEL_TYPE:         { label: 'Fuel Types',          icon: FlameKindling,target: 30,  color: 'text-orange-600' },
  GAS_TYPE:          { label: 'Gas Types',           icon: FlaskConical, target: 10,  color: 'text-cyan-600' },
  COUNTRY:           { label: 'Countries',           icon: Globe,        target: 195, color: 'text-emerald-600' },
};

interface MasterDashboardProps {
  onNavigate: (key: string) => void;
  serviceCode?: string;
}

export function MasterDashboard({ onNavigate, serviceCode }: MasterDashboardProps) {
  const { list: allItems, totalCount, isLoading } = useFetchList<MasterItem>(
    API_LIST.MASTERS_ITEMS_FILTER,
    { limit: 500, additionalFilter: { serviceCode } }
  );

  const stats = useMemo(() => {
    const published = allItems.filter((i) => i.isActive !== false).length;
    const archived = allItems.filter((i) => i.isActive === false).length;
    const byType: Record<string, number> = {};

    for (const item of allItems) {
      byType[item.type] = (byType[item.type] ?? 0) + 1;
    }

    const healthPct = totalCount > 0 ? Math.round((published / totalCount) * 100) : 0;

    return { published, archived, byType, healthPct };
  }, [allItems, totalCount]);

  const recentItems = useMemo(
    () => [...allItems].sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()).slice(0, 8),
    [allItems]
  );

  const coverageItems = Object.entries(COVERAGE_TARGETS).map(([type, cfg]) => {
    const count = stats.byType[type] ?? 0;
    const pct = Math.min(100, Math.round((count / cfg.target) * 100));
    return { type, count, pct, ...cfg };
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">MDM Overview</h2>
          <p className="text-xs text-muted-foreground">Master Data Management health and coverage</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatsCard
          label="Total Items"
          value={isLoading ? '—' : totalCount.toLocaleString()}
          icon={Database}
          iconClassName="bg-primary-50 text-primary dark:bg-primary-100/20"
          subtitle="across all types"
        />
        <StatsCard
          label="Published"
          value={isLoading ? '—' : stats.published.toLocaleString()}
          icon={CheckCircle2}
          iconClassName="bg-positive-50 text-positive-600 dark:bg-positive-100/20 dark:text-positive-400"
          trend={{ value: `${stats.healthPct}%`, direction: stats.healthPct >= 80 ? 'up' : 'neutral' }}
        />
        <StatsCard
          label="Archived"
          value={isLoading ? '—' : stats.archived.toLocaleString()}
          icon={Clock}
          iconClassName="bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
        />
        <StatsCard
          label="MDM Health"
          value={isLoading ? '—' : `${stats.healthPct}%`}
          icon={TrendingUp}
          iconClassName={cn(
            stats.healthPct >= 80
              ? 'bg-positive-50 text-positive-600 dark:bg-positive-100/20 dark:text-positive-400'
              : 'bg-warning-50 text-warning-600 dark:bg-warning-100/20 dark:text-warning-400'
          )}
          subtitle="published ratio"
        />
        <StatsCard
          label="Types Seeded"
          value={isLoading ? '—' : Object.keys(stats.byType).length}
          icon={Layers}
          iconClassName="bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400"
          subtitle={`of ${MASTER_ITEM_TYPES.length} total`}
        />
      </div>

      {/* Coverage + Recent row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Coverage */}
        <SectionCard
          title="Factor Coverage"
          description="Seeding progress by master type"
          actions={
            <button
              onClick={() => onNavigate('EMISSION_FACTOR')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View factors <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <div className="space-y-3">
            {coverageItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.type}
                  onClick={() => onNavigate(item.type)}
                  className="w-full flex items-center gap-3 text-left group"
                >
                  <div className={cn('w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0', item.color)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.count} / {item.target}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          item.pct >= 80 ? 'bg-positive-500' : item.pct >= 40 ? 'bg-warning-500' : 'bg-negative-400'
                        )}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className={cn(
                    'text-[11px] font-bold tabular-nums shrink-0',
                    item.pct >= 80 ? 'text-positive-600' : item.pct >= 40 ? 'text-warning-600' : 'text-negative-500'
                  )}>
                    {item.pct}%
                  </span>
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Recent activity */}
        <SectionCard
          title="Recent Activity"
          description="Last updated master items"
          actions={
            <button
              onClick={() => onNavigate('ALL')}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentItems.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No master data yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seed IPCC AR6 factors to get started
              </p>
            </div>
          ) : (
            <div className="space-y-0 -mx-2">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <TypeBadge type={item.type} showIcon={false} className="shrink-0" />
                  <span className="flex-1 text-xs font-medium text-foreground truncate">{item.name}</span>
                  <StatusBadge status={item.isActive !== false ? 'PUBLISHED' : 'ARCHIVED'} showDot={false} />
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Type breakdown */}
      <SectionCard title="Items by Type" description="Distribution across all master categories">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {MASTER_ITEM_TYPES.filter((t) => !['UNIT_CONVERSIONS', 'MAPPINGS_CATEGORY_FUEL', 'MAPPINGS_FUEL_UNIT', 'EMISSION_FACTOR'].includes(t.value)).map((type) => {
            const count = stats.byType[type.value] ?? 0;
            return (
              <button
                key={type.value}
                onClick={() => onNavigate(type.value)}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-colors text-left group"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{type.label}</p>
                </div>
                <span className={cn(
                  'shrink-0 min-w-[28px] h-6 px-1.5 rounded-lg text-xs font-bold flex items-center justify-center',
                  count > 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
