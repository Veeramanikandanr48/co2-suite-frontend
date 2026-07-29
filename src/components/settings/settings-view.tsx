'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  Leaf,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';

interface AppSettings {
  theme: string;
  language: string;
  dateFormat: string;
  timezone: string;
  carbonUnit: string;
  reportingStandard: string;
  currency: string;
  decimalPrecision: string;
  notifyThresholdAlerts: boolean;
  notifyWeeklyDigest: boolean;
  notifySystemUpdates: boolean;
  enable2FA: boolean;
  sessionTimeout: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  language: 'en',
  dateFormat: 'YYYY-MM-DD',
  timezone: 'UTC',
  carbonUnit: 'tCO2e',
  reportingStandard: 'ghg-protocol',
  currency: 'USD',
  decimalPrecision: '2',
  notifyThresholdAlerts: true,
  notifyWeeklyDigest: true,
  notifySystemUpdates: false,
  enable2FA: false,
  sessionTimeout: '30',
};

export function SettingsView() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<'general' | 'emissions' | 'alerts' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // Fallback
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('app_settings', JSON.stringify(settings));
      setIsSaving(false);
      toast.success('Settings saved successfully');
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">System & Account Settings</h1>
          <p className="text-xs text-neutral-500 mt-1">Configure application preferences, reporting standards, and notification parameters</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-[#0B132B] hover:bg-[#152247] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'general'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'general' ? '#0B132B' : undefined }}
        >
          <Globe className="w-3.5 h-3.5" /> General
        </button>
        <button
          onClick={() => setActiveTab('emissions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'emissions'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'emissions' ? '#0B132B' : undefined }}
        >
          <Leaf className="w-3.5 h-3.5" /> Carbon Units
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'alerts'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'alerts' ? '#0B132B' : undefined }}
        >
          <Bell className="w-3.5 h-3.5" /> Alerts
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'security'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'security' ? '#0B132B' : undefined }}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Security
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">General & Regional Settings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Interface Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español (Spanish)</option>
                  <option value="fr">Français (French)</option>
                  <option value="de">Deutsch (German)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="GMT">GMT (Greenwich Mean Time)</option>
                  <option value="IST">IST (India Standard Time)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD (2026-07-29)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (07/29/2026)</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (29/07/2026)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'emissions' && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Carbon Accounting Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Default Carbon Unit
                </label>
                <select
                  value={settings.carbonUnit}
                  onChange={(e) => setSettings({ ...settings, carbonUnit: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="tCO2e">Metric Tonnes (tCO2e)</option>
                  <option value="kgCO2e">Kilograms (kgCO2e)</option>
                  <option value="lbCO2e">Pounds (lbCO2e)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Accounting Standard
                </label>
                <select
                  value={settings.reportingStandard}
                  onChange={(e) => setSettings({ ...settings, reportingStandard: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="ghg-protocol">GHG Protocol Corporate Standard</option>
                  <option value="iso-14064">ISO 14064-1 Standard</option>
                  <option value="pcaf">PCAF Financial Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Decimal Precision
                </label>
                <select
                  value={settings.decimalPrecision}
                  onChange={(e) => setSettings({ ...settings, decimalPrecision: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
                >
                  <option value="2">2 Decimal Places (0.00)</option>
                  <option value="3">3 Decimal Places (0.000)</option>
                  <option value="4">4 Decimal Places (0.0000)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Notification Preferences</h2>
            {[
              {
                key: 'notifyThresholdAlerts',
                title: 'Emission Threshold Alerts',
                desc: 'Real-time alerts when monthly facility emissions exceed target quotas.',
              },
              {
                key: 'notifyWeeklyDigest',
                title: 'Weekly Carbon Digest',
                desc: 'Weekly automated email summaries of total carbon footprint and facility statistics.',
              },
              {
                key: 'notifySystemUpdates',
                title: 'System Updates & Regulations',
                desc: 'Notices regarding IPCC emission factor updates and platform maintenance.',
              },
            ].map((item) => {
              const k = item.key as keyof AppSettings;
              return (
                <div key={item.key} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-neutral-900">{item.title}</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(settings[k])}
                    onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })}
                    className="w-4 h-4 text-[#0B132B] rounded border-neutral-300 focus:ring-0 cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Security Policies</h2>
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-neutral-900">Enforce Two-Factor Authentication (2FA)</div>
                <div className="text-[11px] text-neutral-500 mt-0.5">Require multi-factor authentication codes during login</div>
              </div>
              <input
                type="checkbox"
                checked={settings.enable2FA}
                onChange={(e) => setSettings({ ...settings, enable2FA: e.target.checked })}
                className="w-4 h-4 text-[#0B132B] rounded border-neutral-300 focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="max-w-xs">
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Session Inactivity Timeout
              </label>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white"
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="240">4 Hours</option>
              </select>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>TLS 256-bit connection encryption enabled.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
