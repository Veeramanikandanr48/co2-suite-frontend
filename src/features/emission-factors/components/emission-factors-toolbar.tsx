'use client';

import React from 'react';
import { Search, X, Plus } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../constants/emission-factor-constants';
import { EmissionFactorsToolbarProps } from '@/types/components/emission-factors.types';

export function EmissionFactorsToolbar({
  searchInput,
  setSearch,
  filterCategory,
  setFilterCategory,
  filterSource,
  setFilterSource,
  setAdditionalFilter,
  refetch,
  onOpenCreateModal,
}: EmissionFactorsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-muted p-2.5 rounded-lg border border-border">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search category, fuel, source..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-xs text-foreground font-semibold pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-foreground"
          />
          {searchInput && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={filterCategory}
          onChange={(e) => {
            const cat = e.target.value;
            setFilterCategory(cat);
            setAdditionalFilter({ category: cat, source: filterSource });
          }}
          className="bg-card border border-border text-xs text-foreground font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-foreground"
        >
          <option value="">All Categories / Scopes</option>
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={filterSource}
          onChange={(e) => {
            const src = e.target.value;
            setFilterSource(src);
            setAdditionalFilter({ category: filterCategory, source: src });
          }}
          className="bg-card border border-border text-xs text-foreground font-semibold px-3 py-1.5 rounded-lg focus:outline-none focus:border-foreground"
        >
          <option value="">All Database Sources</option>
          <option value="DEFRA">DEFRA</option>
          <option value="IPCC">IPCC</option>
          <option value="IEA">IEA</option>
          <option value="Ecoinvent">Ecoinvent</option>
          <option value="EXIOBASE">EXIOBASE</option>
          <option value="PCAF">PCAF</option>
          <option value="EPA">EPA</option>
        </select>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            setSearch('');
            setFilterCategory('');
            setFilterSource('');
            setAdditionalFilter({});
            refetch();
          }}
          className="px-3.5 py-1.5 bg-foreground hover:bg-foreground/90 text-background font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Clear All Filters
        </button>

        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Factor
          </button>
        )}
      </div>
    </div>
  );
}
