import React from 'react';
import {
  Layers,
  Activity,
  FlameKindling,
  FlaskConical,
  BarChart3,
  Globe,
  MapPin,
  Database,
  GitBranch,
  Zap,
  FileCheck,
  Building2,
  DollarSign,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Type Badge ──────────────────────────────────────────────────────────────
// Shows the master item type as a pill with icon and label.
// Used in data grid rows, detail drawers, and filter bars.

interface TypeConfig {
  label: string;
  icon: LucideIcon;
  classes: string;
}

const TYPE_CONFIG: Record<string, TypeConfig> = {
  SCOPE:                { label: 'Scope',          icon: Layers,         classes: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300' },
  ACTIVITY_CATEGORY:    { label: 'Activity',        icon: Activity,       classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  FUEL_TYPE:            { label: 'Fuel',            icon: FlameKindling,  classes: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
  GAS_TYPE:             { label: 'Gas',             icon: FlaskConical,   classes: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300' },
  UNIT:                 { label: 'Unit',            icon: BarChart3,      classes: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  COUNTRY:              { label: 'Country',         icon: Globe,          classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  REGION:               { label: 'Region',          icon: MapPin,         classes: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
  FACTOR_SOURCE:        { label: 'Source',          icon: Database,       classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  FACTOR_VERSION:       { label: 'Version',         icon: GitBranch,      classes: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' },
  GWP_VERSION:          { label: 'GWP',             icon: Zap,            classes: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  FORMULA:              { label: 'Formula',         icon: FlaskConical,   classes: 'bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300' },
  DATA_QUALITY:         { label: 'Quality',         icon: FileCheck,      classes: 'bg-lime-50 text-lime-700 dark:bg-lime-950/40 dark:text-lime-300' },
  REPORTING_FRAMEWORK:  { label: 'Framework',       icon: FileCheck,      classes: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300' },
  INDUSTRY:             { label: 'Industry',        icon: Building2,      classes: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
  CURRENCY:             { label: 'Currency',        icon: DollarSign,     classes: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300' },
  ORGANIZATION:         { label: 'Organization',    icon: Building2,      classes: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
};

const FALLBACK_CONFIG: TypeConfig = {
  label: '',
  icon: Database,
  classes: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

interface TypeBadgeProps {
  type: string;
  showIcon?: boolean;
  className?: string;
}

export function TypeBadge({ type, showIcon = true, className }: TypeBadgeProps) {
  const config = TYPE_CONFIG[type?.toUpperCase?.()] ?? FALLBACK_CONFIG;
  const Icon = config.icon;
  const label = config.label || type?.replace(/_/g, ' ') || '—';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider leading-none',
        config.classes,
        className
      )}
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      {label}
    </span>
  );
}
