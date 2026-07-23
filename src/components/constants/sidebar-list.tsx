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
    ],
  },
];