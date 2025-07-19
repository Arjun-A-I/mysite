import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Disable development overlays
    forceSwcTransforms: false,
  },
  // Disable any development UI
  devIndicators: {
    position: 'bottom-right',
  },
};

export default nextConfig;
