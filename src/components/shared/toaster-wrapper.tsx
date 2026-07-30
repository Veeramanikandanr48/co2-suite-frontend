"use client"

import { Toaster as SonnerToaster } from "sonner"
import { Toaster } from "./toaster"

export function ToasterWrapper() {
  return (
    <>
      <Toaster />
      <SonnerToaster position="top-right" richColors />
    </>
  )
} 