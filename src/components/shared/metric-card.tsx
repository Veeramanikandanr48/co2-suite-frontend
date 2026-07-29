'use client';

import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  className?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  className = '',
}: MetricCardProps) {
  return (
    <div className={`bg-white p-3.5 rounded-xl border border-neutral-200 shadow-xs flex items-center gap-3 ${className}`}>
      {Icon && (
        <div className="p-2.5 bg-[#0B132B] text-white rounded-lg shrink-0">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="min-w-0">
        <div className="text-xl font-bold text-neutral-900 truncate">{value}</div>
        <div className="text-[11px] font-semibold text-neutral-500 truncate">{title}</div>
        {subtitle && <div className="text-[10px] text-neutral-400 truncate">{subtitle}</div>}
      </div>
    </div>
  );
}
