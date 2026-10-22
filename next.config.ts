import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Vendor photos and logos uploaded to Manage My Market. Some originals are
    // several MB, so they go through the image optimizer at card size.
    remotePatterns: [new URL("https://s3-us-west-2.amazonaws.com/managemymarket.com/vendorfiles/**")],
  },
};

export default nextConfig;
