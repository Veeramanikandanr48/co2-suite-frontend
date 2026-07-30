"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts"
import { useTheme } from "next-themes"
import type { DashboardCategoryEmission } from "@/types/main-dashboard"

interface Props {
  data: DashboardCategoryEmission[]
  height?: number
}

const SCOPE_COLORS: Record<string, string> = {
  "1": "#F97316",
  "2": "#0EA5E9",
  "3": "#10B981",
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">{d.name}: {Number(d.value).toLocaleString()} t CO₂e</p>
    </div>
  )
}

export function CategoryBreakdownChart({ data, height = 280 }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const colors = useMemo(() => ({
    grid: isDark ? "#1E293B" : "#F1F5F9",
    text: isDark ? "#94A3B8" : "#64748B",
  }), [isDark])

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[280px] text-sm text-muted-foreground">
        No category data available
      </div>
    )
  }

  const chartData = useMemo(() =>
    [...data]
      .sort((a, b) => b.emission - a.emission)
      .slice(0, 10)
      .map((d) => ({
        name: d.category.length > 20 ? d.category.slice(0, 20) + "..." : d.category,
        emission: Number(d.emission.toFixed(1)),
        scope: d.scope,
      })),
  [data])

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: colors.text }} tickLine={false} axisLine={{ stroke: colors.grid }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fontSize: 11, fill: colors.text }}
          tickLine={false}
          axisLine={false}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="emission" radius={[0, 4, 4, 0]} maxBarSize={16}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={SCOPE_COLORS[entry.scope] || "#6366F1"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
