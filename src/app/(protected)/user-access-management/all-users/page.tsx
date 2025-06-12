'use client';

import { PlusCircle } from "lucide-react";
import { UsersTable } from '~/components/all-users/users-table';
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { allUser } from "~/components/test-ids/all-users.ids";
import { SubheadingDivider } from "@/components/reusables/sub-heading";

export default function AllUsersPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col" data-testid={allUser.allUsersPage}>
      <SubheadingDivider className="font-semibold text-lg leading-7 tracking-normal capitalize text-title-color mb-4" data-testid={allUser.pageTitle}>
        User Access Management
      </SubheadingDivider>

      <div className="flex justify-between items-start  ">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-neutral-400">All Users</p>
          <Button
            variant="default"
            className="bg-blue-700 text-white w-[190px] h-[39px] px-6 gap-2 rounded-md border z-10"
            onClick={() => router.push("/user-access-management/all-users/create")}
            data-testid={allUser.createUserButton}
          >
            <PlusCircle className="w-4 h-4" data-testid={allUser.plusIcon} />
            <span className="text-sm font-medium" data-testid={allUser.createUserText}>Create User</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col py-12  " data-testid={allUser.usersTableContainer}>
        <UsersTable />
      </div>

    </div>
  );
}