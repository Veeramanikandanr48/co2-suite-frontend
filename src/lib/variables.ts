import { UploadType } from "~/enums/base-enum";

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
    loginForm: {
        username: "",
        password: "",
    },
    userForm: {
        name: "",
        email: "",
        roleId: undefined,
        description: "",
    }
}


const REGEX = {
    stringOnly: /^[a-zA-Z ]+$/,
    numberOnly: /^[\d.]+$/,
    noOfShareOnly: /^[^0]\d*$/,
    alphaNumeric: /^[a-zA-Z\d ]+$/,
    alphaNumericWithCommaHiphen: /^[a-zA-Z\d ,-]+$/,
    alphaNumericWithSpecialChar: /^[A-Za-z\d _.\-@:+/'%]+$/,
    exceptional: /^[^<>]*$/,
    email: /^[a-zA-Z\d._%+-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,10}$/,
    panNumber: /^[A-Z]{5}\d{4}[A-Z]$/,
    decimal: /^\d+\.\d{3}$/,
    weight: /^\d\.\d00$/,
    aadhar: /^[2-9]\d{11}$/,
    maxDay: /^(1|10)$/,
    mobileNumber: /^[6-9]\d{9}$/,
    Landline: /^\d{3,5}-\d{6,7}$/,
    numberWithoutPeriod: /^\d+$/,
    ifscCode: /^[A-Z]{4}0[A-Z\d]{6}$/,
    capitalizedAlphaNumeric: /^[A-Z\d ]$/,
    withOutZero: /^[1-9]\d*(?:[ ,\\-]\d+)*$/,
    pinCode: /^\d+$/,
    numbers: /^\d+$/,
    alphaNumericWithAllSpecialChar: /^[a-zA-Z\d _.\-(){}&@#+'~!]+$/,
    alphanumericWithUnderscoreSpace: /^(?!\s*$)[a-zA-Z\d_\s]+$/,
    alphanumericWithHyphenUnderscore: /^(?=[a-zA-Z\d _-]*[a-zA-Z])[a-zA-Z\d _-]+$/
  }
  
/**
 * ? DEV Only
 * Form auto fill values for testing
 */
const FORM_FILL_VALUES = {
    userLogin: {
        username: "Antony@gmail.com",
        password: "password123",
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
//   "/dashboard/overview": true,
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