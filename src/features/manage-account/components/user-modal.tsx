'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/api-service';

import { useAuth } from '@/context/auth-provider';
import { UserFormData, UserModalProps } from '@/types/manage-account';

export type { UserFormData, UserModalProps };

export function UserModal({ isOpen, onClose, onSuccess, userData }: UserModalProps) {
  const { user } = useAuth();
  const orgId = user?.organizationId || 1;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState<number>(3); // Default USER (3)
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userData) {
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
      setRoleId(userData.roleId || 2);
      setPassword('');
    } else {
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRoleId(3);
    }
  }, [userData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setSubmitting(true);
      if (userData?.id) {
        // Edit User
        const payload = {
          firstName,
          lastName,
          email,
          phone,
          roleId,
        };
        await apiService.put(`organizations/${orgId}/users`, userData.id, payload);
        toast.success('User updated successfully');
      } else {
        // Add User
        const payload = {
          userName: email.split('@')[0] + Math.floor(Math.random() * 100),
          email,
          password: password || 'User123!',
          firstName,
          lastName,
          phone,
          roleId,
        };
        await apiService.post(`organizations/${orgId}/users`, payload);
        toast.success('User created successfully');
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error saving user details');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 text-neutral-700 rounded-xl border border-neutral-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {userData?.id ? 'Edit User' : 'Add User'}
              </h2>
              <p className="text-xs text-neutral-400">
                {userData?.id ? 'Update user details and permissions' : 'Create a new user account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="user@w-d.ae"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Phone Number</label>
            <input
              type="text"
              placeholder="+90000000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {!userData?.id && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="Leave blank for auto-generated password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Role</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(Number(e.target.value))}
              className="w-full text-xs bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value={2}>Admin</option>
              <option value={3}>User</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-3 border-t border-neutral-100">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-indigo-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
              style={{ backgroundColor: '#0B132B' }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
