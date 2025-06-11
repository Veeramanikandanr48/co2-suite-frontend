"use client"

import { useRouter } from "next/navigation"
import { useFetchList } from "~/hooks/use-fetchlist"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableTable } from "~/components/reusables/form-fields/reusable-table"
import { Button } from "~/components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { User, RoleResponse } from "~/types/users"
import { useState, useEffect, useCallback, useMemo } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Checkbox } from "~/components/ui/checkbox"
import { API_LIST } from "~/lib/api-list"
import { apiService } from "~/lib/api-service"
import { cn, toCapitalizedWords } from "~/lib/utils"
import { SearchBar } from "~/components"
import { Filter, Trash } from "../svg"
import { CustomAxiosResponse } from "~/types"
import Image from "next/image"
import { DeleteDialog } from "../reusables/dialogs/delete"
import { useAuth } from "~/context/auth-provider"
import userTable from '../test-ids/user-table.test-id'
import { useLoader } from "@/context/loader-context";

const avatarBgClasses = [
    "bg-light-700",
    "bg-warning-600",
    "bg-light-600",
    "bg-blue-400",
    "bg-violet-300",
    "bg-pink-300",
    "bg-amber-300",
];

export function UsersTable() {
    const router = useRouter()
    const { user: currentUser } = useAuth()
    const [localSorting, setLocalSorting] = useState<{ field: string; direction: number }>({ field: '', direction: 1 })
    const [showFilter, setShowFilter] = useState(false)
    const [showCheckboxList] = useState(true)
    const [pendingRoleIds, setPendingRoleIds] = useState<number[]>([])
    const [initialRoles, setInitialRoles] = useState<{ id: number; name: string }[]>([])
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [appliedRoleIds, setAppliedRoleIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { showLoader, hideLoader } = useLoader();
    const {
        list: users,
        setSearch,
        setSorting,
        setAdditionalFilter,
        loadMore,
        isLoadingMore,
        refetch
    } = useFetchList<User>(`${API_LIST.GET_ALL_USERS}?isAll=false&profile=true`);

    const hasUsers: boolean = users?.length > 1;

    // Fetch roles from API
    const fetchRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            const response: CustomAxiosResponse<RoleResponse> = await apiService.get(`${API_LIST.GET_ROLE_FILTER}?filter=true`);
            if (response.data) {
                const roles = response.data.map((role: { id: number; rolename: string }) => ({
                    id: role.id,
                    name: role.rolename
                }));
                setInitialRoles(roles);
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    useEffect(() => {
        if (isLoading) {
            showLoader();
        } else {
            hideLoader();
        }
    }, [isLoading, showLoader, hideLoader]);

    // Memoize role filter handler
    const handleRoleFilterChange = useCallback((roleId: number, checked: boolean) => {
        const newPendingRoleIds = checked
            ? [...pendingRoleIds, roleId]
            : pendingRoleIds.filter(id => id !== roleId);
        setPendingRoleIds(newPendingRoleIds);
    }, [pendingRoleIds]);

    // Memoize clear filter handler
    const handleClearFilter = useCallback(() => {
        setPendingRoleIds([]);
    }, []);

    // Memoize apply filter handler
    const handleApplyFilter = useCallback(async () => {
        if (pendingRoleIds.length > 0) {
            setAdditionalFilter({ roleId: pendingRoleIds });
            setAppliedRoleIds(pendingRoleIds);
        } else {
            setAdditionalFilter({});
            setAppliedRoleIds([]);
        }
        setShowFilter(false);
        refetch();
    }, [pendingRoleIds, setAdditionalFilter, refetch]);

    // Handle dropdown close
    const handleDropdownClose = useCallback(() => {
        if (JSON.stringify(pendingRoleIds) !== JSON.stringify(appliedRoleIds)) {
            setPendingRoleIds(appliedRoleIds);
        }
    }, [pendingRoleIds, appliedRoleIds]);

    // Memoize sort handler
    const handleColumnSort = useCallback((field: string) => {
        const newDirection = localSorting.field === field ? -localSorting.direction : 1;
        setLocalSorting({ field, direction: newDirection });
        setSorting(field);
    }, [localSorting, setSorting]);

    // Memoize row click handler
    const handleRowClick = useCallback((userId: string) => {
        router.push(`/user-access-management/all-users/${userId}`);
    }, [router]);

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            setIsLoading(true)
            await apiService.put(API_LIST.DELETE_USER, userToDelete.id, undefined, {
                headers: {
                    'X-Skip-Toast': 'false'
                }
            });
            setDeleteDialogOpen(false);
            setUserToDelete(null);
            refetch();
            await fetchRoles();
        } catch {
        } finally {
            setIsLoading(false)
        }
    };

    // Memoize table columns
    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: "name",
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            size: 433,
            header: () => (
                <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-neutral-400">Users</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => hasUsers && handleColumnSort("firstName")}
                        disabled={!hasUsers}
                        data-testid={userTable.sortNameButton}
                    >
                        <ArrowUpDown className={`h-4 w-4 ${!hasUsers ? 'stroke-gray-600' : 'stroke-neutral-400'}`} />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const profileBuffer = row.original.profilePath;
                let base64Image = '';

                if (profileBuffer && typeof profileBuffer === 'object' && 'data' in profileBuffer) {
                    try {
                        base64Image = Buffer.from(profileBuffer.data).toString('base64');
                    } catch {
                    }
                }

                return (
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-600 font-medium ${!profileBuffer && avatarBgClasses[row.index % avatarBgClasses.length]
                                }`}
                        >
                            {profileBuffer ? (
                                <Image
                                    src={typeof profileBuffer === 'string'
                                        ? profileBuffer
                                        : `data:image/jpeg;base64,${base64Image}`
                                    }
                                    alt={`${row.original.firstName} ${row.original.lastName}`}
                                    width={32}
                                    height={32}
                                    className="rounded-full object-cover"
                                    unoptimized={typeof profileBuffer !== 'string'}
                                    style={{ width: '32px', height: '32px' }}
                                />
                            ) : (
                                `${row.original.firstName?.[0] || ''}${row.original.lastName?.[0] || ''}`.toUpperCase()
                            )}
                        </div>
                        <div className="flex flex-col gap-2 text-neutral-400 text-xs" data-testid={userTable.userName}>
                            <span>{toCapitalizedWords(`${row.original.firstName || ''} ${row.original.lastName || ''}`)}</span>
                            <span data-testid={userTable.userId}>{row.original.userId || ''}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            id: "role",
            accessorKey: "rolename",
            size: 433,
            header: () => (
                <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-neutral-400">User Roles</span>
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center px-3">
                    <span className="text-xs font-normal text-neutral-400" data-testid={userTable.userRole}>{row.original.roleName}</span>
                </div>
            ),
        },
        {
            id: "actions",
            size: 100,
            cell: ({ row }) => {
                const isCurrentUser = currentUser?.id?.toString() === row.original.id?.toString();
                return (
                    <button
                        className={cn(
                            "h-full w-full flex items-center justify-center",
                            isCurrentUser && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={e => {
                            e.stopPropagation();
                            if (!isCurrentUser) {
                                handleDeleteClick(row.original);
                            }
                        }}
                        disabled={isCurrentUser}
                        data-testid={userTable.deleteButton}
                    >
                        <Trash className={cn(
                            "h-[17px] w-[17px]",
                            isCurrentUser ? "stroke-neutral-300" : "stroke-negative-300"
                        )} data-testid={userTable.deleteButton} />
                    </button>
                );
            },
            header: "",
        },
    ], [handleColumnSort, hasUsers, currentUser]);

    return (
        <div className="space-y-4 h-[calc(100vh-300px)] ">
            <div className="flex items-center gap-2 justify-end -mt-20 ">
                <div className="">
                    <DropdownMenu
                        open={showFilter}
                        onOpenChange={(open) => {
                            setShowFilter(open);
                            if (!open) {
                                handleDropdownClose();
                            }
                        }}
                        data-testid={userTable.dropdownMenu}
                    >
                        <DropdownMenuTrigger asChild data-testid={userTable.filterTrigger}>
                            <Button
                                className={cn(
                                    "relative p-2 rounded-lg focus-visible:ring-0 border-neutral-300 border-[1px] w-[32px] h-[30px]",
                                    (showFilter || appliedRoleIds.length > 0) && "border border-primary bg-blue-400 stroke-primary",
                                    !showFilter && appliedRoleIds.length === 0 && "bg-white"
                                )}
                            >
                                <Filter
                                    className="w-4 h-4"
                                    stroke={showFilter || appliedRoleIds.length > 0 ? 'var(--primary)' : 'var(--neutral-400)'}
                                    data-testid={userTable.filterTrigger}
                                />
                                {appliedRoleIds.length > 0 && (
                                    <span className="absolute -top-2 -right-2 w-[18px] h-[18px] text-[9px] font-semibold flex items-center justify-center bg-blue-200 text-filter-icon rounded-md" >
                                        {appliedRoleIds.length}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        {showFilter && (
                            <DropdownMenuContent
                                align="end"
                                className="w-[196px] h-[190px] bg-white rounded-lg shadow-lg border border-neutral-100 flex flex-col"
                                data-testid={userTable.filterContent}
                            >
                                {/* Fixed Header */}
                                <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                                    <div className="flex items-center gap-2">
                                        <p className="font-normal text-xs text-neutral-500">User Roles</p>
                                        {pendingRoleIds.length > 0 && (
                                            <div className="flex items-center gap-1 bg-blue-200 rounded-md px-1 h-4 w-4 justify-center">
                                                <span className="text-xs font-medium text-filter-icon text-[8px]">{pendingRoleIds.length}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Scrollable Checkbox List */}
                                {showCheckboxList && (
                                    <div
                                        className="flex-1 overflow-y-auto divide-y p-4
                                          [&::-webkit-scrollbar]:w-2
                                          [&::-webkit-scrollbar-thumb]:rounded-full 
                                          [&::-webkit-scrollbar-track]:bg-gray-100 
                                          [&::-webkit-scrollbar-thumb]:bg-gray-300 
                                          hover:[&::-webkit-scrollbar-thumb]:bg-gray-400"
                                    >
                                        {initialRoles.map((role) => (
                                            <div key={role.id} className="flex items-center space-x-2 mb-4 last:mb-0 border-none">
                                                <Checkbox
                                                    id={role.id.toString()}
                                                    checked={pendingRoleIds.includes(role.id)}
                                                    onCheckedChange={(checked) => handleRoleFilterChange(role.id, checked as boolean)}
                                                    className="w-4 h-4 border-neutral-500"
                                                    data-testid={userTable.roleCheckbox}
                                                />
                                                <label
                                                    htmlFor={role.id.toString()}
                                                    className="font-normal text-xs text-neutral-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize max-w-[120px] overflow-hidden break-words line-clamp-1"
                                                    data-testid={userTable.roleCheckbox}
                                                >
                                                    {role.name}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <hr />
                                <div className="flex justify-end gap-4 items-center px-4 py-1 rounded-b-lg bg-white">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilter}
                                        className={cn(
                                            "font-normal text-base text-gray-500 px-0 hover:bg-transparent hover:text-gray-500",
                                            pendingRoleIds.length === 0 && "opacity-50"
                                        )}
                                        disabled={pendingRoleIds.length === 0}
                                        data-testid={userTable.filterClearButton}
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        className="text-blue-600 font-normal text-base px-0 hover:bg-transparent hover:text-blue-600"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleApplyFilter}
                                        data-testid={userTable.filterDoneButton}
                                    >
                                        Done
                                    </Button>
                                </div>
                            </DropdownMenuContent>
                        )}

                    </DropdownMenu>
                </div>
                <SearchBar
                    placeholder="Search User Roles"
                    onSearch={setSearch}
                    data-testid={userTable.searchBar}
                    className="placeholder:italic placeholder:text-input-placeholder placeholder:font-normal placeholder:text-xs font-normal text-input-label w-[200px]"
                />

            </div>

            <ReusableTable
                data={users}
                columns={columns}
                isLoadingMore={isLoadingMore}
                handleLoadMore={loadMore}
                onRowClick={handleRowClick}
                tableHeight="calc(100vh - 210px)"
                data-testid={userTable.reusableTable}
            />
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteUser}
                onCancel={() => setDeleteDialogOpen(false)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                title={`Delete Item?`}
                message={`Are you sure you want to delete ${userToDelete?.firstName ?? ''} ${userToDelete?.lastName ?? ''}?<br />This action cannot be undone.`}
                data-testid={userTable.deleteDialog}
            />
        </div>
    );
}
