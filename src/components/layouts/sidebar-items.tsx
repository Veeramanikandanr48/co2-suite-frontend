"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icons } from "@/components/svg";
import EventBus from "../../lib/eventbus";
import { FORM_CONFIGURATION } from "@/lib/variables";
import { SidebarItemProps } from "@/types/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";

const SidebarItem: React.FC<SidebarItemProps> = ({ item, isOpen: _isOpen, collapsed, setCollapsed: _setCollapsed }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActiveParent =
    pathname === item.href ||
    (item.child &&
      item.child.some((c) => c.href !== "" && pathname.startsWith(`${item.href}${c.href}`)));

  const handleParentClick = () => {
    if (!item.child?.length) {
      handleItemClick(item.href);
    } else {
      const firstChild = item.child[0];
      const fullHref = `${item.href}${firstChild.href}`;
      handleItemClick(fullHref);
    }
  };

  const handleItemClick = (requestHref: string) => {
    const currentroute: string = pathname;
    let modifiedRoute = currentroute;
    modifiedRoute = modifiedRoute.replace(/\d+/g, "[id]");
    const formExit: boolean = FORM_CONFIGURATION[modifiedRoute];
    if (formExit) {
      EventBus.$emit(`${currentroute}`, requestHref);
    } else {
      router.push(requestHref);
    }
  };

  const IconComponent = (Icons as Record<string, React.FC<{ className?: string; stroke?: string }>>)[
    item.icon ?? ""
  ];

  const renderButton = () => (
    <SidebarMenuButton
      asChild
      isActive={isActiveParent}
      tooltip={collapsed ? item.name : undefined}
      onClick={handleParentClick}
      className={`text-sm mx-auto ${
        collapsed ? "w-[72%]" : "w-[88%]"
      } px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer relative h-11 text-neutral-300 hover:bg-white/10 transition-all ${
        isActiveParent ? "bg-background-sidebarActive text-white font-semibold shadow-xs" : ""
      } ${collapsed ? "justify-center" : ""}`}
    >
      <button type="button" className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          {IconComponent && (
            <IconComponent
              className="shrink-0"
              stroke={isActiveParent ? "var(--icon-color-active)" : "var(--icon-color)"}
            />
          )}

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap capitalize text-xs ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            } ${isActiveParent ? "text-white font-medium" : "text-text-sidebar"}`}
          >
            {item.name}
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1.5">
            {item.badge && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white/15 text-white">
                {item.badge}
              </span>
            )}
            {item.child && item.child.length > 0 && (
              <ChevronRight
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  isActiveParent ? "rotate-90 text-white" : ""
                }`}
              />
            )}
          </div>
        )}
      </button>
    </SidebarMenuButton>
  );

  return (
    <SidebarMenuItem className="relative py-0.5 group/item">
      {collapsed ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
            <TooltipContent side="right" className="bg-neutral-900 text-white border-neutral-800 text-xs">
              <p>{item.name} {item.badge ? `(${item.badge})` : ""}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderButton()
      )}
    </SidebarMenuItem>
  );
};

export default React.memo(SidebarItem);
