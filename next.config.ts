import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    reactCompiler: true,
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
      };
    }
    return config;
  },
};

export default nextConfig;
