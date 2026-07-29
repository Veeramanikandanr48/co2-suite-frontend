'use client';

import React from 'react';
import { FormSelectFieldProps } from '@/types/components/reusables.types';

export function FormSelectField({
  label,
  value,
  onChange,
  options,
  disabled = false,
  className = '',
}: FormSelectFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold bg-white disabled:bg-neutral-50 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
