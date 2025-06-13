"use client";

import { FormInput, FormDropdown } from "@/components";
import { SubheadingDivider } from "@/components/reusables/sub-heading";
import { Button } from "@/components/ui/button";
import { userForm } from "@/components/test-ids/user-form";
import { UserFormSchema } from "@/lib/schemas";
import { FORM_DEFAULT_VALUES } from "@/lib/variables";
import { UserFormType } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Close, Save } from "@/components/svg";
import { RoleList, UserList } from "@/mock-data";
import { useRouter } from "next/navigation";
import { DropdownOption } from "@/types";

const UserPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();


    useEffect(() => {
        if (id) {
            console.log('id', id);
        }
    }, [id])

    const form = useForm<UserFormType>({
        defaultValues: FORM_DEFAULT_VALUES.userForm,
        resolver: zodResolver(UserFormSchema),
        mode: "onChange",
    });

    const { handleSubmit, formState } = form;

    const onSubmit = async (data: UserFormType) => {
        const { name, email, roleId, description } = data;
        const roleName = RoleList.data?.find(role => role.id === roleId)?.roleName;

        const newUser = {
            id: "1",
            name,
            email,
            roleName: roleName ?? "",
            description: description ?? "",
        };
        UserList.data?.push(newUser);
        router.push('/user-access-management/all-users');
    };

    const onCancel = () => {
        router.push('/user-access-management/all-users');
    };

    const roleOptions: DropdownOption[] = RoleList.data?.map(role => ({
        id: role.id,
        label: role.roleName
    })) || [];

    return (
        <FormProvider {...form}>
            <SubheadingDivider>User Access Management</SubheadingDivider>
            <p className="text-base font-semibold text-header-secondary py-3 leading-tight capitalize">
                Create User Details
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-[calc(100vh-194px)]">
                <div className="relative w-full h-full bg-light-100 flex flex-col p-5 gap-4">
                    <div className="flex flex-col gap-4 py-4 px-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FormInput
                                    name="name"
                                    label="Name"
                                    placeholder="Enter Name"
                                    className="w-full"
                                    labelClassName="text-[10px] font-semibold text-neutral-500 mb-1 leading-[14px]"
                                    vertical
                                    data-testid={userForm.nameInput}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <FormInput
                                    name="email"
                                    label="Email"
                                    placeholder="Enter Email"
                                    className="w-full"
                                    labelClassName="text-[10px] font-semibold text-neutral-500 mb-1 leading-[14px]"
                                    vertical
                                    data-testid={userForm.emailInput}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FormDropdown
                                    name="roleId"
                                    label="Role"
                                    placeholder="Select Role"
                                    options={roleOptions}
                                    className="w-full"
                                    vertical
                                    data-testid={userForm.roleInput}
                                />
                            </div>
                            <div>
                                <FormInput
                                    name="description"
                                    label="Description"
                                    placeholder="Enter Description"
                                    className="w-full"
                                    labelClassName="text-[10px] font-semibold text-neutral-500 mb-1 leading-[14px]"
                                    vertical
                                    data-testid={userForm.descriptionInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-12 p-4 border-t-[1px] border-neutral-400 mt-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex items-center rounded-sm gap-2 border-blue-600 text-blue-600 w-[120px]"
                            data-testid={userForm.cancelButton}
                        >
                            <Close className="h-4 w-4" data-testid={userForm.closeIcon} />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formState.isValid}
                            className={`flex items-center rounded-sm text-bold gap-2 bg-primary-500 !border-primary-500 text-white w-[120px] ${!formState.isValid ? 'bg-neutral-400 text-neutral-900 cursor-not-allowed !border-none' : ''}`}
                            data-testid={userForm.confirmButton}
                        >
                            <Save className="h-4 w-4" data-testid={userForm.saveIcon} />
                            Save
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
};

export default UserPage;