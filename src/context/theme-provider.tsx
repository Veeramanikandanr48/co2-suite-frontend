"use client"

import { useEffect } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: Readonly<ThemeProviderProps>) {

  useEffect(() => {
    const savedTheme: string | null = localStorage.getItem("theme")
    if (savedTheme) {
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}