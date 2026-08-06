import React from 'react';
import { cn } from '@/lib/utils';

// ─── Status Badge ───────────────────────────────────────────────────────────
// Maps lifecycle states to semantic colors from the design token system.

export type StatusValue =
  | 'PUBLISHED'
  | 'ACTIVE'
  | 'DRAFT'
  | 'PENDING'
  | 'DEPRECATED'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'APPROVED'
  | string;

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  PUBLISHED: {
    label: 'Published',
    classes: 'bg-positive-50 text-positive-700 dark:bg-positive-100/20 dark:text-positive-400',
    dot: 'bg-positive-500',
  },
  ACTIVE: {
    label: 'Active',
    classes: 'bg-positive-50 text-positive-700 dark:bg-positive-100/20 dark:text-positive-400',
    dot: 'bg-positive-500',
  },
  APPROVED: {
    label: 'Approved',
    classes: 'bg-primary-50 text-primary-700 dark:bg-primary-100/20 dark:text-primary-400',
    dot: 'bg-primary-500',
  },
  DRAFT: {
    label: 'Draft',
    classes: 'bg-warning-50 text-warning-700 dark:bg-warning-100/20 dark:text-warning-400',
    dot: 'bg-warning-500',
  },
  PENDING: {
    label: 'Pending',
    classes: 'bg-warning-50 text-warning-700 dark:bg-warning-100/20 dark:text-warning-400',
    dot: 'bg-warning-400',
  },
  DEPRECATED: {
    label: 'Deprecated',
    classes: 'bg-negative-50 text-negative-700 dark:bg-negative-100/20 dark:text-negative-400',
    dot: 'bg-negative-500',
  },
  REJECTED: {
    label: 'Rejected',
    classes: 'bg-negative-50 text-negative-700 dark:bg-negative-100/20 dark:text-negative-400',
    dot: 'bg-negative-500',
  },
  ARCHIVED: {
    label: 'Archived',
    classes: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
    dot: 'bg-neutral-400',
  },
};

const FALLBACK_CONFIG = {
  label: '',
  classes: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  dot: 'bg-neutral-400',
};

interface StatusBadgeProps {
  status: StatusValue;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ status, showDot = true, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status?.toUpperCase?.()] ?? FALLBACK_CONFIG;
  const label = config.label || (status ?? '—');

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider leading-none',
        config.classes,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)} />}
      {label}
    </span>
  );
}
