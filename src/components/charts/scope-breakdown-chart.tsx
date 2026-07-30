"use client"

import { useMemo } from "react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts"
import { useTheme } from "next-themes"
import type { DashboardCategoryEmission } from "@/types/main-dashboard"

interface Props {
  scope1: number
  scope2: number
  scope3: number
  total: number
}

const COLORS = ["#F97316", "#0EA5E9", "#10B981"]

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="bg-popover border border-border rounded-lg shadow-xl px-3 py-2 text-xs">
      <p className="font-medium text-foreground">{d.name}</p>
      <p className="text-muted-foreground">{Number(d.value).toLocaleString()} t CO₂e ({d.payload.percentage}%)</p>
    </div>
  )
}

export function ScopeBreakdownChart({ scope1, scope2, scope3, total }: Props) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const data = useMemo(() => [
    { name: "Scope 1", value: scope1, percentage: total ? ((scope1 / total) * 100).toFixed(1) : "0" },
    { name: "Scope 2", value: scope2, percentage: total ? ((scope2 / total) * 100).toFixed(1) : "0" },
    { name: "Scope 3", value: scope3, percentage: total ? ((scope3 / total) * 100).toFixed(1) : "0" },
  ], [scope1, scope2, scope3, total])

  if (!total) {
    return (
      <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
        No data
      </div>
    )
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-foreground">{(total / 1000).toFixed(1)}k</p>
        </div>
      </div>
      <div className="flex justify-center gap-4 mt-1">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="font-medium text-foreground">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
