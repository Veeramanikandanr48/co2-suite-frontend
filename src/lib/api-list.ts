export enum API_LIST {
    SIGNIN = 'v1/registration/signin',
    SIGNOUT = 'v1/registration/signout',
    LOGIN = '/auth/login',
    LOGOUT = '/auth/logout',
    REGISTER = '/auth/register',

    // Device Integration APIs
    GET_ALL_ROOMS = 'v1/deviceIntegration/getAllRooms',
    GET_ROOM_DETAILS_BY_ROOM_ID = 'v1/deviceIntegration/getRoomDetailsByRoomId',

    CREATE_ROOM = 'v1/deviceIntegration/createRoom',
    UPDATE_ROOM = 'v1/deviceIntegration/updateRoom',
    DELETE_ROOM = 'v1/deviceIntegration/deleteRoom',

    GET_BLACKBOX = 'v1/deviceIntegration/getBlackbox',
    CREATE_BLACKBOX = 'v1/deviceIntegration/createBlackbox',
    UPDATE_BLACKBOX = 'v1/deviceIntegration/updateBlackbox',

    GET_ULTRASOUND = 'v1/deviceIntegration/getUltrasound',
    CREATE_ULTRASOUND = 'v1/deviceIntegration/createUltrasound',
    UPDATE_ULTRASOUND = 'v1/deviceIntegration/updateUltrasound',
    
    GET_PACS_CONFIGURATION = 'v1/deviceIntegration/getPacsConfiguration',
    CREATE_PACS_CONFIGURATION = 'v1/deviceIntegration/createPacsConfiguration',
    UPDATE_PACS_CONFIGURATION = 'v1/deviceIntegration/updatePacsConfiguration',
    DELETE_PACS_CONFIGURATION = 'v1/deviceIntegration/deletePacsConfiguration',

    VERIFY_PACS_CONFIGURATION = 'v1/deviceIntegration/verifyPacs',
    VERIFY_BLACKBOX_CONFIGURATION = 'v1/deviceIntegration/verifyBlackbox',
    VERIFY_ULTRASOUND_CONFIGURATION = 'v1/deviceIntegration/verifyUltrasound',

    // Users APIs
    REGISTER_USER = 'v1/rolePermissions/registerUser',
    GET_ALL_USERS = 'v1/rolePermissions/getAllUsers',
    GET_USER_DETAILS = 'v1/rolePermissions/getUserDetails',
    GET_ROLES_WITH_PERMISSIONS = 'v1/rolePermissions/getRolewithPermissions',
    UPDATE_USER_DETAILS = 'v1/rolePermissions/updateUserDetails',
    DELETE_USER = 'v1/rolePermissions/deleteUser',


    //Roles APIs
    CREATE_ROLE = 'v1/rolePermissions/createRole',
    GET_ALL_ROLES = 'v1/rolePermissions/getAllRoles',
    DELETE_ROLE = 'v1/rolePermissions/deleteRole',
    UPDATE_ROLE = 'v1/rolePermissions/updateRole',
    UPDATE_USER_ROLE = 'v1/rolePermissions/updateuserRoleinUser',
    GET_ROLES = 'v1/rolePermissions/getRoles',
    UPDATE_USER_ROLE_BY_ID = 'v1/rolePermissions/updateUserRole',
    GET_ROLE_FILTER = 'v1/master/getAllRoles',
    

    // Site Resources APIs
    GET_ALL_SITE_RESOURCES = 'v1/siteResources/getAllResources',
    UPLOAD_SITE_RESOURCE = 'v1/siteResources/uploadResourceFile',
    DELETE_SITE_RESOURCE = 'v1/siteResources/deleteResource',
    GET_SITE_RESOURCE_FILE='v1/siteResources/getFileBuffer',

    // Workflow Customization APIs
    GET_ALL_WORKFLOWS = 'v1/workflowCustomization/getAllProtocol',
    GET_WORKFLOW_MASTER_DATA = 'v1/workflowCustomization/getProtocolMasters',
    GET_WORKFLOW_BY_ID = 'v1/workflowCustomization/getProtocolById',
    CREATE_WORKFLOW = 'v1/workflowCustomization/createProtocol',
    UPDATE_WORKFLOW = 'v1/workflowCustomization/updateProtocol',

    // keycloak APIs
    LOGIN_KEYCLOAK = 'v1/auth/login',   
    // Master APIs
    GET_ALL_PERMISSIONS = 'v1/master/getAllPermissions',
};
