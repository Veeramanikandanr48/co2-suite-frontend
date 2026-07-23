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
  UPDATE_ROLE         = '/roles',
  DELETE_ROLE         = '/roles',
  ASSIGN_ROLE         = '/roles/assign',
  SWITCH_ROLE         = '/roles/switch',
  GET_ROLE_PERMISSIONS = '/roles',
  GET_USER_ROLES      = '/roles/users',

  // Permissions
  GET_PERMISSIONS     = '/permissions',
  CREATE_PERMISSION   = '/permissions',
  UPDATE_PERMISSION   = '/permissions',
  DELETE_PERMISSION   = '/permissions',
  ASSIGN_PERMISSIONS_TO_ROLE = '/permissions/role',
  GET_MY_PERMISSIONS  = '/permissions/me',
  EFFECTIVE_PERMISSIONS = '/permissions/effective',
  CACHE_METRICS       = '/permissions/cache/metrics',
  CHECK_PERMISSION    = '/permissions/check',

  // Users
  GET_ALL_USERS       = '/registration/users',
}
