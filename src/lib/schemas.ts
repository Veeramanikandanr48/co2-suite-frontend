// React

import { z } from "zod";

// Helpers
import { formatNumberWithCommas } from "@/lib/helpers";

// Variables
import { DATE_OPTIONS, REGEX } from "./variables";

const CustomInputSchema = z.object({
    key: z.string(),
    value: z.string(),
});

const fieldValidators = {
    name: z
        .string()
        .min(1, { message: "Name is required" })
        .min(2, { message: "Name must be at least 2 characters" })
        .max(50, { message: "Name must be at most 50 characters" })
        .regex(REGEX.stringOnly, "Name can only contain letters and spaces"),
    firstName: z.string()
        .min(1, { message: "First Name is required" })
        .min(2, { message: "First Name must be at least 2 characters" })
        .max(50, { message: "First Name must be less than 50 characters" })
        .regex(REGEX.stringOnly, "First Name can only contain letters and spaces"),
    lastName: z.string()
        .min(1, { message: "Last Name is required" })
        .max(50, "Last Name must be less than 50 characters")
        .regex(REGEX.stringOnly, "Last Name can only contain letters and spaces"),
    userId: z.string()
        .min(1, { message: "User ID is required" })
        .min(2, { message: "User ID must be at least 2 characters" })
        .max(50, { message: "User ID must be less than 50 characters" })
        .regex(REGEX.alphaNumeric, "User ID can only contain letters and numbers"),
    address: z
        .string()
        .min(2, { message: "Must be at least 2 characters" })
        .max(70, { message: "Must be between 2 and 70 characters" })
        .regex(REGEX.alphaNumericWithSpecialChar, "Address can only contain letters, numbers, and special characters"),
    zipCode: z
        .string()
        .min(2, { message: "Must be between 2 and 20 characters" })
        .max(20, { message: "Must be between 2 and 20 characters" })
        .regex(REGEX.pinCode, "Zip Code can only contain numbers"),
    city: z
        .string()
        .min(1, { message: "Must be between 1 and 50 characters" })
        .max(50, { message: "Must be between 1 and 50 characters" })
        .regex(REGEX.stringOnly, "City can only contain letters and spaces"),
    country: z
        .string()
        .min(1, { message: "Must be between 1 and 70 characters" })
        .max(70, { message: "Must be between 1 and 70 characters" })
        .regex(REGEX.stringOnly, "Country can only contain letters and spaces"),
    email: z
        .string()
        .min(1, { message: "Email ID is required" })
        .max(30, { message: "Email ID must be 30 characters or less" })
        .regex(REGEX.email, "Please enter a valid email ID"),
    phone: z
        .string()
        .min(1, { message: "Must be between 1 and 50 characters" })
        .max(50, {
            message: "Must be between 1 and 50 characters",
        })
        .regex(REGEX.mobileNumber, "Phone number must be a valid number"),

    // Dates
    date: z
        .date()
        .transform((date) =>
            new Date(date).toLocaleDateString("en-US", DATE_OPTIONS)
        ),

    // Items
    quantity: z.coerce
        .number()
        .min(1, { message: "Must be a number greater than 0" }),
    unitPrice: z.coerce
        .number()
        .gt(0, { message: "Must be a number greater than 0" })
        .lte(Number.MAX_SAFE_INTEGER, { message: `Must be ≤ ${Number.MAX_SAFE_INTEGER}` }),

    // Strings
    string: z.string(),
    stringMin1: z.string().min(1, { message: "Must be at least 1 character" }),
    stringToNumber: z.coerce.number(),

    // Charges
    stringToNumberWithMax: z.coerce.number().max(1000000),

    stringOptional: z.string().optional(),

    nonNegativeNumber: z.coerce.number().nonnegative({
        message: "Must be a positive number",
    }),
    // ! This is unused
    numWithCommas: z.coerce
        .number()
        .nonnegative({
            message: "Must be a positive number",
        })
        .transform((value) => {
            return formatNumberWithCommas(value);
        }),
    // Checkboxes
    termsAccepted: z.boolean().refine((val: boolean) => val === true, {
        message: "You must accept the terms and conditions",
    }),

    // Dropdowns
    paymentMethod: z.number().refine((val: number) => val !== 0, {
        message: "Please select a payment method",
    }),
    password: z.string()
        .min(1, "Password is required")
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" })
        .or(z.literal("********")), // Allow asterisk password to pass validation

    roleId: z.number().min(1, { message: "Please select a role" }),
    customInput: z.array(CustomInputSchema).optional(),
    attachment: typeof window !== 'undefined' ? z.instanceof(File) : z.any(),
    attachments: typeof window !== 'undefined' ? z.array(z.instanceof(File)) : z.array(z.any()),
};

const ipOctet = /([1-9]?\d|1\d\d|2[0-4]\d|25[0-5])/;
const ipAddressRegex = new RegExp(`^${ipOctet.source}\\.${ipOctet.source}\\.${ipOctet.source}\\.${ipOctet.source}$`);

const ipAddressField = z.string()
    .min(1, "IP address is required")
    .regex(ipAddressRegex, "Invalid IP address format")
    .refine((value) => {
        return value.split('.').every(part => parseInt(part) <= 255)
    }, "IP address parts must be between 0 to 255");

const portField = z.string()
    .min(1, "Port is required")
    .regex(/^\d+$/, "Port must be a number")
    .refine((value) => {
        const portNumber = parseInt(value, 10);
        return portNumber > 0 && portNumber <= 65535;
    }, "Port must be between 1 and 65535");

const aeTitleField = z.string()
    .min(1, "AE Title is required")
    .max(16, "AE Title must be less than 16 characters")
    .regex(REGEX.alphanumericWithUnderscoreSpace, "AE Title only contain letters, numbers space and underscore");


const PacsConfigurationSchema = z.object({
    ipAddress: ipAddressField,
    port: portField,
    aeTitle: aeTitleField,
    contextPacsIp: z.string().optional(),
    contextPacsAeTitle: z.string().optional(),
}).superRefine((data, ctx) => {
    const allPacsIp: string = data?.contextPacsIp ?? '';
    if (allPacsIp.toLowerCase()?.trim() === data.ipAddress.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['ipAddress'],
            code: z.ZodIssueCode.custom,
            message: "IP address already exists",
        });
    }
    const allPacsAeTitle: string = data?.contextPacsAeTitle ?? '';
    if (allPacsAeTitle.toLowerCase()?.trim() === data.aeTitle.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['aeTitle'],
            code: z.ZodIssueCode.custom,
            message: "AE Title already exists",
        });
    }
});

const RoomConfigurationSchema = z.object({
    name: z.string()
        .min(1, "Room Name is required")
        .max(100, "Room Name must be less than 100 characters")
        .regex(REGEX.alphanumericWithUnderscoreSpace, "Room Name only contain letters, numbers space and underscore"),
    description: z.string().max(255, "Description must be 255 characters or less.").optional(),
    ipAddress: ipAddressField,
    port: portField,
    aeTitle: aeTitleField,
});

const RoomNameSchema = z.object({
    name: z.string()
        .min(1, "Room Name is required")
        .max(100, "Room Name must be less than 100 characters")
        .regex(REGEX.alphanumericWithUnderscoreSpace, "Room Name only contain letters, numbers space and underscore"),
    contextRoomValue: z.array(z.string()).optional(),
    }).superRefine((data, ctx) => {
        const allRoomNames: string[] = data?.contextRoomValue ?? [];
        if (allRoomNames.some(roomName => roomName.toLowerCase()?.trim() === data.name.toLowerCase()?.trim())) {
            ctx.addIssue({
                path: ['name'],
                code: z.ZodIssueCode.custom,
                message: "Room name already exists",
            });
        }
    });

const UsgConfigurationSchema = z.object({
    usgName: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .regex(REGEX.alphanumericWithUnderscoreSpace, "Name only contain letters, numbers space and underscore"),
    usgDescription: z.string().max(255, "Description must be 255 characters or less.").optional(),
    usgIp: ipAddressField,
    usgPort: portField,
    usgAeTitle: aeTitleField,    
    roomId: z.number(),
    usgId: z.number().optional(),
    contextUsgIp: z.string().optional(),
    contextUsgAeTitle: z.string().optional(),
}).superRefine((data, ctx) => {
    const allUsgIp: string = data?.contextUsgIp ?? '';
    if (allUsgIp.toLowerCase()?.trim() === data.usgIp.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['usgIp'],
            code: z.ZodIssueCode.custom,
            message: "IP address already exists",
        });
    }
    const allUsgAeTitle: string = data?.contextUsgAeTitle ?? '';
    if (allUsgAeTitle.toLowerCase()?.trim() === data.usgAeTitle.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['usgAeTitle'],
            code: z.ZodIssueCode.custom,
            message: "AE Title already exists",
        });
    }
});

const BlackboxConfigurationSchema = z.object({
    blackboxName: z.string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .regex(REGEX.alphanumericWithUnderscoreSpace, "Name only contain letters, numbers space and underscore"),
    blackboxDescription: z.string().max(255, "Description must be 255 characters or less.").optional(),
    blackboxIp: ipAddressField,
    blackboxPort: portField,
    blackboxAeTitle: aeTitleField,
    roomId: z.number(),
    blackboxId: z.number().optional(),
    contextBlackboxIp: z.string().optional(),
    contextBlackboxAeTitle: z.string().optional(),
}).superRefine((data, ctx) => {
    const allBlackboxIp: string = data?.contextBlackboxIp ?? '';
    if (allBlackboxIp.toLowerCase()?.trim() === data.blackboxIp.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['blackboxIp'],
            code: z.ZodIssueCode.custom,
            message: "IP address already exists",
        });
    }
    const allBlackboxAeTitle: string = data?.contextBlackboxAeTitle ?? '';
    if (allBlackboxAeTitle.toLowerCase()?.trim() === data.blackboxAeTitle.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['blackboxAeTitle'],
            code: z.ZodIssueCode.custom,
            message: "AE Title already exists",
        });
    }
});

const baseUserSchema = {
    firstName: fieldValidators.firstName,
    lastName: fieldValidators.lastName,
    userId: fieldValidators.userId,
    email: fieldValidators.email,
    roleId: fieldValidators.roleId,
    profilePicture: typeof window !== 'undefined' ? z.instanceof(File).optional() : z.any().optional(),
};


const UserFormSchema = z.object({
    ...baseUserSchema,
    password: z.string()
        .nonempty("Password is required")
        .min(8, "")  // min 8 characters but no message
        .regex(/[A-Z]/, "")  // capital letter but no message
        .regex(/\d/, "")  // number but no message
        .regex(/[^A-Za-z0-9]/, ""), // special character but no message
    confirmPassword: z.string()
        .nonempty("Confirm Password is required")
        .min(8, "")
        .regex(/[A-Z]/, "")
        .regex(/\d/, "")
        .regex(/[^A-Za-z0-9]/, "")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const EditUserFormSchema = z.object({
    ...baseUserSchema,
    password: z.string().optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return val.length >= 8;
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[A-Z]/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[a-z]/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /\d/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[^A-Za-z0-9]/.test(val);
        }, {
            message: ""
        }),
    confirmPassword: z.string().optional()
        .refine((val) => {
            if (!val || val === "") return true;
            return val.length >= 8;
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[A-Z]/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[a-z]/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /\d/.test(val);
        }, {
            message: ""
        })
        .refine((val) => {
            if (!val || val === "") return true;
            return /[^A-Za-z0-9]/.test(val);
        }, {
            message: ""
        }),
}).refine((data) => {
    // Only validate password match if both fields have content
    if (data.password && data.password !== "" && data.confirmPassword && data.confirmPassword !== "") {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const UploadResourceSchema = z.object({
    name: z.string().min(1,"Name is required").max(100, "Name too long")
           .regex(REGEX.alphaNumericWithAllSpecialChar, "Name only contain letters, numbers, spaces, and _ . - () {} ! & @ # + ' ~"),
    description: z.string().max(255, { message: "Description must be 255 characters or less." }).optional(), 
    tags: z.array(z.string()).min(1, "At least one tag is required").max(5, "You can add a maximum of 5 tags")
           .refine((tags) => tags.every(tag => !/\d/.test(tag)), { message: "Tags cannot contain numbers" }),
    attachments: typeof window !== 'undefined' 
        ? z.array(z.instanceof(File))
            .min(1, "At least one file is required")
            .max(1, "Maximum 1 files allowed")
        : z.array(z.any())
            .min(1, "At least one file is required")
            .max(1, "Maximum 1 files allowed"),
    contextFileName: z.string().optional()
}).superRefine((data, ctx) => {
    const FileName: string = data?.contextFileName ?? '';
    if (( FileName.toLowerCase()?.trim() === data.name.toLowerCase()?.trim())) {
        ctx.addIssue({
            path: ['name'],
            code: z.ZodIssueCode.custom,
            message: "Resource Name already exists",
        });
    }
});

const WorkflowConfigurationSchema = z.object({
    name: z.string().min(1, "Workflow Name is required")
      .max(100, "Workflow Name is too long") 
      .regex(REGEX.alphanumericWithHyphenUnderscore, "Workflow Name only contain letters, numbers, space or an underscore"),
    description: z.string().max(255, { message: "Description must be 255 characters or less." }).optional(),
    contextWorkFlowValue: z.array(z.string()).optional()
}).superRefine((data, ctx) => {
    const allWorkflowNames: string[] = data?.contextWorkFlowValue ?? [];
    if (allWorkflowNames.some(workflowName => workflowName.toLowerCase()?.trim() === data.name.toLowerCase()?.trim())) {
        ctx.addIssue({
            path: ['name'],
            code: z.ZodIssueCode.custom,
            message: "Workflow name already exists",
        });
    }
});

const AnnotationAcronymSchema = z.object({
    acronym: z.string()
        .min(1, "Acronym is required when annotation is selected")
        .max(10, "Acronym must be less than 10 characters")
        .regex(/^[A-Z0-9]+$/, "Acronym must contain only uppercase letters and numbers")
});

const LoginFormSchema = z.object({
    username: z.string()
    .min(1, "Username is required")
    .email("Please enter a valid username"),
   password: fieldValidators.password,
});

const CreateRoleSchema = z.object({
    roleName: z.string()
        .min(1, "Role name is required")
        .max(20, "Role name must be 20 characters or less"),
    description: z.string()
        .max(255, "Description must be 255 characters or less")
        .optional(),
    permissions: z.array(z.number())
        .min(1, "At least one permission is required"),
    contextRoleName: z.string().optional()
}).superRefine((data, ctx) => {
    const roleName: string = data?.contextRoleName ?? '';
    if (roleName.toLowerCase()?.trim() === data.roleName.toLowerCase()?.trim()) {
        ctx.addIssue({
            path: ['roleName'],
            code: z.ZodIssueCode.custom,
            message: "Role name already exists",
        });
    }
});

export { 
    UserFormSchema, 
    EditUserFormSchema, 
    PacsConfigurationSchema,
    RoomConfigurationSchema,
    RoomNameSchema,
    UsgConfigurationSchema,
    BlackboxConfigurationSchema,
    UploadResourceSchema,
    LoginFormSchema,
    CreateRoleSchema,
    WorkflowConfigurationSchema,
    AnnotationAcronymSchema,
    fieldValidators,
};
