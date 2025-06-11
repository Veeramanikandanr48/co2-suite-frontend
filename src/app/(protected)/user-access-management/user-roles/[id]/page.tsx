'use client';

import { useState, useEffect, use, useRef, useCallback } from "react";
import { API_LIST } from "~/lib/api-list";
import { apiService } from "~/lib/api-service";
import { usePathname, useRouter } from "next/navigation";
import { UpdateRolePayload, ApiResponse, RoleResponse, PermissionsResponse, RoleData, RoleFormData } from "~/types/roles";
import RolesBasedUsers, { RolesBasedUsersRef } from "~/components/roles/rolesbased-users";
import UserCheckPopup from "~/components/roles/usercheck-popup";
import { EAdditionalFieldError } from "~/enums/base-enum";
import { DeleteDialog } from "~/components/reusables/dialogs/delete";
import { useAuth } from "~/context/auth-provider";
import { userRoles } from '@/components/test-ids/user-roles.test-ids';
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import EventBus from "@/components/composables/eventbus";
import { useForm } from "react-hook-form";
import { useLoader } from "@/context/loader-context";
import { AxiosError } from "axios";
import { CreateRoleSchema } from '~/lib/schemas';
import { zodResolver } from "@hookform/resolvers/zod";
import { isFormValid, hasFormChanges } from "@/components/roles/form-utils";
import { RoleHeader } from "~/components/roles/role-header";
import { RoleTabs } from "~/components/roles/role-tabs";
import { RoleForm } from "~/components/roles/role-form";
import type { User } from "~/components/roles/role-tabs";

const UserRolePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'permissions' | 'users'>('permissions');
  const [roleData, setRoleData] = useState<RoleData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [pendingTabChange, setPendingTabChange] = useState<'permissions' | 'users' | null>(null);
  const [showTabSwitchDialog, setShowTabSwitchDialog] = useState(false);
  const router = useRouter();
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [formData, setFormData] = useState<RoleFormData | null>(null);
  const [initialFormData, setInitialFormData] = useState<RoleFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const rolesBasedUsersRef = useRef<RolesBasedUsersRef>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const currentRoute: string = usePathname();
  const requestHref = useRef<string | undefined>(undefined);
  const isCreateMode = resolvedParams.id === 'create';
  const [permissions, setPermissions] = useState<PermissionsResponse>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { showLoader, hideLoader } = useLoader();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(CreateRoleSchema),
    defaultValues: {
      roleName: formData?.roleName ?? '',
      description: formData?.description ?? '',
      permissions: formData?.permissions ?? [],
      contextRoleName: '',
    },
    mode: "all",
    reValidateMode: "onBlur",
    criteriaMode: "all",
  });

  const { setValue, watch, formState: { isValid, isDirty }, getValues, trigger } = form;

  const role = watch('roleName');

  const isSaveButtonDisabled = () => !hasFormChanges(form, formData, initialFormData, isCreateMode) || !isFormValid(formData);

  const handleFormChange = (data: RoleFormData) => {
    setFormData(data);
    setIsFormDirty(true);
  };

  const handleDontSave = useCallback(() => {
    setIsFormDirty(false);
    setShowConfirmDialog(false);
    setShowSaveDialog(false);
    const path = requestHref.current ?? "/user-access-management/user-roles";
    router.push(path);
  }, [router]);

  const handleSubmit = async (data: RoleFormData) => {
    try {
      setIsLoading(true);
      if (isCreateMode) {
        const response = await apiService.post(API_LIST.CREATE_ROLE, {
          roleName: data.roleName,
          description: data.description,
          permissionIds: data.permissions.filter(id => id !== null)
        }, {
          headers: {
            'X-Skip-Toast': 'false'
          }
        });

        if (response.success) {
          router.push('/user-access-management/user-roles');
        }
      } else {
        const payload: UpdateRolePayload = {
          roleName: data.roleName,
          description: data.description,
          permissionIds: data.permissions.filter(id => id !== null)
        };

        const response = await apiService.put<{ success: boolean }>(
          API_LIST.UPDATE_ROLE,
          resolvedParams.id,
          payload,
          {
            headers: {
              'X-Skip-Toast': 'false'
            }
          }
        );

        if (response.success) {
          const updatedData = {
            roleName: data.roleName,
            description: data.description ?? '',
            permissions: data.permissions.filter(id => id !== null)
          };
          setInitialFormData(updatedData);
          setFormData(updatedData);

          if (roleData) {
            setRoleData({
              ...roleData,
              roleName: data.roleName,
              description: data.description ?? '',
              permissions: data.permissions.filter(id => id !== null)
            });
          }
          setIsEditing(false);
          setShowConfirmDialog(false);
          setIsFormDirty(false);
          router.refresh();
        }
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage: EAdditionalFieldError | undefined =
          (error.response?.data as { additionalContext?: EAdditionalFieldError })?.additionalContext ?? undefined;
        if (errorMessage === EAdditionalFieldError.ADDITIONALCONTEXT) {
          setValue('contextRoleName', role ?? '');
          trigger();
        }
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!formData) return;
    setShowSaveDialog(false);
    await handleSubmit(formData);
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    if (!isValid || !isDirty) return;
    setIsSubmitting(true);
    try {
      await handleSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = async () => {
    if (isEditing && formData) {
      await handleSaveChanges();
    } else {
      setIsEditing(true);
    }
  };

  const handleBackClick = (e: React.MouseEvent) => {
    if (isFormDirty) {
      if (hasFormChanges(form, formData, initialFormData, isCreateMode)) {
        e.preventDefault();
        setShowConfirmDialog(true);
      } else {
        router.push(requestHref.current ?? "/user-access-management/user-roles");
      }
    }
  };

  const handleCancel = (newHref: string | undefined = undefined) => {
    if (newHref) {
      requestHref.current = newHref;
    }
    if (isFormDirty && hasFormChanges(form, formData, initialFormData, isCreateMode)) {
      setShowConfirmDialog(true);
    } else {
      router.push("/user-access-management/user-roles");
    }
  };

  const handleDeleteRole = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.put<{ success: boolean }>(
        API_LIST.DELETE_ROLE,
        resolvedParams.id,
        undefined,
        {
          headers: {
            'X-Skip-Toast': 'false'
          }
        }
      );

      if (response.success) {
        setDeleteDialogOpen(false);
        router.push('/user-access-management/user-roles');
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for form changes
  useEffect(() => {
    const subscription = watch(() => {
      const formData = getValues();
      handleFormChange(formData);
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  const fetchPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get<ApiResponse<PermissionsResponse>>(API_LIST.GET_ALL_PERMISSIONS);
      if (response.data) {
        const permissionsData = response.data;
        setPermissions(permissionsData as unknown as PermissionsResponse);

        if (formData?.permissions) {
          setValue('permissions', formData.permissions, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
          });
        }
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [formData, setValue]);

  useEffect(() => {
    fetchPermissions();
  }, []);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  useEffect(() => {
    if (!isCreateMode) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [roleResponse, permissionsResponse] = await Promise.all([
            apiService.getById<ApiResponse<RoleResponse[]>>(API_LIST.GET_ROLES, resolvedParams.id),
            apiService.get<PermissionsResponse>(API_LIST.GET_ALL_PERMISSIONS)
          ]);

          if (roleResponse.success && Array.isArray(roleResponse.data) && roleResponse.data.length > 0 &&
            permissionsResponse.success && permissionsResponse.data) {

            const roleData = roleResponse.data[0];

            const formData: RoleFormData = {
              roleName: roleData.rolename,
              description: roleData.description,
              permissions: (roleData.permissionids ?? []).filter((id: number | null): id is number => id !== null)
            };

            const roleDataTransformed: RoleData = {
              id: roleData.id,
              roleName: roleData.rolename,
              description: roleData.description,
              permissions: (roleData.permissionids ?? []).filter((id: number | null): id is number => id !== null)
            };

            setRoleData(roleDataTransformed);
            setInitialFormData({ ...formData });
            setFormData({ ...formData });

            form.reset({
              roleName: roleData.rolename,
              description: roleData.description,
              permissions: (roleData.permissionids ?? []).filter((id: number | null): id is number => id !== null)
            });
          }
        } catch {
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [resolvedParams.id, isCreateMode, form]);

  useEffect(() => {
    EventBus.$on(`${currentRoute}`, handleCancel);
    return () => {
      EventBus.$off(`${currentRoute}`, handleCancel);
    }
  });

  const handleTabChange = (newTab: 'permissions' | 'users') => {
    if (isFormDirty && hasFormChanges(form, formData, initialFormData, isCreateMode)) {
      setPendingTabChange(newTab);
      setShowTabSwitchDialog(true);
    } else {
      setActiveTab(newTab);
    }
  };

  const handleConfirmTabChange = () => {
    if (pendingTabChange) {
      if (initialFormData) {
        form.reset({
          roleName: initialFormData.roleName,
          description: initialFormData.description,
          permissions: initialFormData.permissions
        });
        setFormData(initialFormData);
      }
      setActiveTab(pendingTabChange);
      setIsFormDirty(false);
      setShowTabSwitchDialog(false);
      setPendingTabChange(null);
    }
  };

  const handleCancelTabChange = () => {
    setShowTabSwitchDialog(false);
    setPendingTabChange(null);
  };

  if (!isCreateMode && !roleData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-neutral-500">Role not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <RoleHeader 
        isCreateMode={isCreateMode}
        roleData={roleData}
        onBackClick={handleBackClick}
      />

      {!isCreateMode && (
        <RoleTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isEditing={isEditing}
          roleData={roleData}
          user={user as User}
          onEditClick={handleEditClick}
          onCancel={handleCancel}
          onSaveChanges={handleSaveChanges}
          onDeleteClick={() => setDeleteDialogOpen(true)}
          onAddUserClick={() => setShowUserPopup(true)}
          isSaveButtonDisabled={isSaveButtonDisabled}
        />
      )}

      <div className="mt-[12px]">
        {isCreateMode || activeTab === 'permissions' ? (
          <RoleForm
            form={form}
            formData={formData}
            isEditing={isEditing}
            isCreateMode={isCreateMode}
            permissions={permissions}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        ) : (
          <RolesBasedUsers
            ref={rolesBasedUsersRef}
            roleId={Number(resolvedParams.id)}
            data-testid={userRoles}
          />
        )}
      </div>

      {showUserPopup && (
        <UserCheckPopup
          roleId={Number(resolvedParams.id)}
          open={showUserPopup}
          onOpenChange={setShowUserPopup}
          onClose={() => {
            rolesBasedUsersRef.current?.refetch();
          }}
          data-testid={userRoles}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteRole}
        onCancel={() => setDeleteDialogOpen(false)}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        title={`Delete User Role?`}
        message="Deleting a user role cannot be undone."
      />

      <UnSavedDialog
        open={showSaveDialog}
        onConfirm={() => handleDontSave()}
        onCancel={() => setShowSaveDialog(false)}
        title="Unsaved Changes"
        message="You will lose all your changes if you proceed."
      />

      <UnSavedDialog
        open={showConfirmDialog}
        title="Unsaved Changes"
        message="Exiting now will discard all your changes."
        onConfirm={() => handleDontSave()}
        onCancel={() => setShowConfirmDialog(false)}
      />

      <UnSavedDialog
        open={showTabSwitchDialog}
        title="Unsaved Changes"
        message="You will lose all your changes if you proceed."
        onConfirm={handleConfirmTabChange}
        onCancel={handleCancelTabChange}
      />
    </div>
  );
};

export default UserRolePage; 