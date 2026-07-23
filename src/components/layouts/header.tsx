"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
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
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { useTheme } from "next-themes";
import {
  CircleUserRound,
  LogOut,
  User as UserIcon,
  Settings,
  Bell,
  Search,
  CheckCheck,
  AlertCircle,
  CheckCircle2,
  Info,
  Menu,
  Sun,
  Moon,
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
    title: "CO2 Emission Threshold Alert",
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
    title: "System Maintenance Scheduled",
    description: "Scheduled upgrade on Sunday at 02:00 UTC.",
    time: "3h ago",
    type: "info",
    read: false,
  },
];

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export default function Header({ onOpenMobileSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const displayName: string = user
    ? user.userName || user.name || (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email?.split('@')[0] || '')
    : '';
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    }
  };

  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="shrink-0 w-full min-h-[52px] flex items-center justify-between py-2 px-3 sm:px-6 border-b border-neutral-200 dark:border-neutral-800 shadow-xs z-10 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 gap-3 sm:gap-4 transition-colors">
      {/* Left side: Mobile Menu Toggle & Breadcrumb Navigation */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors md:hidden text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer shrink-0"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Breadcrumb className="hidden sm:flex min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium text-xs sm:text-sm">
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const href = `/${segments.slice(0, index + 1).join("/")}`;
              const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

              return (
                <React.Fragment key={href}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-semibold text-neutral-900 dark:text-white capitalize text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                        {title}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white capitalize font-medium text-xs sm:text-sm truncate">
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

      {/* Right side: Theme Toggle, Search, Notifications Popover, User Dropdown Menu */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 outline-none cursor-pointer flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle Theme"
        >
          <Sun className="w-5 h-5 hidden dark:block text-amber-400" />
          <Moon className="w-5 h-5 block dark:hidden text-neutral-600" />
        </button>

        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search parameters, data..."
            className="pl-9 pr-12 h-9 w-64 bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-xs rounded-lg focus-visible:ring-1 focus-visible:ring-primary text-neutral-900 dark:text-neutral-100"
          />
          <kbd className="absolute right-2.5 top-2 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded shadow-2xs pointer-events-none">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className="relative p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300 outline-none cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent side="bottom" align="end" className="w-80 p-0 bg-white shadow-xl rounded-xl border border-gray-100 z-50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">Notifications</h4>
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="bg-red-50 text-red-600 font-semibold text-[11px] px-1.5 py-0.2">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex gap-3 transition-colors ${
                    !item.read ? "bg-blue-50/30" : "hover:bg-gray-50/60"
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === "alert" && <AlertCircle className="w-4 h-4 text-amber-500" />}
                    {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {item.type === "info" && <Info className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs ${!item.read ? "font-semibold text-gray-900" : "font-medium text-gray-700"} truncate`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-gray-100 text-center bg-gray-50/50 rounded-b-xl">
              <button className="text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer py-1">
                View all notifications
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer outline-none">
              <div className="w-8 h-8 rounded-full bg-background-sidebarActive border border-profile-border flex items-center justify-center">
                <CircleUserRound className="w-5 h-5 text-text-sidebar" />
              </div>
              <span className="hidden sm:inline-block text-xs font-medium text-gray-700 capitalize max-w-[100px] truncate">
                {displayName || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="w-56 mt-1 bg-white shadow-xl rounded-xl border border-gray-100 p-1 z-50">
            <DropdownMenuLabel className="font-normal p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none text-gray-900 capitalize">{displayName || "User"}</p>
                <p className="text-xs leading-none text-gray-500">{user?.email || "admin@co2suite.com"}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer">
              <Settings className="w-4 h-4 text-gray-500" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg cursor-pointer font-medium"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
