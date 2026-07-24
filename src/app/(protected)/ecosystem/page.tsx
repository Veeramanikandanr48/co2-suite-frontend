"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Sparkles,
  ArrowRight,
  HelpCircle,
  X,
  Layers,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Leaf,
  BarChart3,
  Factory,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AppCardItem {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  category: "Corporate" | "Product" | "Global" | "Industry" | "Customized";
  tags?: string[];
  isSubscribed?: boolean;
  isDemo?: boolean;
  appsCount?: number;
  demoDetails?: {
    overview: string;
    standards: string[];
    features: string[];
  };
}

const DEMO_APPS: AppCardItem[] = [
  {
    id: "demo-carbon",
    title: "CO2 Suite",
    badge: "Carbon",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800",
    description: "Corporate Carbon Management and Reporting Module",
    category: "Corporate",
    isDemo: true,
    demoDetails: {
      overview: "Comprehensive Scope 1, 2, and 3 GHG accounting and real-time decarbonization analytics for corporate enterprise reporting.",
      standards: ["GHG Protocol", "ISO 14064-1", "CSRD / ESRS E1"],
      features: ["Automated Utility Data Ingestion", "Scope 3 Supplier Portal", "Auditable Carbon Ledger"],
    },
  },
  {
    id: "demo-cbam",
    title: "CO2 Suite",
    badge: "CBAM",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    description: "EU Carbon Border Adjustment Mechanism Module",
    category: "Global",
    isDemo: true,
    demoDetails: {
      overview: "Automated calculations, embedded emission declarations, and quarterly CBAM report generation for EU importers.",
      standards: ["EU Regulation 2023/956", "EU CBAM Implementing Act"],
      features: ["Installation Emission Tracking", "De-Minimis Threshold Alerter", "CBAM Declarant Filing XML"],
    },
  },
  {
    id: "demo-pcf-textiles",
    title: "CO2 Suite",
    badge: "PCF | Textiles & Apparels",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800",
    description: "EU Product Environmental Footprint Module for Textiles & Apparels",
    category: "Product",
    isDemo: true,
    demoDetails: {
      overview: "Cradle-to-grave Product Carbon Footprint (PCF) accounting tailored for textile supply chains and garment manufacturing.",
      standards: ["EU PEFCR Textiles", "ISO 14067"],
      features: ["Yarn & Fabric Emission Libraries", "Digital Product Passport (DPP) Export", "Lifecycle Impact Analytics"],
    },
  },
  {
    id: "demo-lca-plastics",
    title: "CO2 Suite",
    badge: "LCA | Plastics",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800",
    description: "Product Life Cycle Assessment for Plastic Manufacturing",
    category: "Industry",
    isDemo: true,
    demoDetails: {
      overview: "Process-level LCA modeling for polymer synthesis, injection molding, and recycled resin accounting.",
      standards: ["ISO 14040 / 14044", "PlasticsEurope EPD Guidelines"],
      features: ["Polymer Chemical Database", "Recycled Content Offset Accounting", "Multi-Impact Category Matrix"],
    },
  },
  {
    id: "demo-lca-metals",
    title: "CO2 Suite",
    badge: "LCA | Metals",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800",
    description: "Product Life Cycle Assessment for Metal Manufacturing",
    category: "Industry",
    isDemo: true,
    demoDetails: {
      overview: "High-precision metallurgical LCA modeling for steel, aluminum smelting, and foundry operations.",
      standards: ["World Steel Association ISO 14040", "EN 15804"],
      features: ["Scrap Substitution Benefit Method", "Foundry Energy Optimization", "Alloy Composition Footprinting"],
    },
  },
  {
    id: "demo-esg",
    title: "CO2 Suite",
    badge: "ESG",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    description: "Corporate Sustainability Management and Reporting Module",
    category: "Corporate",
    isDemo: true,
    demoDetails: {
      overview: "Unified ESG framework metrics capturing Environmental, Social, and Governance KPIs for institutional disclosure.",
      standards: ["GRI Standards", "CSRD", "BRSR India"],
      features: ["Double Materiality Assessment", "Stakeholder Engagement Portal", "BRSR Report Generator"],
    },
  },
  {
    id: "demo-epd-cables",
    title: "CO2 Suite",
    badge: "EPD | Cables",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    description: "Environmental Product Declarations Module for Cable Industry",
    category: "Industry",
    isDemo: true,
    demoDetails: {
      overview: "Standardized EPD creation and third-party verification workflow for industrial wire and electrical cabling products.",
      standards: ["EN 50575", "PCR Cable Systems", "ISO 14025"],
      features: ["Conductor Copper/Alu Calculation", "Insulation PVC/XLPE Module", "EPD International Publisher Export"],
    },
  },
];

const MAIN_APPS: AppCardItem[] = [
  {
    id: "app-carbon",
    title: "CO2 Suite",
    badge: "Carbon",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800",
    description: "Corporate Carbon Management and Reporting Module",
    category: "Corporate",
    tags: ["Corporate", "Global"],
    isSubscribed: true,
  },
  {
    id: "app-cbam",
    title: "CO2 Suite",
    badge: "CBAM",
    badgeColor: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    description: "EU Carbon Border Adjustment Mechanism Module",
    category: "Global",
    tags: ["Product", "Industry"],
    isSubscribed: false,
  },
  {
    id: "app-esg",
    title: "CO2 Suite",
    badge: "ESG",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    description: "Corporate Sustainability Management and Reporting Module",
    category: "Corporate",
    tags: ["Corporate", "Global"],
    isSubscribed: true,
  },
  {
    id: "app-pcf",
    title: "CO2 Suite",
    badge: "PCF",
    badgeColor: "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-950/50 dark:text-sky-400 dark:border-sky-800",
    description: "Product Carbon Footprint Module",
    category: "Product",
    tags: ["Product", "Industry", "Customized"],
    isSubscribed: false,
  },
  {
    id: "app-pcf-textiles",
    title: "CO2 Suite",
    badge: "PCF | Textiles & Apparels",
    badgeColor: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-800",
    description: "EU Product Environmental Footprint Module for Textiles & Apparels",
    category: "Product",
    tags: ["Product", "Industry"],
    isSubscribed: false,
  },
  {
    id: "app-epd-cables",
    title: "CO2 Suite",
    badge: "EPD | Cables",
    badgeColor: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    description: "Environmental Product Declarations Module for Cable Industry",
    category: "Industry",
    tags: ["Product", "Industry"],
    isSubscribed: false,
  },
  {
    id: "app-lca-metals",
    title: "CO2 Suite",
    badge: "LCA | Metals",
    badgeColor: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/50 dark:text-violet-400 dark:border-violet-800",
    description: "Product Life Cycle Assessment for Metal Manufacturing",
    category: "Industry",
    tags: ["Product", "Industry", "Customized"],
    isSubscribed: false,
  },
  {
    id: "app-lca-plastics",
    title: "CO2 Suite",
    badge: "LCA | Plastics",
    badgeColor: "bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/50 dark:text-pink-400 dark:border-pink-800",
    description: "Product Life Cycle Assessment for Plastic Manufacturing",
    category: "Industry",
    tags: ["Product", "Industry"],
    isSubscribed: false,
  },
];

const CUSTOMIZED_APPS: AppCardItem[] = [
  {
    id: "custom-multisite",
    title: "CO2 Suite",
    badge: "Multi-site Hub",
    badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400 dark:border-cyan-800",
    description: "Enterprise Multi-Facility Energy & Emission Consolidation Platform",
    category: "Customized",
    tags: ["Customized", "Global"],
    isSubscribed: true,
  },
  {
    id: "custom-scope3",
    title: "CO2 Suite",
    badge: "Scope 3 Supplier Portal",
    badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800",
    description: "Automated Supply Chain Primary Data Exchange & Decarbonization Ledger",
    category: "Customized",
    tags: ["Customized", "Corporate"],
    isSubscribed: false,
  },
  {
    id: "custom-water",
    title: "CO2 Suite",
    badge: "Water & Waste",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/50 dark:text-teal-400 dark:border-teal-800",
    description: "Industrial Water Withdrawal, Circularity & Effluent Management Module",
    category: "Customized",
    tags: ["Customized", "Industry"],
    isSubscribed: false,
  },
  {
    id: "custom-audit",
    title: "CO2 Suite",
    badge: "Third-Party Audit",
    badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    description: "ISO 14064 Verification Readiness & Assurance Evidence Locker",
    category: "Customized",
    tags: ["Customized", "Global"],
    isSubscribed: true,
  },
];

const CATEGORY_FILTERS = ["All", "Corporate", "Product", "Global", "Industry", "Customized"] as const;

export default function EcosystemPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDemo, setSelectedDemo] = useState<AppCardItem | null>(null);

  // Filter helper
  const filterItem = (item: AppCardItem) => {
    const matchesCategory =
      activeCategory === "All" ||
      item.category === activeCategory ||
      (item.tags && item.tags.includes(activeCategory));

    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  };

  const filteredDemoApps = useMemo(() => DEMO_APPS.filter(filterItem), [activeCategory, searchQuery]);
  const filteredMainApps = useMemo(() => MAIN_APPS.filter(filterItem), [activeCategory, searchQuery]);
  const filteredCustomApps = useMemo(() => CUSTOMIZED_APPS.filter(filterItem), [activeCategory, searchQuery]);

  return (
    <div className="w-full min-h-full bg-slate-50/50 dark:bg-neutral-950 p-4 sm:p-6 lg:p-8 pb-16 sm:pb-24 lg:pb-32 space-y-8 select-none">
      {/* Top Header & Filter Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-gray-200/80 dark:border-neutral-800">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 dark:bg-neutral-900 dark:text-gray-400 dark:border-neutral-800 dark:hover:bg-neutral-800"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Real-time Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search apps, features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 h-9 text-xs bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 rounded-xl shadow-xs focus-visible:ring-1 focus-visible:ring-emerald-500"
          />
        </div>
      </div>

      {/* ── Section 1: Available Demo Apps ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">Available Demo Apps</h2>
          </div>
          <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 rounded-md">
            {filteredDemoApps.length} apps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDemoApps.map((app) => (
            <div
              key={app.id}
              className="group relative bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{app.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDemo(app)}
                    title="View Module Overview"
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 font-normal leading-relaxed line-clamp-3">
                  {app.description}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end">
                <button
                  onClick={() => setSelectedDemo(app)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 transition-colors cursor-pointer group/btn"
                >
                  <span>Demo</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: CO2 Suite Apps ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">CO2 Suite Apps</h2>
          <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 rounded-md">
            {filteredMainApps.length} apps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMainApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{app.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedDemo(app)}
                    title="View Details"
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {app.description}
                </p>

                {app.tags && app.tags.length > 0 && (
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {app.tags.join(" • ")}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/60 flex items-center justify-between">
                <span className={`text-[11px] font-medium italic ${app.isSubscribed ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}>
                  {app.isSubscribed ? "Subscribed" : "Not subscribed"}
                </span>

                {app.isSubscribed ? (
                  <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50 rounded-lg">
                    Launch
                  </Button>
                ) : (
                  <Button size="sm" variant="ghost" className="text-xs h-7 px-2.5 text-gray-500 hover:text-gray-900 rounded-lg">
                    Subscribe
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: CO2 Suite Customized Apps ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">CO2 Suite Customized Apps</h2>
          <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-500 bg-gray-100 dark:bg-neutral-800 dark:text-gray-400 rounded-md">
            {filteredCustomApps.length} apps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredCustomApps.map((app) => (
            <div
              key={app.id}
              className="bg-white dark:bg-neutral-900 border border-gray-200/80 dark:border-neutral-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{app.title}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                  {app.description}
                </p>

                {app.tags && (
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {app.tags.join(" • ")}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/60 flex items-center justify-between">
                <span className={`text-[11px] font-medium italic ${app.isSubscribed ? "text-emerald-600" : "text-gray-400"}`}>
                  {app.isSubscribed ? "Active License" : "Custom Enterprise"}
                </span>

                <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 text-primary border-primary/20 hover:bg-primary/5 rounded-lg">
                  Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Explicit Bottom Spacer for Scroll Clearance */}
      <div className="h-24 sm:h-36 w-full shrink-0" aria-hidden="true" />

      {/* ── Interactive Demo Walkthrough Modal ── */}
      {selectedDemo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-6 relative overflow-hidden">
            <button
              onClick={() => setSelectedDemo(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-bold text-gray-900 dark:text-white">{selectedDemo.title}</span>
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${selectedDemo.badgeColor}`}>
                  {selectedDemo.badge}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{selectedDemo.description}</p>
            </div>

            {selectedDemo.demoDetails && (
              <div className="space-y-4 bg-gray-50 dark:bg-neutral-800/50 p-4 rounded-2xl border border-gray-100 dark:border-neutral-800">
                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Overview
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {selectedDemo.demoDetails.overview}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Regulatory Standards
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDemo.demoDetails.standards.map((st) => (
                      <span key={st} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-semibold rounded-md border border-emerald-200 dark:border-emerald-800">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Key Features
                  </h4>
                  <ul className="space-y-1">
                    {selectedDemo.demoDetails.features.map((ft) => (
                      <li key={ft} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{ft}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setSelectedDemo(null)}
                className="rounded-xl text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  alert(`Launching Demo for ${selectedDemo.badge}...`);
                  setSelectedDemo(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
              >
                <span>Launch Interactive Demo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
