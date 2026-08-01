"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import type { MainDashboardSummaryData, FacilityDetailsItem } from "@/types/main-dashboard"
import { MetricCard, SectionCard } from "@/components/shared"
import { EmissionsTrendChart, ScopeBreakdownChart, CategoryBreakdownChart } from "@/components/charts"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3, PieChart, Activity, Factory, MapPin, Layers, ClipboardCheck,
} from "lucide-react"

interface Props {
  summaryData: MainDashboardSummaryData
}

export function DashboardUserView({ summaryData }: Props) {
  const { kpis, facilities, emissionsTrend, emissionsByCategory, recentActivities, subscribedServices } = summaryData

  const scopeData = useMemo(() => ({
    scope1: kpis.scope1Emissions,
    scope2: kpis.scope2Emissions,
    scope3: kpis.scope3Emissions,
    total: kpis.totalEmissions,
  }), [kpis])

  const recentItems = useMemo(() =>
    (recentActivities ?? []).slice(0, 5),
  [recentActivities])

  const chartSection = useMemo(() => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <SectionCard title="Emissions Trend" subtitle="Monthly Scope 1, 2, and 3 emissions over time">
        <EmissionsTrendChart data={emissionsTrend ?? []} />
      </SectionCard>
      <SectionCard title="Scope Breakdown" subtitle="Distribution across emission scopes">
        <ScopeBreakdownChart {...scopeData} />
      </SectionCard>
      <SectionCard title="Emissions by Category" subtitle="Top categories by emission volume" className="lg:col-span-2">
        <CategoryBreakdownChart data={emissionsByCategory ?? []} />
      </SectionCard>
    </div>
  ), [emissionsTrend, emissionsByCategory, scopeData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Real-time Live Sync
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Auto-refreshing every 15 seconds
        </p>
      </div>

      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          icon={BarChart3}
          title="Organization Footprint"
          value={`${(kpis.totalEmissions / 1000).toFixed(1)}k`}
          subtitle={`${kpis.totalEmissions.toLocaleString()} t CO${String.fromCharCode(8322)}e`}
        />
        <MetricCard
          icon={Layers}
          title="Subscribed Modules"
          value={kpis.activeServicesCount.toLocaleString()}
          subtitle={subscribedServices?.length ? `${subscribedServices.length} services` : "Active services"}
        />
        <MetricCard
          icon={Factory}
          title="Facility Sites"
          value={kpis.facilitiesCount.toLocaleString()}
          subtitle={facilities?.length ? `${facilities.length} registered` : "Registered sites"}
        />
        <MetricCard
          icon={ClipboardCheck}
          title="Data Completeness"
          value={`${kpis.dataCompletenessPercent ?? 0}%`}
          subtitle={`${kpis.totalInventoryEntries.toLocaleString()} entries logged`}
        />
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {chartSection}
      </motion.div>

      {/* Facility Sites & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Facilities */}
        <SectionCard
          title="Facility Sites"
          subtitle={`${facilities?.length ?? 0} registered facilities`}
        >
          {facilities && facilities.length > 0 ? (
            <div className="space-y-2">
              {facilities.slice(0, 5).map((fac) => (
                <div key={fac.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card/50 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fac.name}</p>
                    <p className="text-muted-foreground truncate">{fac.address}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{fac.totalEmissions.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">t CO₂e</p>
                  </div>
                </div>
              ))}
              {facilities.length > 5 && (
                <p className="text-xs text-center text-muted-foreground pt-1">
                  +{facilities.length - 5} more facilities
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No facilities registered</p>
          )}
        </SectionCard>

        {/* Recent Activity */}
        <SectionCard
          title="Recent Activity"
          subtitle="Latest inventory entries and updates"
        >
          {recentItems.length > 0 ? (
            <div className="space-y-1.5">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card/50 text-xs">
                  <Activity className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-muted-foreground truncate">
                      {item.category} · {item.facility}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{item.emission.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">{item.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
