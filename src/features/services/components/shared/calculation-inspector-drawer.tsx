import React from 'react';
import { ShieldCheck, CheckCircle2, FileText, Cpu, Hash, Lock, Calculator, ArrowRight, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface CalculationInspectorData {
  snapshotId: string;
  calculatedAt: string;
  facilityName: string;
  activityName: string;
  fuelName: string;
  unit: string;
  amount: number;
  factorSource: string;
  factorVersion: string;
  formulaName: string;
  gwpVersion: string;
  country: string;
  region: string;
  priorityText: string;
  factorRate: number;
  totalCO2e: number;
  gasBreakdown: {
    co2: number;
    ch4: number;
    n2o: number;
    sf6?: number;
  };
  checksum: string;
  policyRevisionId: string;
  formulaRevisionId: string;
}

interface CalculationInspectorDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CalculationInspectorData | null;
}

export function CalculationInspectorDrawer({ open, onOpenChange, data }: CalculationInspectorDrawerProps) {
  if (!data) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full p-0 flex flex-col bg-background border-l border-border">
        {/* Header */}
        <SheetHeader className="p-5 border-b border-border bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">Calculation Inspector</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-0.5">
                  Complete ISO 14064 Audit Trace & Formula Provenance
                </SheetDescription>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-positive-700 bg-positive-50 dark:bg-positive-950/40 border border-positive-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Verified Snapshot
            </span>
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Emission Summary Card */}
          <div className="bg-card border border-primary/20 rounded-2xl p-4 shadow-xs">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Calculated Emissions
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-extrabold text-primary tabular-nums">
                {data.totalCO2e.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                <span className="text-sm font-semibold text-muted-foreground ml-1.5">kgCO₂e</span>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                {(data.totalCO2e / 1000).toFixed(4)} tCO₂e
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Activity: <strong className="text-foreground font-semibold">{data.amount} {data.unit}</strong> {data.fuelName}</span>
              <span>Facility: <strong className="text-foreground font-semibold">{data.facilityName}</strong></span>
            </div>
          </div>

          {/* Traceability Flow Steps */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-primary" /> Resolution & Calculation Pipeline
            </h4>

            <div className="space-y-2 text-xs">
              {/* Step 1: Input */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">1. Input Activity</span>
                  <span className="font-semibold text-foreground">{data.amount} {data.unit} of {data.fuelName}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {/* Step 2: Policy */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">2. Resolved Factor Policy</span>
                  <span className="font-semibold text-foreground">{data.factorSource} ({data.factorVersion}) • {data.priorityText}</span>
                  <span className="text-[10px] text-muted-foreground block">{data.country} / {data.region}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {/* Step 3: Formula & Rate */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">3. Formula & Unit Rate</span>
                  <span className="font-semibold text-foreground">{data.formulaName} • Rate: {data.factorRate} kgCO₂e/{data.unit}</span>
                  <span className="text-[10px] text-muted-foreground block">GWP Standard: {data.gwpVersion}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
              </div>

              {/* Step 4: Mathematical Execution */}
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase block">4. Evaluated Calculation</span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    {data.amount} × {data.factorRate} = {data.totalCO2e.toFixed(4)} kgCO₂e
                  </span>
                </div>
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>

          {/* Greenhouse Gas Species Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">
              Greenhouse Gas Species Breakdown ({data.gwpVersion})
            </h4>

            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block">CO₂ (Carbon Dioxide)</span>
                <span className="font-bold text-foreground tabular-nums">{data.gasBreakdown.co2.toFixed(3)} kg</span>
                <span className="text-[9px] text-muted-foreground block">GWP: 1.0</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block">CH₄ (Methane)</span>
                <span className="font-bold text-foreground tabular-nums">{data.gasBreakdown.ch4.toFixed(4)} kg</span>
                <span className="text-[9px] text-muted-foreground block">GWP: 27.2</span>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 border border-border">
                <span className="text-[10px] font-bold text-muted-foreground block">N₂O (Nitrous Oxide)</span>
                <span className="font-bold text-foreground tabular-nums">{data.gasBreakdown.n2o.toFixed(4)} kg</span>
                <span className="text-[9px] text-muted-foreground block">GWP: 273.0</span>
              </div>
            </div>
          </div>

          {/* Audit Lock & Legal Checksum */}
          <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-bold border-b border-border pb-2">
              <Lock className="w-4 h-4 text-emerald-600" /> Immutable Snapshot Audit Lock
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-muted-foreground block">Snapshot ID:</span>
                <span className="font-mono font-semibold text-foreground">{data.snapshotId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Calculated At:</span>
                <span className="font-semibold text-foreground">{data.calculatedAt}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Policy Revision ID:</span>
                <span className="font-mono text-foreground">{data.policyRevisionId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Formula Revision ID:</span>
                <span className="font-mono text-foreground">{data.formulaRevisionId}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block flex items-center gap-1">
                <Hash className="w-3 h-3 text-primary" /> ISO 14064 Legal Checksum (SHA-256):
              </span>
              <span className="font-mono text-[10px] text-primary break-all bg-background p-2 rounded-lg border border-border block mt-1">
                {data.checksum}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
