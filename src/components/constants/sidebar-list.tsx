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
  ]