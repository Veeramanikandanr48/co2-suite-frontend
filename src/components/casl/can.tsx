"use client";

import React from "react";
import { usePermissions } from "@/context/permissions-provider";
import type { Actions } from "@/types";

interface CanProps {
  readonly children: React.ReactNode;
  /** CASL action — e.g. 'read', 'create', 'update', 'delete' */
  readonly I: Actions;
  /** CASL subject — 'module:resource' format e.g. 'users:profile' */
  readonly a: string;
  /** When true, renders children only if the user CANNOT perform the action */
  readonly not?: boolean;
  /**
   * Optional content to render when the check fails.
   * Useful for disabled states or tooltip wrappers.
   */
  readonly fallback?: React.ReactNode;
}

/**
 * Can — inline CASL ability check component for UI-level gating.
 * Follows CASL's idiomatic API: <Can I="create" a="users:profile">
 *
 * Use for individual UI elements (buttons, links, menu items).
 * For page-level access control, prefer PermissionGuard.
 *
 * Examples:
 *
 *   // Show button only if user can create users
 *   <Can I="create" a="users:profile">
 *     <Button>New User</Button>
 *   </Can>
 *
 *   // Show element only if user CANNOT delete roles
 *   <Can not I="delete" a="roles:roles">
 *     <Tooltip>Read-only access</Tooltip>
 *   </Can>
 *
 *   // With fallback for disabled state
 *   <Can I="update" a="reports:invoice" fallback={<Button disabled>Edit</Button>}>
 *     <Button>Edit</Button>
 *   </Can>
 */
const Can: React.FC<CanProps> = ({ children, I: action, a: subject, not = false, fallback = null }) => {
  const ability = usePermissions();

  const allowed = ability.can(action, subject);
  const shouldRender = not ? !allowed : allowed;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;
