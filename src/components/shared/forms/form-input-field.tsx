'use client';

import React from 'react';
import { FormInputFieldProps } from '@/types/components/reusables.types';

export function FormInputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
  className = '',
}: FormInputFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-foreground text-foreground font-semibold disabled:bg-muted bg-card"
      />
    </div>
  );
}
