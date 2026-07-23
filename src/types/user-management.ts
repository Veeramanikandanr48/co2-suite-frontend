export interface UserRoleInfo {
  roleId: number;
  roleKey: string;
  roleName: string;
  isPrimary?: boolean;
}

export interface UserListItem {
  userId: number;
  userName?: string;
  emailId: string;
  isActive: boolean;
  isVerified: boolean;
  isTwoFactorAuthenticationEnabled?: boolean;
  createdOn?: string;
  updatedOn?: string;
  roles: UserRoleInfo[];
  primaryRole?: UserRoleInfo | null;
}

export interface UserListResponse {
  items: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateUserPayload {
  userName: string;
  email: string;
  password: string;
  roleId?: number;
  additionalRoleIds?: number[];
  isActive?: boolean;
  isVerified?: boolean;
  isTwoFactorAuthenticationEnabled?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface UpdateUserPayload {
  userName?: string;
  email?: string;
  isActive?: boolean;
  isVerified?: boolean;
  isTwoFactorAuthenticationEnabled?: boolean;
  roleIds?: number[];
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "active" | "inactive" | "all";
}
