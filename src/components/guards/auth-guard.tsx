"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-provider";
import { Loader } from "@/components/reusables/loader";

interface AuthGuardProps {
  readonly children: React.ReactNode;
  /** Override the redirect target (default: /sign-in/admin) */
  readonly redirectTo?: string;
}

/**
 * AuthGuard — redirects to sign-in if the user is not authenticated.
 * Shows a full-screen loader while the session is being restored.
 *
 * Usage:
 *   <AuthGuard>
 *     <ProtectedPage />
 *   </AuthGuard>
 */
const AuthGuard: React.FC<AuthGuardProps> = ({ children, redirectTo = "/sign-in/admin" }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};

export default AuthGuard;
