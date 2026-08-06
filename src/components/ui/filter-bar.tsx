import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── SearchInput ──────────────────────────────────────────────────────────────
// Debounced search input matching the design token system.

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…', className }: SearchInputProps) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'h-8 w-full pl-8 pr-8 text-sm bg-background border border-input rounded-lg',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
          'transition-colors'
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────
// Horizontal toolbar hosting search, filter chips, and action buttons.

interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  chips?: FilterChip[];
  onRemoveChip?: (key: string) => void;
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  chips = [],
  onRemoveChip,
  leftActions,
  rightActions,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {leftActions}

      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="w-56"
      />

      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
        >
          <span className="opacity-60">{chip.label}:</span>
          {chip.value}
          {onRemoveChip && (
            <button
              onClick={() => onRemoveChip(chip.key)}
              className="ml-0.5 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          )}
        </span>
      ))}

      <div className="ml-auto flex items-center gap-2 shrink-0">
        {rightActions}
      </div>
    </div>
  );
}

// ─── ColumnToggleButton ───────────────────────────────────────────────────────
// Trigger button for column visibility dropdown.

interface ColumnToggleButtonProps {
  onClick: () => void;
  count?: number;
  className?: string;
}

export function ColumnToggleButton({ onClick, count, className }: ColumnToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg border border-input bg-background',
        'hover:bg-muted transition-colors text-muted-foreground hover:text-foreground',
        className
      )}
    >
      <SlidersHorizontal className="w-3.5 h-3.5" />
      Columns
      {count !== undefined && (
        <span className="ml-0.5 min-w-[16px] h-4 px-1 rounded bg-muted text-[10px] font-bold text-muted-foreground flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}
