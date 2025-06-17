"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface OnboardingLayoutProps {
  children: ReactNode
}

const OnboardingLayout = ({ children }: OnboardingLayoutProps) => { 
  const pathname = usePathname()
  const isPreferencesPage = pathname.includes("/preferences")

  // Common components that should be shown on all pages except preferences
  const CommonComponents = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          1
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          2
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          3
        </div>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          4
        </div>
      </div>
      <div className="text-sm text-gray-500">
        Step {pathname.includes("basic-details") ? "1" : 
              pathname.includes("education-details") ? "2" :
              pathname.includes("work-experience") ? "3" : "4"} of 4
      </div>
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {!isPreferencesPage && <CommonComponents />}
      {children}
    </div>
  )
}

export default OnboardingLayout 