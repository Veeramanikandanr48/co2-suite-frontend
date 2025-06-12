import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "../context/theme-provider";
import { PermissionsProvider } from "~/context/permissions-provider";
import { Toaster } from "@/components/reusables/toaster";
import { LoaderProvider } from "@/context/loader-context";
import { Loader } from "@/components/reusables/loader";
import { SocketProvider } from "@/context/socket-context";

export const metadata: Metadata = {
  title: "Boiler-Plate",
  description: "Boiler-Plate-Front-End",
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
            <SocketProvider>
              <AuthProvider>
                <PermissionsProvider>
                  {children}
                  <Toaster />
                </PermissionsProvider>
              </AuthProvider>
            </SocketProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
