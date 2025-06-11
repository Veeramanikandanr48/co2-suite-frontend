'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Resolver, FormProvider } from "react-hook-form";
import { useMemo, useCallback, useState, useEffect, useRef, use } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserFormData, Mode, Role, UserDetailsResponse } from "~/types/users";
import { UserFormSchema, EditUserFormSchema } from "~/lib/schemas";
import FormInput from "~/components/reusables/form-fields/form-input";
import FormDropdown from "~/components/reusables/form-fields/form-dropdown";
import { ModeSection } from "~/components/all-users/mode-section";
import { ProfilePicture } from "~/components/all-users/profile-picture";
import { Form } from "~/components/ui/form";
import { FORM_DEFAULT_VALUES } from "@/lib/variables";
import { ChevronRight, CirclePlus, X } from "lucide-react";
import { API_LIST } from "~/lib/api-list";
import { apiService } from "~/lib/api-service";
import { CREATE_USER_TEST_IDS } from "~/components/test-ids/create-user.ids";
import { UnSavedDialog } from "~/components/reusables/dialogs/unsaved.dialog";
import { useLoader } from "@/context/loader-context";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/context/auth-provider";
import type { User } from "~/context/auth-provider";
import SaveIcon from "~/components/svg/save";
import Pencil from "~/components/svg/pencil";
import { CustomAxiosResponse } from "~/types";
import EventBus from "~/components/composables/eventbus";
import ReactPasswordChecklist from "react-password-checklist";

const defaultFormValues: UserFormData = FORM_DEFAULT_VALUES.userForm;
const formFields = [
    { name: "firstName", label: "First Name *", type: "text" },
    { name: "lastName", label: "Last Name *", type: "text" },
    { name: "userId", label: "User ID *", type: "text" },
    { name: "email", label: "Email ID *", type: "email" },
    { name: "password", label: "Enter Password *", type: "password" },
    { name: "confirmPassword", label: "Confirm Password *", type: "password" },
] as const;

export default function UserPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
    const resolvedParams = use(params);
    const router = useRouter();
    const { user: currentUser, updateUser } = useAuth();
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [hasProfilePictureChanged, setHasProfilePictureChanged] = useState(false);
    const [isRemovingProfilePicture, setIsRemovingProfilePicture] = useState(false);
    const [currentFormData, setCurrentFormData] = useState<Partial<UserFormData>>();
    const [isFromBackArrow, setIsFromBackArrow] = useState(false);
    const { showLoader, hideLoader } = useLoader();
    const isCreateMode = resolvedParams.id === 'create';
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef<{ reset: (data: UserFormData) => void }>({ reset: () => { } });
    const currentRoute: string = usePathname();
    const requestHref = useRef<string | undefined>(undefined);

    const form = useForm<UserFormData>({
        resolver: zodResolver(isCreateMode ? UserFormSchema : EditUserFormSchema) as Resolver<UserFormData>,
        defaultValues: { ...defaultFormValues },
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const [showPasswordChecklist, setShowPasswordChecklist] = useState(false);
    const [showConfirmPasswordChecklist, setShowConfirmPasswordChecklist] = useState(false);
    const { watch } = form;
    const password = watch("password");
    const confirmPassword = watch("confirmPassword");

    // Check if user is editing their own profile
    const isEditingOwnProfile = useMemo(() => {
        return currentUser?.id?.toString() === resolvedParams.id?.toString();
    }, [currentUser?.id, resolvedParams.id]);

    const convertBufferToFile = (buffer: { type: 'Buffer', data: number[] }): File => {
        const uint8Array = new Uint8Array(buffer.data);

        const signatures: Record<string, { mimeType: string, pattern: number[] }> = {
            jpeg: { mimeType: 'image/jpeg', pattern: [0xFF, 0xD8] },
            gif: { mimeType: 'image/gif', pattern: [0x47, 0x49, 0x46] },
            png: { mimeType: 'image/png', pattern: [0x89, 0x50, 0x4E, 0x47] },
            webp: { mimeType: 'image/webp', pattern: [0x52, 0x49, 0x46, 0x46] }
        };

        const match = Object.values(signatures).find(({ pattern }) =>
            pattern.every((byte, index) => uint8Array[index] === byte)
        );

        const mimeType = match?.mimeType ?? 'image/png';
        const blob = new Blob([uint8Array], { type: mimeType });
        const extension = mimeType.split('/')[1];

        return new File([blob], `profile.${extension}`, { type: mimeType });
    };

    useEffect(() => {
        formRef.current = form;
    }, [form]);

    const { handleSubmit, setValue } = form;

    const currentProfilePicture = watch("profilePicture");
    const handlePasswordClick = (fieldName: 'password' | 'confirmPassword') => {
        if (!isCreateMode && form.getValues()[fieldName] === "********") {
            setValue(fieldName, "");
        }
    };

    const allModes = useMemo(() => {
        if (!roles.length) return [];

        const uniqueModes = new Map<number, Mode>();
        roles.forEach(role => {
            role.permissions.forEach(permission => {
                if (!permission?.modeId) return;
                if (!uniqueModes.has(permission.modeId)) {
                    uniqueModes.set(permission.modeId, {
                        id: permission.modeId,
                        name: permission.permissionName || '',
                        permissions: [{
                            modeId: permission.modeId,
                            permissionId: permission.permissionId,
                            permissionName: permission.permissionName,
                            abbrevation: permission.abbrevation,
                            styles: permission.styles
                        }]
                    });
                }
            });
        });
        return Array.from(uniqueModes.values());
    }, [roles]);

    const selectedRoleId = watch("roleId");
    const selectedRole = useMemo(() =>
        roles.find((role: Role) => role.id === Number(selectedRoleId)),
        [selectedRoleId, roles]
    );

    const hasAccessToMode = useCallback((modeId: number) => {
        if (!selectedRole) return false;
        return selectedRole.permissions.some(permission => permission.modeId === modeId);
    }, [selectedRole]);

    const handleProfilePictureUpload = (data: UserFormData, formData: FormData) => {
        if (data.profilePicture instanceof File) {
            formData.append('file', data.profilePicture);
        } else if (typeof data.profilePicture === 'string' && data.profilePicture.startsWith('data:image')) {
            const base64Data = data.profilePicture.split(',')[1];
            const byteArray = new Uint8Array(atob(base64Data).split('').map(c => c.charCodeAt(0)));
            const blob = new Blob([byteArray], { type: 'image/png' });
            formData.append('file', blob, 'profile.png');
        }
    };

    const updateCurrentUserProfile = useCallback((data: UserFormData) => {
        if (!isEditingOwnProfile || !currentUser) return;

        const updatedUserData: User = {
            id: currentUser.id,
            userName: currentUser.userName,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            userId: currentUser.userId,
            idpId: currentUser.idpId,
            profilePath: (() => {
                if (isRemovingProfilePicture) return null;
                if (hasProfilePictureChanged && data.profilePicture instanceof File) {
                    return URL.createObjectURL(data.profilePicture);
                }
                return currentUser.profilePath;
            })(),
            roleId: currentUser.roleId
        };
        updateUser(updatedUserData);
    }, [isEditingOwnProfile, currentUser, isRemovingProfilePicture, hasProfilePictureChanged, updateUser]);

    const handleFormSubmit = useCallback(async (data: UserFormData) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();

            // Add basic user data
            formData.append('firstName', data.firstName);
            formData.append('lastName', data.lastName);
            formData.append('email', data.email);
            formData.append('userId', data.userId);
            formData.append('roleId', `[${data.roleId}]`);

            if (data.password && data.password !== "") {
                formData.append('hashedPassword', data.password);
            }

            let response;
            if (isCreateMode) {
                // Only append profile picture if it exists
                if (data.profilePicture) {
                    handleProfilePictureUpload(data, formData);
                }
                response = await apiService.post<{ success: boolean }>(API_LIST.REGISTER_USER, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'X-Skip-Toast': 'false' }
                });
            } else {
                if (hasProfilePictureChanged && data.profilePicture) {
                    formData.append('file', data.profilePicture);
                }
                if (isRemovingProfilePicture) {
                    formData.append('removeProfilePicture', JSON.stringify(isRemovingProfilePicture));
                }

                response = await apiService.put<{ success: boolean }>(API_LIST.UPDATE_USER_DETAILS, resolvedParams.id, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'X-Skip-Toast': 'false'
                    }
                });
            }

            if (response.success) {
                if (!isCreateMode) {
                    updateCurrentUserProfile(data);
                    setIsEditing(false);
                    setHasProfilePictureChanged(false);
                    setIsRemovingProfilePicture(false);
                }
                router.push('/user-access-management/all-users');
            }
        } catch {
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    }, [isCreateMode, resolvedParams.id, router, hasProfilePictureChanged, isRemovingProfilePicture, updateCurrentUserProfile]);

    const renderRoleSection = useMemo(() => {
        const roleOptions = roles.map((role: Role) => ({
            id: role.id,
            label: role.rolename
        }));

        return (
            <div className="flex flex-col gap-4 bg-white rounded-md p-5">
                <div className="flex justify-center items-center mr-6 pb-2">
                    <p className="text-sm font-medium w-20 text-black">User Role</p>
                    <hr className="bg-neutral-300 w-full h-[2px] pb-[1px] gap-2" />
                </div>
                <div className="flex items-center justify-start pt-2 mr-6">
                    <div className="flex items-center gap-20">
                        <FormDropdown
                            name="roleId"
                            label="Assign User Role *"
                            placeholder="User Roles"
                            options={roleOptions}
                            disabled={!isCreateMode && !isEditing}
                            vertical
                            className="w-[21.5rem] bg-white rounded-[9.21px] [&>svg]:w-[21.24px] [&>svg]:h-[21.24px] [&>svg]:!stroke-neutral-400 placeholder:text-neutral-600"
                        />
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-neutral-600">Permissions</p>
                            <div className="flex gap-[29px] pl-2">
                                {allModes.map((mode: Mode) => (
                                    <ModeSection
                                        key={mode.id}
                                        mode={mode}
                                        isDisabled={!hasAccessToMode(Number(mode.id))}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [roles, isCreateMode, isEditing, allModes, hasAccessToMode]);

    const hasFormChanges = useCallback(() => {
        // Check form changes and profile picture changes
        const formDirty = form.formState.isDirty;
        const profileChanged = hasProfilePictureChanged || isRemovingProfilePicture;

        // In create mode, check if any field has been filled or profile picture added
        if (isCreateMode) {
            const formData = form.getValues();
            const hasAnyValue = Object.entries(formData).some(([key, value]) => {
                // Skip password fields if they're empty (they're required but not changed yet)
                if ((key === 'password' || key === 'confirmPassword') && value === '') {
                    return false;
                }
                // Skip empty values and compare with default values
                if (value === undefined || value === '') {
                    return false;
                }
                // Compare with default values
                return value !== defaultFormValues[key as keyof UserFormData];
            });
            return hasAnyValue || profileChanged;
        }

        // In edit mode, check if profile picture is different from original
        if (!isCreateMode && currentFormData) {
            const currentProfile = form.getValues().profilePicture;
            const originalProfile = currentFormData.profilePicture;
            const profileIsDifferent = currentProfile !== originalProfile;

            // If only profile picture has changed, consider it as a change
            if (!formDirty && (profileChanged || profileIsDifferent)) {
                return true;
            }

            return formDirty || profileChanged || profileIsDifferent;
        }

        return formDirty || profileChanged;
    }, [form, hasProfilePictureChanged, isRemovingProfilePicture, isCreateMode, currentFormData]);

    const handleBackClick = () => {
        if (hasFormChanges()) {
            setIsFromBackArrow(true);
            setShowConfirmDialog(true);
        } else {
            router.push("/user-access-management/all-users");
        }
    };

    const handleDontSave = () => {
        setShowConfirmDialog(false);
        if (isFromBackArrow) {
            router.push("/user-access-management/all-users");
        } else if (isCreateMode) {
            router.push(requestHref.current ?? '/user-access-management/all-users');
        } else {
            setIsEditing(false);
            form.reset(currentFormData);
            setHasProfilePictureChanged(false);
            setIsRemovingProfilePicture(false);
            router.push(requestHref.current ?? "/user-access-management/all-users");
        }
    };

    const getTestIdForField = (fieldName: string): string | undefined => {
        const fieldToTestIdMap: Record<string, string> = {
            firstName: CREATE_USER_TEST_IDS.FIRST_NAME_INPUT,
            lastName: CREATE_USER_TEST_IDS.LAST_NAME_INPUT,
        };
        return fieldToTestIdMap[fieldName];
    };

    const handleRemoveProfilePicture = useCallback(() => {
        form.setValue("profilePicture", undefined, {
            shouldDirty: true,
            shouldValidate: true
        });
        setIsRemovingProfilePicture(true);
        setHasProfilePictureChanged(true);
    }, [form]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = (newHref: string | undefined = undefined) => {
        if (newHref) {
            requestHref.current = newHref;
        }
        if (hasFormChanges()) {
            setIsFromBackArrow(false);
            setShowConfirmDialog(true);
        } else {
            router.push(requestHref.current ?? "/user-access-management/all-users");
        }
    };

    useEffect(() => {
        EventBus.$on(`${currentRoute}`, handleCancel);
        return () => {
            EventBus.$off(`${currentRoute}`, handleCancel);
        };
    });

    const shouldEnableSubmitButton = useCallback(() => {
        if (isSubmitting) return false;
        if (!form.formState.isValid) return false; 
        const formData = form.getValues();
    
        // In create mode, profile picture is optional
        if (isCreateMode) {
            const requiredFields = ['firstName', 'lastName', 'userId', 'email', 'password', 'confirmPassword', 'roleId'];
            const hasAllRequiredFields = requiredFields.every(field => {
                const value = formData[field as keyof UserFormData];
                return value !== undefined && value !== '';
            });
            return hasAllRequiredFields;
        }
    
        // New validation: In edit mode, if password is being changed, confirmPassword should not be empty
        if (formData.password && formData.password !== '') {
            if (!formData.confirmPassword || formData.confirmPassword === '') {
                return false; // Disable button if confirmPassword is empty when password is entered
            }
        }
    
        // In edit mode, check if there are any changes
        if (!hasFormChanges()) return false;
        return true;
    }, [isSubmitting, hasFormChanges, isCreateMode, form]);

    const fetchUserData = useCallback(async () => {
        if (isCreateMode) return;

        try {
            setIsLoading(true);
            const response: CustomAxiosResponse<UserDetailsResponse> = await apiService.getById(API_LIST.GET_USER_DETAILS, resolvedParams.id);

            let profilePicture;
            const profilePath = response.data.profilePath;
            if (profilePath && typeof profilePath === 'object' && 'type' in profilePath && profilePath.type === 'Buffer' && Array.isArray(profilePath.data)) {
                try {
                    profilePicture = convertBufferToFile(profilePath as { type: 'Buffer', data: number[] });
                } catch {
                }
            }

            const userData = {
                ...response.data,
                roleId: response.data.roleId,
                password: "",
                confirmPassword: "",
                profilePath: response.data.profilePath,
                profilePicture
            };

            formRef.current?.reset(userData);
            setCurrentFormData(userData);
        } catch {
        } finally {
            setIsLoading(false);
        }
    }, [isCreateMode, resolvedParams.id]);

    const fetchRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get<Role[]>(API_LIST.GET_ROLES_WITH_PERMISSIONS);
            if (response?.data) {
                setRoles(response.data);
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
        if (!isCreateMode) {
            fetchUserData();
        }
    }, [fetchRoles, fetchUserData, isCreateMode]);

    useEffect(() => {
        if (isLoading) {
            showLoader();
        } else {
            hideLoader();
        }
    }, [isLoading, showLoader, hideLoader]);

    // Add this function to handle password field focus
    const handlePasswordFocus = (field: 'password' | 'confirmPassword') => {
        if (field === 'password') {
            setShowPasswordChecklist(true);
        } else {
            setShowConfirmPasswordChecklist(true);
        }
    };

    // Add this function to handle password field blur
    const handlePasswordBlur = (field: 'password' | 'confirmPassword') => {
        if (field === 'password') {
            setShowPasswordChecklist(false);
        } else {
            setShowConfirmPasswordChecklist(false);
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex flex-col">
                <p className="font-semibold text-lg leading-7 tracking-normal capitalize text-title-color">User Access Management</p>
                <hr className="bg-neutral-300 w-full h-0.5 my-4 pb-0.25 gap-2" />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-md text-neutral-500 font-semibold mb-3">
                    <button
                        type="button"
                        onClick={handleBackClick}
                        className="text-md text-neutral-500 font-semibold"
                    >
                        All Users
                    </button>
                    <ChevronRight className="w-7 h-7" />
                    <span>{isCreateMode ? 'Create User' : 'User Profile'}</span>
                </div>
                
            </div>

            {!isCreateMode && (
                    <div className="flex justify-end gap-2 pb-3">
                        {isEditing ? (
                            <>
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    className="bg-white w-[130px] h-[38px] px-6 py-3 gap-2"
                                    onClick={() => handleCancel()}
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-sm font-medium">Cancel</span>
                                </Button>
                                <Button
                                    type="submit"
                                    form="user-form"
                                    className="bg-blue-700 text-white w-[130px] h-[38px] px-6 py-3 gap-2 disabled:button-disabled"
                                    disabled={!shouldEnableSubmitButton()}
                                >
                                    <SaveIcon className="w-4 h-4" stroke={!shouldEnableSubmitButton() ? 'var(--neutral-700)' : 'white'} />
                                    <span className="text-sm font-medium">Save</span>
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                variant="default"
                                className="bg-blue-700 text-white w-[130px] h-[38px] px-6 py-3 gap-2 rounded-md border"
                                onClick={handleEditClick}
                            >
                                <Pencil className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit Profile</span>
                            </Button>
                        )}
                    </div>
                )}

            <FormProvider {...form}>
                <Form {...form}>
                    <form id="user-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-[8px]" data-testid={CREATE_USER_TEST_IDS.USER_FORM}>
                        <div className="flex flex-col gap-4 bg-white rounded-md p-6">
                            <div className="flex justify-center items-center mr-6">
                                <p className="text-sm font-medium w-28 text-black">Basic Details</p>
                                <hr className="bg-neutral-300 w-full h-[2px] pb-[1px] gap-2" />
                            </div>
                            <div className="flex items-start gap-8 pt-2 mr-6 pb-6">
                                <ProfilePicture
                                    name="profilePicture"
                                    imageUrl={currentProfilePicture}
                                    disabled={!isCreateMode && !isEditing}
                                    onFileChange={() => {
                                        setHasProfilePictureChanged(true);
                                        setIsRemovingProfilePicture(false);
                                    }}
                                    isEditing={isCreateMode || isEditing}
                                    onRemove={handleRemoveProfilePicture}
                                />
                                <div className="grid grid-cols-2 gap-x-12 gap-y-8 w-[48rem]">
                                    {formFields.map((field) => (
                                        <div key={field.name} className="relative">
                                            <FormInput
                                                key={field.name}
                                                name={field.name}
                                                label={field.label}
                                                placeholder={!isCreateMode && (field.name === 'password' || field.name === 'confirmPassword')
                                                    ? "********"
                                                    : field.label.split("*")[0]}
                                                type={field.type}
                                                disabled={!isCreateMode && !isEditing}
                                                vertical
                                                labelClassName="text-[12.5px] text-input-label font-normal leading-[22.5px]"
                                                className={`placeholder:italic text-sm h-[2.38rem] w-[22.5rem] rounded-[9.04px] border border-input-placeholder ${!isCreateMode && (field.name === 'password' || field.name === 'confirmPassword')
                                                        ? 'placeholder:text-neutral-400'
                                                        : ''
                                                    }`}
                                                onClick={() => {
                                                    if (field.name === 'password' || field.name === 'confirmPassword') {
                                                        handlePasswordClick(field.name);
                                                    }
                                                }}
                                                onFocus={() => {
                                                    if (field.name === 'password' || field.name === 'confirmPassword') {
                                                        handlePasswordFocus(field.name);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    if (field.name === 'password' || field.name === 'confirmPassword') {
                                                        handlePasswordBlur(field.name);
                                                    }
                                                }}
                                                autoComplete={field.name === 'password' || field.name === 'confirmPassword' ? 'new-password' : 'off'}
                                                autoCorrect="off"
                                                autoCapitalize="off"
                                                spellCheck="false"
                                                data-testid={getTestIdForField(field.name)}
                                            />
                                            {field.name === 'password' && showPasswordChecklist && password && (
                                                <div className="absolute z-10 mt-1 p-3 bg-white border rounded-md shadow-lg">
                                                    <ReactPasswordChecklist
                                                        rules={["minLength", "specialChar", "number", "capital"]}
                                                        minLength={8}
                                                        value={password}
                                                        messages={{
                                                            minLength: "Password has at least 8 characters",
                                                            specialChar: "Password has special characters",
                                                            number: "Password has a number",
                                                            capital: "Password has a capital letter",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            {field.name === 'confirmPassword' && showConfirmPasswordChecklist && confirmPassword && (
                                                <div className="absolute z-10 mt-1 p-3 bg-white border rounded-md shadow-lg">
                                                    <ReactPasswordChecklist
                                                        rules={["match"]}
                                                        value={password}
                                                        valueAgain={confirmPassword}
                                                        messages={{
                                                            match: "Passwords match",
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {renderRoleSection}

                        {isCreateMode && (
                            <div className="flex justify-end items-end gap-4 py-3 px-10 bg-light-100 rounded-md">
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    className="bg-white w-[8.15rem] h-[2.4rem]"
                                    onClick={handleBackClick}
                                >
                                    <X className="w-4 h-4" />
                                    <span className="text-primary-500">Cancel</span>
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-[8.15rem] h-[2.4rem] disabled:button-disabled"
                                    disabled={!shouldEnableSubmitButton()}
                                >
                                    <CirclePlus className="w-4 h-4" />
                                    <span>Create</span>
                                </Button>
                            </div>
                        )}
                    </form>
                </Form>
            </FormProvider>

            <UnSavedDialog
                open={showConfirmDialog}
                title="Unsaved Changes"
                message="You will lose all your changes if you proceed."
                onConfirm={handleDontSave}
                onCancel={() => setShowConfirmDialog(false)}
            />
        </div>
    );
} 