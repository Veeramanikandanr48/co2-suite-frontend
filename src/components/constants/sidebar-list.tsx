import { SidebarItemType } from "@/types/sidebar";
import { MasterRole } from "@/types/enums";

export const sidebarList: SidebarItemType[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Analytics & Trends",
    href: "/analytics",
    icon: "TrendingUp",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Reports & Disclosures",
    href: "/reports",
    icon: "FileText",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "AI Platform",
    href: "/ai-platform",
    icon: "Sparkles",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Services & Scopes",
    href: "/services",
    icon: "LayoutGrid",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Master Data Management",
    href: "/master-management",
    icon: "Database",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN],
    child: [],
  },
  {
    name: "Organization",
    href: "/organizations",
    icon: "Building2",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN],
    child: [],
  },
  {
    name: "Enterprise Hub",
    href: "/enterprise",
    icon: "ShieldAlert",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN],
    child: [],
  },
  {
    name: "Manage Account",
    href: "/manage-account",
    icon: "Building",
    isActive: true,
    roles: [MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Profile",
    href: "/profile",
    icon: "User",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "Settings",
    isActive: true,
    roles: [MasterRole.SUPER_ADMIN, MasterRole.ADMIN, MasterRole.USER],
    child: [],
  },
];

/**
 * Filter sidebar menu items dynamically based on the current user's role ID.
 */
export function getVisibleSidebarItems(userRoleId?: number): SidebarItemType[] {
  if (!userRoleId) return [];
  return sidebarList.filter(
    (item) => !item.roles || item.roles.length === 0 || item.roles.includes(userRoleId),
  );
}