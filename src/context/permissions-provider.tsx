"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { defineAbilityFor } from '../lib/casl/ability';
import { AppAbility } from '@/types';
  
const PermissionsContext = createContext<AppAbility | undefined>(undefined);

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [ability, setAbility] = useState<AppAbility>(defineAbilityFor([]));

  useEffect(() => {
    const userPermissions: string | null = localStorage.getItem('user_permissions');    
    if (userPermissions) {
      try {
        const parsedPermissions = userPermissions ? JSON.parse(userPermissions) : [];
        const newAbility = defineAbilityFor(parsedPermissions);
        setAbility(newAbility);
      } catch {
      }
    }
  }, []);

  return (
    <PermissionsContext.Provider value={ability}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Custom hook to use the Permissions context
export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};
