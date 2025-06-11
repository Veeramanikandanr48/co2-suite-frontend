enum HttpStatus {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503,
    CONNECTION_REFUSED = 504,
}

enum EAdditionalFieldError {
    ADDITIONALCONTEXT = 'AdditionalFieldError'
}

enum FontSize {
    SMALL = 14,
    MEDIUM = 16,
    LARGE = 18
}

enum UploadType {
    PROFILE_PICTURE = 'profilePicture',
    ATTACHMENT = 'attachment'
}


enum ToastType {
    LIMIT = 1,
    DURATION = 4000,
}

enum ESelectedStatus {
    SELECTED = 1,
    UNSELECTED = 0,
    INTERMEDIATE = 2,
}

export {
    HttpStatus,
    EAdditionalFieldError,
    FontSize,
    UploadType,
    ToastType,
    ESelectedStatus,
};
