"use client";

import React, { useState } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { SidebarItemType, SidebarChildItem } from "@/types/sidebar";
import {
  ArrowLeft,
  Search,
  FileText,
  Mic,
  Inbox,
  Share2,
  MessageSquare,
  LayoutGrid,
  Sliders,
  Phone,
  Terminal,
  Star,
  Shield,
  Megaphone,
  FolderKanban,
  PanelLeftClose,
  ChevronRight,
  Users,
  Lock,
} from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import EventBus from "@/lib/eventbus";
import { FORM_CONFIGURATION } from "@/lib/variables";

interface InnerSidebarProps {
  parentItem: SidebarItemType | null;
  onClose?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  FileText: <FileText className="w-4 h-4" />,
  Mic: <Mic className="w-4 h-4" />,
  Inbox: <Inbox className="w-4 h-4" />,
  Share2: <Share2 className="w-4 h-4" />,
  MessageSquare: <MessageSquare className="w-4 h-4" />,
  LayoutGrid: <LayoutGrid className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  Phone: <Phone className="w-4 h-4" />,
  Terminal: <Terminal className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
};

export const InnerSidebar: React.FC<InnerSidebarProps> = ({ parentItem, onClose }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  if (!parentItem || !parentItem.child || parentItem.child.length === 0) {
    return null;
  }

  const currentTab = searchParams ? searchParams.get("tab") : null;

  const resolveChildHref = (childHref: string, parentHref: string) => {
    if (childHref.startsWith(parentHref)) return childHref;
    return childHref.startsWith("/")
      ? `${parentHref}${childHref}`
      : `${parentHref}/${childHref}`;
  };

  const handleChildClick = (childHref: string) => {
    const fullHref = resolveChildHref(childHref, parentItem.href);

    const currentroute: string = pathname;
    let modifiedRoute = currentroute;
    modifiedRoute = modifiedRoute.replace(/\d+/g, "[id]");
    const formExit: boolean = FORM_CONFIGURATION[modifiedRoute];
    if (formExit) {
      EventBus.$emit(`${currentroute}`, fullHref);
    } else {
      router.push(fullHref);
    }
  };

  const filteredChildren = parentItem.child.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups = filteredChildren.reduce<Record<string, SidebarChildItem[]>>((acc, child) => {
    const groupName = child.group || "Navigation";
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(child);
    return acc;
  }, {});

  return (
    <aside className="w-[240px] h-full bg-background-sidebar border-r border-white/10 flex flex-col shrink-0 transition-all duration-300 select-none shadow-inner">
      {/* Top Header Navigation */}
      <div className="p-3.5 border-b border-white/10 space-y-3">
        <button
          onClick={() => {
            if (onClose) onClose();
            router.push(parentItem.href);
          }}
          className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors group cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to all {parentItem.name.toLowerCase()}</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white border border-white/10">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight truncate max-w-[140px]">
                {parentItem.name}
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              title="Close sub-sidebar"
              className="p-1 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Filter in Inner Sidebar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white/10 border border-white/15 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-emerald-400/60 transition-all"
          />
        </div>
      </div>

      {/* Nav List */}
      <ScrollArea className="flex-1 px-2.5 py-3">
        <div className="space-y-4">
          {Object.entries(groups).map(([groupTitle, items]) => (
            <div key={groupTitle} className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                {groupTitle}
              </div>

              <div className="space-y-0.5">
                {items.map((child) => {
                  const targetUrl = resolveChildHref(child.href, parentItem.href);

                  const [childPath, childQueryStr] = targetUrl.split("?");
                  const childParams = new URLSearchParams(childQueryStr || "");
                  const childTab = childParams.get("tab");

                  let isActive = false;
                  if (childTab) {
                    isActive = pathname === childPath && currentTab === childTab;
                  } else if (childQueryStr) {
                    isActive = pathname === childPath && searchParams?.toString() === childQueryStr;
                  } else {
                    isActive = pathname === childPath && !currentTab;
                  }

                  return (
                    <button
                      key={child.name + child.href}
                      onClick={() => handleChildClick(child.href)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                        isActive
                          ? "bg-background-sidebarActive text-white font-semibold shadow-xs"
                          : "text-neutral-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`shrink-0 ${
                            isActive ? "text-white" : "text-neutral-400"
                          }`}
                        >
                          {child.icon && iconMap[child.icon] ? (
                            iconMap[child.icon]
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          )}
                        </span>
                        <span className="truncate">{child.name}</span>
                      </div>

                      {child.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-white/15 text-white">
                          {child.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};

export default InnerSidebar;
