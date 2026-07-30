"use client"

import { useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/shared/loader";
import { Leaf } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader />
    </div>
  );

  if (user) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-background to-primary-50/40 dark:from-neutral-950 dark:via-background dark:to-primary-950/30">
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px]">
          {/* Brand */}
          <div className="flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">CO2 Suite</h1>
              <p className="text-xs text-muted-foreground">Enterprise Carbon Accounting</p>
            </div>
          </div>

          {children}
        </div>
      </div>

      <div className="relative pb-6 text-center">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CO2 Suite. All rights reserved.
        </p>
      </div>
    </div>
  );
}
