export const sidebarList = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: "DashboardIcon",
    isActive: true,
    child: [
      {
        name: "Overview",
        href: "/overview",
        icon: null,
        isActive: true,
      },
      {
        name: "Audit Logs",
        href: "/audit-logs",
        icon: null,
        isActive: false,
      },
    ],
  },
  {
    name: "User Access Management",
    href: "/user-access-management",
    icon: "UserAccessManagementIcon",
    isActive: false,
    child: [
      {
        name: "All Users",
        href: "/all-users",
        icon: null,
        isActive: false,
      }
    ],
  },
]