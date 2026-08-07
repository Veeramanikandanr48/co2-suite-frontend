'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, ArrowLeft, Leaf } from 'lucide-react';
import Link from 'next/link';
import { ServiceProvider, useServiceContext } from '@/features/services/components/shared/service-context';
import { ServiceSidebar } from '@/features/services/components/shared/service-sidebar';

/** Only Carbon is currently live. All other service routes show "Coming Soon". */
const ACTIVE_SERVICE_CODES = new Set(['carbon']);

function ComingSoonScreen({ code }: { readonly code: string }) {
  return (
    <div className="w-full flex-1 h-full min-h-0 flex items-center justify-center bg-background overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 max-w-sm text-center px-6"
      >
        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Clock className="w-9 h-9 text-amber-500" />
          </div>
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white uppercase tracking-wide">
            !
          </span>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3" />
            Coming Soon
          </div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {code.toUpperCase()} Module
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This service module is currently under development and will be available in a future release.
            Stay tuned for updates!
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border" />

        {/* Currently available callout */}
        <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Carbon is Available Now</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full Carbon footprint tracking and emission management is live.
            </p>
          </div>
        </div>

        {/* Back link */}
        <Link
          href="/services/carbon"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Carbon
        </Link>

        <Link
          href="/services"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Back to Services
        </Link>
      </motion.div>
    </div>
  );
}

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
  const params = useParams();
  const code = ((params.code as string) || '').toLowerCase();

  if (!ACTIVE_SERVICE_CODES.has(code)) {
    return <ComingSoonScreen code={code} />;
  }

  return (
    <ServiceProvider>
      <ServiceDetailLayoutInner>{children}</ServiceDetailLayoutInner>
    </ServiceProvider>
  );
}
