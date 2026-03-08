import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  async headers() {
    return [{
      source: "/sw.js",
      headers: [
        { key: "Service-Worker-Allowed", value: "/" },
        { key: "Cache-Control", value: "no-cache" },
      ],
    }];
  },
  images: {
    remotePatterns: [{
      protocol: "https",
      hostname: "*.public.blob.vercel-storage.com",
    }],
  },
};
export default nextConfig;
