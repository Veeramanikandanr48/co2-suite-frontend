'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OrgLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-5 bg-[#F8F9FA]">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-[#1454CC]/10 border border-[#1454CC]/20 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-[#1454CC]/40" />
        </div>
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-xs border border-[#E6E8EB]">
          <Loader2 className="w-4 h-4 text-[#1454CC] animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-base font-bold text-neutral-700">Loading Organization</p>
        <p className="text-xs text-neutral-400 mt-1">Please wait while we fetch the details…</p>
      </div>
    </div>
  );
}

export function OrgNotFoundState({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] gap-6 bg-[#F8F9FA]">
      <div className="w-20 h-20 rounded-2xl bg-[#F0F2F5] border-2 border-dashed border-[#D9E5F2] flex items-center justify-center">
        <Building2 className="w-10 h-10 text-neutral-300" />
      </div>
      <div className="text-center">
        <p className="text-lg font-bold text-neutral-800">Organization not found</p>
        <p className="text-xs text-neutral-400 mt-1.5 max-w-sm">
          This organization doesn&apos;t exist or may have been removed from the system.
        </p>
      </div>
      <Button
        onClick={() => router.push(isSuperAdmin ? '/organizations' : '/dashboard')}
        variant="outline"
        className="gap-2 h-10 text-xs font-semibold"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Button>
    </div>
  );
}
