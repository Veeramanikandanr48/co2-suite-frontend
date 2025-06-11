"use client"

import ProtectedLayout from "@/components/layouts/protected-layout"
import type { LayoutProps } from "@/types"

export default function ProtectedRouteLayout({
  children,
}: Readonly<LayoutProps>) {
  return <ProtectedLayout>{children}</ProtectedLayout>
} 
