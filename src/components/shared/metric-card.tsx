'use client';

import React from 'react';
import { MetricCardProps } from '@/types/components/reusables.types';

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  className = '',
}: MetricCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-xs p-4 flex items-center gap-3.5 ${className}`}>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-2xl font-bold text-foreground truncate">{value}</div>
        <div className="text-xs font-medium text-muted-foreground truncate">{title}</div>
        {subtitle && <div className="text-[11px] text-muted-foreground/70 truncate">{subtitle}</div>}
      </div>
    </div>
  );
}
