'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { useServiceContext } from '@/features/services/components/shared/service-context';
import { Scope1CalculationView } from '@/features/services/components/scope1/scope1-calculation-view';
import { Scope2CalculationView } from '@/features/services/components/scope2/scope2-calculation-view';
import { Scope3CalculationView } from '@/features/services/components/scope3/scope3-calculation-view';

export default function ScopeItemPage() {
  const params = useParams();
  const scopeName = decodeURIComponent(params.name as string);
  const { scopeItems } = useServiceContext();

  const scopeItem = scopeItems.find((item) => item.name === scopeName);

  if (!scopeItem) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-sm font-semibold text-muted-foreground">Scope item not found</p>
        <p className="text-xs text-muted-foreground/60">{scopeName}</p>
      </div>
    );
  }

  const scope = scopeItem.scope;

  if (scope === 'Scope 1') {
    return <Scope1CalculationView category={scopeName as any} />;
  }

  if (scope === 'Scope 2') {
    const isHeat = scopeName === 'Purchased Heating & Steam' || scopeName === 'Purchased Heating & Cooling';
    return <Scope2CalculationView type={isHeat ? 'heat' : 'electricity'} category={scopeName} />;
  }

  if (scope === 'Scope 3') {
    return <Scope3CalculationView category={scopeName} />;
  }

  return notFound();
}
