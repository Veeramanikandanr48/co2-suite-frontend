export enum API_LIST {
  // Auth
  LOGIN               = '/registration/login',
  LOGOUT              = '/registration/logout',
  REGISTER            = '/registration/register',
  REFRESH_TOKEN       = '/registration/refresh',
  GET_ME              = '/registration/me',

  // Roles
  GET_ROLES           = '/roles',
  CREATE_ROLE         = '/roles',
  ASSIGN_ROLE         = '/roles/assign',
  SWITCH_ROLE         = '/roles/switch',

  // Permissions
  GET_PERMISSIONS     = '/permissions',
  GET_MY_PERMISSIONS  = '/permissions/me',

  // Users (legacy)
  GET_ALL_USERS       = '/users',
}
