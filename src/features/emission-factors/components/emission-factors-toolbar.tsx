'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { CATEGORY_OPTIONS } from '../constants/emission-factor-constants';

interface ToolbarProps {
  searchInput: string;
  setSearch: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterSource: string;
  setFilterSource: (v: string) => void;
  setAdditionalFilter: (f: any) => void;
  refetch: () => void;
}

export function EmissionFactorsToolbar({
  searchInput,
  setSearch,
  filterCategory,
  setFilterCategory,
  filterSource,
  setFilterSource,
  setAdditionalFilter,
  refetch,
}: ToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search category, fuel, source..."
            value={searchInput}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-neutral-200 text-xs text-neutral-700 pl-8 pr-7 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
          />
          {searchInput && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-600"
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
          className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
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
          className="bg-white border border-neutral-200 text-xs text-neutral-700 px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500"
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

      <button
        type="button"
        onClick={() => {
          setSearch('');
          setFilterCategory('');
          setFilterSource('');
          setAdditionalFilter({});
          refetch();
        }}
        className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-900 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0"
      >
        Clear All Filters
      </button>
    </div>
  );
}
