'use client';

import React from 'react';
import { NavTabButtonProps } from '@/types/components/reusables.types';

export function NavTabButton({
  isActive,
  onClick,
  icon: Icon,
  label,
  className = '',
}: NavTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
        isActive
          ? 'bg-foreground text-background shadow-xs'
          : 'bg-card text-muted-foreground border border-border hover:bg-accent'
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{label}</span>
    </button>
  );
}
