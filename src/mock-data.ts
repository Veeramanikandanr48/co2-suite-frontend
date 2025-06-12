import { CustomAxiosResponse } from "./types"
import { RoleResponse, UserResponse } from "./types/users"

const UserList: Partial<CustomAxiosResponse<UserResponse[]>> = {
    success: true,
    message: "success",
    data: [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            description: 'Senior Developer',
            roleName: 'Admin',
            roleId: 1
        },
        {
            id: '2',
            name: 'David',
            email: 'david@example.com',
            description: 'Junior Developer',
            roleName: 'User',
            roleId: 2
        }
    ],
}

const RoleList: Partial<CustomAxiosResponse<RoleResponse[]>> = {
    success: true,
    message: 'success',
    data: [
        {
            id: 1,
            roleName: 'Admin',
            description: 'Administrator role with full access'
        },
        {
            id: 2,
            roleName: 'User',
            description: 'Regular user with limited access'
        }
    ]
};

export {
    UserList,
    RoleList
}