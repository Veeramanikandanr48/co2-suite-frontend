"use client";
import React, { useState, useMemo, useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/guards/auth-guard";
import { PermissionsProvider } from "@/context/permissions-provider";
import Header from "./header";
import Sidebar from "./sidebar";
import InnerSidebar from "./inner-sidebar";
import { sidebarList } from "@/components/constants/sidebar-list";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ProtectedLayoutProps {
  readonly children: React.ReactNode;
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [innerSidebarOpen, setInnerSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Find active parent item in sidebar list
  const activeParent = useMemo(() => {
    return (
      sidebarList.find((item) => {
        if (!item.child || item.child.length === 0) return false;
        // Check if current route matches parent href
        if (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))) {
          return true;
        }
        // Check if current route matches any child href
        return item.child.some((child) => {
          if (!child.href) return false;
          const cleanChildHref = child.href.split("?")[0];
          const fullHref = cleanChildHref.startsWith("/")
            ? cleanChildHref
            : `${item.href}${cleanChildHref}`;
          return (
            pathname === cleanChildHref ||
            pathname === fullHref ||
            (cleanChildHref !== "/" && pathname.startsWith(cleanChildHref)) ||
            (fullHref !== "/" && pathname.startsWith(fullHref))
          );
        });
      }) || null
    );
  }, [pathname]);

  // When navigating to a new parent section with sub-items, auto-collapse main rail to icon mode
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
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden p-3 sm:p-5">{children}</div>
            </main>
          </div>
        </div>
      </PermissionsProvider>
    </AuthGuard>
  );
};

export default ProtectedLayout;