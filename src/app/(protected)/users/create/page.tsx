"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { Role } from "@/types/roles-permissions";
import { unwrapApiArray, extractErrorMessage } from "@/lib/api-utils";
import { showSuccessToast, showErrorToast } from "@/components/reusables/toast-variant";
import { UserRoleSelector } from "@/components/users/user-role-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UserPlus,
  ArrowLeft,
  User,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { CreateUserSchema } from "@/lib/schemas";

type CreateUserFormValues = z.infer<typeof CreateUserSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Password visibility toggles
  const [showPass, setShowPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const form = useForm<CreateUserFormValues>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: "",
      additionalRoleIds: [],
    },
  });

  // Fetch available roles
  useEffect(() => {
    async function fetchRoles() {
      try {
        setLoadingRoles(true);
        const rolesRes = await apiService.get<Role[]>(API_LIST.GET_ROLES);
        const safeRoles = unwrapApiArray<Role>(rolesRes);
        setAllRoles(safeRoles);

        if (safeRoles.length > 0 && !form.getValues("roleId")) {
          form.setValue("roleId", safeRoles[0].roleId.toString());
        }
      } catch (error) {
        console.error("Failed to load roles:", error);
        showErrorToast("Failed to load roles list");
      } finally {
        setLoadingRoles(false);
      }
    }
    fetchRoles();
  }, [form]);

  const onSubmit = async (values: CreateUserFormValues) => {
    try {
      setSubmitting(true);
      const primaryIdNum = parseInt(values.roleId, 10);
      const secondaryIdNums = (values.additionalRoleIds || [])
        .map((id) => (typeof id === "number" ? id : parseInt(id, 10)))
        .filter((id) => id !== primaryIdNum);

      await apiService.post(API_LIST.CREATE_USER, {
        userName: values.userName.trim(),
        email: values.email.trim(),
        password: values.password,
        roleId: primaryIdNum,
        additionalRoleIds: secondaryIdNums,
        isActive: true,
        isVerified: true,
        isTwoFactorAuthenticationEnabled: false,
        sendWelcomeEmail: true,
      });

      showSuccessToast(`User "${values.userName}" created successfully!`);
      router.push("/users");
    } catch (error: unknown) {
      showErrorToast(extractErrorMessage(error, "Failed to create user"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden gap-4 p-1 text-neutral-900 dark:text-neutral-100 w-full">
      {/* Top Header Bar */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push("/users")}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Create User Account
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Provision a new user account with credentials, security settings, and assigned roles.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => router.push("/users")}
          className="h-8 text-xs px-3 cursor-pointer"
        >
          Cancel
        </Button>
      </div>

      {/* Main Form Container */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                    Basic Identity & Credentials
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Full Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. John Doe" className="h-9 text-xs bg-white dark:bg-neutral-900" />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john.doe@company.com" className="h-9 text-xs bg-white dark:bg-neutral-900" />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showPass ? "text" : "password"} placeholder="••••••••" className="h-9 text-xs pr-9 bg-white dark:bg-neutral-900" />
                            <button
                              type="button"
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            >
                              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">Confirm Password *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input {...field} type={showConfirmPass ? "text" : "password"} placeholder="••••••••" className="h-9 text-xs pr-9 bg-white dark:bg-neutral-900" />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(!showConfirmPass)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                            >
                              {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Reusable Role Selection Component */}
              <UserRoleSelector form={form} allRoles={allRoles} loadingRoles={loadingRoles} />

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button type="button" variant="outline" size="sm" onClick={() => router.push("/users")} className="h-9 text-xs px-4 cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-9 text-xs px-5 shadow-sm cursor-pointer gap-1.5">
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create User</span>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
