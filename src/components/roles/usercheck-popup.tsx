import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Search, X, Save } from "lucide-react";
import { API_LIST } from "@/lib/api-list";
import { apiService } from "@/lib/api-service";
import { CustomAxiosResponse } from "~/types";
import { UserResponse, User } from "~/types/users";
import { UnSavedDialog } from "../reusables/dialogs/unsaved.dialog";
import { useLoader } from "@/context/loader-context";
import { toCapitalizedWords } from "~/lib/utils";

const avatarBg = "bg-amber-500"; // gold/yellow color for avatar

type UserCheckPopupProps = {
  roleId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
};

const UserCheckPopup = ({ roleId, open, onOpenChange, onClose }: UserCheckPopupProps) => {
  const { showLoader, hideLoader } = useLoader();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);
  const [initiallyChecked, setInitiallyChecked] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingUncheckId, setPendingUncheckId] = useState<string | null>(null);
  const [pendingUncheckUser, setPendingUncheckUser] = useState<User | null>(null);
  const [confirmedUnchecked, setConfirmedUnchecked] = useState<string[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Add function to check if selections have changed
  const hasChanges = useCallback(() => {
    if (selected.length !== initiallyChecked.length) return true;
    return selected.some(id => !initiallyChecked.includes(id)) || 
           initiallyChecked.some(id => !selected.includes(id));
  }, [selected, initiallyChecked]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response :CustomAxiosResponse<UserResponse> = await apiService.post(
        API_LIST.GET_ALL_USERS,
        {
          searchInput: "",
          offSet: 0,
          limit: 0,
          sortField: "",
          sortOrder: 0,
          additionalFilter: {}
        },
        {
          params: { isAll: true }
        }
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }

      setUsers(response.data.listData);
      setFilteredUsers(response.data.listData);
      // Set selected users based on roleId
      const selectedUserIds = response.data.listData
        .filter(user => Number(user.roleId) === roleId)
        .map(user => user.id.toString());
      setSelected(selectedUserIds);
      setInitiallyChecked(selectedUserIds);
      setConfirmedUnchecked([]);
    } catch {
      setUsers([]);
      setFilteredUsers([]);
      setSelected([]);
      setInitiallyChecked([]);
      setConfirmedUnchecked([]);
    } finally {
      setIsLoading(false)
    }
  }, [roleId]);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  useEffect(() => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const userId = user.userId.toLowerCase();
      const searchTerm = search.toLowerCase();
      
      return fullName.includes(searchTerm) || userId.includes(searchTerm);
    });
    setFilteredUsers(filtered);
  }, [search, users]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
  }, [isLoading, showLoader, hideLoader]);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      // Trying to uncheck
      if (initiallyChecked.includes(id) && !confirmedUnchecked.includes(id)) {
        const user = users.find(u => u.id.toString() === id);
        setPendingUncheckId(id);
        setPendingUncheckUser(user || null);
        setShowConfirmDialog(true);
        return;
      }
      setSelected((prev) => prev.filter((sid) => sid !== id));
    } else {
      // Trying to check - no confirmation needed
      setSelected((prev) => [...prev, id]);
    }
  };

  const handleConfirm = () => {
    if (pendingUncheckId) {
      // Only handle unchecking case
      setSelected((prev) => prev.filter((sid) => sid !== pendingUncheckId));
      setConfirmedUnchecked((prev) => [...prev, pendingUncheckId]);
      setPendingUncheckId(null);
      setPendingUncheckUser(null);
    }
    setShowConfirmDialog(false);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true)
      setSaving(true);
      const response = await apiService.put(API_LIST.UPDATE_USER_ROLE, roleId , {
        userIds: selected.map(id => Number(id))
      }, {
        headers: {
          'X-Skip-Toast': 'false'
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to update user roles');
      }

      onOpenChange(false);
      onClose?.();
    } catch {
    } finally {
      setSaving(false);
      setIsLoading(false)
    }
  };

  const handleCancel = () => {
    if (hasChanges()) {
      setShowCancelDialog(true)
    } else {
      onOpenChange(false);
      onClose?.();
    }
  }

  const renderUserList = () => {
    if (users.length === 0) {
      return <div className="flex justify-center items-center h-full text-gray-500">No users found</div>;
    }
    if (filteredUsers.length === 0) {
      return <div className="flex justify-center items-center h-full text-gray-500">No matching users found</div>;
    }
    return filteredUsers.map((user) => (
      <label
        key={user.id}
        className="flex items-center gap-4 py-3 cursor-pointer px-2 hover:bg-neutral-200 w-full h-[47px]"
      >
        <span className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(user.id.toString())}
            onChange={() => handleToggle(user.id.toString())}
            className="peer w-4 h-4 appearance-none border-2 border-gray-400 rounded-[3px] bg-white checked:bg-gray-500 checked:border-gray-500 focus:outline-none transition-colors p-2"
          />
          <svg
            className="pointer-events-none absolute left-0 top-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="5 10.5 9 14.5 15 7.5" />
          </svg>
        </span>
        <div className={`w-[1.9375rem] h-[1.9375rem] rounded-full flex items-center justify-center text-white font-normal text-xs ${avatarBg}`}>
          {getInitials(user.firstName, user.lastName)}
        </div>
        <div className="flex flex-col">
          <span className="text-neutral-400 font-normal text-[0.75rem]">{toCapitalizedWords(`${user.firstName} ${user.lastName}`)}</span>
          <span className="text-neutral-400 font-normal text-[0.75rem]">{user.userId}</span>
        </div>
      </label>
    ));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          onClose?.();
        }
      }}>
        <DialogContent className="w-[553px] h-[573px] p-0 gap-0" onPointerDownOutside={(e) => e.preventDefault()}>
          <div className="flex items-center justify-between px-4">
            <DialogTitle className="text-[16px] font-bold">User List</DialogTitle>
            <DialogClose asChild>
              <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
                <X className="w-5 h-5 stroke-[1.5] stroke-neutral-800" />
              </button>
            </DialogClose>
          </div>
          <DialogDescription className="sr-only">
            Manage user role assignments for this role
          </DialogDescription>

          <hr />

          <div className="flex items-center gap-2 border rounded-lg mx-8 px-4 py-2 my-4 bg-[#FAFAFA] h-[36px]">
            <input
              className="flex-1 outline-none bg-transparent text-base placeholder:italic placeholder:text-input-placeholder placeholder:text-[15.7px]"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="w-5 h-5 text-input-placeholder" />
          </div>

          <div className="h-[19.25rem] overflow-y-auto scrollBar divide-y divide-gray-100 mx-6">
            {renderUserList()}
          </div>
          <hr />
            <div className="flex items-center justify-center gap-4 w-full h-[50px]">
              <Button 
                className="border border-primary text-primary text-sm w-[130px] h-[38px] font-bold bg-white"
                onClick={handleCancel}
              >
                <X className="w-5 h-5 stroke-[1.5] stroke-primary" />
                Cancel
              </Button>
              <Button 
                className="bg-primary text-white flex items-center gap-2 text-sm w-[130px] h-[38px] font-bold disabled:button-disabled"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                <Save className="w-4 h-4 stroke-[2px] stroke-current" />
                Save
              </Button>  
            </div>
        </DialogContent>
      </Dialog>

      <UnSavedDialog
        open={showCancelDialog}
        title="Unsaved Changes"
        message={`Exiting now will discard all your changes.`}
        onConfirm={() => {
          setShowCancelDialog(false);
          onOpenChange(false);
          onClose?.();
        }}
        onCancel={() => setShowCancelDialog(false)}
      />

      <UnSavedDialog
        open={showConfirmDialog}
        title="Revert User Role?"
        message={`This action will result in ${pendingUncheckUser?.firstName} ${pendingUncheckUser?.lastName} being reverted to the role of 'User'.`}
        onConfirm={handleConfirm}
        onCancel={() => {
          setShowConfirmDialog(false);
          setPendingUncheckId(null);
          setPendingUncheckUser(null);
        }}
      />
    </>
  );
};

export default UserCheckPopup;