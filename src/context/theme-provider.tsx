"use client"

import { useEffect, ComponentProps } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

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