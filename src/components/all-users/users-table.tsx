import { useRouter } from "next/navigation"
import { useFetchList } from "~/hooks/use-fetchlist"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableTable } from "@/components/reusables/reusable-table"
import { Button } from "~/components/ui/button"
import { ArrowUpDown, Info } from "lucide-react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { API_LIST } from "~/lib/api-list"
import { SearchBar } from "~/components"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { Checkbox } from "~/components/ui/checkbox"
import { cn } from "~/lib/utils"
import { Filter } from "../svg"
import { RoleResponse, UserResponse as UserTable } from "~/types/users"
import { apiService } from "~/lib/api-service"
import { allUser } from "../test-ids/all-users.ids"
import { useLoader } from "@/context/loader-context";

interface RoleFilter {
    id: number;
    name: string;
}

interface RolesTableProps {
    onBackClick?: () => void;
}

interface RoleColumnsProps {
    hasUsers: boolean;
    handleColumnSort: (field: string) => void;
    handleRowClick: (roleId: string) => void;
}

const NameHeader = ({ hasUsers, handleColumnSort }: { hasUsers: boolean; handleColumnSort: (field: string) => void }) => (
    <div className="flex flex-col w-full">
        <div className="flex justify-between items-center w-full">
            <span className="font-bold text-neutral-500 text-sm">User Role</span>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => hasUsers && handleColumnSort("roleName")}
                disabled={!hasUsers}
                data-testid={allUser.sortUserRoleButton}
            >
                <ArrowUpDown className={`h-4 w-4 ${!hasUsers ? 'stroke-gray-600' : 'stroke-neutral-400'}`} />
            </Button>
        </div>
        <div className="h-6"></div>
    </div>
);

const DescriptionHeader = () => (
    <div className="flex flex-col w-full">
        <div className="flex gap-1 text-sm text-neutral-500 font-bold">
            Description
        </div>
        <div className="h-6"></div>
    </div>
);

const ActionsHeader = () => (
    <div className="flex justify-center w-full">
        <span className="text-neutral-500 font-bold">
            <Info className="w-[17px] h-[17px]" />
        </span>
    </div>
);

const NameCell = ({ row }: { row: { original: UserTable } }) => (
    <span className="font-medium text-xs text-neutral-500 text-normal pl-2" data-testid={allUser.userRoleColumn}>
        {row.original.name ?? '-'}
    </span>
);

const DescriptionCell = ({ row }: { row: { original: UserTable } }) => (
    <div className="pl-2">
        <span className="text-[10px] text-gray-600 break-words font-normal py-6 leading-[12px] line-clamp-3" data-testid={allUser.descriptionColumn}>
            {row.original.description ?? '-'}
        </span>
    </div>
);

const ActionsCell = ({ row, handleRowClick }: { row: { original: UserTable }; handleRowClick: (roleId: string) => void }) => (
    <div className="flex justify-center w-full">
        <button
            className="text-[10px] text-blue-600 underline font-normal"
            onClick={() => row.original?.id && handleRowClick(row.original.id.toString())}
            data-testid={`view-more-button-${row.original?.id}`}
        >
            View more...
        </button>
    </div>
);

const useRoleColumns = ({ hasUsers, handleColumnSort, handleRowClick }: RoleColumnsProps) => {
    return useMemo<ColumnDef<UserTable>[]>(() => [
        {
            id: "name",
            accessorKey: "name",
            size: 159,
            header: () => <NameHeader hasUsers={hasUsers} handleColumnSort={handleColumnSort} />,
            cell: ({ row }) => <NameCell row={row} />,
        },
        {
            id: "description",
            accessorKey: "description",
            size: 317,
            header: DescriptionHeader,
            cell: ({ row }) => <DescriptionCell row={row} />,
        },
        {
            id: "actions",
            size: 185,
            header: ActionsHeader,
            cell: ({ row }) => <ActionsCell row={row} handleRowClick={handleRowClick} />,
        },
    ], [hasUsers, handleColumnSort, handleRowClick]);
};

export function UsersTable({ onBackClick }: Readonly<RolesTableProps>) {
    const router = useRouter()
    const [localSorting, setLocalSorting] = useState<{ field: string; direction: number }>({ field: '', direction: 1 })
    const [showFilter, setShowFilter] = useState(false)
    const [showCheckboxList] = useState(true)
    const [pendingRoleIds, setPendingRoleIds] = useState<number[]>([])
    const [initialRoles, setInitialRoles] = useState<RoleFilter[]>([])
    const [appliedRoleIds, setAppliedRoleIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(false)
    const { showLoader, hideLoader } = useLoader();

    const {
        list: roles = [],
        setSearch,
        setSorting,
        setAdditionalFilter,
        loadMore,
        isLoadingMore,
        refetch
    } = useFetchList<UserTable>(API_LIST.GET_ALL_USERS);

    const hasUsers: boolean = roles?.length > 1;

    const fetchRoles = async () => {
        try {
            setIsLoading(true);
            const response = await apiService.get<RoleResponse[]>(API_LIST.GET_ROLE_FILTER);
            if (response?.data?.length) {
                const validRoles = response.data
                    .filter((role) =>
                        role?.id != null &&
                        typeof role.roleName === 'string'
                    )
                    .map(({ id, roleName }) => ({ id, name: roleName }));
                setInitialRoles(validRoles);
            }
        } catch {
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (isLoading) {
            showLoader();
        } else {
            hideLoader();
        }
    }, [isLoading, showLoader, hideLoader]);

    const handleRoleFilterChange = useCallback((roleId: number, checked: boolean) => {
        setPendingRoleIds(prev => checked
            ? [...prev, roleId]
            : prev.filter(id => id !== roleId)
        );
    }, []);

    const handleClearFilter = useCallback(() => {
        setPendingRoleIds([]);
    }, []);

    const handleApplyFilter = useCallback(() => {
        setAdditionalFilter(pendingRoleIds.length ? { roleId: pendingRoleIds } : {});
        setAppliedRoleIds(pendingRoleIds);
        setShowFilter(false);
        refetch();
    }, [pendingRoleIds, setAdditionalFilter, refetch]);

    const handleDropdownClose = useCallback(() => {
        if (JSON.stringify(pendingRoleIds) !== JSON.stringify(appliedRoleIds)) {
            setPendingRoleIds(appliedRoleIds);
        }
    }, [pendingRoleIds, appliedRoleIds]);

    const handleColumnSort = useCallback((field: string) => {
        const newDirection = localSorting.field === field ? -localSorting.direction : 1;
        setLocalSorting({ field, direction: newDirection });
        setSorting(field);
    }, [localSorting, setSorting]);

    const handleRowClick = useCallback((roleId: string) => {
        if (onBackClick) {
            onBackClick();
        }
        router.push(`/user-access-management/user-roles/${roleId}`);
    }, [router, onBackClick]);

    const columns: ColumnDef<UserTable>[] = useRoleColumns({ hasUsers, handleColumnSort, handleRowClick });

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-end ">
                <div className="flex items-center gap-2 -mt-20">
                    <div className="">
                        <DropdownMenu
                            open={showFilter}
                            onOpenChange={(open) => {
                                if (!open) {
                                    handleDropdownClose();
                                }
                                setShowFilter(open);
                            }}
                        >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className={cn(
                                        "relative p-2 rounded-lg focus-visible:ring-0 border-neutral-100 border-[1px] w-[32px] h-[30px]",
                                        (showFilter || appliedRoleIds.length > 0) && "border border-primary bg-blue-400 stroke-primary",
                                        !showFilter && appliedRoleIds.length === 0 && "bg-white"
                                    )}
                                    data-testid={allUser.filterRolesButton}
                                >
                                    <Filter
                                        className="w-4 h-4"
                                        stroke={showFilter || appliedRoleIds.length > 0 ? 'var(--primary)' : 'var(--neutral-400)'}
                                    />
                                    {appliedRoleIds.length > 0 && (
                                        <span className="absolute -top-2 -right-2 w-[18px] h-[18px] text-[9px] font-semibold flex items-center justify-center bg-blue-200 text-filter-icon rounded-md">
                                            {appliedRoleIds.length}
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            {showFilter && (
                                <DropdownMenuContent
                                    align="end"
                                    className="w-[196px] h-[190px] bg-white rounded-lg shadow-lg border border-neutral-100 flex flex-col"
                                    data-testid={allUser.filterRolesButton}
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
                                                        data-testid={`${allUser.roleCheckbox}-${role?.id}`}
                                                    />
                                                    <label
                                                        htmlFor={role.id.toString()}
                                                        className="font-normal text-xs text-neutral-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer capitalize max-w-[120px] overflow-hidden break-words line-clamp-1"
                                                    >
                                                        {role.name || '-'}
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
                                            data-testid={allUser.filterClearButton}
                                        >
                                            Clear
                                        </Button>
                                        <Button
                                            className="text-blue-600 font-normal text-base px-0 hover:bg-transparent hover:text-blue-600"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleApplyFilter}
                                            data-testid={allUser.filterDoneButton}
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
                        className="placeholder:italic placeholder:text-input-placeholder placeholder:font-normal placeholder:text-xs font-normal text-input-label"
                    />

                </div>
            </div>
            <ReusableTable
                data={roles.map(role => ({
                    ...role,
                    id: role.id.toString() ?? '0'
                }))}
                columns={columns}
                isLoadingMore={isLoadingMore}
                handleLoadMore={loadMore}
                tableHeight="calc(100vh - 236px)"
            />
        </div>
    );
}