import { SidebarItemType } from "@/types/sidebar";

export const sidebarList: SidebarItemType[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "DashboardIcon",
    isActive: true,
    child: [],
  },
  {
    name: "User Management",
    href: "/users",
    icon: "UserManagementIcon",
    isActive: false,
    child: [],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "SettingsIcon",
    isActive: false,
    child: [
      {
        name: "Roles & Permissions",
        href: "/roles",
        group: "Options",
        icon: "Shield",
      },
      {
        name: "Security & 2FA",
        href: "/security",
        group: "Options",
        icon: "Lock",
      },
    ],
  },
];