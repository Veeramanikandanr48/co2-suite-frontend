enum ESelectedStatus {
    UNSELECTED = 0,
    INTERMEDIATE = 1,
    SELECTED = 2
}

enum EFieldStatus {
    NONE = 0,
    NEW = 1,
    EDIT = 2,
    DELETE = 3
}

enum EWorkflowStatus {
    NEW = 1,
    EDIT = 2,
    DUPLICATE = 3,
}

export {
    ESelectedStatus,
    EFieldStatus,
    EWorkflowStatus
}