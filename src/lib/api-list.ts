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

  // Users Management
  GET_ALL_USERS       = '/users',
  CREATE_USER         = '/users',
  UPDATE_USER         = '/users',
  DELETE_USER         = '/users',
  TOGGLE_USER_STATUS  = '/users',
  RESET_USER_PASSWORD = '/users',
  GET_SELF_2FA        = '/users/me/2fa',
  TOGGLE_SELF_2FA     = '/users/me/2fa/toggle',
  VERIFY_SELF_2FA     = '/users/me/2fa/verify',
  DISABLE_SELF_2FA    = '/users/me/2fa/disable',
  VALIDATE_MFA        = '/registration/mfa/validate',

  // Sidebar Navigation Framework
  GET_MY_SIDEBAR_MENU = '/sidebar/my-menu',
  GET_SIDEBAR_VERSION = '/sidebar/version',
  GET_SIDEBAR_ITEMS   = '/sidebar',
  CREATE_SIDEBAR_ITEM = '/sidebar',
  UPDATE_SIDEBAR_ITEM = '/sidebar',
  DELETE_SIDEBAR_ITEM = '/sidebar',
  REORDER_SIDEBAR     = '/sidebar/reorder',
  PREVIEW_SIDEBAR     = '/sidebar/preview',
}


