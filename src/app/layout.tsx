import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/auth-provider";
import { ThemeProvider } from "../context/theme-provider";
import { PermissionsProvider } from "~/context/permissions-provider";
import { LoaderProvider } from "@/context/loader-context";
import { Loader } from "@/components/reusables/loader";
import { SocketProvider } from "@/context/socket-context";
import { ToasterWrapper } from "@/components/reusables/toaster-wrapper";

export const metadata: Metadata = {
  title: "CO2 Suite | Enterprise Carbon Accounting",
  description: "Enterprise Carbon Accounting & Sustainability Platform",
  icons: {
    icon: [
      { url: "/images/CMP.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/images/CMP.svg",
    apple: "/images/CMP.svg",
  },
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
                  <ToasterWrapper />
                </PermissionsProvider>
              </AuthProvider>
            </SocketProvider>
          </LoaderProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
