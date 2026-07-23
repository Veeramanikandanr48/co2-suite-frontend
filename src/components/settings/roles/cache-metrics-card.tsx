"use client";

import React, { useState, useEffect } from "react";
import { CacheMetrics, EffectivePermissionResponse } from "@/types/roles-permissions";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, RefreshCw, Zap, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export const CacheMetricsCard: React.FC = () => {
  const [metrics, setMetrics] = useState<CacheMetrics | null>(null);
  const [effectiveData, setEffectiveData] = useState<EffectivePermissionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetricsAndEffective = async () => {
    try {
      setLoading(true);
      const metricsRes = await apiService.get<CacheMetrics>(API_LIST.CACHE_METRICS);
      const metricsData = (metricsRes as unknown as { data?: CacheMetrics })?.data ?? (metricsRes as unknown as CacheMetrics);
      setMetrics(metricsData);

      const effectiveRes = await apiService.get<EffectivePermissionResponse>(API_LIST.EFFECTIVE_PERMISSIONS);
      const effectiveResData = (effectiveRes as unknown as { data?: EffectivePermissionResponse })?.data ?? (effectiveRes as unknown as EffectivePermissionResponse);
      setEffectiveData(effectiveResData);
    } catch (error: unknown) {
      console.error("Failed to load cache metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetricsAndEffective();
  }, []);

  const calculateHitRate = () => {
    if (!metrics) return "0.0%";
    if (metrics.hitRate !== undefined) return `${metrics.hitRate}%`;
    const total = (metrics.hits || 0) + (metrics.misses || 0);
    if (total === 0) return "100.0%";
    return `${(((metrics.hits || 0) / total) * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      {/* Metrics Top Header Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hit Rate Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-emerald-500/30 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cache Hit Rate</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{calculateHitRate()}</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Cache Hits Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cache Hits</span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{metrics?.hits ?? 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Cache Misses Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Cache Misses</span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{metrics?.misses ?? 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Invalidations Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Invalidations</span>
            <div className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{metrics?.invalidations ?? 0}</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Refresh Controls & Status */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 shadow-xs">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">RBAC Subsystem Performance</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Real-time cache performance & effective active permissions</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchMetricsAndEffective}
          disabled={loading}
          className="border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 gap-2 h-9"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Effective Permissions Table */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h4 className="text-base font-semibold text-neutral-900 dark:text-white">Active Effective Permissions</h4>
            {effectiveData?.role && (
              <Badge className="bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-500/30">
                Active Role: {effectiveData.role.roleName} ({effectiveData.role.roleKey})
              </Badge>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">Loading effective permissions...</div>
        ) : !effectiveData || !effectiveData.permissions || effectiveData.permissions.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 italic">No effective permissions found for current active role</div>
        ) : (
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-100 dark:bg-neutral-800/80">
                <TableRow className="border-neutral-200 dark:border-neutral-700 hover:bg-transparent">
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Module</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Resource</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Action</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Scope</TableHead>
                  <TableHead className="text-neutral-700 dark:text-neutral-300 font-semibold">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {effectiveData.permissions.map((p, idx) => (
                  <TableRow key={idx} className="border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <TableCell className="font-semibold text-neutral-900 dark:text-white">{p.module || "General"}</TableCell>
                    <TableCell className="font-mono text-xs text-cyan-600 dark:text-cyan-400">{p.resource}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 uppercase text-[10px]">
                        {p.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-neutral-500 dark:text-neutral-400">{p.scope || "any"}</TableCell>
                    <TableCell className="text-xs text-neutral-500 dark:text-neutral-400">{p.description || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
