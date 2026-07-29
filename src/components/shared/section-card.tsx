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
    <div className={`bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 w-full ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            {title && <h3 className="text-sm font-bold text-neutral-900">{title}</h3>}
            {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
