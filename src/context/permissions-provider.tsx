"use client";

import React, { createContext, useContext, useMemo } from "react";
import { defineAbilityFor } from "@/lib/casl/ability";
import { AppAbility } from "@/types";
import { useAuth } from "@/context/auth-provider";

const PermissionsContext = createContext<AppAbility | undefined>(undefined);

/**
 * PermissionsProvider — builds the CASL ability from the in-memory permissions
 * stored in AuthContext. No localStorage reads; always in sync with auth state.
 *
 * Wraps the entire protected tree so any component can call usePermissions().
 */
export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const { permissions } = useAuth();

  // Rebuild ability whenever permissions change (e.g. role switch)
  const ability = useMemo(() => defineAbilityFor(permissions), [permissions]);

  return (
    <PermissionsContext.Provider value={ability}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = (): AppAbility => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
};
