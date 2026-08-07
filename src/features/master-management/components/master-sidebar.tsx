'use client';

import React, { useState, useEffect } from 'react';
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
  Building2,
  Shield,
} from 'lucide-react';
import { apiService } from '@/lib/api/api-service';
import { API_LIST } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
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
  Activity,
  BarChart3,
  Building2,
  Shield,
};

interface DynamicMasterType {
  id: number;
  code: string;
  name: string;
  icon?: string;
  color?: string;
  count?: number;
  allowHierarchy?: boolean;
  allowVersioning?: boolean;
}

interface DynamicMasterCategory {
  id: number;
  code: string;
  name: string;
  icon?: string;
  types: DynamicMasterType[];
}

interface SidebarStructureResponse {
  workspace: string;
  categories: DynamicMasterCategory[];
}

interface MasterSidebarProps {
  selectedKey: string;
  onSelect: (key: string) => void;
  selectedServiceCode?: string;
  onOpenHub?: () => void;
}

export function MasterSidebar({
  selectedKey,
  onSelect,
  selectedServiceCode = 'CARBON',
  onOpenHub,
}: MasterSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState<DynamicMasterCategory[]>([]);
  const [workspaceName, setWorkspaceName] = useState<string>('Master Data');

  useEffect(() => {
    async function fetchSidebarStructure() {
      try {
        const response = await apiService.get<SidebarStructureResponse>(API_LIST.MASTERS_SIDEBAR_STRUCTURE, {
          serviceCode: selectedServiceCode,
        });
        const resData = response?.data;
        if (resData && Array.isArray(resData.categories)) {
          setCategories(resData.categories);
          if (resData.workspace) setWorkspaceName(resData.workspace);
        }
      } catch {
        // keep fallback empty
      }
    }
    if (selectedServiceCode) {
      fetchSidebarStructure();
    }
  }, [selectedServiceCode]);

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
              className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground select-none truncate"
            >
              {workspaceName}
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Static Overview Dashboard */}
      <div className="pt-2 px-1">
        <button
          onClick={() => onSelect('DASHBOARD')}
          title={collapsed ? 'Dashboard' : undefined}
          className={cn(
            'relative w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors rounded-md',
            selectedKey === 'DASHBOARD'
              ? 'text-foreground font-semibold bg-muted before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-full'
              : 'text-muted-foreground font-medium hover:bg-muted/60',
            collapsed && 'justify-center px-0'
          )}
        >
          <LayoutDashboard className={cn('shrink-0 w-4 h-4', selectedKey === 'DASHBOARD' ? 'text-primary' : '')} />
          {!collapsed && <span className="truncate text-[13px]">Dashboard</span>}
        </button>
      </div>

      {/* Dynamic DB Categories & Types */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-1 px-1 scrollbar-hidden">
        {categories.map((group) => (
          <div key={group.id} className="mb-2">
            <AnimatePresence>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 select-none"
                >
                  {group.name}
                </motion.p>
              )}
            </AnimatePresence>

            {group.types.map((item) => {
              const IconComponent = (item.icon && ICON_MAP[item.icon]) || Database;
              const active = selectedKey === item.code;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelect(item.code)}
                  title={collapsed ? item.name : undefined}
                  className={cn(
                    'relative w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors rounded-md',
                    'hover:bg-muted/60',
                    active
                      ? 'text-foreground font-semibold bg-muted before:absolute before:left-0 before:top-1 before:bottom-1 before:w-0.5 before:bg-primary before:rounded-full'
                      : 'text-muted-foreground font-medium',
                    collapsed && 'justify-center px-0'
                  )}
                >
                  <IconComponent className={cn('shrink-0 w-4 h-4', active ? 'text-primary' : '')} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="truncate text-[13px]"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.count !== undefined && item.count > 0 && (
                    <span className="ml-auto shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                      {item.count}
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
