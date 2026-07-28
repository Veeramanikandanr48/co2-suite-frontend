'use client';

import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Users,
  Building,
  ShieldCheck,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { useAuth } from '@/context/auth-provider';
import { CompanyModal } from './company-modal';

interface CompanyData {
  id?: number;
  name?: string;
  country?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  taxId?: string;
  allowedDomains?: string;
  userCount?: number;
  adminCount?: number;
  facilityCount?: number;
  subscriptions?: any[];
}

export function CompanyView() {
  const { user } = useAuth();
  const canEdit = !user || user.roleId === 1 || user.roleId === 2;
  const [editing, setEditing] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [orgRes, facRes, svcRes] = await Promise.all([
        apiService.get<any>('organizations'),
        apiService.get<any>('facilities'),
        apiService.get<any>('organizations/1/services'),
      ]);

      const orgs = (orgRes as any)?.data ?? orgRes;
      const currentOrg = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;

      const facs = (facRes as any)?.data ?? facRes;
      const facilityCount = Array.isArray(facs) ? facs.length : 0;

      const rawSvcs = (svcRes as any)?.data ?? svcRes;
      const subscriptions = Array.isArray(rawSvcs)
        ? rawSvcs.map((item: any) => item.service || item)
        : [];

      setCompany({
        id: currentOrg?.id || 1,
        name: currentOrg?.name || currentOrg?.organizationName || 'WD Solutions Co. LLC',
        country: currentOrg?.country || currentOrg?.countryName || 'Türkiye',
        contactEmail: currentOrg?.contactEmail || currentOrg?.email || 'admin@w-d.ae',
        contactPhone: currentOrg?.contactPhone || currentOrg?.phone || '+90',
        address: currentOrg?.address || currentOrg?.city || 'Agha Yasin',
        taxId: currentOrg?.taxId || 'Not set',
        allowedDomains: currentOrg?.allowedDomains || 'w-d.ae',
        userCount: currentOrg?.userCount || 1,
        adminCount: currentOrg?.adminCount || 1,
        facilityCount: facilityCount || 1,
        subscriptions: subscriptions,
      });
    } catch (err) {
      console.error('Failed to load company data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading company details from database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Company Management</h1>
        <p className="text-xs text-neutral-500 mt-1">Manage your company details and branding</p>
      </div>

      {/* Top Card: Company Overview */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              Company Overview <span className="text-neutral-400">•</span>{' '}
              <span className="text-neutral-700">{company?.name}</span>
            </h2>
            <p className="text-xs text-neutral-400">Logo, contact info and registration details</p>
          </div>
          {canEdit && (
            <button
              onClick={() => setEditing(!editing)}
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: '#0B132B' }}
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Logo Area */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px]">
            <div className="w-16 h-16 bg-neutral-200 rounded-2xl flex items-center justify-center text-neutral-400 mb-3 font-bold text-xl uppercase">
              {company?.name ? company.name.substring(0, 2) : 'CO'}
            </div>
            <span className="text-xs font-bold text-neutral-500">Company Logo</span>
          </div>

          {/* Details List */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg">🇹🇷</span>
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Company Registration Country</div>
                  <div className="text-xs font-bold text-neutral-800">{company?.country}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Contact Email</div>
                  <div className="text-xs font-bold text-neutral-800">{company?.contactEmail}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Contact Phone Number</div>
                  <div className="text-xs font-bold text-neutral-800">{company?.contactPhone}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Contact Address</div>
                  <div className="text-xs font-bold text-neutral-800">{company?.address}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Tax ID</div>
                  <div className="text-xs font-bold text-neutral-800">{company?.taxId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Company Details Metrics & Active Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details Metrics */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-3">
            Company Details
          </h3>

          <div className="space-y-3">
            <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500">ALLOWED EMAIL DOMAINS</div>
                  <div className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {company?.allowedDomains}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-3.5 flex items-center gap-3">
                <Users className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500">TOTAL USERS</div>
                  <div className="text-base font-extrabold text-neutral-900">{company?.userCount}</div>
                </div>
              </div>

              <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-3.5 flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-500">ADMINISTRATORS</div>
                  <div className="text-base font-extrabold text-neutral-900">{company?.adminCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/80 border border-neutral-200 rounded-xl p-3.5 flex items-center gap-3">
              <Building className="w-4 h-4 text-neutral-400" />
              <div>
                <div className="text-[11px] font-semibold text-neutral-500">TOTAL FACILITIES</div>
                <div className="text-base font-extrabold text-neutral-900">{company?.facilityCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-neutral-800 border-b border-neutral-100 pb-3">
            Active Subscriptions
          </h3>

          <div className="flex-1 flex flex-col items-center justify-center py-6 text-neutral-400 space-y-3">
            {company?.subscriptions && company.subscriptions.length > 0 ? (
              company.subscriptions.map((svc: any) => (
                <div key={svc.id || svc.code} className="flex items-center gap-3 w-full bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-800">{svc.name || 'CageSuite Carbon'}</div>
                    <div className="text-[11px] text-neutral-400">{svc.description || 'Carbon Management Module'}</div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="p-3 bg-neutral-100 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <span className="text-xs font-bold text-neutral-800">CageSuite Carbon</span>
                <span className="text-[11px] text-neutral-400">Corporate Carbon Management Module</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Company Edit Modal */}
      <CompanyModal
        isOpen={editing}
        onClose={() => setEditing(false)}
        onSuccess={fetchCompanyData}
        companyData={company ? {
          id: company.id,
          name: company.name || '',
          country: company.country || '',
          contactEmail: company.contactEmail || '',
          contactPhone: company.contactPhone || '',
          address: company.address || '',
          taxId: company.taxId || '',
          allowedDomains: company.allowedDomains || '',
        } : null}
      />
    </div>
  );
}
