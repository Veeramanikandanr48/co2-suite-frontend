'use client';

import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Loader2,
  Layers,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ServiceScopeItem } from '@/types/services';

interface ServiceSidebarProps {
  readonly currentConfig: {
    name: string;
    tag: string;
    daysLeft: number;
  };
  readonly activeTab: string;
  readonly setActiveTab: (tab: string) => void;
  readonly loadingScopes: boolean;
  readonly groupedScopes: Record<string, ServiceScopeItem[]>;
  readonly openScopes: Record<string, boolean>;
  readonly toggleScope: (scopeName: string) => void;
}

export const ServiceSidebar: React.FC<ServiceSidebarProps> = ({
  currentConfig,
  activeTab,
  setActiveTab,
  loadingScopes,
  groupedScopes,
  openScopes,
  toggleScope,
}) => {
  return (
    <aside className="w-64 bg-background-sidebar border-r border-border-logo flex flex-col shrink-0 h-full overflow-hidden shadow-[inset_0px_3px_10px_0px_#0000001A]">
      {/* Module Title Header (Clean text without branch logo) */}
      <div className="px-4 pt-4 pb-2 border-b border-border-logo/40">
        <h2 className="text-sm font-semibold text-text-sidebar truncate">
          {currentConfig.name}
        </h2>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider">
          Service Module
        </p>
      </div>

      {/* Navigation Sections in ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="py-2 space-y-5">
          {/* START Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4">
              START
            </p>
            <div className="px-3">
              <button
                type="button"
                onClick={() => setActiveTab('Summary')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'Summary'
                    ? 'bg-background-sidebarActive text-light-100 font-medium shadow-xs'
                    : 'text-text-sidebar/80 hover:bg-white/5 hover:text-light-100'
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'Summary' ? 'text-emerald-400' : 'text-gray-400'
                  }`}
                />
                <span>Summary</span>
              </button>
            </div>
          </div>

          {/* CALCULATE Section */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-4">
              CALCULATE
            </p>

            <div className="px-3 space-y-1.5">
              {loadingScopes ? (
                <div className="flex items-center gap-2 text-gray-400 py-3 px-3 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading scopes...</span>
                </div>
              ) : Object.keys(groupedScopes).length === 0 ? (
                <p className="text-[11px] text-gray-400 italic px-3 py-1">
                  No scope items found.
                </p>
              ) : (
                Object.entries(groupedScopes).map(([scopeName, items]) => {
                  const isOpen = openScopes[scopeName] !== false;
                  return (
                    <div key={scopeName} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => toggleScope(scopeName)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-text-sidebar/90 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span>{scopeName}</span>
                        </span>
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="ml-5 pl-2.5 border-l border-white/10 space-y-0.5 my-1">
                          {items.map((item) => {
                            const isActive = activeTab === item.name;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                title={item.description || item.name}
                                onClick={() => setActiveTab(item.name)}
                                className={`w-full text-left cursor-pointer px-2.5 py-1.5 rounded-md text-xs transition-all duration-200 truncate block ${
                                  isActive
                                    ? 'bg-background-sidebarActive text-emerald-400 font-medium'
                                    : 'text-gray-400 hover:text-light-100 hover:bg-white/5'
                                }`}
                              >
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
};
