'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  FlameKindling,
  Globe,
  MapPin,
  Database,
  GitBranch,
  FlaskConical,
  Zap,
  FileCheck,
  Upload,
  History,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Activity,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { key: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Taxonomy',
    items: [
      { key: 'SCOPE', label: 'GHG Scopes', icon: Layers },
      { key: 'ACTIVITY_CATEGORY', label: 'Activity Categories', icon: Activity },
      { key: 'FUEL_TYPE', label: 'Fuel Types', icon: FlameKindling },
      { key: 'GAS_TYPE', label: 'Gas Types', icon: FlaskConical },
      { key: 'UNIT', label: 'Measurement Units', icon: BarChart3 },
    ],
  },
  {
    title: 'Geography',
    items: [
      { key: 'COUNTRY', label: 'Countries', icon: Globe },
      { key: 'REGION', label: 'Grid Regions', icon: MapPin },
    ],
  },
  {
    title: 'Reference Data',
    items: [
      { key: 'FACTOR_SOURCE', label: 'Factor Sources', icon: Database },
      { key: 'FACTOR_VERSION', label: 'Factor Versions', icon: GitBranch },
      { key: 'GWP_VERSION', label: 'GWP Versions', icon: Zap },
      { key: 'FORMULA', label: 'Formulas', icon: FlaskConical },
      { key: 'EMISSION_FACTOR', label: 'Emission Factors', icon: Database },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { key: 'CURRENCY', label: 'Currencies', icon: BarChart3 },
      { key: 'INDUSTRY', label: 'Industry Sectors', icon: Layers },
      { key: 'DATA_QUALITY', label: 'Data Quality', icon: FileCheck },
      { key: 'REPORTING_FRAMEWORK', label: 'Reporting Frameworks', icon: FileCheck },
      { key: 'UNIT_CONVERSIONS', label: 'Unit Conversions', icon: GitBranch },
    ],
  },
  {
    title: 'Governance',
    items: [
      { key: 'IMPORTS', label: 'Import Jobs', icon: Upload },
      { key: 'HISTORY', label: 'Audit History', icon: History },
      { key: 'VALIDATION', label: 'Validation', icon: AlertTriangle },
    ],
  },
];

interface MasterSidebarProps {
  selectedKey: string;
  onSelect: (key: string) => void;
}

export function MasterSidebar({ selectedKey, onSelect }: MasterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col shrink-0 border-r border-border bg-card overflow-hidden h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-border shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground select-none"
            >
              Master Data
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hidden">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-1">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none"
                >
                  {group.title}
                </motion.p>
              )}
            </AnimatePresence>

            {group.items.map((item) => {
              const Icon = item.icon;
              const active = selectedKey === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'relative w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    'hover:bg-muted/60',
                    active
                      ? 'text-foreground font-semibold bg-muted before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-full'
                      : 'text-muted-foreground font-medium',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <Icon className={cn('shrink-0', active ? 'text-primary w-4 h-4' : 'w-4 h-4')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="truncate text-[13px]"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </motion.aside>
  );
}
