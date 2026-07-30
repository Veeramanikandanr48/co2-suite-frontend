"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { sidebarList, getVisibleSidebarItems } from "@/components/constants/sidebar-list";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Check,
  Plus,
  LayoutDashboard,
  Building2,
  LayoutGrid,
  Database,
  Building,
  User,
  Settings,
  LogOut,
  CircleUserRound,
  MoreVertical,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { useAuth } from "@/context/auth-provider";
import { FORM_CONFIGURATION } from "@/lib/constants/app-variables";
import { MasterRole } from "@/types/enums";
import EventBus from "@/lib/utils/event-bus";
import { WorkspaceLogo, workspaceLogos, hasActiveDescendant } from "./sidebar-constants";
import type { SidebarItemType } from "@/types/sidebar";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Building2, LayoutGrid, Database, Building, User, Settings,
};

function getIcon(name: string | null | undefined) {
  if (!name) return LayoutDashboard;
  return iconMap[name] ?? LayoutDashboard;
}

const SidebarItemWrapper = React.memo(function SidebarItemWrapper({
  item,
  isActive,
  collapsed,
  onNavigate,
}: {
  item: SidebarItemType;
  isActive: boolean;
  collapsed: boolean;
  onNavigate: (href: string) => void;
}) {
  const Icon = getIcon(item.icon);
  const hasChildren = item.child && item.child.length > 0;

  const button = (
    <button
      onClick={() => onNavigate(item.href)}
      className={`relative flex items-center w-full rounded-lg transition-all duration-200 outline-none
        ${collapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 gap-3"}
        ${isActive
          ? "bg-primary/15 text-white font-medium"
          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary-400" : "text-sidebar-foreground/50"}`} />
      {!collapsed && (
        <span className="text-sm truncate">{item.name}</span>
      )}
      {isActive && !collapsed && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-primary/15 -z-10"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" className="ml-2">
          <p>{item.name}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
});

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeLogo, setActiveLogo] = useState<WorkspaceLogo>(workspaceLogos[0]);
  const { user, logout } = useAuth();

  const isEffectiveCollapsed = collapsed && !isHovered;

  const displayName = user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '';

  const visibleItems = useMemo(() => getVisibleSidebarItems(user?.roleId), [user?.roleId]);

  useEffect(() => {
    if (pathname.startsWith('/services')) {
      setCollapsed(true);
    }
  }, [pathname]);

  const handleNavigate = useCallback((href: string) => {
    let targetHref = href;
    if (href === "/organizations" && user?.roleId !== MasterRole.SUPER_ADMIN) {
      targetHref = `/organizations/${user?.organizationId || 1}`;
    }
    const modifiedRoute = pathname.replace(/\d+/g, '[id]');
    if (FORM_CONFIGURATION[modifiedRoute]) {
      EventBus.$emit(pathname, targetHref);
    } else {
      router.push(targetHref);
    }
  }, [pathname, router, user?.roleId, user?.organizationId]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-full bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out relative
        ${isEffectiveCollapsed ? "w-sidebar-collapsed" : "w-sidebar"}`}
    >
      {/* Workspace Switcher */}
      <div className="shrink-0 px-3 pt-4 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 hover:bg-sidebar-accent/50 transition-colors outline-none text-left group
              ${isEffectiveCollapsed ? "justify-center" : ""}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activeLogo.iconBg}`}>
                {activeLogo.icon}
              </div>
              {!isEffectiveCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{activeLogo.name}</p>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate">{activeLogo.plan}</p>
                  </div>
                  <ChevronsUpDown className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-60 ml-2 bg-surface-overlay border-border shadow-xl rounded-xl p-1.5">
            <DropdownMenuLabel className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-1.5">
              Workspaces
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border" />
            {workspaceLogos.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => setActiveLogo(item)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-neutral-500">{item.plan}</p>
                </div>
                {activeLogo.id === item.id && (
                  <Check className="w-4 h-4 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-primary rounded-lg cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mx-3 border-t border-sidebar-border/50" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-0.5">
          {visibleItems.map((item) => (
            <SidebarItemWrapper
              key={item.href}
              item={item}
              isActive={pathname.startsWith(item.href)}
              collapsed={isEffectiveCollapsed}
              onNavigate={handleNavigate}
            />
          ))}
        </nav>
      </ScrollArea>

      <div className="mx-3 border-t border-sidebar-border/50" />

      {/* Collapse Toggle */}
      <div className="shrink-0 px-3 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={`flex items-center w-full rounded-lg transition-colors outline-none
                ${isEffectiveCollapsed ? "justify-center h-9 w-9 mx-auto" : "px-3 py-2 gap-3"}
                text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50`}
            >
              <ChevronLeft className={`w-4 h-4 shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
              {!isEffectiveCollapsed && <span className="text-xs">Collapse</span>}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{collapsed ? "Expand" : "Collapse"}</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="mx-3 border-t border-sidebar-border/50" />

      {/* User Profile */}
      <div className="shrink-0 px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-3 w-full rounded-lg px-2.5 py-2 hover:bg-sidebar-accent/50 transition-colors outline-none text-left group
              ${isEffectiveCollapsed ? "justify-center" : ""}`}
            >
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0 ring-2 ring-sidebar-border">
                <CircleUserRound className="w-4 h-4 text-sidebar-foreground/70" />
              </div>
              {!isEffectiveCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate capitalize">{displayName || "User"}</p>
                    <p className="text-[11px] text-sidebar-foreground/50 truncate capitalize">Admin</p>
                  </div>
                  <MoreVertical className="w-4 h-4 text-sidebar-foreground/40 group-hover:text-sidebar-foreground/70 transition-colors shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align={isEffectiveCollapsed ? "start" : "end"} className="w-56 mb-2 bg-surface-overlay border-border shadow-xl rounded-xl p-1.5">
            <DropdownMenuLabel className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground capitalize">{displayName || "User"}</p>
              <p className="text-xs text-neutral-500">{user?.email || "admin@co2suite.com"}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem onClick={() => router.push('/profile')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer">
              <User className="w-4 h-4 text-neutral-500" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer">
              <Settings className="w-4 h-4 text-neutral-500" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem onClick={() => logout()} className="flex items-center gap-2 px-3 py-2 text-sm text-negative-600 rounded-lg cursor-pointer font-medium">
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);
