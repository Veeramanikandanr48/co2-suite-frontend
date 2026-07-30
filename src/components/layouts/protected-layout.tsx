"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/auth-provider"
import { useRouter } from "next/navigation"
import Header from "./header"
import Sidebar from "./sidebar"
import { Loader } from "@/components/shared/loader"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface ProtectedLayoutProps {
  readonly children: React.ReactNode
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in/admin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isServiceDetail = pathname.startsWith('/services/');

  return (
    <div className="w-full h-screen flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 border-r-0 w-[280px] overflow-hidden">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full bg-surface-subtle overflow-hidden">
        <Header onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className={`flex-1 min-h-0 ${isServiceDetail ? 'overflow-hidden flex flex-col' : 'overflow-auto scrollbar-custom'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isServiceDetail ? 'service-detail-view' : pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className={`min-h-full ${isServiceDetail ? 'h-full flex flex-col flex-1' : ''}`}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default ProtectedLayout
