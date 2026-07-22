interface LoginResponse {
  isTwoFactorAuthenticationEnabled: boolean;
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
  roles: RoleInfo[];
  permissions: PermissionEntry[];
}

interface UserProfile {
  id: number;
  userName: string;
  email: string;
  roleKey: string;
  roleName: string;
  roleIds: number[];
  currentRoleId: number;
}

interface RoleInfo {
  roleId: number;
  roleKey: string;
  roleName: string;
  isPrimary: boolean;
}

interface PermissionEntry {
  action: string;
  subject: string;
  conditions?: Record<string, unknown>;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  roleName: string;
  roleKey?: string;
  roleId?: number;
  description: string;
}

interface RoleResponse {
  id: number;
  roleKey: string;
  roleName: string;
  description: string;
}

export type {
  LoginResponse,
  UserProfile,
  UserResponse,
  RoleResponse,
  RoleInfo,
  PermissionEntry,
};
