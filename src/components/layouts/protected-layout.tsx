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
    <div className="w-full h-screen flex bg-background-sidebar">
      <Sidebar />
      <div className="flex-1 flex flex-col py-2">
        <main className="flex-1 bg-white rounded-tl-[20px] rounded-bl-[20px] flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 overflow-auto p-4">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default ProtectedLayout