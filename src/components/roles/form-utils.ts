import { RoleFormData } from "~/types/roles";
import { UseFormReturn } from "react-hook-form";

export const isFormValid = (data: RoleFormData | null) => {
  if (!data) return false;
  return Boolean(
    data.roleName?.trim() &&
    data.permissions?.length > 0
  );
};

export const hasFormChanges = (
  form: UseFormReturn<RoleFormData>,
  formData: RoleFormData | null,
  initialFormData: RoleFormData | null,
  isCreateMode: boolean
) => {
  if (isCreateMode) {
    const currentValues = form.getValues();
    return Boolean(
      currentValues.roleName?.trim() ||
      currentValues.description?.trim() ||
      currentValues.permissions?.length > 0
    );
  }

  if (!formData || !initialFormData) return false;

  if (formData.roleName !== initialFormData.roleName ||
    formData.description !== initialFormData.description) {
    return true;
  }

  const initialPermissions = Object.entries(initialFormData.permissions);
  const currentPermissions = Object.entries(formData.permissions);

  if (initialPermissions.length !== currentPermissions.length) return true;

  return currentPermissions.some(([key, value]) =>
    initialFormData.permissions[key as keyof typeof initialFormData.permissions] !== value
  );
}; 