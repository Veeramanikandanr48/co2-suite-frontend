'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Users,
  Globe,
  CheckCircle2,
  MapPin,
  ChevronRight,
  ChevronDown,
  BarChart3,
} from 'lucide-react';
import { MainDashboardSummaryData } from '@/types/main-dashboard';

interface DashboardAdminViewProps {
  summaryData: MainDashboardSummaryData | null;
  expandedOrgId: number | null;
  toggleExpandOrg: (id: number) => void;
  maxTrendTotal: number;
}

export function DashboardAdminView({
  summaryData,
  expandedOrgId,
  toggleExpandOrg,
  maxTrendTotal,
}: DashboardAdminViewProps) {
  const router = useRouter();

  return (
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

      {/* Tenant Organizations Portfolio & Facilities Site Inspector */}
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
    </>
  );
}
