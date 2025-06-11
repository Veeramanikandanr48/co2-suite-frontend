'use client';

import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { RolesTable } from "~/components/roles/roletable";
import { userRoles } from "@/components/test-ids/user-roles.test-ids";
import { SubheadingDivider } from "@/components/reusables/form-fields/sub-heading";

export default function AllUsersPage() {
  const router = useRouter();


  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4">
        <SubheadingDivider className="font-semibold text-lg leading-7 tracking-normal capitalize text-title-color">
          User Access Management
        </SubheadingDivider>    
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-neutral-400">User Roles</p>
          <Button
            variant="default"
            className="bg-blue-700 text-white w-[190px] h-[39px] px-6 gap-2 rounded-md border"
            onClick={() => router.push("/user-access-management/user-roles/create")}
            data-testid={userRoles.addButton}
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Add User Role</span>
          </Button>
        </div>
      </div>     

      <div className="flex flex-col pt-6" data-testid={userRoles.table}>
        <RolesTable />
      </div>
    </div>
  );
}