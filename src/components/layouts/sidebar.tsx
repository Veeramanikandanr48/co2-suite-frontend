"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { sidebarList } from "@/components/constants/sidebar-list";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
const SidebarItem = dynamic(() => import("./sidebar-items"), { ssr: false });
import { SidebarItemType } from "@/types/sidebar";

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

  const indexedSidebar = useMemo(() => {
    const map = new Map();
    sidebarList.forEach((item) => {
      map.set(item.href, item);
      item.child?.forEach((child) => {
        map.set(`${item.href}${child.href}`, { ...child, parentHref: item.href });
      });
    });
    return map;
  }, []);

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
    <div className={`h-full bg-light-100 border-r border-neutral-100 transition-[width]
        duration-300 ease-in-out pb-4 relative before:absolute before:top-0 before:left-0 before:h-full before:w-full
        shadow-[inset_0px_3px_10px_0px_#0000001A] ${collapsed ? "w-[64px]" : "w-[250px]"}`}
    >
      <ul>
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
