"use client"
import type React from "react"
import { useAuth } from "@/context/auth-provider"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import Header from "./header"
import Sidebar from "./sidebar"

interface ProtectedLayoutProps {
  readonly children: React.ReactNode
}
const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ children }) => {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in")
    }
  }, [user, isLoading, router])
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }
  if (!user) {
    return null
  }
  return (
<div className="w-full h-screen flex flex-col">
  <Header />
  <div className="flex flex-1">
    <div>
      <Sidebar />
    </div>
    <main className="flex-1 p-4 overflow-y-auto bg-background-outer shadow-[inset_2px_2px_10px_0px_#0000001A]">
      {children}
    </main>
  </div>
</div>


  )
}

export default ProtectedLayout