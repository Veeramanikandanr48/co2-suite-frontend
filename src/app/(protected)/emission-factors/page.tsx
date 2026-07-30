'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-provider';
import { MasterRole } from '@/types/enums';
import { EmissionFactorsView } from '@/features/emission-factors/components/emission-factors-view';
import { ShieldAlert } from 'lucide-react';
import { PageHeader } from '@/components/shared';

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
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-container min-h-[60vh] flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <div className="p-4 bg-destructive/10 text-destructive rounded-full">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-extrabold text-foreground">Access Denied</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            Only Super Admin users are authorized to view and manage global emission factors.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <EmissionFactorsView />
    </motion.div>
  );
}
