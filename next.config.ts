import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: [],
  },
  env: {
    PORT: process.env.PORT || '3000',
  },
};

export default nextConfig;
