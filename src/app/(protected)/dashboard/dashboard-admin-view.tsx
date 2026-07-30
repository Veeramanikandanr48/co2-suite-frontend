"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import type { MainDashboardSummaryData, OrganizationSummaryItem } from "@/types/main-dashboard"
import { MetricCard } from "@/components/shared"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2, Users, Factory, Globe, ChevronDown, ChevronRight, ExternalLink, MapPin,
} from "lucide-react"

interface Props {
  summaryData: MainDashboardSummaryData
}

export function DashboardAdminView({ summaryData }: Props) {
  const router = useRouter()
  const [expandedOrgId, setExpandedOrgId] = useState<number | null>(null)

  const { kpis, organizationsSummary } = summaryData
  const totalOrgs = kpis.totalOrganizations ?? organizationsSummary?.length ?? 0
  const totalUsers = kpis.totalUsers ?? 0

  const toggleOrg = (id: number) => {
    setExpandedOrgId(expandedOrgId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <MetricCard
          icon={Building2}
          title="Tenant Organizations"
          value={totalOrgs.toLocaleString()}
          subtitle="Active organizations"
        />
        <MetricCard
          icon={Users}
          title="Platform Users"
          value={totalUsers.toLocaleString()}
          subtitle="Registered users"
        />
        <MetricCard
          icon={Factory}
          title="Facility Sites"
          value={kpis.facilitiesCount.toLocaleString()}
          subtitle="Across all orgs"
        />
        <MetricCard
          icon={Globe}
          title="Global Footprint"
          value={`${(kpis.totalEmissions / 1000).toFixed(1)}k`}
          subtitle={`${kpis.totalEmissions.toLocaleString()} t CO${String.fromCharCode(8322)}e`}
        />
      </motion.div>

      {/* Organizations Inspector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-card border border-border rounded-xl shadow-xs"
      >
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Tenant Organizations &amp; Facilities</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {organizationsSummary?.length ?? 0} organizations · {kpis.facilitiesCount} facilities
          </p>
        </div>

        <div className="divide-y divide-border">
          {(!organizationsSummary || organizationsSummary.length === 0) ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No organizations found
            </div>
          ) : (
            organizationsSummary.map((org, i) => (
              <motion.div
                key={org.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => toggleOrg(org.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/50 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{org.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{org.industry} · {org.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{org.facilitiesCount} facilities</span>
                      <span>{(org.totalEmissions / 1000).toFixed(1)}k t</span>
                    </div>
                    {expandedOrgId === org.id ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedOrgId === org.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 pt-2 bg-muted/30 border-t border-border">
                        {org.facilities && org.facilities.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {org.facilities.map((fac) => (
                              <div key={fac.id} className="bg-card border border-border rounded-lg p-3 text-xs space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="font-medium text-foreground truncate">{fac.name}</span>
                                </div>
                                {fac.unLocode && (
                                  <p className="text-muted-foreground">UN/LOCODE: {fac.unLocode}</p>
                                )}
                                <p className="text-muted-foreground truncate">{fac.address}</p>
                                <div className="flex items-center justify-between pt-1 border-t border-border mt-1">
                                  <span className="text-muted-foreground">Footprint</span>
                                  <span className="font-semibold text-foreground">
                                    {fac.totalEmissions.toLocaleString()} t
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground py-2">No facilities listed</p>
                        )}
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/organizations/${org.id}`)}
                            className="text-xs"
                          >
                            <ExternalLink className="w-3 h-3 mr-1.5" />
                            Manage Organization
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
