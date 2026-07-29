'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Building,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  Key,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/auth-provider';
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
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Title Header */}
      <div>
        <h1 className="text-xl font-bold text-neutral-900 tracking-tight">Profile Details</h1>
        <p className="text-xs text-neutral-500 mt-1">View and manage your account information and security credentials</p>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-3">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'personal'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'personal' ? '#0B132B' : undefined }}
        >
          <User className="w-3.5 h-3.5" /> Personal Details
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'security'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'security' ? '#0B132B' : undefined }}
        >
          <Lock className="w-3.5 h-3.5" /> Security & Password
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors ${
            activeTab === 'permissions'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
          }`}
          style={{ backgroundColor: activeTab === 'permissions' ? '#0B132B' : undefined }}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Role & Permissions
        </button>
      </div>

      {/* Top Card: User Profile Summary */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
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
              className="px-3.5 py-1.5 bg-neutral-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              style={{ backgroundColor: '#0B132B' }}
            >
              <Edit2 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Avatar Box */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 bg-[#0B132B] text-white rounded-2xl flex items-center justify-center font-bold text-xl mb-3 shadow-xs">
              {initials}
            </div>
            <span className="text-sm font-bold text-neutral-900">{displayName}</span>
            <span className="text-xs font-semibold text-emerald-600 mt-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              System Administrator
            </span>
          </div>

          {/* Details List */}
          <div className="lg:col-span-2 space-y-2.5">
            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Email Address</div>
                  <div className="text-xs font-bold text-neutral-800">{formData.email || 'user@co2suite.com'}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Contact Phone</div>
                  <div className="text-xs font-bold text-neutral-800">{formData.phone}</div>
                </div>
              </div>
            </div>

            <div className="bg-neutral-50/70 border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="text-[11px] font-semibold text-neutral-400">Job Title & Department</div>
                  <div className="text-xs font-bold text-neutral-800">{formData.jobTitle} • {formData.department}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content: Personal Info */}
      {activeTab === 'personal' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Personal Details Form</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
                  className="px-4 py-2 bg-[#0B132B] hover:bg-[#152247] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
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
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Update Password</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
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
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-900 font-semibold"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#0B132B] hover:bg-[#152247] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" /> {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Content: Permissions */}
      {activeTab === 'permissions' && (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">Assigned System Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              'Facilities & Multi-location Management',
              'Carbon Inventory Data Entry & Verification',
              'Custom Emission Factors Configuration',
              'Organization Onboarding & Audit Logs',
              'Compliance Report Generation',
              'User Access & Role Delegation',
            ].map((perm) => (
              <div key={perm} className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 flex items-center gap-2.5 text-xs font-bold text-neutral-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
