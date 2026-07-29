'use client';

import React from 'react';
import { PageHeaderProps } from '@/types/components/reusables.types';

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
      <div>
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className="p-2.5 rounded-xl bg-[#0B132B] text-white shadow-xs">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h1>
        </div>
        {description && (
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        )}
      </div>

      {action && <div className="flex items-center gap-3 shrink-0">{action}</div>}
    </div>
  );
}
