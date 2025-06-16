"use client"

import { useEffect } from "react";
import { useAuth } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/reusables/loader";

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

    if (isLoading) {
        return <Loader />
    }

    if (user) {
        return null;
    }

    return <>{children}</>;
}

