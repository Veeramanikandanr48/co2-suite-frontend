"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiService } from "@/lib/api-service";
import { API_LIST } from "@/lib/api-list";
import { Role } from "@/types/roles-permissions";
import { UserListItem } from "@/types/user-management";
import { unwrapApiArray, unwrapApiResponse, extractErrorMessage } from "@/lib/api-utils";
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
  Edit,
  ArrowLeft,
  User,
  Loader2,
} from "lucide-react";
import { UpdateUserSchema } from "@/lib/schemas";

type UpdateUserFormValues = z.infer<typeof UpdateUserSchema>;

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const resolvedParams = use(params);
  const userId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      userName: "",
      email: "",
      roleId: "",
      additionalRoleIds: [],
    },
  });

  // Fetch roles & target user details
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingRoles(true);
        setLoadingUser(true);

        const [rolesRes, userRes] = await Promise.all([
          apiService.get<Role[]>(API_LIST.GET_ROLES),
          apiService.get<UserListItem>(`${API_LIST.GET_ALL_USERS}/${userId}`),
        ]);

        const safeRoles = unwrapApiArray<Role>(rolesRes);
        setAllRoles(safeRoles);

        const rawUser = unwrapApiResponse<UserListItem>(userRes);
        if (rawUser) {
          const userRoles: Array<{ roleId: number; isPrimary?: boolean }> = rawUser.roles || [];
          const primaryObj = userRoles.find((r) => r.isPrimary) || userRoles[0];
          const primaryId = primaryObj ? primaryObj.roleId.toString() : "";
          const secondaryIds = userRoles
            .filter((r) => r.roleId.toString() !== primaryId)
            .map((r) => r.roleId.toString());

          form.reset({
            userName: rawUser.userName || "",
            email: rawUser.emailId || "",
            roleId: primaryId,
            additionalRoleIds: secondaryIds,
          });
        }
      } catch (error: unknown) {
        console.error("Failed to load user edit details:", error);
        showErrorToast(extractErrorMessage(error, "Failed to fetch user details"));
      } finally {
        setLoadingRoles(false);
        setLoadingUser(false);
      }
    }

    if (userId) {
      loadData();
    }
  }, [userId, form]);

  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      setSubmitting(true);
      const primaryId = parseInt(values.roleId, 10);
      const secIds = (values.additionalRoleIds || [])
        .map((id) => (typeof id === "number" ? id : parseInt(id, 10)))
        .filter((id) => id !== primaryId);

      const combinedRoleIds = [primaryId, ...secIds];

      await apiService.put(`${API_LIST.UPDATE_USER}/${userId}`, {
        userName: values.userName.trim(),
        email: values.email.trim(),
        roleIds: combinedRoleIds,
        primaryRoleId: primaryId,
      });

      showSuccessToast(`User "${values.userName}" updated successfully!`);
      router.push("/users");
    } catch (error: unknown) {
      showErrorToast(extractErrorMessage(error, "Failed to update user"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-2">
        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
        <span className="text-xs text-neutral-500">Loading user details...</span>
      </div>
    );
  }

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
              <Edit className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                Edit User Account
              </h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Modify account identity, contact email, and primary/secondary assigned roles.
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

      {/* Main Form Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Account Basic Info Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-neutral-200 dark:border-neutral-800">
                  <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wider">
                    Basic Identity Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Full Name *
                        </FormLabel>
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
                        <FormLabel className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          Email Address *
                        </FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="john.doe@company.com" className="h-9 text-xs bg-white dark:bg-neutral-900" />
                        </FormControl>
                        <FormMessage className="text-rose-500 text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Reusable Role Selection Component */}
              <UserRoleSelector form={form} allRoles={allRoles} loadingRoles={loadingRoles} />

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/users")}
                  className="h-9 text-xs px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-9 text-xs px-5 shadow-sm cursor-pointer gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
