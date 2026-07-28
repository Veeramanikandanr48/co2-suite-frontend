'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  RefreshCw,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  CheckCircle2,
  Activity,
  Zap,
  Globe,
  FileCheck2,
  ShieldCheck,
  Loader2,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  PieChart,
  Users,
  Shield,
  Briefcase,
  Database,
  MapPin,
  Tag,
  Map,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { MainDashboardSummaryData, OrganizationSummaryItem } from '@/types/main-dashboard';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';

export default function DashboardPage() {
  const router = useRouter();
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
        /* ═══════════════════════════════════════════════════════════════════
           SUPER ADMIN PLATFORM GOVERNANCE DASHBOARD VIEW WITH ORGANIZATIONS & FACILITIES
           ═══════════════════════════════════════════════════════════════════ */
        <>
          {/* Top 4 Platform KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Registered Organizations */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between min-h-[165px] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black opacity-90 tracking-wider uppercase">
                    TENANT ORGANIZATIONS
                  </p>
                  <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    Multi-tenant
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-4xl font-black tracking-tight">
                    {summaryData?.kpis?.totalOrganizations || summaryData?.organizationsSummary?.length || 1}
                  </p>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">
                    Registered Enterprise Entities
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold opacity-90">
                <span>Active Corporate Portfolio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 2: Registered Platform Users */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    PLATFORM USERS
                  </p>
                  <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.totalUsers || 2}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    Staff & Organization Admins
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-neutral-500 font-bold">
                <span>Cross-organization Accounts</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>

            {/* Card 3: Global Facility Sites */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-sky-200 hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    TOTAL FACILITY SITES
                  </p>
                  <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.facilitiesCount || 0}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    Operational Sites Across Orgs
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-sky-600 font-bold">
                <span>UK & International Facilities</span>
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: Global Platform Footprint */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-emerald-200 hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    GLOBAL PLATFORM FOOTPRINT
                  </p>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.totalEmissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    tonne CO₂-e Total Logged
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-emerald-600 font-bold">
                <span>Scope 1, 2 & 3 Combined</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* ─── Tenant Organizations Portfolio & Facilities Site Inspector ─── */}
          <div className="bg-white rounded-3xl border border-[#E6E8EB] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    Tenant Organizations & Operational Facility Sites (Database)
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Expand any organization to inspect its facility sites, addresses, UN/LOCODEs, and carbon emissions.
                  </p>
                </div>
              </div>
              <Link
                href="/organizations"
                className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 transition-colors"
              >
                <span>Full Organizations Directory</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {summaryData?.organizationsSummary && summaryData.organizationsSummary.length > 0 ? (
              <div className="space-y-4">
                {summaryData.organizationsSummary.map((org) => {
                  const isExpanded = expandedOrgId === org.id;
                  return (
                    <div
                      key={org.id}
                      className="bg-[#F8FAFC] rounded-2xl border border-[#E6E8EB] overflow-hidden transition-all duration-200"
                    >
                      {/* Organization Main Row */}
                      <div className="p-4 flex flex-wrap items-center justify-between gap-4 bg-white border-b border-[#E6E8EB]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-neutral-900">{org.name}</h4>
                              <span className="bg-neutral-100 text-neutral-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {org.code}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 font-medium">
                              {org.industry} • Contact: {org.contactEmail}
                            </p>
                          </div>
                        </div>

                        {/* Summary Badges */}
                        <div className="flex items-center flex-wrap gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Total Emissions</p>
                            <p className="text-sm font-black text-[#00C9A7]">
                              {org.totalEmissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} t CO₂-e
                            </p>
                          </div>

                          <div className="text-center bg-[#F4F6F8] px-3 py-1.5 rounded-xl border border-[#E6E8EB]">
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Facilities</p>
                            <p className="text-xs font-black text-neutral-800">{org.facilitiesCount} sites</p>
                          </div>

                          <div className="text-center bg-[#F4F6F8] px-3 py-1.5 rounded-xl border border-[#E6E8EB]">
                            <p className="text-[10px] text-neutral-400 font-bold uppercase">Modules</p>
                            <p className="text-xs font-black text-neutral-800">{org.subscribedServicesCount} active</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleExpandOrg(org.id)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-extrabold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors"
                            >
                              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>{isExpanded ? 'Hide Facilities' : `Facilities (${org.facilitiesCount})`}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            <button
                              onClick={() => router.push(`/organizations/${org.id}`)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-2xs transition-colors"
                            >
                              Manage Org
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Facility Sites Details Cards against Organization */}
                      {isExpanded && (
                        <div className="p-4 bg-[#F8FAFC] space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-extrabold text-neutral-700 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Facility Sites Associated with {org.name}</span>
                            </p>
                            <span className="text-[10px] font-bold text-neutral-400">
                              {org.facilities?.length || 0} Registered Facility Locations
                            </span>
                          </div>

                          {org.facilities && org.facilities.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {org.facilities.map((fac) => (
                                <div
                                  key={fac.id}
                                  className="bg-white rounded-2xl p-4 border border-[#E6E8EB] hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-2.5"
                                >
                                  <div>
                                    <div className="flex items-center justify-between">
                                      <h5 className="text-xs font-black text-neutral-900 truncate" title={fac.name}>
                                        {fac.name}
                                      </h5>
                                      <span className="text-[9px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md uppercase">
                                        {fac.unLocode || fac.countryCode}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-tight flex items-start gap-1">
                                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                                      <span>{fac.address}</span>
                                    </p>
                                  </div>

                                  <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between">
                                    <div>
                                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Postcode</span>
                                      <p className="text-xs font-mono font-bold text-neutral-700">{fac.postCode}</p>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[9px] font-bold text-neutral-400 uppercase">Site Footprint</span>
                                      <p className="text-xs font-mono font-black text-[#00C9A7]">
                                        {fac.totalEmissions} t CO₂-e
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-xs text-neutral-400 font-medium">
                              No facilities configured for this organization.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400">No organizations found in database.</div>
            )}
          </div>

          {/* Global Master Solutions & Platform Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Global Trend */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Platform-wide Monthly Emissions Trend (All Organizations)
                  </h3>
                </div>
              </div>

              <div className="py-6 flex-1 flex flex-col justify-end">
                {summaryData?.emissionsTrend && summaryData.emissionsTrend.length > 0 ? (
                  <div className="h-48 w-full flex items-end justify-around gap-4 px-4 border-b border-l border-[#E6E8EB] relative">
                    {summaryData.emissionsTrend.map((item, idx) => {
                      const barHeightPercent = Math.max(8, Math.min(100, (item.total / maxTrendTotal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] p-2 rounded-lg font-mono pointer-events-none whitespace-nowrap z-20 shadow-lg border border-neutral-700">
                            <p className="font-bold border-b border-neutral-700 pb-1 mb-1">{item.period}</p>
                            <p className="text-indigo-300">Global Total: {item.total} t CO₂-e</p>
                          </div>
                          <div
                            className="w-12 bg-indigo-500 rounded-t-lg transition-all group-hover:bg-indigo-600 cursor-pointer"
                            style={{ height: `${barHeightPercent}%` }}
                          />
                          <span className="text-[10px] font-bold text-neutral-500 truncate max-w-[70px]">
                            {item.period}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                    <Activity className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-xs font-semibold text-neutral-500">No platform entries</p>
                  </div>
                )}
              </div>
            </div>

            {/* Global Master Solutions */}
            <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Master Services Portfolio
                  </h3>
                </div>
              </div>

              <div className="py-2 space-y-3 flex-1 flex flex-col justify-start overflow-y-auto max-h-[230px] pr-1">
                {summaryData?.subscribedServices?.map((svc) => (
                  <div key={svc.id} className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E6E8EB] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">{svc.name}</p>
                      <p className="text-[10px] text-neutral-400">{svc.category} • {svc.subscriberCount || 1} Org Subscriptions</p>
                    </div>
                    <span className="text-xs font-black text-indigo-600">{svc.totalEmissions?.toLocaleString() || 0} t</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Global System Audit Stream */}
          <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Global System Audit Stream (Cross-Organization Database Logs)
                </h3>
              </div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
                Top {summaryData?.recentActivities?.length || 0} Global Logs
              </span>
            </div>

            {summaryData?.recentActivities && summaryData.recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E8EB] bg-[#F8FAFC] text-neutral-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Organization</th>
                      <th className="py-2.5 px-3">Activity / Fuel Name</th>
                      <th className="py-2.5 px-3">Service Module</th>
                      <th className="py-2.5 px-3">Facility</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Emissions (t CO₂-e)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {summaryData.recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-indigo-700">
                          {act.orgName || 'WD Solutions Co. LLC'}
                        </td>
                        <td className="py-3 px-3 font-bold text-neutral-800">{act.name}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                            {act.serviceCode || 'CARBON'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">{act.facility}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-800">
                          {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">{act.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-[#00C9A7]">
                          {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-neutral-400">No activity logs recorded.</div>
            )}
          </div>
        </>
      ) : (
        /* ═══════════════════════════════════════════════════════════════════
           ORGANIZATION ADMIN & STANDARD USER SUSTAINABILITY DASHBOARD VIEW
           ═══════════════════════════════════════════════════════════════════ */
        <>
          {/* Top 4 Organization KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Corporate Carbon Footprint */}
            <div className="bg-gradient-to-br from-[#00C9A7] via-[#059669] to-emerald-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between min-h-[165px] relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute -right-4 -top-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black opacity-90 tracking-wider uppercase">
                    ORGANIZATION FOOTPRINT
                  </p>
                  <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    DB Logged
                  </span>
                </div>
                <div className="my-2">
                  <p className="text-4xl font-black tracking-tight">
                    {summaryData?.kpis?.totalEmissions?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) || '0.0'}
                  </p>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">
                    {summaryData?.unit || 'tonne CO₂-e'}
                  </p>
                </div>
              </div>

              {/* Scope Breakdown Pills */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] font-bold text-center pt-2 border-t border-white/20">
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 1</p>
                  <p className="text-xs font-black">{summaryData?.kpis?.scope1Percentage || 0}%</p>
                </div>
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 2</p>
                  <p className="text-xs font-black">{summaryData?.kpis?.scope2Percentage || 0}%</p>
                </div>
                <div className="bg-white/20 py-1 px-1 rounded-lg backdrop-blur-xs">
                  <p className="opacity-80">Scope 3</p>
                  <p className="text-xs font-black">{summaryData?.kpis?.scope3Percentage || 0}%</p>
                </div>
              </div>
            </div>

            {/* Card 2: Subscribed ESG Services */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-[#00C9A7] hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    SUBSCRIBED MODULES
                  </p>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <Sparkles className="w-4 h-4 text-[#00C9A7]" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.activeServicesCount || 0}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    Active Sustainability Solutions
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-neutral-500 font-bold">
                <span>Carbon, CBAM, PEF, LCA, ESG, EPD</span>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>
            </div>

            {/* Card 3: Active Facility Sites */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-sky-300 hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    FACILITY SITES
                  </p>
                  <div className="p-2 bg-sky-50 rounded-xl text-sky-600">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.facilitiesCount || summaryData?.facilities?.length || 0}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    Operational Sites & Plants
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#F0F2F5] flex items-center justify-between text-[11px] text-sky-600 font-bold">
                <span>UK & EU Installations</span>
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4: Inventory Records & Data Health */}
            <div className="bg-white rounded-3xl p-5 border border-[#E6E8EB] shadow-xs flex flex-col justify-between min-h-[165px] group hover:border-emerald-300 hover:shadow-md transition-all duration-300">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">
                    CALCULATION LOGS
                  </p>
                  <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="my-2">
                  <p className="text-3xl font-extrabold text-neutral-900">
                    {summaryData?.kpis?.totalInventoryEntries || 0}
                  </p>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">
                    Logged Activity Entries
                  </p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-emerald-600 mb-1">
                  <span>Data Completeness</span>
                  <span>{summaryData?.kpis?.dataCompletenessPercent || 100}%</span>
                </div>
                <div className="w-full h-1.5 bg-[#F0F2F5] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Organization Facility Sites Operational Breakdown ────────────── */}
          <div className="bg-white rounded-3xl border border-[#E6E8EB] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-neutral-900">
                    Organization Operational Facility Sites (Database)
                  </h3>
                  <p className="text-xs text-neutral-500 font-medium">
                    Facility site locations, UN/LOCODEs, postcodes, and carbon footprints.
                  </p>
                </div>
              </div>
              <span className="text-xs font-extrabold text-sky-600 bg-sky-50 px-3 py-1 rounded-xl border border-sky-100">
                {summaryData?.facilities?.length || 0} Configured Sites
              </span>
            </div>

            {summaryData?.facilities && summaryData.facilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summaryData.facilities.map((fac) => (
                  <div
                    key={fac.id}
                    className="bg-[#F8FAFC] rounded-2xl p-4 border border-[#E6E8EB] hover:border-sky-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-sky-600" />
                          <h4 className="text-xs font-black text-neutral-900 truncate" title={fac.name}>
                            {fac.name}
                          </h4>
                        </div>
                        <span className="text-[9px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md uppercase">
                          {fac.unLocode || fac.countryCode}
                        </span>
                      </div>

                      <p className="text-[11px] text-neutral-500 font-medium mt-2 leading-relaxed flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-neutral-400 shrink-0 mt-0.5" />
                        <span>{fac.address}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#E6E8EB] flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">Postcode</span>
                        <p className="text-xs font-mono font-bold text-neutral-700">{fac.postCode}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase">Logged Footprint</span>
                        <p className="text-xs font-mono font-black text-[#00C9A7]">
                          {fac.totalEmissions?.toLocaleString() || 0} t CO₂-e
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-neutral-400">
                No facilities registered for this organization.
              </div>
            )}
          </div>

          {/* Subscribed Services Grid */}
          <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00C9A7]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Subscribed Enterprise ESG & Sustainability Modules
                </h3>
              </div>
              <span className="text-xs font-extrabold text-neutral-500">
                {summaryData?.subscribedServices?.length || 0} Available Solutions
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summaryData?.subscribedServices?.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-[#F8FAFC] rounded-2xl border border-[#E6E8EB] p-4 hover:border-neutral-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#00C9A7]/10 text-[#00C9A7]">
                        {svc.category}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {svc.daysLeft} Days Active
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-neutral-900">{svc.name}</h4>
                    <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E6E8EB] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase">Log Emissions</p>
                      <p className="text-xs font-black text-neutral-800">
                        {svc.totalEmissions?.toLocaleString() || 0} t CO₂-e
                      </p>
                    </div>

                    <Link
                      href={svc.demoUrl}
                      className="bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-[#E6E8EB] flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <span>Open Module</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trends & Footprint Share */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Chart 1: Trend Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00C9A7]" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Emissions Trend & Monthly Breakdown (DB Data)
                  </h3>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-bold text-neutral-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Scope 1</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                    <span>Scope 2</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                    <span>Scope 3</span>
                  </div>
                </div>
              </div>

              <div className="py-6 flex-1 flex flex-col justify-end">
                {summaryData?.emissionsTrend && summaryData.emissionsTrend.length > 0 ? (
                  <div className="h-48 w-full flex items-end justify-around gap-4 px-4 border-b border-l border-[#E6E8EB] relative">
                    {summaryData.emissionsTrend.map((item, idx) => {
                      const barHeightPercent = Math.max(8, Math.min(100, (item.total / maxTrendTotal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] p-2 rounded-lg font-mono pointer-events-none whitespace-nowrap z-20 shadow-lg border border-neutral-700">
                            <p className="font-bold border-b border-neutral-700 pb-1 mb-1">{item.period}</p>
                            <p className="text-amber-400">Scope 1: {item.scope1} t</p>
                            <p className="text-sky-400">Scope 2: {item.scope2} t</p>
                            <p className="text-emerald-400">Scope 3: {item.scope3} t</p>
                            <p className="font-extrabold text-white pt-1 border-t border-neutral-700">Total: {item.total} t CO₂-e</p>
                          </div>

                          <div
                            className="w-12 bg-neutral-100 rounded-t-lg overflow-hidden flex flex-col justify-end group-hover:ring-2 group-hover:ring-[#00C9A7]/50 transition-all cursor-pointer"
                            style={{ height: `${barHeightPercent}%` }}
                          >
                            {item.scope3 > 0 && (
                              <div className="bg-emerald-600 w-full transition-all" style={{ height: `${(item.scope3 / item.total) * 100}%` }} />
                            )}
                            {item.scope2 > 0 && (
                              <div className="bg-sky-500 w-full transition-all" style={{ height: `${(item.scope2 / item.total) * 100}%` }} />
                            )}
                            {item.scope1 > 0 && (
                              <div className="bg-amber-500 w-full transition-all" style={{ height: `${(item.scope1 / item.total) * 100}%` }} />
                            )}
                          </div>

                          <span className="text-[10px] font-bold text-neutral-500 truncate max-w-[70px]">{item.period}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-44 flex flex-col items-center justify-center text-center p-4">
                    <Activity className="w-8 h-8 text-neutral-300 mb-2" />
                    <p className="text-xs font-semibold text-neutral-500">No trend data found in database</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Scope & Facility Carbon Share */}
            <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs flex flex-col justify-between min-h-[320px]">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Scope Share & Facility Site Breakdown
                  </h3>
                </div>
              </div>

              <div className="py-2 space-y-4 flex-1 flex flex-col justify-start overflow-y-auto max-h-[230px] pr-1">
                {/* Scope 1 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-amber-700">Scope 1 Direct</span>
                    <span className="text-neutral-800">{summaryData?.kpis?.scope1Emissions || 0} t ({summaryData?.kpis?.scope1Percentage || 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope1Percentage || 0)}%` }} />
                  </div>
                </div>

                {/* Scope 2 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-sky-700">Scope 2 Indirect Energy</span>
                    <span className="text-neutral-800">{summaryData?.kpis?.scope2Emissions || 0} t ({summaryData?.kpis?.scope2Percentage || 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope2Percentage || 0)}%` }} />
                  </div>
                </div>

                {/* Scope 3 */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-emerald-700">Scope 3 Value Chain</span>
                    <span className="text-neutral-800">{summaryData?.kpis?.scope3Emissions || 0} t ({summaryData?.kpis?.scope3Percentage || 0}%)</span>
                  </div>
                  <div className="w-full h-2 bg-[#F0F2F5] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, summaryData?.kpis?.scope3Percentage || 0)}%` }} />
                  </div>
                </div>

                {/* Facility Footprints */}
                <div className="pt-3 border-t border-[#F0F2F5] space-y-2">
                  <p className="text-[11px] font-black text-neutral-400 uppercase tracking-wider">Top Facility Sites</p>
                  {summaryData?.emissionsByFacility?.map((fac, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                      <span className="truncate max-w-[140px]">{fac.facility}</span>
                      <span className="font-extrabold">{fac.emission} t ({fac.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stream Table */}
          <div className="bg-white rounded-3xl border border-[#E6E8EB] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F2F5]">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#00C9A7]" />
                <h3 className="text-sm font-bold text-neutral-900">
                  Recent Activity Stream (Database Logs)
                </h3>
              </div>
              <span className="bg-neutral-100 text-neutral-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                Top {summaryData?.recentActivities?.length || 0} Recent Logs
              </span>
            </div>

            {summaryData?.recentActivities && summaryData.recentActivities.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#E6E8EB] bg-[#F8FAFC] text-neutral-500 font-extrabold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Activity / Fuel Name</th>
                      <th className="py-2.5 px-3">Service Module</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Facility</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-right">Emissions (t CO₂-e)</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F2F5]">
                    {summaryData.recentActivities.map((act) => (
                      <tr key={act.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-neutral-800">{act.name}</td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                            {act.serviceCode || 'CARBON'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">{act.category}</td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-neutral-400" />
                            <span>{act.facility}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-800">
                          {act.amount?.toLocaleString()} <span className="text-[10px] font-normal text-neutral-400">{act.unit}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-extrabold text-[#00C9A7]">
                          {act.emission?.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-neutral-400">No activity records logged in database yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
