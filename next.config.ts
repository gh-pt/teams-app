import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d2u8k2ocievbld.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
