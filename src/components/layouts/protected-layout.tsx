"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-provider"
import { useRouter } from "next/navigation"
import Header from "./header"
import Sidebar from "./sidebar"
import { Loader } from "../reusables/loader"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface ProtectedLayoutProps {
  readonly children: React.ReactNode
}

const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in/admin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full h-screen flex bg-background-sidebar overflow-hidden">
      {/* Desktop Sidebar Container */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 border-r-0 bg-background-sidebar w-[260px] text-white overflow-hidden z-50">
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
  )
}

export default ProtectedLayout