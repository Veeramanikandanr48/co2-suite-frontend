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
