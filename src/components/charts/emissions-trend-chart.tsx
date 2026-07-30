"use client"

import { useMemo } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { useTheme } from "next-themes"
import type { DashboardEmissionsTrendItem } from "@/types/main-dashboard"

interface Props {
  data: DashboardEmissionsTrendItem[]
  height?: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-medium text-foreground">{Number(entry.value).toLocaleString()} t</span>
        </div>
      ))}
    </div>
  )
}

export function EmissionsTrendChart({ data, height = 300 }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const colors = useMemo(() => ({
    scope1: "#F97316",
    scope2: "#0EA5E9",
    scope3: "#10B981",
    grid: isDark ? "#1E293B" : "#F1F5F9",
    text: isDark ? "#94A3B8" : "#64748B",
  }), [isDark])

  if (!data?.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-sm text-muted-foreground">
        No trend data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {["scope1", "scope2", "scope3"].map((key) => (
            <linearGradient key={key} id={`trend-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[key as keyof typeof colors]} stopOpacity={0.2} />
              <stop offset="95%" stopColor={colors[key as keyof typeof colors]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: colors.text }} tickLine={false} axisLine={{ stroke: colors.grid }} />
        <YAxis tick={{ fontSize: 11, fill: colors.text }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" iconSize={8} />
        {["scope1", "scope2", "scope3"].map((key) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            name={`Scope ${key.replace("scope", "")}`}
            stroke={colors[key as keyof typeof colors]}
            fill={`url(#trend-${key})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
