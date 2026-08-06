import React from 'react';
import { cn } from '@/lib/utils';

// ─── PageHeader ───────────────────────────────────────────────────────────────
// Standardized page-level header: title, description, breadcrumb slot, actions.

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 flex-wrap', className)}>
      <div className="min-w-0 flex-1">
        {breadcrumb && (
          <div className="mb-1 text-xs text-muted-foreground">{breadcrumb}</div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-foreground leading-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
      )}
    </div>
  );
}

// ─── SectionCard ─────────────────────────────────────────────────────────────
// Consistent card container for content sections.

interface SectionCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
  noPadding = false,
}: SectionCardProps) {
  return (
    <div className={cn('bg-card border border-border rounded-xl shadow-[var(--shadow-xs)] overflow-hidden', className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
          <div>
            {title && (
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            )}
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-4', bodyClassName)}>
        {children}
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── InlineLoader (Skeleton) ──────────────────────────────────────────────────

export function RowSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-px">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-b border-border last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              className="h-3.5 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"
              style={{ width: `${60 + ((i + j) % 3) * 20}px`, flex: j === 0 ? '0 0 auto' : '1' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ElementType;
  iconClassName?: string;
  badge?: React.ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

export function Timeline({ events, className }: TimelineProps) {
  return (
    <ol className={cn('relative border-l border-border ml-3 space-y-0', className)}>
      {events.map((event) => {
        const Icon = event.icon;
        return (
          <li key={event.id} className="ml-4 pb-5 last:pb-0">
            <div className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-border border-2 border-card" />
            {Icon && (
              <div className={cn('absolute -left-2.5 mt-1 w-5 h-5 rounded-full flex items-center justify-center', event.iconClassName || 'bg-muted')}>
                <Icon className="w-2.5 h-2.5" />
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-foreground">{event.title}</p>
                {event.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{event.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {event.badge}
                <time className="text-[10px] text-muted-foreground whitespace-nowrap">{event.timestamp}</time>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
