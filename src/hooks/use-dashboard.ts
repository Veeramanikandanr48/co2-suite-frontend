"use client"

import { useState, useEffect, useCallback } from "react"
import { apiService } from "@/lib/api/api-service"
import type { MainDashboardSummaryData } from "@/types/main-dashboard"

interface UseDashboardReturn {
  summaryData: MainDashboardSummaryData | null
  loading: boolean
  error: string | null
  selectedYear: string
  selectedFacility: string
  setSelectedYear: (year: string) => void
  setSelectedFacility: (facility: string) => void
  refresh: () => void
  availableYears: string[]
  availableFacilities: { name: string; id: string }[]
}

export function useDashboard(): UseDashboardReturn {
  const [summaryData, setSummaryData] = useState<MainDashboardSummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedFacility, setSelectedFacility] = useState("all")

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params: Record<string, string> = {}
      if (selectedYear !== "all") params.year = selectedYear
      if (selectedFacility !== "all") params.facility = selectedFacility
      const response = await apiService.getMainDashboardSummary<MainDashboardSummaryData>(params)
      const data = (response as any)?.data ?? response
      setSummaryData(data)
    } catch (err) {
      setError("Failed to load dashboard data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [selectedYear, selectedFacility])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const availableYears = summaryData?.availableYears ?? []
  const availableFacilities = (summaryData?.availableFacilities ?? []).map((f) =>
    typeof f === "string" ? { name: f, id: f } : f
  )

  return {
    summaryData,
    loading,
    error,
    selectedYear,
    selectedFacility,
    setSelectedYear,
    setSelectedFacility,
    refresh: fetchData,
    availableYears,
    availableFacilities,
  }
}
