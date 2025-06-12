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

const LoginFormSchema = z.object({
    username: z.string()
        .min(1, "Username is required")
        .email("Please enter a valid username"),
    password: fieldValidators.password,
});

const UserFormSchema = z.object({
    name: fieldValidators.name,
    email: fieldValidators.email,
    description: z.string()
        .max(255, "Description must be less than 255 characters")
        .optional(),
    roleId: fieldValidators.roleId,
});

export {
    LoginFormSchema,
    UserFormSchema
};
