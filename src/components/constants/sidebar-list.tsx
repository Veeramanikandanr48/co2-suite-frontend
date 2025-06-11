export const sidebarList = [
  // {
    //   name: "Dashboard",
    //   href: "/dashboard",
    //   icon: "DashboardIcon",
    //   isActive: true,
    //   child: [
    //     {
    //       name: "Overview",
    //       href: "/overview",
    //       icon: null,
    //       isActive: true,
    //     },
    //     {
    //       name: "Audit Logs",
    //       href: "/audit-logs",
    //       icon: null,
    //       isActive: false,
    //     },
    //   ],
    // },
    {
      name: "Device Integration",
      href: "/device-integration",
      icon: "DeviceIntegrationIcon",
      isActive: false,
      child: [
        {
          name: "System integration",
          href: "/system-integration",
          icon: null,
          isActive: false,
          child: [
            {
              name: "PACS configuration",
              href: "/pacs-configuration",
              icon: null,
              isActive: false,
            },
          ],
        },
        {
          name: "Room integration",
          href: "/room-integration",
          icon: null,
          isActive: false,
          child: [
            {
              name: "USG configuration",
              href: "/usg-configuration",
              icon: null,
              isActive: false,
            },
            {
              name: "Blackbox configuration",
              href: "/blackbox-configuration",
              icon: null,
              isActive: false,
            },
          ],
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
          },
          {
              name: "User Roles",
              href: "/user-roles",
              icon: null,
              isActive: false,
          },
      ],
     },
     {
      name: "Customization",
      href: "/workflow-customization",
      icon: "WorkflowCustomizationIcon",
      isActive: false,
      child: [
          {
              name: "Workflow Customization",
              href: "/secondary",
              icon: null,
              isActive: false,
          },
      ]
     },
    //  {
    //   name: "General Settings",
    //   href: "/general-settings",
    //   icon: "GeneralSettingsIcon",
    //   isActive: false,
    //   child: [
    //       {
    //           name: "Date & time",
    //           href: "/date-time",
    //           icon: null,
    //           isActive: false,
    //       },
    //       {
    //           name: "Language",
    //           href: "/language",
    //           icon: null,
    //           isActive: false,
    //       },
    //       {
    //           name: "About",
    //           href: "/about",
    //           icon: null,
    //           isActive: false,
    //       },
    //   ]  
    //  },
     {
      name: "Site resources",
      href: "/site-resources",
      icon: "SiteResourcesIcon",
      isActive: false,
     },
    //  {
    //   name: "Help and tutorials",
    //   href: "/help-tutorials",
    //   icon: "HelpAndTutorialsIcon",
    //   isActive: false,
    //  },
  ]