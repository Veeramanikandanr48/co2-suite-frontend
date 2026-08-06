'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CornerDownLeft, ArrowUp, ArrowDown, Hash, Database, Upload, History, X } from 'lucide-react';
import { MASTER_ITEM_TYPES } from '@/types/master-management.types';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ElementType;
  action: () => void;
  group: string;
}

interface MasterCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
}

export function MasterCommandPalette({ isOpen, onClose, onNavigate }: MasterCommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCommands: CommandItem[] = [
    { id: 'DASHBOARD',  label: 'Dashboard',       group: 'Navigation', icon: Hash,     action: () => onNavigate('DASHBOARD') },
    { id: 'IMPORTS',    label: 'Import Jobs',      group: 'Governance', icon: Upload,   action: () => onNavigate('IMPORTS') },
    { id: 'HISTORY',    label: 'Audit History',    group: 'Governance', icon: History,  action: () => onNavigate('HISTORY') },
    { id: 'EMISSION_FACTOR', label: 'Emission Factors', group: 'Reference Data', icon: Database, action: () => onNavigate('EMISSION_FACTOR') },
    ...MASTER_ITEM_TYPES
      .filter((t) => !['UNIT_CONVERSIONS', 'MAPPINGS_CATEGORY_FUEL', 'MAPPINGS_FUEL_UNIT', 'EMISSION_FACTOR'].includes(t.value))
      .map((t) => ({
        id: t.value,
        label: t.label,
        description: t.description,
        group: 'Master Data',
        action: () => onNavigate(t.value),
      })),
  ];

  const filtered = query.trim()
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allCommands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    acc[item.group] = [...(acc[item.group] ?? []), item];
    return acc;
  }, {});

  const flatList = filtered;

  const execute = useCallback((item: CommandItem) => {
    item.action();
    onClose();
    setQuery('');
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setCursor(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(c + 1, flatList.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
      if (e.key === 'Enter' && flatList[cursor]) { execute(flatList[cursor]); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, cursor, flatList, execute, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-[var(--shadow-2xl)] overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
            placeholder="Search master data, navigate…"
            className="flex-1 text-sm bg-transparent placeholder:text-muted-foreground focus:outline-none text-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:flex h-5 px-1.5 rounded bg-muted text-[10px] font-mono font-semibold text-muted-foreground items-center">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto scrollbar-custom py-1">
          {flatList.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No results for &quot;{query}&quot;</p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {group}
                </p>
                {items.map((item) => {
                  const globalIdx = flatList.indexOf(item);
                  const isActive = cursor === globalIdx;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setCursor(globalIdx)}
                      onClick={() => execute(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive ? 'bg-primary/8 text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      )}
                    >
                      {Icon ? (
                        <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} />
                      ) : (
                        <Hash className="w-4 h-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                        )}
                      </div>
                      {isActive && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/40">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ArrowUp className="w-3 h-3" /><ArrowDown className="w-3 h-3" /> Navigate
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> Select
          </span>
          <span className="text-[10px] text-muted-foreground ml-auto">
            <kbd className="px-1 rounded bg-muted font-mono">Ctrl K</kbd> to toggle
          </span>
        </div>
      </motion.div>
    </div>
  );
}
