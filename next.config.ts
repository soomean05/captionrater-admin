import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /** Image uploads via server actions */
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
