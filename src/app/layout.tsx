import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "../context/theme-provider";
import { PermissionsProvider } from "~/context/permissions-provider";
import { Toaster } from "@/components/reusables/toaster";
import { LoaderProvider } from "@/context/loader-context";
import { Loader } from "@/components/reusables/loader";

export const metadata: Metadata = {
  title: "OMEA - Admin",
  description: "OMEA-EXAM-ASSISTANT-ADMIN-FRONT-END",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoaderProvider>
            <Loader />
            <AuthProvider>
              <PermissionsProvider>
                {children}
              <Toaster />
              </PermissionsProvider>
            </AuthProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
