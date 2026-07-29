'use client';

import React from 'react';
import { StatusBadgeProps } from '@/types/components/reusables.types';

export function StatusBadge({
  status,
  label,
  variant,
  className = '',
}: StatusBadgeProps) {
  const displayLabel = label || (typeof status === 'string' ? status : status ? 'Active' : 'Inactive');

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap leading-none bg-neutral-100 text-neutral-900 border border-neutral-300 ${className}`}
    >
      {displayLabel}
    </span>
  );
}
