import type { NextConfig } from "next";
import WebpackObfuscator from "webpack-obfuscator";

const nextConfig: NextConfig = {
  turbopack: {},
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
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: true,
      },
    ];
  },
  webpack: (config, { dev, isServer }) => {
    // Apply selective obfuscation only in production browser builds
    if (!dev && !isServer) {
      config.plugins.push(
        new WebpackObfuscator(
          {
            rotateStringArray: true,
            stringArray: true,
            stringArrayThreshold: 0.75,
            identifierNamesGenerator: "hexadecimal",
            compact: true,
            controlFlowFlattening: false, // Disabled for performance
            deadCodeInjection: false,     // Disabled to preserve tree-shaking
          },
          ["**/components/**", "**/app/**", "**/pages/**"] // Exclude UI layer
        )
      );
    }
    return config;
  },
};

export default nextConfig;
