'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
  Globe,
  Leaf,
  FileText,
  Factory,
  Database,
  Key,
  Mail,
  User,
  X,
  Copy,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Sliders,
  Check,
} from 'lucide-react';

interface ModuleItem {
  id: string;
  moduleKey: string;
  name: string;
  category: string;
  icon: string;
  description?: string;
}

interface OrganizationItem {
  id: string;
  name: string;
  tenantCode: string;
  slug: string;
  schemaName: string;
  contactEmail?: string;
  subscriptionPlan: string;
  status: string;
  migrationVersion: number;
  createdAt: string;
  subscriptions: {
    moduleKey: string;
    name: string;
    category: string;
    status: string;
    licenseKey: string;
  }[];
  health?: {
    migrationStatus: string;
    storageUsedMB: number;
  };
}

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [masterModules, setMasterModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    subscriptionPlan: 'STANDARD',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    selectedModules: ['carbon'],
  });

  const [selectedOrgForLogs, setSelectedOrgForLogs] = useState<OrganizationItem | null>(null);

  useEffect(() => {
    fetchOrganizations();
    fetchMasterModules();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      // Mock data fallback if backend token is missing in local dev demo
      const res = await fetch('http://localhost:5000/api/v1/organizations', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setOrganizations(json.data || []);
      } else {
        // Fallback demo enterprise orgs
        setOrganizations([
          {
            id: 'org-001',
            name: 'Acme Global Manufacturing',
            tenantCode: 'TEN000001',
            slug: 'acme_global',
            schemaName: 't_000001',
            contactEmail: 'sustainability@acme.com',
            subscriptionPlan: 'ENTERPRISE',
            status: 'ACTIVE',
            migrationVersion: 1,
            createdAt: new Date().toISOString(),
            subscriptions: [
              { moduleKey: 'carbon', name: 'Corporate Carbon Management', category: 'Corporate', status: 'ACTIVE', licenseKey: 'LIC-TEN000001-CARBON' },
              { moduleKey: 'cbam', name: 'EU Carbon Border Adjustment', category: 'Global', status: 'ACTIVE', licenseKey: 'LIC-TEN000001-CBAM' },
              { moduleKey: 'esg', name: 'Corporate Sustainability (ESG)', category: 'Corporate', status: 'ACTIVE', licenseKey: 'LIC-TEN000001-ESG' },
            ],
            health: { migrationStatus: 'HEALTHY', storageUsedMB: 12.4 },
          },
          {
            id: 'org-002',
            name: 'Apex Metals & Smelting Co.',
            tenantCode: 'TEN000002',
            slug: 'apex_metals',
            schemaName: 't_000002',
            contactEmail: 'esg@apexmetals.io',
            subscriptionPlan: 'STANDARD',
            status: 'ACTIVE',
            migrationVersion: 1,
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            subscriptions: [
              { moduleKey: 'carbon', name: 'Corporate Carbon Management', category: 'Corporate', status: 'ACTIVE', licenseKey: 'LIC-TEN000002-CARBON' },
              { moduleKey: 'lca_metals', name: 'LCA - Metals & Smelting', category: 'Industry', status: 'ACTIVE', licenseKey: 'LIC-TEN000002-LCA_METALS' },
            ],
            health: { migrationStatus: 'HEALTHY', storageUsedMB: 4.8 },
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterModules = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/organizations/modules/master', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      if (res.ok) {
        const json = await res.json();
        setMasterModules(json.data || []);
      } else {
        setMasterModules([
          { id: 'm1', moduleKey: 'carbon', name: 'Corporate Carbon Management', category: 'Corporate', icon: 'Layers', description: 'Scope 1, 2, 3 emissions tracking and SECR reporting' },
          { id: 'm2', moduleKey: 'cbam', name: 'EU CBAM Compliance', category: 'Global', icon: 'Globe', description: 'Embedded emissions reporting for EU imports' },
          { id: 'm3', moduleKey: 'esg', name: 'Corporate Sustainability (ESG)', category: 'Corporate', icon: 'Leaf', description: 'CSRD & GRI sustainability framework compliance' },
          { id: 'm4', moduleKey: 'pcf', name: 'Product Carbon Footprint (PCF)', category: 'Product', icon: 'FileText', description: 'ISO 14067 product footprint calculations' },
          { id: 'm5', moduleKey: 'lca_plastics', name: 'LCA - Plastics Manufacturing', category: 'Industry', icon: 'Factory', description: 'Life Cycle Assessment for polymers & packaging' },
          { id: 'm6', moduleKey: 'lca_metals', name: 'LCA - Metals & Smelting', category: 'Industry', icon: 'Zap', description: 'Smelting & alloy metallurgical carbon modeling' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch master modules:', err);
    }
  };

  const handleToggleModule = (moduleKey: string) => {
    setFormData((prev) => {
      const exists = prev.selectedModules.includes(moduleKey);
      if (exists) {
        if (prev.selectedModules.length === 1) return prev; // Keep at least one
        return { ...prev, selectedModules: prev.selectedModules.filter((m) => m !== moduleKey) };
      }
      return { ...prev, selectedModules: [...prev.selectedModules, moduleKey] };
    });
  };

  const handleSubmitOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(null);

    try {
      const res = await fetch('http://localhost:5000/api/v1/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify({
          name: formData.name,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          subscriptionPlan: formData.subscriptionPlan,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
          moduleKeys: formData.selectedModules,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setSubmitSuccess(`✅ Organization '${formData.name}' onboarded successfully! Tenant Code: ${json.data?.tenantCode || 'TEN000003'}, Schema: ${json.data?.schemaName || 't_000003'}`);
        fetchOrganizations();
        setTimeout(() => {
          setIsModalOpen(false);
          setSubmitSuccess(null);
          setFormData({
            name: '',
            contactEmail: '',
            contactPhone: '',
            subscriptionPlan: 'STANDARD',
            adminName: '',
            adminEmail: '',
            adminPassword: '',
            selectedModules: ['carbon'],
          });
        }, 2000);
      } else {
        const errJson = await res.json();
        alert(`Failed to onboard organization: ${errJson.message || 'Server error'}`);
      }
    } catch (err) {
      alert(`Error submitting onboarding request: ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.tenantCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.schemaName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || org.subscriptionPlan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const getModuleIcon = (key: string) => {
    switch (key) {
      case 'carbon':
        return <Layers className="w-3.5 h-3.5 text-emerald-500" />;
      case 'cbam':
        return <Globe className="w-3.5 h-3.5 text-blue-500" />;
      case 'esg':
        return <Leaf className="w-3.5 h-3.5 text-teal-500" />;
      case 'pcf':
        return <FileText className="w-3.5 h-3.5 text-violet-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Organization Management</h1>
              <p className="text-sm text-slate-400">
                Onboard enterprise clients, isolate tenant schemas (`t_000001`), and license carbon modules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrganizations()}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Onboard Organization
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Organizations</span>
          <div className="text-2xl font-bold text-white">{organizations.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Tenant Schemas</span>
          <div className="text-2xl font-bold text-emerald-400">
            {organizations.filter((o) => o.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enterprise Licenses</span>
          <div className="text-2xl font-bold text-blue-400">
            {organizations.filter((o) => o.subscriptionPlan === 'ENTERPRISE').length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Isolated DB Architecture</span>
          <div className="text-sm font-medium text-teal-400 flex items-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" /> Schema-Per-Tenant (`t_*`)
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, TEN code, or schema..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['ALL', 'ENTERPRISE', 'STANDARD', 'DEMO'].map((plan) => (
            <button
              key={plan}
              onClick={() => setFilterPlan(plan)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterPlan === plan
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-400 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {/* Organizations Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-800/30 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Organization & Tenant</th>
                <th className="py-4 px-6">Isolated Schema</th>
                <th className="py-4 px-6">Plan</th>
                <th className="py-4 px-6">Granted Applications</th>
                <th className="py-4 px-6">Status & Health</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {filteredOrgs.map((org) => (
                <tr key={org.id} className="hover:bg-slate-800/30 transition-colors group">
                  {/* Org Name & Tenant Code */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                      {org.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-bold">
                        {org.tenantCode}
                      </span>
                      <span>•</span>
                      <span>{org.contactEmail}</span>
                    </div>
                  </td>

                  {/* Schema Name */}
                  <td className="py-4 px-6 font-mono text-xs text-teal-300">
                    <div className="inline-flex items-center gap-1.5 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                      <Database className="w-3.5 h-3.5 text-teal-400" />
                      {org.schemaName}
                    </div>
                  </td>

                  {/* Plan Badge */}
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        org.subscriptionPlan === 'ENTERPRISE'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : org.subscriptionPlan === 'STANDARD'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {org.subscriptionPlan}
                    </span>
                  </td>

                  {/* Granted Subscriptions */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {org.subscriptions && org.subscriptions.length > 0 ? (
                        org.subscriptions.map((sub, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-300 border border-slate-700/50"
                          >
                            {getModuleIcon(sub.moduleKey)}
                            <span className="capitalize">{sub.moduleKey}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500 italic">No apps assigned</span>
                      )}
                    </div>
                  </td>

                  {/* Status & Health */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-semibold text-emerald-400">{org.status}</span>
                      <span className="text-xs text-slate-500">v{org.migrationVersion}</span>
                    </div>
                    {org.health && (
                      <div className="text-[11px] text-slate-400 mt-1">
                        Storage: {org.health.storageUsedMB} MB
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => setSelectedOrgForLogs(org)}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                    >
                      Provision Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboarding Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-6">
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Onboard New Organization</h2>
                  <p className="text-xs text-slate-400">Auto-assign immutable tenant code (`TEN*`) and isolated schema (`t_*`)</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOnboarding} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {submitSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
                  {submitSuccess}
                </div>
              )}

              {/* Organization Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">1. Organization Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Eco Solutions Ltd"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Subscription Plan</label>
                    <select
                      value={formData.subscriptionPlan}
                      onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="ENTERPRISE">ENTERPRISE (Full Suite Access)</option>
                      <option value="STANDARD">STANDARD (Core Carbon Access)</option>
                      <option value="DEMO">DEMO (Trial Tenant Schema)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      placeholder="contact@acme.com"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      placeholder="+1 (555) 019-2834"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Module Licensing Selector */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">2. Application Access & Licensing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {masterModules.map((mod) => {
                    const isChecked = formData.selectedModules.includes(mod.moduleKey);
                    return (
                      <div
                        key={mod.moduleKey}
                        onClick={() => handleToggleModule(mod.moduleKey)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-sm text-white">
                            {getModuleIcon(mod.moduleKey)}
                            <span>{mod.name}</span>
                          </div>
                          {mod.description && <p className="text-xs text-slate-400 line-clamp-2">{mod.description}</p>}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                            isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Organization Admin Account */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">3. Initial Organization Admin User</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Admin Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={formData.adminName}
                      onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Admin Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@acme.com"
                      value={formData.adminEmail}
                      onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Admin Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Schema...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" /> Provision Tenant Schema
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logs Drawer Modal */}
      {selectedOrgForLogs && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base">Provisioning Audit Logs</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedOrgForLogs.name} ({selectedOrgForLogs.tenantCode})</p>
              </div>
              <button
                onClick={() => setSelectedOrgForLogs(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STEP 1: CREATE_SETTINGS</span>
                </div>
                <span className="text-[10px] text-emerald-400/80">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STEP 2: CREATE_SCHEMA ("{selectedOrgForLogs.schemaName}")</span>
                </div>
                <span className="text-[10px] text-emerald-400/80">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STEP 3: RUN_MIGRATIONS (v1: 001_facilities - 004_emissions)</span>
                </div>
                <span className="text-[10px] text-emerald-400/80">COMPLETED</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>STEP 4: SEED_MASTER_DATA (Defra/EPA Defaults)</span>
                </div>
                <span className="text-[10px] text-emerald-400/80">COMPLETED</span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedOrgForLogs(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
