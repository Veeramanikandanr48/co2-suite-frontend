"use client"

import { Toaster as RadixToaster } from "./toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"

export function ToasterWrapper() {
  return (
    <>
      <RadixToaster />
      <SonnerToaster position="top-right" richColors closeButton />
    </>
  )
} 