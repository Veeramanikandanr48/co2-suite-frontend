'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Bell,
  ShieldCheck,
  Leaf,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  PageHeader,
  NavTabButton,
  SectionCard,
  FormSelectField,
} from '@/components/shared';
import { AppSettings } from '@/types/settings';
import { toast } from 'sonner';

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
    <div className="space-y-6 w-full p-4 md:p-6 bg-white text-neutral-900">
      {/* Page Header */}
      <PageHeader
        title="System & Account Settings"
        description="Configure application preferences, reporting standards, and notification parameters"
        action={
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        }
      />

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <NavTabButton
          isActive={activeTab === 'general'}
          onClick={() => setActiveTab('general')}
          icon={Globe}
          label="General"
        />
        <NavTabButton
          isActive={activeTab === 'emissions'}
          onClick={() => setActiveTab('emissions')}
          icon={Leaf}
          label="Carbon Units"
        />
        <NavTabButton
          isActive={activeTab === 'alerts'}
          onClick={() => setActiveTab('alerts')}
          icon={Bell}
          label="Alerts"
        />
        <NavTabButton
          isActive={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={ShieldCheck}
          label="Security"
        />
      </div>

      {/* Settings Card Content */}
      <SectionCard>
        {activeTab === 'general' && (
          <div className="space-y-4 w-full">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              General & Regional Settings
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <FormSelectField
                label="Interface Language"
                value={settings.language}
                onChange={(val) => setSettings({ ...settings, language: val })}
                options={[
                  { value: 'en', label: 'English (US)' },
                  { value: 'es', label: 'Español (Spanish)' },
                  { value: 'fr', label: 'Français (French)' },
                  { value: 'de', label: 'Deutsch (German)' },
                ]}
              />

              <FormSelectField
                label="Timezone"
                value={settings.timezone}
                onChange={(val) => setSettings({ ...settings, timezone: val })}
                options={[
                  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
                  { value: 'EST', label: 'EST (Eastern Standard Time)' },
                  { value: 'PST', label: 'PST (Pacific Standard Time)' },
                  { value: 'GMT', label: 'GMT (Greenwich Mean Time)' },
                  { value: 'IST', label: 'IST (India Standard Time)' },
                ]}
              />

              <FormSelectField
                label="Date Format"
                value={settings.dateFormat}
                onChange={(val) => setSettings({ ...settings, dateFormat: val })}
                options={[
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-07-29)' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (07/29/2026)' },
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (29/07/2026)' },
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'emissions' && (
          <div className="space-y-4 w-full">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Carbon Accounting Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              <FormSelectField
                label="Default Carbon Unit"
                value={settings.carbonUnit}
                onChange={(val) => setSettings({ ...settings, carbonUnit: val })}
                options={[
                  { value: 'tCO2e', label: 'Metric Tonnes (tCO2e)' },
                  { value: 'kgCO2e', label: 'Kilograms (kgCO2e)' },
                  { value: 'lbCO2e', label: 'Pounds (lbCO2e)' },
                ]}
              />

              <FormSelectField
                label="Accounting Standard"
                value={settings.reportingStandard}
                onChange={(val) => setSettings({ ...settings, reportingStandard: val })}
                options={[
                  { value: 'ghg-protocol', label: 'GHG Protocol Corporate Standard' },
                  { value: 'iso-14064', label: 'ISO 14064-1 Standard' },
                  { value: 'pcaf', label: 'PCAF Financial Standard' },
                ]}
              />

              <FormSelectField
                label="Currency"
                value={settings.currency}
                onChange={(val) => setSettings({ ...settings, currency: val })}
                options={[
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'GBP', label: 'GBP (£)' },
                  { value: 'INR', label: 'INR (₹)' },
                ]}
              />

              <FormSelectField
                label="Decimal Precision"
                value={settings.decimalPrecision}
                onChange={(val) => setSettings({ ...settings, decimalPrecision: val })}
                options={[
                  { value: '2', label: '2 Decimal Places (0.00)' },
                  { value: '3', label: '3 Decimal Places (0.000)' },
                  { value: '4', label: '4 Decimal Places (0.0000)' },
                ]}
              />
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4 w-full">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Notification Preferences
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
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
                  <div
                    key={item.key}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-900">{item.title}</div>
                      <div className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={Boolean(settings[k])}
                      onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })}
                      className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-0 cursor-pointer ml-3 shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 w-full">
            <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Security Policies
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-neutral-900">
                    Enforce Two-Factor Authentication (2FA)
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    Require multi-factor authentication codes during login
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enable2FA}
                  onChange={(e) => setSettings({ ...settings, enable2FA: e.target.checked })}
                  className="w-4 h-4 text-neutral-900 rounded border-neutral-300 focus:ring-0 cursor-pointer shrink-0 ml-3"
                />
              </div>

              <FormSelectField
                label="Session Inactivity Timeout"
                value={settings.sessionTimeout}
                onChange={(val) => setSettings({ ...settings, sessionTimeout: val })}
                options={[
                  { value: '15', label: '15 Minutes' },
                  { value: '30', label: '30 Minutes' },
                  { value: '60', label: '1 Hour' },
                  { value: '240', label: '4 Hours' },
                ]}
              />
            </div>

            <div className="p-3.5 bg-neutral-100 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 flex items-center gap-2 w-full">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>TLS 256-bit connection encryption enabled for all active user sessions.</span>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
