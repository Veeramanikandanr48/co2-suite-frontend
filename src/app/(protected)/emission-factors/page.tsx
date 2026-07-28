'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/enums/base-enum';
import { EmissionFactorsView } from '@/components/emission-factors/emission-factors-view';
import { ShieldAlert } from 'lucide-react';

export default function EmissionFactorsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.roleId !== MasterRole.SUPER_ADMIN) {
      router.replace('/services');
    }
  }, [user, router]);

  if (user && user.roleId !== MasterRole.SUPER_ADMIN) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center p-6">
        <div className="p-4 bg-rose-50 text-rose-600 rounded-full">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-extrabold text-neutral-800">Access Denied</h2>
        <p className="text-xs text-neutral-500 max-w-sm">
          Only Super Admin users are authorized to view and manage global emission factors.
        </p>
      </div>
    );
  }

  return <EmissionFactorsView />;
}
