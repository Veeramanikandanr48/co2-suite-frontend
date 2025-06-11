import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  env: {
    SERVER_URL: process.env.SERVER_URL,
    SOCKET_URL: process.env.SOCKET_URL,
    VERIFY_CONFIGURATION: process.env.VERIFY_CONFIGURATION,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/device-integration/system-integration",
        permanent: true,
      },
      // {
      //   source: "/",
      //   destination: "/dashboard/overview",
      //   permanent: true,
      // },
      // {
      //   source: "/dashboard",
      //   destination: "/dashboard/overview",
      //   permanent: true,
      // },
      {
        source: "/user-access-management",
        destination: "/user-access-management/all-users",
        permanent: true,
      },
      {
        source: "/workflow-customization",
        destination: "/workflow-customization/secondary",
        permanent: true,
      },
      {
        source: "/general-settings",
        destination: "/general-settings/date-time",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
