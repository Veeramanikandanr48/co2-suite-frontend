import { useFetchList } from "~/hooks/use-fetchlist"
import { ColumnDef } from "@tanstack/react-table"
import { ReusableTable } from "~/components/reusables/form-fields/reusable-table"
import { User } from "~/types/users"
import { useMemo, useState, useCallback, forwardRef, useImperativeHandle, useEffect } from "react"
import { API_LIST } from "~/lib/api-list"
import { Button } from "~/components/ui/button"
import { ArrowUpDown, Trash2 } from "lucide-react"
import { apiService } from "~/lib/api-service"
import Image from "next/image"
import { DeleteDialog } from "../reusables/dialogs/delete"
import { useAuth } from "~/context/auth-provider"
import { DefaultValues } from "~/enums/base-enum"
import { userRoles } from "../test-ids/user-roles.test-ids"
import { useLoader } from "@/context/loader-context";
import { toCapitalizedWords } from "@/lib/utils"

const avatarBgClasses = [
    "bg-light-700",
    "bg-warning-600",
    "bg-light-600",
    "bg-blue-400",
    "bg-violet-300",
    "bg-pink-300",
    "bg-amber-300",
];

export interface RolesBasedUsersRef {
    refetch: () => void;
}

interface RolesBasedUsersProps {
    roleId: number;
}

const RolesBasedUsers = forwardRef<RolesBasedUsersRef, RolesBasedUsersProps>(({ roleId }, ref) => {
    const { user: currentUser } = useAuth();
    const [localSorting, setLocalSorting] = useState<{ field: string; direction: number }>({ field: '', direction: 1 });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { showLoader, hideLoader } = useLoader();
    
    const {
        list: users,
        loadMore,
        isLoadingMore,
        setSorting,
        refetch
    } = useFetchList<User>(`${API_LIST.GET_ALL_USERS}?isAll=false&profile=true`, {
        additionalFilter: { roleId: [roleId] }
    });

    useImperativeHandle(ref, () => ({
        refetch
    }));

    const hasUsers = users?.length > 1;

    const handleColumnSort = useCallback((field: string) => {
        const newDirection = localSorting.field === field ? -localSorting.direction : 1;
        setLocalSorting({ field, direction: newDirection });
        setSorting(field);
    }, [localSorting, setSorting]);

    const handleDelete = useCallback(async (userId: number) => {
        setSelectedUserId(userId);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedUserId) return;
        
        try {
            setIsLoading(true)
            const response = await apiService.put<{ success: boolean }>(
                API_LIST.UPDATE_USER_ROLE_BY_ID,
                `${roleId}/${selectedUserId}`,
                undefined,
                {
                    headers: {
                        'X-Skip-Toast': 'false'
                    }
                }
            );
            
            if (response.success) {
                refetch();
            }
        } catch {
        } finally {
            setIsLoading(false)
            setIsDeleteDialogOpen(false);
            setSelectedUserId(null);
        }
    }, [roleId, refetch, selectedUserId]);
    
    useEffect(() => {
      if (isLoading) {
        showLoader();
      } else {
        hideLoader();
      }
    }, [isLoading, showLoader, hideLoader]);

    const columns = useMemo<ColumnDef<User>[]>(() => [
        {
            id: "name",
            accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            size: 433,
            header: () => (
                <div className="flex justify-between items-center mr-10" data-testid={userRoles.sortUserRoleButton}>
                    <span className="font-bold text-neutral-400">Users</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-transparent"
                        onClick={() => hasUsers && handleColumnSort("firstName")}
                        disabled={!hasUsers}
                        data-testid={userRoles.sortUserRoleButton}
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

                const isCurrentUser = currentUser?.id?.toString() === row.original.id?.toString();
                const isDefaultRole = roleId === DefaultValues.USER_ROLE_ID;
                
                return (
                    <div className="flex items-center justify-between mr-10">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-gray-600 font-medium ${!row.original.profilePath && avatarBgClasses[row.index % avatarBgClasses.length]
                                    }`}
                            >
                                {row.original.profilePath && base64Image ? (
                                    <Image
                                        src={`data:image/jpeg;base64,${base64Image}`}
                                        alt={`${row.original.firstName} ${row.original.lastName}`}
                                        width={32}
                                        height={32}
                                        className="rounded-full object-cover"
                                        unoptimized={typeof row.original.profilePath !== 'string'}
                                        style={{ width: '32px', height: '32px' }}
                                    />
                                ) : (
                                    `${row.original.firstName?.[0] || ''}${row.original.lastName?.[0] || ''}`.toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col gap-2 text-neutral-400 text-xs ">
                                <span>{toCapitalizedWords(`${row.original.firstName || ''} ${row.original.lastName || ''}`)}</span>
                                <span>{row.original.userId || ''}</span>
                            </div>
                        </div>
                        <div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-transparent"
                                onClick={() => handleDelete(Number(row.original.id))}
                                disabled={isCurrentUser || isDefaultRole}
                                data-testid={userRoles.deleteUserButton}
                            >
                                <Trash2 className="h-4 w-4 stroke-negative-300" />
                            </Button>
                        </div>
                    </div>
                );
            },
        }
    ], [handleColumnSort, hasUsers, handleDelete, currentUser, roleId]);

    return (
        <div className="space-y-4">
            <ReusableTable
                data={users}
                columns={columns}
                isLoadingMore={isLoadingMore}
                handleLoadMore={loadMore}
                tableHeight="calc(100vh - 287px)"
                data-testid={userRoles.usersList}
            />
            <DeleteDialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsDeleteDialogOpen(false)}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                title={`Delete Item?`}
                message="Are you sure you want to delete this item?<br />This action cannot be undone."
                data-testid={userRoles.deleteDialog}
            />
        </div>
    )
});

RolesBasedUsers.displayName = 'RolesBasedUsers';

export default RolesBasedUsers;