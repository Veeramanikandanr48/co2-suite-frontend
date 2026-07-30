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
import {
  PageHeader,
  NavTabButton,
  SectionCard,
  FormInputField,
  StatusBadge,
} from '@/components/shared';
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
    <div className="page-container space-y-6">
      <PageHeader
        title="Profile Details"
        description="View and manage your account information and security credentials"
      />

      <div className="flex items-center gap-2 border-b border-border pb-3">
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

      {/* Profile Overview Card */}
      <SectionCard
        title={`User Profile • ${displayName}`}
        subtitle="Account overview and basic credentials"
        action={
          activeTab === 'personal' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          )
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start w-full">
          {/* Avatar Box */}
          <div className="bg-muted border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px] lg:col-span-1">
            <div className="w-20 h-20 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-bold text-2xl mb-3 shadow-xs">
              {initials}
            </div>
            <span className="text-sm font-bold text-foreground">{displayName}</span>
            <StatusBadge label="System Administrator" className="mt-2" />
          </div>

          {/* Details List */}
          <div className="lg:col-span-3 space-y-3 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="bg-muted/70 border border-border rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Email Address</div>
                    <div className="text-xs font-bold text-foreground">{formData.email || 'user@co2suite.com'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/70 border border-border rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Contact Phone</div>
                    <div className="text-xs font-bold text-foreground">{formData.phone}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/70 border border-border rounded-xl p-3.5 flex items-center justify-between sm:col-span-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase">Job Title & Department</div>
                    <div className="text-xs font-bold text-foreground">{formData.jobTitle} • {formData.department}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Tab Content: Personal Info */}
      {activeTab === 'personal' && (
        <SectionCard title="Personal Details Form">
          <form onSubmit={handleProfileSubmit} className="space-y-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              <FormInputField
                label="First Name"
                value={formData.firstName}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, firstName: val })}
              />

              <FormInputField
                label="Last Name"
                value={formData.lastName}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, lastName: val })}
              />

              <FormInputField
                label="Email Address"
                type="email"
                value={formData.email}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, email: val })}
              />

              <FormInputField
                label="Phone Number"
                value={formData.phone}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, phone: val })}
              />

              <FormInputField
                label="Job Title"
                value={formData.jobTitle}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, jobTitle: val })}
              />

              <FormInputField
                label="Department"
                value={formData.department}
                disabled={!isEditing}
                onChange={(val) => setFormData({ ...formData, department: val })}
              />
            </div>

            {isEditing && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </SectionCard>
      )}

      {/* Tab Content: Security */}
      {activeTab === 'security' && (
        <SectionCard title="Update Password">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 w-full max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormInputField
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={(val) => setPasswords({ ...passwords, currentPassword: val })}
              />

              <FormInputField
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(val) => setPasswords({ ...passwords, newPassword: val })}
              />

              <FormInputField
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(val) => setPasswords({ ...passwords, confirmPassword: val })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" /> {isSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Tab Content: Permissions */}
      {activeTab === 'permissions' && (
        <SectionCard title="Assigned System Permissions">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full">
            {[
              'Facilities & Multi-location Management',
              'Carbon Inventory Data Entry & Verification',
              'Custom Emission Factors Configuration',
              'Organization Onboarding & Audit Logs',
              'Compliance Report Generation',
              'User Access & Role Delegation',
            ].map((perm) => (
              <div
                key={perm}
                className="bg-muted border border-border rounded-xl p-3.5 flex items-center gap-2.5 text-xs font-bold text-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-foreground shrink-0" />
                <span>{perm}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
