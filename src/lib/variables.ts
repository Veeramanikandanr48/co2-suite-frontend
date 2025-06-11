import { DefaultValues, UploadType } from "~/enums/base-enum";

/**
 * Form date options
 */
const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
};

const SHORT_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
};

/**
 * Form defaults
 */
const FORM_DEFAULT_VALUES = {
    paymentInformation: {
        profilePicture: undefined,
        attachments: [],
    },
    pacsConfiguration: {
        ipAddress: "",
        port: "",
        aeTitle: "",
    },
    roomConfiguration: {
        name: "",
        description: "",
        ipAddress: "",
        port: "",
        aeTitle: "",
    },
    userForm: {
        firstName: "",
        lastName: "",
        userId: "",
        email: "",
        password: "",
        confirmPassword: "",
        roleId: DefaultValues.USER_ROLE_ID,
        profilePicture: undefined,
    },
    roomName: {
        name: "",
        contextRoomValue: [],
    },
    usgConfiguration: {
        usgName: "",
        usgDescription: "",
        usgIp: "",
        usgPort: "",
        usgAeTitle: "",
        roomId: 0,
        usgId: 0,
    },
    blackboxConfiguration: {
        blackboxName: "",
        blackboxDescription: "",
        blackboxIp: "",
        blackboxPort: "",
        blackboxAeTitle: "",
        roomId: 0,
        blackboxId: 0,
    },
    loginForm: {
        username: "",
        password: "",
    },
    roleForm: {
        roleName: "",
        description: "",
        permissions: {},
    },
    workflowConfiguration: {
        name: "",
        description: "",
        contextWorkFlowValue: [],
    },
}


const REGEX = {
    stringOnly: /^[a-zA-Z ]+$/,
    numberOnly: /^[0-9.]+$/,
    noOfShareOnly: /^[^0][0-9]*$/,
    alphaNumeric: /^[a-zA-Z0-9 ]+$/,
    alphaNumericWithCommaHiphen: /^[a-zA-Z0-9 ,\-]+$/,
    alphaNumericWithSpecialChar: /^[A-Za-z0-9 _\.\-@:+/'%]+$/,
    exceptional: /^[^<>]*$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/,
    panNumber: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    decimal: /^\d+\.\d{3}$/,
    weight: /^[0-9]\.[0-9]{1}[0]{2}$/,
    aadhar: /^[2-9]\d{11}$/,
    maxDay: /^(1|10)$/,
    mobileNumber: /^[6-9]\d{9}$/,
    Landline: /^\d{3,5}-\d{6,7}$/,
    numberWithoutPeriod: /^[0-9]+$/,
    ifscCode: /^[A-Z]{4}[0]{1}[A-Z0-9]{6}$/,
    capitalizedAlphaNumeric: /^[A-Z0-9 ]$/,
    withOutZero: /^[1-9][0-9]*(?:[ ,\\-][0-9]+)*$/,
    pinCode: /^[0-9]+$/,
    numbers: /^[0-9]+$/,
    alphaNumericWithAllSpecialChar: /^[a-zA-Z0-9 _.\-(){}&@#+'~!]+$/,
    alphanumericWithUnderscoreSpace: /^(?!\s*$)[a-zA-Z0-9_\s]+$/,
    alphanumericWithHyphenUnderscore: /^(?=[a-zA-Z0-9 _-]*[a-zA-Z])[a-zA-Z0-9 _-]+$/
}

/**
 * ? DEV Only
 * Form auto fill values for testing
 */
const FORM_FILL_VALUES = {
    paymentInformation: {
        bankName: "Bank of America",
        accountName: "John Doe",
        email: "john.doe@example.com",
        additionalNotes: "This is a test note",
        profilePicture: "https://via.placeholder.com/150",
        customInputs: [
            { key: "customInput1", value: "Custom Input 1" },
            { key: "customInput2", value: "Custom Input 2" },
        ],
        date: "2021-01-01",
    },
    pacsConfiguration: {
        ipAddress: "192.168.1.1",
        port: 104,
        aeTitle: "PACS",
    },
    userForm: {
        firstName: "John",
        lastName: "Doe",
        userId: "johndoe",
        email: "john@gmail.com",
        password: "password123",
        confirmPassword: "password123",
        roleId: 1,
        profilePicture: undefined,
    },
    roomName: {
        name: "Room 1",
        contextRoomValue: [],
    },
    usg: {
        usgName: "USG 1",
        usgDescription: "USG 1 description",
        usgIp: "192.168.1.1",
        usgPort: 104,
        usgAeTitle: "USG1AE",
        roomId: "1",
        usgId: "1",
    },
    blackbox: {
        blackboxName: "Blackbox 1",
        blackboxDescription: "Blackbox 1 description",
        blackboxIp: "192.168.1.1",
        blackboxPort: 104,
        blackboxAeTitle: "BBX1AE",
        roomId: "1",
        blackboxId: "1",
    },
    userLogin: {
        username: "Antony@gmail.com",
        password: "password123",
    },
    roleForm: {
        roleName: "Admin",
        description: "Admin role",
        permissions: {
            "admin": true,
        },
    },
    workflowConfiguration: {
        name: "Workflow 1",
        description: "Workflow 1 description",
    },
};

type FileUploadConfig = {
    maxSize: number;
    supportedTypes: string[];
    maxFiles: number;
};

/**
 * File upload configurations
 */
const FILE_UPLOAD_CONFIG: Record<UploadType, FileUploadConfig> = {
    [UploadType.PROFILE_PICTURE]: {
        maxSize: 5 * 1024 * 1024, // 5MB
        supportedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
        maxFiles: 1,
    },
    [UploadType.ATTACHMENT]: {
        maxSize: 5 * 1024 * 1024, // 5MB
        supportedTypes: [
            'image/jpeg', 
            'image/png',
            'image/jpg',
            'application/pdf',
        ],
        maxFiles: 5
    }
} as const;

const FORM_CONFIGURATION: Record<string, boolean> = {
  "/device-integration/system-integration/pacs-configuration": true,
  "/device-integration/room-integration/room/[id]": true,
  "/device-integration/room-integration/room/[id]/blackbox-configuration": true,
  "/device-integration/room-integration/room/[id]/usg-configuration": true,
  "/user-access-management/all-users/create": true,
  "/user-access-management/all-users/[id]": true,
  "/user-access-management/user-roles/create": true,
  "/user-access-management/user-roles/[id]": true,
}

export {
    DATE_OPTIONS,
    SHORT_DATE_OPTIONS,
    FORM_DEFAULT_VALUES,
    FORM_FILL_VALUES,
    REGEX,
    FILE_UPLOAD_CONFIG,
    FORM_CONFIGURATION
}