"use client";

import React from "react";
import Image from "next/image";
import {
  Leaf,
  Sparkles,
  Activity,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  Globe2,
} from "lucide-react";

export const SignInHeroColumn: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 lg:p-16 relative border-r border-slate-200/80 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.png"
          alt="Enterprise Carbon Telemetry Hero Background"
          fill
          priority
          className="object-cover object-center opacity-90 scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-slate-950/50 backdrop-blur-[1px]" />
      </div>

      {/* Top Brand Header */}
      <div className="relative z-10 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
          <Leaf className="h-5 w-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold tracking-wider text-white text-lg drop-shadow-sm">CO2 SUITE</span>
            <span className="text-[10px] font-semibold tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full backdrop-blur-md">
              Enterprise v2.4
            </span>
          </div>
          <p className="text-xs text-slate-300 drop-shadow-sm">Carbon Telemetry & Decarbonization Intelligence</p>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 my-auto py-12 space-y-8 max-w-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-emerald-300 shadow-md backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Next-Gen Enterprise Sustainability Platform</span>
        </div>

        <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-md">
          Accelerate Net-Zero Transformation with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">Real-Time Intelligence</span>
        </h1>

        <p className="text-slate-200 text-base leading-relaxed drop-shadow-sm font-normal">
          Unified GHG Protocol accounting, IoT emission sensor integration, and automated ESG disclosure reporting built for multi-site global enterprises.
        </p>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Carbon Tracked</span>
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">4.2M <span className="text-xs font-medium text-slate-400">tCO2e</span></div>
            <div className="flex items-center space-x-1 text-[11px] text-emerald-400 font-semibold">
              <TrendingDown className="h-3 w-3" />
              <span>18.4% reduction YoY</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 shadow-xl backdrop-blur-md space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
              <span>Audit Assurance</span>
              <ShieldCheck className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">100% <span className="text-xs font-medium text-slate-400">ISO 14064</span></div>
            <div className="flex items-center space-x-1 text-[11px] text-teal-400 font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              <span>Big-4 Audit Verified</span>
            </div>
          </div>
        </div>

        {/* Key Feature List */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium drop-shadow-sm">
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span>Automated Scope 1, 2, and 3 emission factors aggregation</span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-200 font-medium drop-shadow-sm">
            <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-400/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <span>Predictive decarbonization scenario modeling with AI</span>
          </div>
        </div>
      </div>

      {/* Bottom Security Trust Bar */}
      <div className="relative z-10 pt-6 border-t border-slate-700/70 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="font-medium text-white">SOC 2 Type II Certified</span>
          </div>
          <span>•</span>
          <div className="flex items-center space-x-1.5">
            <Globe2 className="h-4 w-4 text-teal-400" />
            <span className="font-medium text-white">ISO 27001 Compliant</span>
          </div>
        </div>
        <span className="text-slate-400">256-bit AES Encrypted</span>
      </div>
    </div>
  );
};
