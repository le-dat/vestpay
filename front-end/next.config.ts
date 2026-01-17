import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
    domains: ["app.scallop.io", "mstable.io", "archive.cetus.zone"],
  },
};

export default nextConfig;
