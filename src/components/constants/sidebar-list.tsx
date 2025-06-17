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
    name: "User management",
    href: "/user-management",
    icon: "UserManagementIcon",
    isActive: false,
    child: [],
  },
  {
    name: "Job management",
    href: "/job-management",
    icon: "UserManagementIcon",
    isActive: false,
    child: [],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: "UserManagementIcon",
    isActive: false,
    child: [],
  },
]