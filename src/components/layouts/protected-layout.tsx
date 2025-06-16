"use client"
import type React from "react"
import { useAuth } from "@/context/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import { Loader } from "../reusables/loader"

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
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex flex-1">
        <div>
          <Sidebar />
        </div>
        <main className="flex-1 py-4 overflow-y-auto bg-background-outer shadow-[inset_2px_2px_10px_0px_#0000001A]">
          <Header />
          <div className="px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout