import React from 'react';
import { z } from 'zod';
import { Shield, User } from 'lucide-react';
import { MasterRole } from '@/types/enums';
import { AddMemberFormState } from '@/features/organizations/components/dialogs/org-dialogs';

export const AddMemberSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().optional(),
  userName: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.number().min(2, 'Please select a valid role'),
});

export const INITIAL_ADD_MEMBER_FORM: AddMemberFormState = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  password: '',
  roleId: MasterRole.USER,
};

export function getOrgMonogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function getAvatarColors(name: string): { bg: string; text: string } {
  const palettes = [
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-violet-100', text: 'text-violet-700' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' },
    { bg: 'bg-orange-100', text: 'text-orange-700' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palettes[Math.abs(hash) % palettes.length];
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function Badge({ variant, children }: { variant: 'active' | 'inactive'; children: React.ReactNode }) {
  const styles = {
    active: 'bg-[#EDFCF3] text-[#18B169] border-[#D3F8E0]',
    inactive: 'bg-[#FFDED8] text-[#CC4529] border-[#FFDED8]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${styles[variant]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${variant === 'active' ? 'bg-[#18B169]' : 'bg-[#CC4529]'}`} />
      {children}
    </span>
  );
}

export function RoleBadge({ roleId }: { roleId: number }) {
  if (roleId === MasterRole.SUPER_ADMIN)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
        <Shield className="w-3 h-3" />
        Super Admin
      </span>
    );
  if (roleId === MasterRole.ADMIN)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
        <Shield className="w-3 h-3" />
        Org Admin
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#F0F2F5] text-neutral-500 border border-[#E6E8EB]">
      <User className="w-3 h-3" />
      Member
    </span>
  );
}
