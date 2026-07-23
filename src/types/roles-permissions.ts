export interface Role {
  roleId: number;
  roleKey: string;
  roleName: string;
  roleShortName?: string;
  description?: string;
  permissionsVersion?: number;
  tenantId?: number;
  createdAt?: string;
  updatedAt?: string;
  userCount?: number;
  permissionCount?: number;
}

export interface MasterModule {
  moduleId: number;
  moduleKey: string;
  moduleName: string;
  description?: string;
}

export interface Permission {
  permissionId?: number;
  id?: number;
  moduleId: number;
  moduleName?: string;
  moduleKey?: string;
  module?: {
    id?: number;
    moduleKey?: string;
    moduleName?: string;
    description?: string;
  };
  resource: string;
  action: string;
  scope?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRoleMapping {
  userRoleId?: number;
  userId: number;
  roleId: number;
  isPrimary?: boolean;
  user?: {
    userId: number;
    userName?: string;
    emailId?: string;
    firstName?: string;
    lastName?: string;
  };
  role?: Role;
}

export interface CreateRoleInput {
  roleKey: string;
  roleName: string;
  roleShortName?: string;
  description?: string;
}

export interface UpdateRoleInput {
  roleName?: string;
  roleShortName?: string;
  description?: string;
}

export interface AssignRoleInput {
  userId: number;
  roleId: number;
  isPrimary?: boolean;
}

export interface CreatePermissionInput {
  moduleId: number;
  resource: string;
  action: string;
  scope?: string;
  description?: string;
}

export interface UpdatePermissionInput {
  scope?: string;
  description?: string;
}

export interface AssignPermissionsInput {
  permissionIds: number[];
}

export interface CacheMetrics {
  hits: number;
  misses: number;
  invalidations: number;
  hitRate?: number | string;
}

export interface EffectivePermission {
  permissionId: number;
  module: string;
  resource: string;
  action: string;
  scope: string;
  description?: string;
}

export interface EffectivePermissionResponse {
  role: {
    roleId: number;
    roleKey: string;
    roleName: string;
  };
  permissions: EffectivePermission[];
}
