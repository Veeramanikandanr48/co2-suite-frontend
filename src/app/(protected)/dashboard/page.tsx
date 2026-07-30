"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/context/auth-provider"
import { MasterRole } from "@/types/enums"
import { useDashboard } from "@/hooks/use-dashboard"
import { DashboardAdminView } from "./dashboard-admin-view"
import { DashboardUserView } from "./dashboard-user-view"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RefreshCw, LayoutDashboard, Building2, Loader2, AlertCircle } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const {
    summaryData, loading, error,
    selectedYear, selectedFacility,
    setSelectedYear, setSelectedFacility,
    refresh, availableYears, availableFacilities,
  } = useDashboard()

  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN || summaryData?.isSuperAdmin === true

  const filters = useMemo(() => (
    <div className="flex items-center gap-2">
      {availableYears.length > 0 && (
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[130px] h-9 text-xs">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={y}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {availableFacilities.length > 0 && (
        <Select value={selectedFacility} onValueChange={setSelectedFacility}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue placeholder="Facility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Facilities</SelectItem>
            {availableFacilities.map((f) => (
              <SelectItem key={f.id || f.name} value={f.id || f.name}>{f.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <Button variant="outline" size="icon" onClick={refresh} disabled={loading} className="h-9 w-9">
        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  ), [selectedYear, selectedFacility, availableYears, availableFacilities, loading, refresh, setSelectedYear, setSelectedFacility])

  if (error) {
    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <AlertCircle className="w-10 h-10 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={refresh}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {isSuperAdmin ? "Platform Governance" : "Sustainability Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isSuperAdmin
                  ? "Multi-tenant oversight and compliance monitoring"
                  : "Real-time carbon footprint and emission tracking"
                }
              </p>
            </div>
          </div>
          {filters}
        </div>
      </motion.div>

      {loading && !summaryData ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : summaryData ? (
        <motion.div
          key={`${selectedYear}-${selectedFacility}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {isSuperAdmin ? (
            <DashboardAdminView summaryData={summaryData} />
          ) : (
            <DashboardUserView summaryData={summaryData} />
          )}
        </motion.div>
      ) : null}
    </div>
  )
}
