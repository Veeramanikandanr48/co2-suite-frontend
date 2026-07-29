'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  RefreshCw,
  ArrowRight,
  Shield,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { MainDashboardSummaryData } from '@/types/main-dashboard';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';

import { DashboardAdminView } from './dashboard-admin-view';
import { DashboardUserView } from './dashboard-user-view';

export default function DashboardPage() {
  const { user } = useAuth();

  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');

  const [summaryData, setSummaryData] = useState<MainDashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedOrgId, setExpandedOrgId] = useState<number | null>(null);

  const isSuperAdmin = user?.roleId === MasterRole.SUPER_ADMIN || summaryData?.isSuperAdmin === true;

  // Fetch dynamic main dashboard summary from DB API
  const fetchDashboardSummary = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedYear && selectedYear !== 'all') params.year = selectedYear;
      if (selectedFacility && selectedFacility !== 'all') params.facility = selectedFacility;

      const response = await apiService.getMainDashboardSummary<MainDashboardSummaryData>(params);
      const data = (response as any)?.data ?? response;
      if (data && typeof data === 'object') {
        setSummaryData(data);
        // Expand first org by default in Super Admin view
        if (data.organizationsSummary && data.organizationsSummary.length > 0) {
          setExpandedOrgId(data.organizationsSummary[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch main dashboard summary from DB:', error);
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedFacility]);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  // Max value for trend bar scaling
  const maxTrendTotal = useMemo(() => {
    if (!summaryData?.emissionsTrend || summaryData.emissionsTrend.length === 0) return 100;
    return Math.max(...summaryData.emissionsTrend.map((t) => t.total || 0), 10);
  }, [summaryData]);

  const toggleExpandOrg = (id: number) => {
    setExpandedOrgId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full min-h-screen bg-background-outer font-sans text-header-primary p-6 space-y-6">
      {/* ─── Premium Glassmorphic Header Bar ────────────────────────────── */}
      <div className="relative overflow-hidden bg-background p-6 rounded-3xl border border-border shadow-xs">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-positive-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3.5 rounded-2xl text-primary-foreground shadow-md ${
                isSuperAdmin
                  ? 'bg-gradient-to-br from-primary via-primary-300 to-primary-300'
                  : 'bg-gradient-to-br from-positive-500 via-positive-600 to-positive-700'
              }`}
            >
              {isSuperAdmin ? <Shield className="w-7 h-7" /> : <LayoutDashboard className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-header-primary tracking-tight">
                  {isSuperAdmin ? 'Super Admin Platform Governance' : 'Executive Sustainability Dashboard'}
                </h1>
                <span
                  className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full flex items-center gap-1.5 border shadow-2xs ${
                    isSuperAdmin
                      ? 'bg-primary/5 text-primary border-primary/20'
                      : 'bg-positive-50 text-positive-700 border-positive-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isSuperAdmin ? 'bg-primary' : 'bg-positive-500'}`} />
                  {isSuperAdmin ? 'Multi-tenant Governance • Live DB' : 'Live DB Analytics'}
                </span>
              </div>
              <p className="text-xs text-header-secondary font-semibold mt-1">
                {isSuperAdmin
                  ? 'Platform-wide corporate portfolio monitoring, organization facility sites & master module analytics.'
                  : `Welcome back${user?.firstName ? `, ${user.firstName}` : ''}! Enterprise carbon footprint, operational facilities & ESG accounting overview.`}
              </p>
            </div>
          </div>

          {/* Filter & Action Controls */}
          <div className="flex items-center flex-wrap gap-3">
            {/* Year selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-background-inner border border-border text-xs font-bold text-header-primary pl-8 pr-8 py-2 rounded-xl cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">All Years</option>
                {summaryData?.availableYears?.map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </select>
              <Calendar className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Facility selector */}
            <div className="relative">
              <select
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="appearance-none bg-background-inner border border-border text-xs font-bold text-header-primary pl-8 pr-8 py-2 rounded-xl cursor-pointer hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {summaryData?.availableFacilities?.map((fac) => (
                  <option key={fac} value={fac === 'All Facilities' ? 'all' : fac}>
                    {fac}
                  </option>
                )) || <option value="all">All Facilities</option>}
              </select>
              <Building2 className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-3 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDashboardSummary}
              title="Refresh DB Data"
              className="p-2 bg-background-inner hover:bg-background-outer border border-border rounded-xl text-header-secondary transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-positive-500' : ''}`} />
            </button>

            {isSuperAdmin ? (
              <Link
                href="/organizations"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Manage Organizations</span>
              </Link>
            ) : (
              <Link
                href="/services"
                className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition-all hover:scale-[1.02]"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {loading && !summaryData ? (
        <div className="w-full h-80 flex flex-col items-center justify-center bg-white rounded-3xl border border-[#E6E8EB] shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 text-[#00C9A7] animate-spin" />
          <p className="text-xs font-bold text-neutral-600">Loading Dashboard Analytics & Facility Information from Database...</p>
        </div>
      ) : isSuperAdmin ? (
        <DashboardAdminView
          summaryData={summaryData}
          expandedOrgId={expandedOrgId}
          toggleExpandOrg={toggleExpandOrg}
          maxTrendTotal={maxTrendTotal}
        />
      ) : (
        <DashboardUserView
          summaryData={summaryData}
          maxTrendTotal={maxTrendTotal}
        />
      )}
    </div>
  );
}
