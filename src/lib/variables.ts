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
  "/dashboard/overview": true,
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