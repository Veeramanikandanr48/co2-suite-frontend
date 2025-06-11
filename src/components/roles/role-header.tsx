import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { RoleData } from "~/types/roles";
import { userRoles } from '@/components/test-ids/user-roles.test-ids';

interface RoleHeaderProps {
  isCreateMode: boolean;
  roleData: RoleData | null;
  onBackClick: (e: React.MouseEvent) => void;
}

export const RoleHeader = ({ isCreateMode, roleData, onBackClick }: RoleHeaderProps) => (
  <>
    <div className="flex items-center justify-between w-full h-12 gap-1.5">
      <p className="font-bold text-lg leading-7 tracking-normal capitalize" data-testid={userRoles.pageTitle}>User Access Management</p>
    </div>

    <hr className="bg-neutral-300 w-full h-[2px] pb-[1px] gap-2" />

    <div className="flex flex-col pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/user-access-management/user-roles" onClick={onBackClick}>
            <p className="font-semibold text-neutral-400 text-md">User Roles</p>
          </Link>
          <ChevronRight className="w-7 h-7 text-neutral-400" />
          <p className="font-semibold text-neutral-400 text-md">{isCreateMode ? 'Create Role' : roleData?.roleName}</p>
        </div>
      </div>
    </div>
  </>
); 