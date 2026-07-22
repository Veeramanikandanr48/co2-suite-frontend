"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";

interface RoleGuardProps {
  readonly children: React.ReactNode;
  /** One or more roleKey strings that are allowed to access the route */
  readonly roles: string[];
  /** Redirect target when access is denied (default: /403) */
  readonly redirectTo?: string;
}

/**
 * RoleGuard — coarse-grained guard based on the user's current roleKey.
 * Must be nested inside AuthGuard (requires auth to be resolved first).
 *
 * Usage:
 *   <AuthGuard>
 *     <RoleGuard roles={['SUPER_ADMIN', 'ADMIN']}>
 *       <UserManagement />
 *     </RoleGuard>
 *   </AuthGuard>
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  roles,
  redirectTo = "/403",
}) => {
  const { user } = useAuth();
  const router = useRouter();

  const hasRole = user?.roleKey ? roles.includes(user.roleKey) : false;

  useEffect(() => {
    if (user && !hasRole) {
      router.push(redirectTo);
    }
  }, [user, hasRole, router, redirectTo]);

  if (!user || !hasRole) return null;

  return <>{children}</>;
};

export default RoleGuard;
