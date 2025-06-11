import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
  },
  env: {
    SERVER_URL: process.env.SERVER_URL,
    SOCKET_URL: process.env.SOCKET_URL,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard/overview",
        permanent: true,
      }
    ];
  },
};

export default nextConfig;
