'use client';

import React from 'react';
import { SectionCardProps } from '@/types/components/reusables.types';

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div className={`bg-card border border-border rounded-xl shadow-xs p-5 sm:p-6 space-y-4 w-full ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
