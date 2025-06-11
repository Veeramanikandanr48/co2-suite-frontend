import { Trash2, CirclePlus, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { RoleData } from "~/types/roles";
import { DefaultValues } from "~/enums/base-enum";
import { userRoles } from '@/components/test-ids/user-roles.test-ids';
import SaveIcon from "@/components/svg/save";
import Pencil from "@/components/svg/pencil";

export interface User {
  roleId?: number;
}

interface RoleTabsProps {
  activeTab: 'permissions' | 'users';
  onTabChange: (tab: 'permissions' | 'users') => void;
  isEditing: boolean;
  roleData: RoleData | null;
  user: User;
  onEditClick: () => void;
  onCancel: () => void;
  onSaveChanges: () => void;
  onDeleteClick: () => void;
  onAddUserClick: () => void;
  isSaveButtonDisabled: () => boolean;
}

export const RoleTabs = ({
  activeTab,
  onTabChange,
  isEditing,
  roleData,
  user,
  onEditClick,
  onCancel,
  onSaveChanges,
  onDeleteClick,
  onAddUserClick,
  isSaveButtonDisabled
}: RoleTabsProps) => (
  <div className="flex items-center justify-between pt-6 pb-1 border-b border-neutral-300">
    <div className="flex items-center justify-start gap-2">
      <button
        onClick={() => onTabChange('permissions')}
        className={`text-sm px-4 py-2 w-40 ${activeTab === 'permissions'
            ? 'font-medium text-primary-500 border-b-2 border-primary-500'
            : 'font-semibold text-neutral-400'
          }`}
      >
        Permissions
      </button>
      <button
        onClick={() => onTabChange('users')}
        className={`text-sm px-4 py-2 w-40 ${activeTab === 'users'
            ? 'font-medium text-primary-500 border-b-2 border-primary-500'
            : 'font-semibold text-neutral-400'
          }`}
      >
        Users
      </button>
    </div>
    <div className="flex items-center justify-start gap-2">
      {activeTab === 'permissions' && (
        <>
          {isEditing ? (
            <Button
              variant="outline-primary"
              className="bg-white w-[130px] h-[38px] px-6 py-3 gap-2 rounded-sm border"
              onClick={onCancel}
            >
              <X className="w-4 h-4" />
              <span className="text-sm font-medium">Cancel</span>
            </Button>
          ) : (
            <Button
              variant="outline-primary"
              className="bg-white w-[153px] h-[38px] px-6 py-3 gap-2 rounded-sm border disabled:button-disabled"
              onClick={onDeleteClick}
              disabled={roleData?.id === DefaultValues.USER_ROLE_ID || user?.roleId === roleData?.id}
            >
              <Trash2 className="w-4 h-4" />
              <span className="text-sm">Delete User Role</span>
            </Button>
          )}
        </>
      )}
      {activeTab === 'permissions' ? (
        <>
          {isEditing ? (
            <Button
              variant="default"
              className="bg-primary-500 text-white w-[130px] h-[38px] px-6 py-3 gap-2 rounded-sm border disabled:button-disabled"
              onClick={onSaveChanges}
              disabled={isSaveButtonDisabled()}
            >
              <SaveIcon className="w-4 h-4" stroke={isSaveButtonDisabled() ? 'var(--neutral-700)' : 'white'} />
              <span className="text-sm font-medium">Save</span>
            </Button>
          ) : (
            <Button
              variant="default"
              className="bg-primary-500 text-white w-[190px] h-[38px] px-6 py-3 gap-2 rounded-sm border disabled:button-disabled"
              onClick={onEditClick}
              disabled={roleData?.id === DefaultValues.USER_ROLE_ID || user?.roleId === roleData?.id}
            >
              <Pencil className="w-[18px] h-[18px]" stroke={roleData?.id === DefaultValues.USER_ROLE_ID || user?.roleId === roleData?.id ? "var(--neutral-700)" : "var(--light-100)"} />
              <span className="text-sm font-medium">Edit Permissions</span>
            </Button>
          )}
        </>
      ) : (
        <Button
          variant="default"
          className="bg-primary-500 text-white w-[130px] h-[38px] px-6 py-3 gap-2 rounded-sm border"
          onClick={onAddUserClick}
          data-testid={userRoles}
        >
          <CirclePlus className="w-4 h-4" />
          <span className="text-sm font-medium">Add User</span>
        </Button>
      )}
    </div>
  </div>
); 