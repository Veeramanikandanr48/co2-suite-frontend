import { X, CirclePlus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { FormProvider, UseFormReturn} from "react-hook-form";
import FormInput from '@/components/reusables/form-fields/form-input';
import { PermissionSection } from "~/components/roles/permission-section";
import { PermissionsResponse, RoleFormData } from "~/types/roles";
import { userRoles } from '@/components/test-ids/user-roles.test-ids';
import { isFormValid } from "@/components/roles/form-utils";

interface RoleFormProps {
  form: UseFormReturn<RoleFormData>;
  formData: RoleFormData | null;
  isEditing: boolean;
  isCreateMode: boolean;
  permissions: PermissionsResponse;
  onSubmit: (data: RoleFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const RoleForm = ({
  form,
  formData,
  isEditing,
  isCreateMode,
  permissions,
  onSubmit,
  onCancel,
  isSubmitting
}: RoleFormProps) => {
  const { handleSubmit: formSubmit, watch, setValue, formState: { errors } } = form;

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={formSubmit(onSubmit)} className="flex flex-col gap-1">
          <div className={`flex flex-col gap-4 bg-card rounded-lg px-6 pt-6 pb-4 h-[71vh]`}>
            {(isEditing || isCreateMode) && (
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-2 w-full sm:w-[390px] min-h-[90px]">
                  <p className="font-semibold text-neutral-700 text-[15px]">{isCreateMode ? 'Create User Role' : 'Edit User Role'}</p>
                  <div className="flex flex-col gap-1">
                    <FormInput
                      name="roleName"
                      placeholder="Role name"
                      className={`text-header-secondary w-[390px] h-[41px] ${errors.roleName ? "border-red-500" : "border-input-placeholder"
                        }`}
                      disabled={!isEditing && !isCreateMode}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[390px] min-h-[90px]">
                  <p className="font-semibold text-neutral-700 text-[15px]">Description</p>
                  <div className="flex flex-col gap-1">
                    <FormInput
                      name="description"
                      placeholder="Add a description"
                      className={`text-header-secondary w-[390px] h-[41px] border-input-placeholder`}
                      disabled={!isEditing && !isCreateMode}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <p className="font-semibold text-neutral-600">Permissions</p>
            </div>

            <div className={`flex flex-col px-4 space-y-8 h-[calc(100vh-337px)] overflow-y-auto scrollBar`}>
              {Object.entries(permissions).map(([modeName, modePermissions]) => {
                const permission = modePermissions[0];
                const isChecked = watch('permissions')?.includes(permission.id);

                return (
                  <PermissionSection
                    key={modeName}
                    modeName={modeName}
                    permission={permission}
                    isChecked={isChecked}
                    isEditing={isEditing}
                    isCreateMode={isCreateMode}
                    watch={watch}
                    setValue={setValue}
                  />
                );
              })}
              <div className="h-5">
                {errors.permissions && form.formState.dirtyFields.permissions && (
                  <p className="text-red-500 text-xs" data-testid={userRoles}>{errors.permissions.message?.toString()}</p>
                )}
              </div>
            </div>

            {isCreateMode && (
              <div className="flex flex-col rounded-md px-4 mt-16">
                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline-primary"
                    className="bg-white w-[8.15rem] h-[2.4rem]"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                    <span className="text-primary-500">Cancel</span>
                  </Button>
                  <Button
                    type="submit"
                    className="w-[8.15rem] h-[2.4rem] disabled:button-disabled"
                    disabled={isSubmitting || !isFormValid(formData)}
                  >
                    <CirclePlus className="w-4 h-4" />
                    <span>{isCreateMode ? 'Create' : 'Save'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}; 