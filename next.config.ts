import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Supabase Storage — covers all projects (*.supabase.co)
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        // Supabase Storage — direct bucket URLs
        protocol: "https",
        hostname: "*.supabase.in",
        pathname: "/storage/v1/**",
      },
      {
        // DiceBear avatars for community poll users
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;
