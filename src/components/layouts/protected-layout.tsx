"use client";
import type React from "react";
import { useState } from "react";
import AuthGuard from "@/components/guards/auth-guard";
import { PermissionsProvider } from "@/context/permissions-provider";
import Header from "./header";
import Sidebar from "./sidebar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ProtectedLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * ProtectedLayout — the shell for all authenticated pages.
 *
 * Hierarchy:
 *   AuthGuard (redirects if no session)
 *     └── PermissionsProvider (builds CASL ability from auth permissions)
 *           └── Sidebar + Header + Content
 *
 * For per-page role/permission checks, compose RoleGuard or PermissionGuard
 * inside individual page components rather than here.
 */
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AuthGuard>
      <PermissionsProvider>
        <div className="w-full h-screen flex bg-background-sidebar overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block h-full shrink-0">
            <Sidebar />
          </div>

          {/* Mobile Drawer Sidebar */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="p-0 border-r-0 bg-background-sidebar w-[260px] text-white overflow-hidden z-50"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="h-full w-full">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-full py-0 md:py-2">
            <main className="flex-1 bg-white md:rounded-tl-[20px] md:rounded-bl-[20px] flex flex-col overflow-hidden shadow-xs">
              <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
              <div className="flex-1 overflow-auto p-3 sm:p-5">{children}</div>
            </main>
          </div>
        </div>
      </PermissionsProvider>
    </AuthGuard>
  );
};

export default ProtectedLayout;