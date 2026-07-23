"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { sidebarList } from "@/components/constants/sidebar-list";
import {
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  LogOut,
  User as UserIcon,
  Settings,
  MoreVertical,
  Leaf,
  Globe,
  Zap,
  ChevronsUpDown,
  Check,
  Plus,
  Building2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { SidebarProvider, SidebarMenu } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
const SidebarItem = dynamic(() => import("./sidebar-items"), { ssr: false });
import { SidebarItemType } from "@/types/sidebar";
import { useAuth } from "@/context/auth-provider";
import Image from "next/image";
import { FORM_CONFIGURATION } from "@/lib/variables";
import EventBus from "@/lib/eventbus";

const CmpLogoIcon = ({ className = "w-7 h-7" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" className={className}>
    <defs>
      <linearGradient id="cmp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="50%" stopColor="#059669" />
        <stop offset="100%" stopColor="#0284C7" />
      </linearGradient>
      <linearGradient id="cmp-leaf" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="24" fill="url(#cmp-grad)" />
    <circle cx="50" cy="50" r="34" stroke="white" strokeOpacity="0.25" strokeWidth="3" strokeDasharray="6 4" />
    <path d="M50 22C35 22 26 35 26 50C26 65 37 78 50 78C63 78 74 65 74 50C74 35 65 22 50 22ZM50 70C40 70 33 60 33 50C33 40 41 30 50 30C50 42 42 50 33 50C42 50 50 58 50 70Z" fill="white" fillOpacity="0.95" />
    <path d="M50 30C58 38 66 42 70 50C62 50 54 58 50 70C50 58 42 50 34 50C42 42 50 38 50 30Z" fill="url(#cmp-leaf)" />
  </svg>
);

interface WorkspaceLogo {
  id: string;
  name: string;
  plan: string;
  iconBg: string;
  icon: React.ReactNode;
}

const workspaceLogos: WorkspaceLogo[] = [
  {
    id: "co2-suite",
    name: "CO2 Suite",
    plan: "Enterprise",
    icon: <CmpLogoIcon className="w-7 h-7" />,
    iconBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 p-0.5",
  },
  {
    id: "ecotrack",
    name: "EcoTrack",
    plan: "Carbon Pro",
    icon: <Leaf className="w-4 h-4 text-emerald-400" />,
    iconBg: "bg-emerald-500/20 border-emerald-500/40",
  },
  {
    id: "netzero",
    name: "NetZero Cloud",
    plan: "ESG Enterprise",
    icon: <Zap className="w-4 h-4 text-amber-400" />,
    iconBg: "bg-amber-500/20 border-amber-500/40",
  },
  {
    id: "global-carbon",
    name: "Global Carbon",
    plan: "Multi-site Hub",
    icon: <Globe className="w-4 h-4 text-cyan-400" />,
    iconBg: "bg-cyan-500/20 border-cyan-500/40",
  },
];

function hasActiveDescendant(item: SidebarItemType, pathname: string): boolean {
  if (!item.child) return false;
  return item.child.some((child: SidebarItemType) => {
    const fullHref = child.href.startsWith(item.href)
      ? child.href
      : `${item.href}${child.href}`;
    return pathname.startsWith(fullHref) || hasActiveDescendant({ ...child, href: fullHref }, pathname);
  });
}

interface SidebarProps {
  collapsed?: boolean;
  setCollapsed?: React.Dispatch<React.SetStateAction<boolean>> | ((collapsed: boolean) => void);
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed: externalCollapsed,
  setCollapsed: externalSetCollapsed,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(false);

  const collapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const setCollapsed = externalSetCollapsed || setInternalCollapsed;

  const [activeLogo, setActiveLogo] = useState<WorkspaceLogo>(workspaceLogos[0]);
  const { user, logout } = useAuth();

  const displayName: string = user
    ? user.userName || user.name || (user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email?.split('@')[0] || '')
    : '';

  const indexedSidebar = useMemo(() => {
    const map = new Map();
    sidebarList.forEach((item) => {
      map.set(item.href, item);
      item?.child?.forEach((child: SidebarItemType) => {
        const fullHref = child.href.startsWith(item.href)
          ? child.href
          : `${item.href}${child.href}`;
        map.set(fullHref, { ...child, parentHref: item.href });
      });
    });
    return map;
  }, []);

  const handleItemClick = (requestHref: string) => {
    const currentroute: string = pathname;
    let modifiedRoute = currentroute;
    modifiedRoute = modifiedRoute.replace(/\d+/g, '[id]');
    const formExit: boolean = FORM_CONFIGURATION[modifiedRoute];
    if (formExit) {
      EventBus.$emit(`${currentroute}`, requestHref);
    } else {
      router.push(requestHref);
    }
  };

  useEffect(() => {
    const activeParent = sidebarList.find((item) =>
      hasActiveDescendant(item, pathname)
    );

    setOpenMenu((prev) => (prev === activeParent?.href ? prev : activeParent?.href ?? null));

    const parentItem = indexedSidebar.get(pathname);
    if (parentItem?.child?.length && pathname === parentItem.href) {
      const firstChild = parentItem.child[0];
      const targetHref = firstChild.href.startsWith(parentItem.href)
        ? firstChild.href
        : `${parentItem.href}${firstChild.href}`;
      router.replace(targetHref);
    }
  }, [pathname, router, indexedSidebar]);

  return (
    <SidebarProvider open={!collapsed} onOpenChange={(open) => setCollapsed(!open)} className="h-full">
      <div className={`h-full relative before:absolute before:top-0 before:left-0 before:h-full before:w-full
          shadow-[inset_0px_3px_10px_0px_#0000001A] transition-[width] duration-300 ease-in-out will-change-[width] ${collapsed ? "w-[80px]" : "w-[246px]"}`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center justify-between mx-auto py-2.5 px-3 my-2 rounded-xl hover:bg-white/10 transition-all cursor-pointer outline-none text-left group ${collapsed ? 'w-[80%]' : 'w-[90%]'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${activeLogo.iconBg}`}>
                  {activeLogo.icon}
                </div>
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                  <p className="text-base font-light text-text-sidebar whitespace-nowrap truncate">{activeLogo.name}</p>
                  <p className="text-[10px] font-normal text-gray-400 whitespace-nowrap">{activeLogo.plan}</p>
                </div>
              </div>
              {!collapsed && (
                <ChevronsUpDown className="w-4 h-4 text-gray-400 group-hover:text-text-sidebar transition-colors shrink-0 ml-1" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start" className="w-60 mt-1 bg-white shadow-xl rounded-xl border border-gray-100 p-1.5 z-50">
            <DropdownMenuLabel className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase tracking-wider">
              Organizations & Logos
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
            {workspaceLogos.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => {
                  setActiveLogo(item);
                  handleItemClick('/');
                }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-900 truncate">{item.name}</span>
                    <span className="text-[10px] text-gray-400">{item.plan}</span>
                  </div>
                </div>
                {activeLogo.id === item.id && (
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 bg-gray-100" />
            <DropdownMenuItem className="flex items-center gap-2 p-2 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg cursor-pointer">
              <Plus className="w-4 h-4" />
              <span>Add Organization</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className={`${collapsed ? 'w-[64%]' : 'w-[86%]'} mx-auto border-b border-border-logo`}></div>

        <ScrollArea className="h-[calc(100%-160px)]">
          <SidebarMenu className="mt-[10px] transition-all duration-300 ease-in-out pb-4">
            {sidebarList.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isOpen={openMenu === item.href}
                setOpenMenu={setOpenMenu}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
              />
            ))}
          </SidebarMenu>
        </ScrollArea>

        <div className="absolute left-0 right-0 bottom-0 w-full px-3 py-4 bg-background-sidebar">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-between w-full p-2 rounded-xl hover:bg-background-sidebarActive/50 transition-colors text-left group cursor-pointer outline-none">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center min-w-[40px] h-[40px] rounded-full bg-background-sidebarActive border border-profile-border shrink-0">
                    <CircleUserRound className="w-6 h-6 text-text-sidebar" />
                  </div>
                  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    <p className="text-text-sidebar font-medium text-sm capitalize whitespace-nowrap truncate max-w-[110px]">{displayName || "User"}</p>
                    <p className="text-xs font-normal text-gray-400 capitalize whitespace-nowrap">Admin</p>
                  </div>
                </div>
                {!collapsed && (
                  <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-text-sidebar transition-colors shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align={collapsed ? "start" : "end"} className="w-56 mb-2 bg-white shadow-xl rounded-xl border border-gray-100 p-1 z-50">
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

        <div className="absolute bottom-4 left-full transform -translate-x-1/2 cursor-pointer transition-transform duration-300 ease-in-out z-10">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="bg-white rounded-full p-1 hover:bg-gray-50 transition-all cursor-pointer shadow-[-3px_0px_10px_0px_#0000001A]">
                  {collapsed ? <ChevronRight size={25} /> : <ChevronLeft size={25} />}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collapsed ? "Expand" : "Collapse"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Sidebar;