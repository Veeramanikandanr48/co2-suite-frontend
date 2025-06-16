"use client";

import { FormInput, FormDropdown, FormTextarea } from "@/components";
import { SubheadingDivider } from "@/components/reusables/sub-heading";
import { Button } from "@/components/ui/button";
import { userForm } from "@/components/test-ids/user-form";
import { UserFormSchema } from "@/lib/schemas";
import { FORM_DEFAULT_VALUES } from "@/lib/variables";
import { UserFormType } from "@/types/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { use, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Close, Save } from "@/components/svg";
import { RoleList, UserList } from "@/mock-data";
import { usePathname, useRouter } from "next/navigation";
import { DropdownOption } from "@/types";
import EventBus from "@/lib/eventbus";
import { UserResponse } from "@/types/users";
import { UnSavedDialog } from "@/components/reusables/dialogs/unsaved.dialog";
import { EAction } from "@/enums/base-enum";

const UserPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const currentRoute = usePathname();
    const requestHref = useRef<string | undefined>(undefined);
    const [showWarning, setShowWarning] = useState(false);
    const [roleOptions, setRoleOptions] = useState<DropdownOption[]>([]);
    const [action, setAction] = useState<EAction>(EAction.CREATE);

    const form = useForm<UserFormType>({
        defaultValues: FORM_DEFAULT_VALUES.userForm,
        resolver: zodResolver(UserFormSchema),
        mode: "onChange",
    });
    const { handleSubmit, formState } = form;
    const { isDirty } = formState;

    useEffect(() => {
        const roleOptions = RoleList.data?.map(role => ({
            id: role.id,
            label: role.roleName
        })) || [];
        setRoleOptions(roleOptions);
    }, []);

    useEffect(() => {
        if (id) {
            const user: UserResponse | undefined = UserList.data?.find(user => user.id === id);
            if (user) {
                form.reset(user);
                setAction(EAction.EDIT);
            }
        }
        return () => {
            setAction(EAction.CREATE);
        }
    }, [id, form])

    const onSubmit = async (data: UserFormType) => {
        const { name, email, roleId, description } = data;
        const roleName = RoleList.data?.find(role => role.id === Number(roleId))?.roleName;

        const newUser: UserResponse = {
            id: action === EAction.CREATE ? ((UserList.data?.length ?? 0) + 1).toString() : id,
            name,
            email,
            roleId: roleId,
            roleName: roleName ?? "",
            description: description ?? "",
        };
        if (action === EAction.CREATE) {
            UserList.data?.push(newUser);
        } else {
            const index = UserList.data?.findIndex(user => user.id === id) ?? -1;
            if (index !== -1) {
                UserList.data![index] = newUser;
            }
        }
        router.push('/user-access-management/all-users');
    };

    const handleCancel = (newHref: string | undefined = undefined) => {
        if (newHref) {
            requestHref.current = newHref;
        }
        if (isDirty) {
            setShowWarning(true);
        } else {
            router.push(requestHref.current ?? '/user-access-management/all-users');
        }
    };

    const handleWarningConfirm = () => {
        setShowWarning(false);
        router.push(requestHref.current ?? '/user-access-management/all-users');
    };

    const handleWarningCancel = () => {
        setShowWarning(false);
        requestHref.current = undefined;
    };

    useEffect(() => {
        EventBus.$on(`${currentRoute}`, handleCancel);
        return () => {
            EventBus.$off(`${currentRoute}`, handleCancel);
        }
    });

    return (
        <FormProvider {...form}>
            <SubheadingDivider>User Access Management</SubheadingDivider>
            <p className="text-base font-semibold text-header-secondary py-3 leading-tight capitalize">
                {action === EAction.CREATE ? 'Create User Details' : 'Edit User Details'}
            </p>

            <UnSavedDialog
                open={showWarning}
                title="Unsaved Changes"
                message="You will lose all your changes if you proceed."
                onConfirm={handleWarningConfirm}
                onCancel={handleWarningCancel}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-[calc(100vh-194px)]">
                <div className="relative w-full h-full bg-light-100 flex flex-col p-5 gap-4">
                    <div className="flex flex-col gap-4 py-4 px-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <FormInput
                                    name="name"
                                    label="Name"
                                    placeholder="Enter Name"
                                    className="w-[21.5rem]"
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
                                    className="w-[21.5rem]"
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
                                    className="w-[21.5rem]"
                                    vertical
                                    data-testid={userForm.roleInput}
                                />
                            </div>
                            <div>
                                <FormTextarea
                                    name="description"
                                    label="Description"
                                    placeholder="Enter Description"
                                    className="w-[21.5rem]"
                                    data-testid={userForm.descriptionInput}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-12 p-4 border-t-[1px] border-neutral-400 mt-auto">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleCancel()}
                            className="flex items-center rounded-sm gap-2 border-blue-600 text-blue-600 w-[120px]"
                            data-testid={userForm.cancelButton}
                        >
                            <Close className="h-4 w-4" data-testid={userForm.closeIcon} />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!formState.isValid || !isDirty}
                            className={`flex items-center rounded-sm text-bold gap-2 bg-primary-500 !border-primary-500 text-white w-[120px] ${!formState.isValid || !isDirty ? 'bg-neutral-400 text-neutral-900 cursor-not-allowed !border-none' : ''}`}
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