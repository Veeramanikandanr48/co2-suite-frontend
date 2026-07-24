"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import EventBus from "@/lib/eventbus";
import { FORM_CONFIGURATION } from "@/lib/variables";
import { SidebarItemProps, SidebarItemType } from "@/types/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChevronRight } from "lucide-react";
import { DynamicIcon } from "@/lib/dynamic-icons";

type ExtendedSidebarItemType = SidebarItemType & {
  itemType?: string;
  activeMatch?: string;
  disabled?: boolean;
  disabledReason?: string;
  target?: string;
};

const SidebarItem: React.FC<SidebarItemProps> = ({
  item: rawItem,
  isOpen: _isOpen,
  setOpenMenu,
  collapsed,
  setCollapsed,
}) => {
  const item = rawItem as ExtendedSidebarItemType;
  const pathname = usePathname();
  const router = useRouter();
  const [groupExpanded, setGroupExpanded] = useState<boolean>(false);

  // Active path checking via exact match, prefix match, or wildcard activeMatch
  const isActiveParent = React.useMemo(() => {
    if (item.activeMatch) {
      if (item.activeMatch.endsWith("/*")) {
        const prefix = item.activeMatch.slice(0, -2);
        if (pathname.startsWith(prefix)) return true;
      } else if (pathname === item.activeMatch) {
        return true;
      }
    }
    if (item.href && item.href !== "#") {
      if (pathname === item.href) return true;
      if (item.href !== "/" && pathname.startsWith(item.href)) return true;
    }
    if (item.child && item.child.length > 0) {
      return item.child.some((c) => {
        if (!c.href) return false;
        const fullHref = c.href.startsWith("/") ? c.href : `${item.href}${c.href}`;
        return pathname === c.href || pathname === fullHref || pathname.startsWith(fullHref);
      });
    }
    return false;
  }, [pathname, item]);

  // Keep group expanded if active
  React.useEffect(() => {
    if (isActiveParent && item.itemType === "GROUP") {
      setGroupExpanded(true);
    }
  }, [isActiveParent, item.itemType]);

  // 1. Handle Section HEADERS (e.g. MAIN, ADMINISTRATION, SYSTEM)
  if (item.itemType === "HEADER") {
    return (
      <div className="w-full my-1">
        {collapsed ? (
          <div className="h-[1px] w-[60%] mx-auto my-3 bg-white/10" />
        ) : (
          <div className="px-4 pt-4 pb-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400/90 select-none">
            {item.name}
          </div>
        )}

        {/* Render child menu items directly under this section header */}
        {item.child && item.child.length > 0 && (
          <div className="space-y-0.5">
            {item.child.map((childNode, idx) => (
              <SidebarItem
                key={childNode.itemKey || (childNode.id ? `header-child-${childNode.id}` : `header-idx-${idx}-${childNode.name}`)}
                item={childNode}
                isOpen={_isOpen}
                setOpenMenu={setOpenMenu}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. Handle DIVIDERS
  if (item.itemType === "DIVIDER") {
    return <div className="mx-4 my-2 border-t border-white/10" />;
  }

  // 3. Handle Item Click
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

  const handleParentClick = () => {
    if (item.disabled) return;

    if (item.target === "_blank" && item.href) {
      window.open(item.href, "_blank");
      return;
    }

    if (item.child && item.child.length > 0) {
      setGroupExpanded((prev) => !prev);
      const firstChild = item.child[0];
      const targetHref = firstChild.href || item.href;
      if (targetHref && targetHref !== "#") {
        handleItemClick(targetHref);
      }
      return;
    }

    if (item.href && item.href !== "#") {
      handleItemClick(item.href);
    }
  };

  const getBadgeColor = (badgeText?: string) => {
    if (!badgeText) return "bg-white/15 text-white";
    if (badgeText === "BETA") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    if (badgeText === "NEW") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30";
  };

  const hasChildren = Boolean(item.child && item.child.length > 0);

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
      } ${item.disabled ? "opacity-50 cursor-not-allowed hover:bg-transparent" : ""} ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <button type="button" disabled={item.disabled} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <DynamicIcon
            name={item.icon}
            className={`shrink-0 transition-colors ${
              isActiveParent ? "text-emerald-400" : "text-gray-400 group-hover:text-white"
            }`}
            size={18}
          />

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap capitalize text-xs ${
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            } ${isActiveParent ? "text-white font-medium" : "text-text-sidebar"}`}
          >
            {item.name}
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1.5 ml-auto">
            {item.badge && (
              <span className={`px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase rounded-md ${getBadgeColor(item.badge)}`}>
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform duration-200 ${
                  groupExpanded ? "rotate-90 text-white" : ""
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
      {collapsed || item.disabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{renderButton()}</TooltipTrigger>
            <TooltipContent side="right" className="bg-neutral-900 text-white border-neutral-800 text-xs">
              <p>
                {item.name} {item.badge ? `(${item.badge})` : ""}
                {item.disabledReason ? ` - ${item.disabledReason}` : ""}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        renderButton()
      )}

      {/* Accordion dropdown for sub-items when group is expanded */}
      {!collapsed && hasChildren && groupExpanded && (
        <div className="pl-6 pt-0.5 space-y-0.5 border-l border-white/10 ml-5 my-0.5">
          {item.child!.map((childNode, idx) => (
            <SidebarItem
              key={childNode.itemKey || (childNode.id ? `group-child-${childNode.id}` : `group-idx-${idx}-${childNode.name}`)}
              item={childNode}
              isOpen={_isOpen}
              setOpenMenu={setOpenMenu}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
          ))}
        </div>
      )}
    </SidebarMenuItem>
  );
};

export default React.memo(SidebarItem);
