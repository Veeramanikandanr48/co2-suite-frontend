import React from 'react';
import { ShieldCheck, Info, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalculationContextPreview {
  factorSource: string;
  factorVersion: string;
  formula: string;
  gwpVersion: string;
  country?: string;
  region?: string;
  priorityText: string;
  factorRate: number;
  unit: string;
  calculatedCO2e?: number;
  isCustomFactor?: boolean;
}

interface AppliedCalculationContextCardProps {
  context: CalculationContextPreview | null;
  loading?: boolean;
  className?: string;
}

export function AppliedCalculationContextCard({ context, loading, className }: AppliedCalculationContextCardProps) {
  if (loading) {
    return (
      <div className={cn('bg-muted/40 border border-border rounded-xl p-4 animate-pulse space-y-2', className)}>
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-8 bg-muted rounded w-full mt-2" />
      </div>
    );
  }

  if (!context) {
    return (
      <div className={cn('bg-muted/30 border border-dashed border-border rounded-xl p-4 text-center', className)}>
        <Info className="w-5 h-5 mx-auto text-muted-foreground/60 mb-1" />
        <p className="text-xs font-semibold text-foreground">Derived Calculation Context</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Select Facility, Fuel, and Unit to auto-resolve factor source, GWP, and calculation formula from policy.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-primary/20 rounded-xl p-4 shadow-xs relative overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground leading-none">Applied Calculation Context</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">Auto-resolved from Tenant Policy & Facility Master</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-positive-700 bg-positive-50 dark:bg-positive-950/30 px-2 py-0.5 rounded-full border border-positive-200">
          <CheckCircle2 className="w-2.5 h-2.5" />
          {context.priorityText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Factor Source</span>
          <span className="font-semibold text-foreground">{context.factorSource}</span>
          <span className="text-[10px] text-muted-foreground block">{context.factorVersion}</span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Geography</span>
          <span className="font-semibold text-foreground">{context.country || 'Global'}</span>
          <span className="text-[10px] text-muted-foreground block truncate">{context.region || 'Default'}</span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Formula & GWP</span>
          <span className="font-semibold text-foreground truncate block">{context.formula}</span>
          <span className="text-[10px] text-muted-foreground block">GWP: {context.gwpVersion}</span>
        </div>

        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">Unit Rate</span>
          <span className="font-bold text-primary tabular-nums">
            {context.factorRate.toFixed(6)}
          </span>
          <span className="text-[10px] text-muted-foreground block">kgCO₂e / {context.unit}</span>
        </div>
      </div>

      {context.calculatedCO2e !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Preview Total Emissions:
          </span>
          <span className="text-sm font-extrabold text-foreground tabular-nums">
            {context.calculatedCO2e.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} kgCO₂e
          </span>
        </div>
      )}
    </div>
  );
}
