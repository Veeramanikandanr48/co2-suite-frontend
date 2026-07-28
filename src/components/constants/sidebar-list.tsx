import { SidebarItemType } from "@/types/sidebar";
import { MasterRole } from "@/enums/base-enum";

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
    name: "Organization",
    href: "/organizations",
    icon: "Building2",
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