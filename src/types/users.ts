interface LoginResponse {
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

interface UserResponse {
    id: string;
    name: string;
    email: string;
    roleName: string;
    roleId?: number;
    description: string;
}

interface RoleResponse {
    id: number;
    roleName: string;
    description: string;
}

export type {
    LoginResponse,
    UserResponse,
    RoleResponse
}
