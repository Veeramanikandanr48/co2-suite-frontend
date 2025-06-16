"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { sidebarList } from "@/components/constants/sidebar-list";
import { ChevronLeft, ChevronRight, CircleUserRound } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
const SidebarItem = dynamic(() => import("./sidebar-items"), { ssr: false });
import { SidebarItemType } from "@/types/sidebar";
import { useAuth } from "@/context/auth-provider";
import Image from "next/image";
import { FORM_CONFIGURATION } from "@/lib/variables";
import EventBus from "@/lib/eventbus";

// Recursive function to check if any descendant matches the pathname
function hasActiveDescendant(item: SidebarItemType, pathname: string): boolean {
  if (!item.child) return false;
  return item.child.some((child: SidebarItemType) => {
    const fullHref = `${item.href}${child.href}`;
    return pathname.startsWith(fullHref) || hasActiveDescendant({ ...child, href: fullHref }, pathname);
  });
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const { user } = useAuth();

  const displayName: string = user ? `${user.firstName} ${user.lastName ?? ''}`.trim() : '';


  const indexedSidebar = useMemo(() => {
    const map = new Map();
    sidebarList.forEach((item) => {
      map.set(item.href, item);
      item?.child?.forEach((child: SidebarItemType) => {
        map.set(`${item.href}${child.href}`, { ...child, parentHref: item.href });
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
      router.replace(`${parentItem.href}${parentItem.child[0].href}`);
    }
  }, [pathname, router, indexedSidebar]);

  return (
    <div className={`h-full transition-[width]
        duration-300 ease-in-out pb-4 relative before:absolute before:top-0 before:left-0 before:h-full before:w-full
        shadow-[inset_0px_3px_10px_0px_#0000001A] ${collapsed ? "w-[80px]" : "w-[246px]"}`}
    >
      <button className={`flex mx-auto ${collapsed ? "w-auto" : "w-[86%]"} gap-3 border-b border-border-logo py-2`} onClick={() => handleItemClick('/')}>
        <Image
          src="/images/CMP.svg"
          className="w-fit"
          alt="My Image"
          width={300}
          height={300}
        />
        {!collapsed && (
          <p className="text-[28px] font-light text-text-sidebar">
            CMP
          </p>
        )}
      </button>
      <ul className="mt-[10px]">
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
      </ul>

      <div className="absolute left-0 right-0 bottom-0 w-full px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-[44px] h-[44px] rounded-full bg-background-sidebarActive border border-profile-border">
            <CircleUserRound className="w-7 aspect-square text-text-sidebar" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-text-sidebar font-medium text-sm capitalize">{displayName}</p>
              <p className="text-xs font-normal text-gray-400 capitalize">Admin</p>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-full transform -translate-x-1/2 cursor-pointer">
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
  );
};

export default Sidebar;
