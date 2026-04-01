import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Hide the floating dev-tools “N” badge in local development */
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
