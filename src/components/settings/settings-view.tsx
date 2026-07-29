"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Globe,
  Bell,
  ShieldCheck,
  Leaf,
  Save,
  Moon,
  Sun,
  Monitor,
  CheckCircle,
} from "lucide-react";

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
  theme: "system",
  language: "en",
  dateFormat: "YYYY-MM-DD",
  timezone: "UTC",
  carbonUnit: "tCO2e",
  reportingStandard: "ghg-protocol",
  currency: "USD",
  decimalPrecision: "2",
  notifyThresholdAlerts: true,
  notifyWeeklyDigest: true,
  notifySystemUpdates: false,
  enable2FA: false,
  sessionTimeout: "30",
};

export function SettingsView() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("app_settings");
    if (saved) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
      } catch {
        // Fallback to default
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem("app_settings", JSON.stringify(settings));
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your platform preferences have been updated successfully.",
      });
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-emerald-600" />
            System & Account Settings
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure application preferences, reporting standards, and notification parameters.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shrink-0">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px] bg-background-inner p-1 border border-border rounded-xl">
          <TabsTrigger value="general" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <Globe className="w-4 h-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="emissions" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <Leaf className="w-4 h-4" />
            <span>Carbon Units</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <Bell className="w-4 h-4" />
            <span>Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 text-xs sm:text-sm rounded-lg">
            <ShieldCheck className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                General & Regional Preferences
              </CardTitle>
              <CardDescription>
                Customize theme appearance, language, and locale formatting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appearance Mode Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Appearance Theme</Label>
                <div className="grid grid-cols-3 gap-3 max-w-md">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = settings.theme === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSettings({ ...settings, theme: item.id })}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold"
                            : "border-border hover:bg-background-inner/60 text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-1" />
                        <span className="text-xs">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl pt-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Interface Language</Label>
                  <Select value={settings.language} onValueChange={(val) => setSettings({ ...settings, language: val })}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English (US)</SelectItem>
                      <SelectItem value="es">Español (Spanish)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="de">Deutsch (German)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(val) => setSettings({ ...settings, timezone: val })}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="EST">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="PST">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="GMT">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="IST">IST (India Standard Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(val) => setSettings({ ...settings, dateFormat: val })}>
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-07-29)</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (07/29/2026)</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (29/07/2026)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Carbon Units & Standard */}
        <TabsContent value="emissions">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                Carbon Accounting & Standards
              </CardTitle>
              <CardDescription>
                Define greenhouse gas emission measurement units, standards, and currency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="carbonUnit">Default Carbon Unit</Label>
                  <Select value={settings.carbonUnit} onValueChange={(val) => setSettings({ ...settings, carbonUnit: val })}>
                    <SelectTrigger id="carbonUnit">
                      <SelectValue placeholder="Select carbon unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tCO2e">Metric Tonnes (tCO2e)</SelectItem>
                      <SelectItem value="kgCO2e">Kilograms (kgCO2e)</SelectItem>
                      <SelectItem value="lbCO2e">Pounds (lbCO2e)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportingStandard">Accounting Standard</Label>
                  <Select value={settings.reportingStandard} onValueChange={(val) => setSettings({ ...settings, reportingStandard: val })}>
                    <SelectTrigger id="reportingStandard">
                      <SelectValue placeholder="Select standard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ghg-protocol">GHG Protocol Corporate Standard</SelectItem>
                      <SelectItem value="iso-14064">ISO 14064-1 Standard</SelectItem>
                      <SelectItem value="pcaf">PCAF Financial Standard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Financial Currency</Label>
                  <Select value={settings.currency} onValueChange={(val) => setSettings({ ...settings, currency: val })}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="decimalPrecision">Decimal Precision</Label>
                  <Select value={settings.decimalPrecision} onValueChange={(val) => setSettings({ ...settings, decimalPrecision: val })}>
                    <SelectTrigger id="decimalPrecision">
                      <SelectValue placeholder="Select precision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Decimal Places (0.00)</SelectItem>
                      <SelectItem value="3">3 Decimal Places (0.000)</SelectItem>
                      <SelectItem value="4">4 Decimal Places (0.0000)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Notifications */}
        <TabsContent value="notifications">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose when and how you receive alerts and reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              {[
                {
                  id: "notifyThresholdAlerts",
                  title: "CO2 Emission Threshold Breach Alerts",
                  desc: "Receive real-time notifications when a facility exceeds configured carbon targets.",
                },
                {
                  id: "notifyWeeklyDigest",
                  title: "Weekly Carbon Footprint Summary",
                  desc: "Automated weekly email report containing emission trends and facility statistics.",
                },
                {
                  id: "notifySystemUpdates",
                  title: "System Maintenance & Regulatory Updates",
                  desc: "Notices about platform upgrades, API changes, and IPCC emission factor updates.",
                },
              ].map((item) => {
                const key = item.id as keyof AppSettings;
                return (
                  <div key={item.id} className="flex items-start space-x-3 p-3.5 border border-border rounded-xl hover:bg-background-inner/40 transition-colors">
                    <Checkbox
                      id={item.id}
                      checked={Boolean(settings[key])}
                      onCheckedChange={(checked) => setSettings({ ...settings, [key]: Boolean(checked) })}
                      className="mt-0.5"
                    />
                    <div className="space-y-0.5">
                      <Label htmlFor={item.id} className="text-sm font-medium cursor-pointer">
                        {item.title}
                      </Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Security */}
        <TabsContent value="security">
          <Card className="border border-border shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Security & Session Policies
              </CardTitle>
              <CardDescription>
                Manage account safety rules and authentication enforcement.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-2xl">
              <div className="flex items-start space-x-3 p-4 border border-border rounded-xl bg-background-inner/30">
                <Checkbox
                  id="enable2FA"
                  checked={settings.enable2FA}
                  onCheckedChange={(checked) => setSettings({ ...settings, enable2FA: Boolean(checked) })}
                  className="mt-0.5"
                />
                <div className="space-y-0.5">
                  <Label htmlFor="enable2FA" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                    Enforce Two-Factor Authentication (2FA)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Require an authenticator app code during sign in for enhanced protection.
                  </p>
                </div>
              </div>

              <div className="space-y-2 max-w-xs">
                <Label htmlFor="sessionTimeout">Session Inactivity Timeout</Label>
                <Select value={settings.sessionTimeout} onValueChange={(val) => setSettings({ ...settings, sessionTimeout: val })}>
                  <SelectTrigger id="sessionTimeout">
                    <SelectValue placeholder="Select timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">1 Hour</SelectItem>
                    <SelectItem value="240">4 Hours</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground pt-1">
                  Automatically log out after this duration of inactivity.
                </p>
              </div>

              <div className="p-4 border border-emerald-600/20 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your connection is encrypted with 256-bit TLS security protocol.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
