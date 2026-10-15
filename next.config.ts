import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run beside `next dev` without sharing .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: { optimizePackageImports: ["@chakra-ui/react"] },
  // The default bottom-left badge covers the sidebar's collapse button.
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
