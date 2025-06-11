import { Checkbox } from '@/components/ui/checkbox';
import { PermissionBadge } from "~/components/all-users/permission-badge";
import { UseFormSetValue } from "react-hook-form";
import { RoleFormData } from "~/types/roles";
import { userRoles } from '@/components/test-ids/user-roles.test-ids';

interface PermissionSectionProps {
  modeName: string;
  permission: {
    id: number;
    abbrevation: string;
    permissionName: string;
    description: string;
    styles: {
      color: string;
    };
  };
  isChecked: boolean;
  isEditing: boolean;
  isCreateMode: boolean;
  watch: (field: string) => unknown;
  setValue: UseFormSetValue<RoleFormData>;
}

export const PermissionSection = ({ 
  modeName, 
  permission, 
  isChecked, 
  isEditing, 
  isCreateMode, 
  watch, 
  setValue 
}: PermissionSectionProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-4">
      <p className="font-medium text-neutral-400 w-[150px] text-[13px] uppercase">{modeName}</p>
      <hr className="bg-neutral-300 w-full h-[2px] pb-[1px] gap-2" />
    </div>
    <div className="rounded-lg w-[462px]">
      <div className={`flex flex-col ${isChecked ? 'bg-background-inner' : ''} border border-neutral-100 rounded-[8px]`}>
        <div className="flex items-center px-[10px] pt-[10px] pb-[4px] gap-[12px]">
          <div className="w-[1.9375rem] h-[1.9375rem] rounded-full flex items-center justify-center text-white font-normal text-xs">
            <Checkbox
              id={`permissions.${permission.id}`}
              data-testid={userRoles.roleCheckbox}
              className="text-white data-[state=unchecked]:bg-white data-[state=checked]:border-0 data-[state=unchecked]:border-neutral-300 rounded-none"
              style={{
                backgroundColor: isChecked ? permission.styles.color : 'white',
                color: 'white'
              }}
              disabled={!isEditing && !isCreateMode}
              checked={isChecked}
              onCheckedChange={(checked) => {
                const currentPermissions = watch('permissions') as number[] || [];
                if (checked) {
                  if (permission.id !== null) {
                    setValue('permissions', [...currentPermissions, permission.id], {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true
                    });
                  }
                } else {
                  setValue('permissions', currentPermissions.filter((id: number) => id !== null && id !== permission.id), {
                    shouldValidate: true,
                    shouldDirty: true,
                    shouldTouch: true
                  });
                }
              }}
            />
          </div>
          <PermissionBadge
            permission={{
              id: permission.id,
              code: permission.abbrevation,
              color: isChecked ? permission.styles.color : '#D9E5F2',
              textColor: isChecked ? '#222326' : '#5C5F66'
            }}
            data-testid={userRoles}
          />
          <p className="font-medium text-neutral-400 text-[13px]" data-testid={userRoles}>{permission.permissionName}</p>
        </div>
        <hr className="bg-neutral-300 w-full" />
        <div className="flex items-center">
          <p className="text-neutral-950 text-xs font-[300] px-[10px] pb-6 pt-2" data-testid={userRoles}>
            {permission.description}
          </p>
        </div>
      </div>
    </div>
  </div>
); 