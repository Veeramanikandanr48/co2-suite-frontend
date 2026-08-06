import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── StatsCard ────────────────────────────────────────────────────────────────
// Dense metric card for dashboard grids.
// Supports trend indicators, icon, and subtitle.

export type TrendDirection = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: { value: string; direction: TrendDirection };
  onClick?: () => void;
  className?: string;
}

function TrendIndicator({ direction, value }: { direction: TrendDirection; value: string }) {
  if (direction === 'up') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-positive-600 dark:text-positive-400">
        <TrendingUp className="w-3 h-3" /> {value}
      </span>
    );
  }
  if (direction === 'down') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-negative-600 dark:text-negative-400">
        <TrendingDown className="w-3 h-3" /> {value}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-muted-foreground">
      <Minus className="w-3 h-3" /> {value}
    </span>
  );
}

export function StatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  trend,
  onClick,
  className,
}: StatsCardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={cn(
        'relative bg-card border border-border rounded-xl p-4 text-left',
        'shadow-[var(--shadow-xs)] transition-shadow',
        onClick && 'hover:shadow-[var(--shadow-sm)] hover:border-neutral-300 dark:hover:border-neutral-600 cursor-pointer',
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
          {label}
        </p>
        {Icon && (
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconClassName)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-foreground tabular-nums leading-none mb-1">
        {value}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-1.5">
        {trend && <TrendIndicator direction={trend.direction} value={trend.value} />}
        {subtitle && (
          <span className="text-[11px] text-muted-foreground">{subtitle}</span>
        )}
      </div>
    </Tag>
  );
}
