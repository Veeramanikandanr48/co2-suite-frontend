import React from 'react';
import { Leaf, ShieldCheck, Factory } from 'lucide-react';
import type { WorkspaceLogo } from '@/types/sidebar';

export type { WorkspaceLogo };

export const workspaceLogos: WorkspaceLogo[] = [
  {
    id: 'co2-suite',
    name: 'CO2 Suite',
    plan: 'Enterprise',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    icon: <Leaf className="w-5 h-5" />,
  },
  {
    id: 'eco-tracker',
    name: 'EcoTracker Pro',
    plan: 'Professional',
    iconBg: 'bg-blue-500/10 text-blue-400',
    icon: <ShieldCheck className="w-5 h-5" />,
  },
  {
    id: 'green-ops',
    name: 'GreenOps Global',
    plan: 'Standard',
    iconBg: 'bg-purple-500/10 text-purple-400',
    icon: <Factory className="w-5 h-5" />,
  },
];

export function hasActiveDescendant(item: any, currentPath: string): boolean {
  if (currentPath === item.href || currentPath.startsWith(`${item.href}/`)) {
    return true;
  }
  if (item.child && Array.isArray(item.child)) {
    return item.child.some((child: any) => {
      const fullChildHref = `${item.href}${child.href}`;
      return currentPath === fullChildHref || currentPath.startsWith(`${fullChildHref}/`);
    });
  }
  return false;
}
