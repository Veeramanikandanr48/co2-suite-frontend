'use client';

import React from 'react';
import { ServiceProvider, useServiceContext } from '@/features/services/components/shared/service-context';
import { ServiceSidebar } from '@/features/services/components/shared/service-sidebar';

function ServiceDetailLayoutInner({ children }: { children: React.ReactNode }) {
  const { currentConfig, loadingScopes, groupedScopes, openScopes, toggleScope } = useServiceContext();

  return (
    <div className="w-full flex-1 h-full min-h-0 flex bg-background font-sans text-foreground overflow-hidden rounded-none">
      <ServiceSidebar
        currentConfig={currentConfig}
        loadingScopes={loadingScopes}
        groupedScopes={groupedScopes}
        openScopes={openScopes}
        toggleScope={toggleScope}
      />
      <div className="flex-1 flex flex-col min-w-0 h-full min-h-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto scrollbar-custom p-5 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function ServiceDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <ServiceProvider>
      <ServiceDetailLayoutInner>{children}</ServiceDetailLayoutInner>
    </ServiceProvider>
  );
}
