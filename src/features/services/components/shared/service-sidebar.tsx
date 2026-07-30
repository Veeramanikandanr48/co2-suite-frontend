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
import { ServiceSidebarProps } from '@/types/components/services.types';

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
    <aside className="w-64 bg-sidebar border-r border-border flex flex-col shrink-0 h-full overflow-hidden shadow-sm">
      {/* Module Title Header */}
      <div className="px-4 pt-4 pb-2 border-b border-border/40">
        <h2 className="text-sm font-semibold text-sidebar-foreground truncate">
          {currentConfig.name}
        </h2>
        <p className="text-[10px] text-sidebar-foreground/50 uppercase tracking-wider">
          Service Module
        </p>
      </div>

      {/* Navigation Sections in ScrollArea */}
      <ScrollArea className="flex-1">
        <div className="py-2 space-y-5">
          {/* START Section */}
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-4">
              START
            </p>
            <div className="px-3">
              <button
                type="button"
                onClick={() => setActiveTab('Summary')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all duration-200 cursor-pointer ${
                  activeTab === 'Summary'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-xs'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                }`}
              >
                <TrendingUp
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'Summary' ? 'text-emerald-400' : 'text-sidebar-foreground/50'
                  }`}
                />
                <span>Summary</span>
              </button>
            </div>
          </div>

          {/* CALCULATE Section */}
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-sidebar-foreground/50 px-4">
              CALCULATE
            </p>

            <div className="px-3 space-y-1.5">
              {loadingScopes ? (
                <div className="flex items-center gap-2 text-sidebar-foreground/50 py-3 px-3 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Loading scopes...</span>
                </div>
              ) : Object.keys(groupedScopes).length === 0 ? (
                <p className="text-[11px] text-sidebar-foreground/50 italic px-3 py-1">
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
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                          <span>{scopeName}</span>
                        </span>
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-sidebar-foreground/50" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="ml-5 pl-2.5 border-l border-border space-y-0.5 my-1">
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
                                    ? 'bg-sidebar-accent text-emerald-400 font-medium'
                                    : 'text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
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
