import { FieldErrors, Control } from "react-hook-form";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    userId: string;
    email: string;
    roleId: string;
    roleName: string;
    profilePath?: string | { type: 'Buffer', data: number[] };
}

export interface UserResponse {
    listData: User[];
    dataCount: number;
}

export interface UserQueryParams {
    searchInput?: string;
    offSet?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: number;
    additionalFilter?: Record<string, string | number | boolean | (string | number)[]>;
}

export interface UserFormData {
    firstName: string;
    lastName: string;
    userId: string;
    email: string;
    password: string;
    confirmPassword: string;
    roleId: number;
    profilePath?: string | { type: 'Buffer', data: number[] };
    profilePicture?: File | string;
} 

export interface LoginFormData {
    username: string;
    password: string;
}

export interface UserDetailsResponse {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        userId: string;
        roleId: number;
    profilePath?: string | { type: 'Buffer', data: number[] };
}

export interface EditUserProps {
    params: Promise<{
        id: string;
    }>;
}

export interface Permission {
    modeId: number;
    permissionId: number;
    permissionName: string;
    abbrevation: string;
    styles: {
        color: string;
    };
}

export interface Mode {
    id: number;
    name: string;
    permissions: Array<{
        modeId: number;
        permissionId: number;
        permissionName: string;
        abbrevation: string;
        styles: {
            color: string;
        };
    }>;
}

export interface FormFieldProps {
    label: string;
    name: keyof UserFormData;
    type?: string;
    control: Control<UserFormData>;
    errors: FieldErrors<UserFormData>;
    formState: {
        touchedFields: Record<string, boolean>;
        dirtyFields: Record<string, boolean>;
        isValid: boolean;
    };
    disabled?: boolean;
}

export interface Role {
    id: number;
    rolename: string;
    description: string;
    permissions: Permission[];
}

export interface RolesResponse {
    message: string;
    data: Role[];
    success: boolean;
}

export interface PermissionsResponse {
    message: string;
    data: {
        [key: string]: Permission[];
    };
    success: boolean;
}

export interface PermissionBadgeProps {
    permission: {
        id: number;
        code: string;
        color: string;
        textColor?: string;
    };
    isDisabled?: boolean;
}

export type RoleResponse = Array<{
    id: number;
    rolename: string;
    description: string;
}>

export interface LoginResponse {
    id: number;
    userName: string;
    firstName: string;
    lastName: string | null;
    prefix: string | null;
    email: string;
    userId: string;
    idpId: string;
    profilePath: string;
    token: string;
    roleId: number;
}
