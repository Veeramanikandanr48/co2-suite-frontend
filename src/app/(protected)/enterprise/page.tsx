'use client';

import React, { useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api-service';
import { useAuth } from '@/context/auth-provider';
import {
  Building2,
  Key,
  Webhook,
  History,
  Plus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export default function EnterprisePage() {
  const { accessToken, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'tenants' | 'apiKeys' | 'webhooks' | 'auditLogs'>('tenants');
  const [loading, setLoading] = useState(true);

  const [tenants, setTenants] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Generated Key banner
  const [newSecret, setNewSecret] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !accessToken) {
      setLoading(false);
      return;
    }

    async function loadEnterpriseData() {
      setLoading(true);
      try {
        const [tenantsRes, keysRes, webhooksRes, auditRes] = await Promise.all([
          apiService.get<any[]>('enterprise/tenants'),
          apiService.get<any[]>('enterprise/api-keys?organizationId=1'),
          apiService.get<any[]>('enterprise/webhooks?organizationId=1'),
          apiService.get<any[]>('enterprise/audit-logs?organizationId=1'),
        ]);

        if (tenantsRes?.data) setTenants(tenantsRes.data);
        if (keysRes?.data) setApiKeys(keysRes.data);
        if (webhooksRes?.data) setWebhooks(webhooksRes.data);
        if (auditRes?.data) setAuditLogs(auditRes.data);
      } catch (err) {
        console.error('Failed to load enterprise data', err);
      } finally {
        setLoading(false);
      }
    }

    loadEnterpriseData();
  }, [accessToken, authLoading]);

  const handleGenerateApiKey = async () => {
    try {
      const res = await apiService.post<{ apiKeySecret: string; record: any }>('enterprise/api-keys', {
        name: 'SAP ERP Production Integration',
        organizationId: 1,
        permissions: ['read:inventory', 'write:inventory', 'read:reports'],
      });
      if (res?.data?.apiKeySecret) {
        setNewSecret(res.data.apiKeySecret);
        if (res.data.record) setApiKeys((prev) => [res.data.record, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterWebhook = async () => {
    try {
      const res = await apiService.post<any>('enterprise/webhooks', {
        name: 'Oracle ERP Webhook Receiver',
        url: 'https://erp.acme.com/api/v1/co2-webhooks',
        events: ['calculation.completed', 'report.generated'],
        organizationId: 1,
      });
      if (res?.data) {
        setWebhooks((prev) => [res.data, ...prev]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs font-semibold text-neutral-500">Loading Enterprise Hub...</p>
      </div>
    );
  }

  if (!accessToken) {
    return null;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-neutral-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-emerald-600" />
          <span>Enterprise Scale & Integration Hub</span>
        </h1>
        <p className="text-xs text-neutral-500">
          Manage Multi-Tenant Subdomain Routing, Partner API Keys, Real-Time Webhooks, and Audit Logs.
        </p>
      </div>

      {/* Secret Banner */}
      {newSecret && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-900">New API Key Secret Generated</p>
              <p className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded mt-1">
                {newSecret}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewSecret(null)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'tenants' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Tenants ({tenants.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('apiKeys')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'apiKeys' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Keys ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'webhooks' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Webhook className="w-3.5 h-3.5" />
          <span>Webhooks ({webhooks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('auditLogs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'auditLogs' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'tenants' && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Provisioned Multi-Tenant Accounts</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Tenant Name</th>
                  <th className="py-2">Subdomain Slug</th>
                  <th className="py-2">Plan</th>
                  <th className="py-2">Retention</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50">
                    <td className="py-2.5 font-bold text-neutral-900">{t.name}</td>
                    <td className="py-2.5 font-mono text-emerald-600">{t.slug}.co2suite.com</td>
                    <td className="py-2.5 uppercase font-bold text-[10px] text-purple-700">{t.planType}</td>
                    <td className="py-2.5 text-neutral-500">{t.dataRetentionDays} days (7 yrs)</td>
                    <td className="py-2.5 text-right font-bold text-emerald-600 uppercase text-[10px]">{t.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apiKeys' && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Partner & ERP Integration API Keys</h2>
            <button
              onClick={handleGenerateApiKey}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate API Key</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Key Name</th>
                  <th className="py-2">Prefix</th>
                  <th className="py-2">Permissions</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {apiKeys.length > 0 ? (
                  apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 font-bold text-neutral-900">{k.name}</td>
                      <td className="py-2.5 font-mono text-neutral-600">{k.keyPrefix}</td>
                      <td className="py-2.5 text-neutral-500">{k.permissions}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">Active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-neutral-400">
                      No API keys generated yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'webhooks' && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Registered Webhook Event Receivers</h2>
            <button
              onClick={handleRegisterWebhook}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Webhook</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Receiver Name</th>
                  <th className="py-2">Target URL</th>
                  <th className="py-2">Subscribed Events</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {webhooks.length > 0 ? (
                  webhooks.map((w) => (
                    <tr key={w.id} className="hover:bg-neutral-50">
                      <td className="py-2.5 font-bold text-neutral-900">{w.name}</td>
                      <td className="py-2.5 font-mono text-blue-600">{w.url}</td>
                      <td className="py-2.5 text-neutral-500">{w.events}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600">Active</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-neutral-400">
                      No webhooks registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'auditLogs' && (
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900">Append-Only Platform Audit Log</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-500 uppercase text-[10px] font-bold">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Entity</th>
                  <th className="py-2">User Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {auditLogs.length > 0 ? (
                  auditLogs.map((a) => (
                    <tr key={a.id} className="hover:bg-neutral-50">
                      <td className="py-2 font-mono text-neutral-500">{a.createdAt || 'Just now'}</td>
                      <td className="py-2 font-extrabold uppercase text-[10px] text-emerald-700">{a.action}</td>
                      <td className="py-2 font-semibold text-neutral-900">{a.entityName} #{a.entityId}</td>
                      <td className="py-2 text-neutral-600">{a.userEmail || 'admin@co2suite.com'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-neutral-400">
                      Audit logs clean
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
