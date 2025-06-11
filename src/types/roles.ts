export interface RolePermission {
    id: number;
    code: string;
    color: {
        color: string;
    };
}

export interface Mode {
    id: number;
    name: string;
    permissions: RolePermission[];
}

export interface TableRole {
    id: string;
    name: string;
    description: string;
    modes: Mode[];
}

export interface Permission {
    id: number;
    permissionName: string;
    description: string;
    abbrevation: string;
    styles: {
        color: string;
    };
    modeId: number;
}

export interface PermissionSection {
    modeName: string;
    modePermissions: Array<{
        id: number;
        abbrevation: string;
        permissionName: string;
        description: string;
        styles: {
            color: string;
        };
    }>;
}

export interface PermissionsResponse {
    [key: string]: Permission[];
}

export interface ApiResponse<T> {
    message: string;
    data: T;
    success: boolean;
}

export interface UpdateRolePayload {
    roleName: string;
    description?: string;
    permissionIds: number[];
}

export interface RoleResponse {
    id: number;
    rolename: string;
    description: string;
    permissionids: number[];
}

export interface RoleData {
    id: number;
    roleName: string;
    description: string;
    permissions: number[];
}

export interface RoleFormData {
    roleName: string;
    description?: string;
    permissions: number[];
    contextRoleName?: string;
}

