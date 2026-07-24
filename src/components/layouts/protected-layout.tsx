"use client";
import React, { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/guards/auth-guard";
import { PermissionsProvider } from "@/context/permissions-provider";
import Header from "./header";
import Sidebar from "./sidebar";
import InnerSidebar from "./inner-sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useSidebarMenu } from "@/hooks/use-sidebar-menu";
import { SidebarItemType } from "@/types/sidebar";

/**
 * Recursively searches menu tree for active group item that owns child sub-menus.
 */
function findActiveGroupItem(items: SidebarItemType[], pathname: string): SidebarItemType | null {
  for (const item of items) {
    if (item.itemType !== "HEADER" && item.child && item.child.length > 0) {
      const isParentMatch =
        (item.href && item.href !== "#" && pathname.startsWith(item.href)) ||
        (item.activeMatch &&
          (item.activeMatch.endsWith("/*")
            ? pathname.startsWith(item.activeMatch.slice(0, -2))
            : pathname === item.activeMatch));

      const isChildMatch = item.child.some((child) => {
        if (!child.href || child.href === "#") return false;
        const cleanHref = child.href.split("?")[0];
        const fullHref = cleanHref.startsWith("/") ? cleanHref : `${item.href}${cleanHref}`;
        return (
          pathname === cleanHref ||
          pathname === fullHref ||
          (cleanHref !== "/" && pathname.startsWith(cleanHref)) ||
          (fullHref !== "/" && pathname.startsWith(fullHref))
        );
      });

      if (isParentMatch || isChildMatch) {
        return item;
      }
    }

    if (item.child && item.child.length > 0) {
      const foundInChild = findActiveGroupItem(item.child, pathname);
      if (foundInChild) return foundInChild;
    }
  }
  return null;
}

interface ProtectedLayoutProps {
  readonly children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [innerSidebarOpen, setInnerSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { menuItems } = useSidebarMenu();

  // Find active parent item for secondary sub-sidebar
  const activeParent = useMemo(() => {
    return findActiveGroupItem(menuItems, pathname);
  }, [pathname, menuItems]);

  // When navigating to a section with sub-items, auto-collapse main rail to icon mode and open sub-sidebar
  useEffect(() => {
    if (activeParent) {
      setCollapsed(true);
      setInnerSidebarOpen(true);
    } else {
      setCollapsed(false);
    }
  }, [activeParent?.href]);

  const hasSubSidebar = Boolean(activeParent && activeParent.child && activeParent.child.length > 0 && innerSidebarOpen);

  return (
    <AuthGuard>
      <PermissionsProvider>
        <div className="w-full h-full flex bg-background-sidebar overflow-hidden">
          {/* Desktop Dual Sidebar Layout */}
          <div className="hidden md:flex h-full shrink-0">
            {/* Primary Rail Sidebar */}
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            {/* Secondary Inner Sub-Sidebar Panel */}
            {hasSubSidebar && (
              <InnerSidebar
                parentItem={activeParent}
                onClose={() => setInnerSidebarOpen(false)}
              />
            )}
          </div>

          {/* Mobile Drawer Sidebar */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="p-0 border-r-0 bg-background-sidebar w-[320px] text-white overflow-hidden z-50 flex"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="h-full flex w-full">
                <Sidebar collapsed={true} setCollapsed={() => {}} />
                {activeParent && (
                  <div className="flex-1 bg-background-sidebar text-white overflow-hidden">
                    <InnerSidebar parentItem={activeParent} onClose={() => setMobileOpen(false)} />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 h-full overflow-hidden p-0 md:py-2">
            <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 md:rounded-tl-[20px] md:rounded-bl-[20px] overflow-hidden shadow-xs transition-colors">
              <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
              <div className="flex-1 min-h-0 flex flex-col overflow-y-auto p-3 sm:p-5 pb-24 sm:pb-32">{children}</div>
            </main>
          </div>
        </div>
      </PermissionsProvider>
    </AuthGuard>
  );
};

export default ProtectedLayout;