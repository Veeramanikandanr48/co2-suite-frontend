"use client";

import React from "react";
import { usePermissions } from "@/context/permissions-provider";
import type { Actions } from "@/types";

interface PermissionGuardProps {
  readonly children: React.ReactNode;
  /** CASL action — e.g. 'read', 'create', 'update', 'delete' */
  readonly action: Actions;
  /** CASL subject — 'module:resource' format e.g. 'users:profile' */
  readonly subject: string;
  /**
   * Optional fallback rendered when the user lacks the required permission.
   * If not provided, renders nothing on access denial.
   */
  readonly fallback?: React.ReactNode;
}

/**
 * PermissionGuard — fine-grained guard that checks a single CASL permission.
 * Renders children only if the current ability allows the action on the subject.
 * Use for page-level access control (versus Can for inline UI elements).
 *
 * Usage:
 *   <PermissionGuard action="create" subject="users:profile">
 *     <CreateUserPage />
 *   </PermissionGuard>
 *
 *   <PermissionGuard action="read" subject="reports:invoice" fallback={<AccessDenied />}>
 *     <InvoiceReport />
 *   </PermissionGuard>
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  action,
  subject,
  fallback = null,
}) => {
  const ability = usePermissions();

  if (!ability.can(action, subject)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default PermissionGuard;
