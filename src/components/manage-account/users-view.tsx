'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Lock, Mail, Phone, Building, Loader2, Edit2 } from 'lucide-react';
import { apiService } from '@/lib/api-service';
import { useAuth } from '@/context/auth-provider';
import { UserModal, UserFormData } from './user-modal';
import { UserCardData } from '@/types/manage-account';

export function UsersView() {
  const { user } = useAuth();
  const canEdit = !user || user.roleId === 1 || user.roleId === 2;

  const [usersList, setUsersList] = useState<UserCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await apiService.post<any>('organizations/1/users/filter', { pageNo: 1, limit: 50 });
      const dataObj = (res as any)?.data ?? res;
      const listData = Array.isArray(dataObj?.listData)
        ? dataObj.listData
        : Array.isArray(dataObj?.items)
          ? dataObj.items
          : Array.isArray(dataObj)
            ? dataObj
            : [];

      if (listData.length > 0) {
        const mapped: UserCardData[] = listData.map((u: any, idx: number) => {
          const fullName = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.userName || u.email;
          return {
            id: u.id || idx + 1,
            name: fullName,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            phone: u.phone || u.phoneNumber || '-',
            facilities: u.facilityName || 'All Facilities',
            status: u.isActive !== false ? 'Active' : 'Inactive',
            roleId: u.roleId || 3,
            role: u.roleId === 2 ? 'Carbon - ADMIN' : u.roleId === 3 ? 'Carbon - USER' : u.roleName ? `Carbon - ${u.roleName}` : 'Carbon - MEMBER',
            isProtected: true,
          };
        });
        setUsersList(mapped);
      } else {
        setUsersList([]);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (usr: UserCardData) => {
    setSelectedUser({
      id: usr.id,
      firstName: usr.firstName || usr.name.split(' ')[0] || '',
      lastName: usr.lastName || usr.name.split(' ').slice(1).join(' ') || '',
      email: usr.email,
      phone: usr.phone === '-' ? '' : usr.phone,
      roleId: usr.roleId,
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading users from database...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Users Management</h1>
        <p className="text-xs text-neutral-500 mt-1">Manage and monitor all your users in one place</p>
      </div>

      {/* Action Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-3.5 shadow-2xs flex items-center justify-between gap-4">
        <div className="text-xs font-bold text-neutral-700 flex items-center gap-3">
          <span>
            Total Users: <span className="text-emerald-600 font-extrabold">{usersList.length}</span>
          </span>
          <span className="text-neutral-300">•</span>
          <span>
            Admins: <span className="text-emerald-600 font-extrabold">{usersList.filter(u => u.role.toLowerCase().includes('admin')).length}</span>
          </span>
        </div>

        {canEdit && (
          <button
            onClick={handleAddUser}
            className="p-2 bg-neutral-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 px-3"
            style={{ backgroundColor: '#0B132B' }}
            title="Add User"
          >
            <Plus className="w-4 h-4" />
            <span className="text-xs font-bold">Add User</span>
          </button>
        )}
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {usersList.map((usr) => (
          <div
            key={usr.id}
            className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Top Accent Line */}
            <div className="h-1 bg-emerald-500 w-full" />

            <div className="p-5 space-y-3.5">
              {/* User Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">{usr.name}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${usr.roleId === 2 ? 'bg-cyan-100 text-cyan-700' : 'bg-blue-100 text-blue-700'}`}>
                  {usr.roleId === 2 ? 'ADMIN' : 'USER'}
                </span>
              </div>

              {/* Details List */}
              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{usr.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{usr.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{usr.facilities}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700">{usr.status}</span>
                </div>
              </div>

              {/* Module Role Pill */}
              <div className="pt-1 flex items-center justify-between">
                <span className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-200">
                  {usr.role}
                </span>

                {canEdit && (
                  <button
                    onClick={() => handleEditUser(usr)}
                    className="p-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors border border-neutral-200"
                    title="Edit User"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-2.5 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end text-neutral-400 gap-1 text-[10px] font-medium">
              <Lock className="w-3 h-3" /> Protected
            </div>
          </div>
        ))}
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchUsers}
        userData={selectedUser}
      />
    </div>
  );
}
