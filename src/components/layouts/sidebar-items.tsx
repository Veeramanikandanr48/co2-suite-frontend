"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/components/svg";
import EventBus from "../../lib/eventbus";
import { FORM_CONFIGURATION } from "@/lib/variables";
import { SidebarItemProps } from "@/types/sidebar";

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isOpen, collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveParent = pathname.startsWith(item.href);

  const handleParentClick = () => {
    if (!item.child?.length) {
      handleItemClick(item.href)
    } else if (pathname !== `${item.href}${item.child[0].href}`) {
      const fullHref: string = `${item.href}${item.child[0].href}`;
      handleItemClick(fullHref)
    }

    if(collapsed) {
      setCollapsed(false);
    }
  };

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

  const IconComponent = (Icons as Record<string, React.FC<{ className?: string; stroke?: string }>>)[item.icon ?? ""];

  return (
    <div className={`relative ${(isOpen && !collapsed) ? "border-b border-gray-400" : ""}`}>
      <button
        onClick={handleParentClick} 
        className={`text-sm mx-auto ${collapsed ? "w-[64%]" : "w-[86%]"} px-3 py-[10px] rounded-lg flex items-center cursor-pointer relative h-[50px] text-neutral-400
        ${isActiveParent ? "bg-background-sidebarActive text-light-100" : ""} ${collapsed ? "justify-center" : ""}`}
      >
        {IconComponent && <IconComponent className={`${!collapsed && "mr-2"}`} stroke={isActiveParent ? "var(--icon-color-active)" : "var(--icon-color)"} />}

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap capitalize ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"} ${isActiveParent ? "text-light-100 font-medium" : "text-text-sidebar"}`}
        >
          {item.name}
        </div>
      </button>

      {!collapsed && isOpen && item.child && (                                                                
        <div className="ml-6 flex flex-col items-start">
          {item.child.map((subItem) => {
            const fullHref = `${item.href}${subItem.href}`;
            const isActiveChild = pathname.startsWith(fullHref);

            return (
              <button onClick={()=>handleItemClick(fullHref)} key={fullHref}>
                <div className={`text-xs pl-6 p-2 rounded-md cursor-pointer ${isActiveChild ? "text-primary-300 font-medium" : "text-neutral-500"}`}>
                  <div className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2"}`}>
                    {subItem.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(SidebarItem);
