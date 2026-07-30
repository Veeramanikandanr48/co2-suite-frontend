"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import {
  Bell,
  Search,
  Menu,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  CircleUserRound,
  LogOut,
  User,
  Settings,
  X,
  Command,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "info" | "alert" | "success";
  read: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Emission Threshold Alert",
    description: "Facility #3 exceeded monthly target by 4.2%",
    time: "10m ago",
    type: "alert",
    read: false,
  },
  {
    id: "2",
    title: "Monthly Audit Report Ready",
    description: "Q2 Carbon accounting report generated successfully.",
    time: "1h ago",
    type: "success",
    read: false,
  },
  {
    id: "3",
    title: "System Maintenance",
    description: "Scheduled upgrade on Sunday at 02:00 UTC.",
    time: "3h ago",
    type: "info",
    read: false,
  },
];

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

const notificationIcons = {
  alert: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const notificationColors = {
  alert: "text-warning-500",
  success: "text-positive-500",
  info: "text-primary",
};

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [searchOpen, setSearchOpen] = useState(false);

  const displayName = user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 w-full h-header bg-header border-b border-header-border flex items-center justify-between px-4 lg:px-6 gap-4">
      {/* Left */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileSidebar}
          className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden text-foreground outline-none cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumb className="hidden sm:flex min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-sm text-neutral-500 hover:text-foreground transition-colors">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator className="text-neutral-300" />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-sm font-semibold text-foreground capitalize truncate max-w-[160px]">
                        {title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-sm text-neutral-500 hover:text-foreground capitalize transition-colors truncate">
                        {title}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg bg-muted/60 border border-border text-sm text-neutral-500 hover:text-foreground hover:border-neutral-300 transition-colors cursor-pointer outline-none min-w-[200px]"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-neutral-400 bg-background border border-border rounded">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative p-2 rounded-lg hover:bg-muted transition-colors text-neutral-500 hover:text-foreground outline-none cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-negative-500 animate-ping-slow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-negative-500" />
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80 p-0 bg-surface-overlay border-border shadow-xl rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-negative-50 text-negative-600">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary-700 transition-colors cursor-pointer font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {notifications.map((item) => {
                const Icon = notificationIcons[item.type];
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3 flex gap-3 transition-colors cursor-pointer ${
                      !item.read ? "bg-primary-50/50 dark:bg-primary-50/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon className={`w-4 h-4 ${notificationColors[item.type]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs ${!item.read ? "font-semibold text-foreground" : "font-medium text-neutral-700 dark:text-neutral-300"} truncate`}>
                          {item.title}
                        </p>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">{item.time}</span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-border text-center bg-muted/30">
              <button className="text-xs font-medium text-neutral-500 hover:text-foreground transition-colors cursor-pointer py-1">
                View all notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer outline-none">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <CircleUserRound className="w-4 h-4 text-primary" />
              </div>
              <span className="hidden lg:inline-block text-sm font-medium text-foreground capitalize max-w-[100px] truncate">
                {displayName || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56 mt-1 bg-surface-overlay border-border shadow-xl rounded-xl p-1.5">
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
    </header>
  );
}
