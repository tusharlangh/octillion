import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        encoding: false,
      };
    }

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, // Only for deployment emergency
  },
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks
  },
};

export default nextConfig;
