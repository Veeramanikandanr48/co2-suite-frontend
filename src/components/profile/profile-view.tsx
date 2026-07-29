'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  Key,
} from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
import { PageHeader, NavTabButton } from '@/components/shared';
import { toast } from 'sonner';

export function ProfileView() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'permissions'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '+1 (555) 234-5678',
    jobTitle: 'Sustainability Lead',
    department: 'ESG & Carbon Accounting',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (user) {
        updateUser({
          ...user,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        });
      }
      setIsSaving(false);
      setIsEditing(false);
      toast.success('Profile details updated successfully');
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    }, 500);
  };

  const displayName = `${formData.firstName} ${formData.lastName}`.trim() || 'User';
  const initials = `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <div className="space-y-6 w-full p-4 md:p-6 bg-white text-neutral-900">
      {/* Page Header */}
      <PageHeader
        title="Profile Details"
        description="View and manage your account information and security credentials"
      />

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <NavTabButton
          isActive={activeTab === 'personal'}
          onClick={() => setActiveTab('personal')}
          icon={User}
          label="Personal Details"
        />
        <NavTabButton
          isActive={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
          icon={Lock}
          label="Security & Password"
        />
        <NavTabButton
          isActive={activeTab === 'permissions'}
          onClick={() => setActiveTab('permissions')}
          icon={ShieldCheck}
          label="Role & Permissions"
        />
      </div>

      {/* Top Card: User Profile Summary */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              User Profile <span className="text-neutral-400">•</span>{' '}
              <span className="text-neutral-700">{displayName}</span>
            </h2>
            <p className="text-xs text-neutral-400">Account overview and basic credentials</p>
          </div>
          {activeTab === 'personal' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 bg-[#0B132B] hover:bg-black text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start w-full">
          {/* Avatar Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] lg:col-span-1">
            <div className="w-20 h-20 bg-[#0B132B] text-white rounded-2xl flex items-center justify-center font-bold text-2xl mb-3 shadow-xs">
              {initials}
            </div>
            <span className="text-sm font-bold text-neutral-900">{displayName}</span>
            <span className="text-xs font-bold text-neutral-900 mt-1.5 bg-neutral-100 px-2.5 py-0.5 rounded-md border border-neutral-300">
              System Administrator
            </span>
          </div>

          {/* Details List */}
          <div className="lg:col-span-3 space-y-3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Email Address</div>
                    <div className="text-xs font-bold text-neutral-900">{formData.email || 'user@co2suite.com'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Contact Phone</div>
                    <div className="text-xs font-bold text-neutral-900">{formData.phone}</div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase">Job Title & Department</div>
                    <div className="text-xs font-bold text-neutral-900">{formData.jobTitle} • {formData.department}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content: Personal Info */}
      {activeTab === 'personal' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 w-full">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Personal Details Form</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 text-neutral-900 font-semibold"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Tab Content: Security */}
      {activeTab === 'security' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 w-full">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Update Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 w-full max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#0B132B] hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" /> {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4 w-full">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Assigned System Permissions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
            {[
              'Facilities & Multi-location Management',
              'Carbon Inventory Data Entry & Verification',
              'Custom Emission Factors Configuration',
              'Organization Onboarding & Audit Logs',
              'Compliance Report Generation',
              'User Access & Role Delegation',
            ].map((perm) => (
              <div key={perm} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-neutral-900">
                <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
