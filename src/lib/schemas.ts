// Centralized Zod Schemas for Application Forms

import { z } from "zod";
import { formatNumberWithCommas } from "@/lib/helpers";
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
        .min(6, { message: "Password must be at least 6 characters" })
        .or(z.literal("********")),

    roleId: z.number().min(1, { message: "Please select a role" }),
    customInput: z.array(CustomInputSchema).optional(),
    attachment: typeof window !== 'undefined' ? z.instanceof(File) : z.any(),
    attachments: typeof window !== 'undefined' ? z.array(z.instanceof(File)) : z.array(z.any()),
};

// ─── AUTH SCHEMAS ─────────────────────────────────────────────────────────────

export const LoginFormSchema = z.object({
    username: z.string()
        .min(1, "Username is required")
        .email("Please enter a valid email address"),
    password: fieldValidators.password,
});

export const TotpFormSchema = z.object({
    code: z
        .string()
        .min(6, "Verification code must be 6 digits")
        .max(6, "Verification code must be 6 digits")
        .regex(/^\d+$/, "Verification code must be numbers only"),
});

export const SignUpSchema = z
    .object({
        userName: z.string().min(2, "Full Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password is required"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address"),
});

// ─── USER MANAGEMENT SCHEMAS ──────────────────────────────────────────────────

export const CreateUserSchema = z
    .object({
        userName: z.string().min(2, "Full Name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password is required"),
        roleId: z.string().min(1, "Please select a primary role"),
        additionalRoleIds: z.array(z.union([z.number(), z.string()])).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const UpdateUserSchema = z.object({
    userName: z.string().min(2, "Full Name is required"),
    email: z.string().email("Invalid email address"),
    roleId: z.string().min(1, "Please select a primary role"),
    additionalRoleIds: z.array(z.union([z.number(), z.string()])).optional(),
});

export const ResetPasswordSchema = z
    .object({
        newPassword: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string().min(6, "Confirm Password is required"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const UserFormSchema = z.object({
    name: fieldValidators.name,
    email: fieldValidators.email,
    description: z.string()
        .max(255, "Description must be less than 255 characters")
        .optional(),
    roleId: fieldValidators.roleId,
});

// ─── ROLES & PERMISSIONS SCHEMAS ─────────────────────────────────────────────

export const CreateRoleSchema = z.object({
    roleKey: z
        .string()
        .min(2, "Role Key must be at least 2 characters")
        .regex(/^[A-Z0-9_]+$/, "Role Key must be UPPERCASE (e.g. CARBON_MANAGER)"),
    roleName: z.string().min(2, "Role Name is required"),
    roleShortName: z.string().optional(),
    description: z.string().optional(),
});

export const EditRoleSchema = z.object({
    roleName: z.string().min(2, "Role Name is required"),
    roleShortName: z.string().optional(),
    description: z.string().optional(),
});

export const CreatePermissionSchema = z.object({
    moduleId: z.number().min(1, "Module is required"),
    resource: z.string().min(2, "Resource is required (e.g. users, emissions, reports)"),
    action: z.string().min(2, "Action is required (e.g. read, create, update, delete)"),
    scope: z.enum(["any", "own"]).default("any"),
    description: z.string().optional(),
});
