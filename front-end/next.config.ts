import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    unoptimized: true,
    domains: ["app.scallop.io", "mstable.io", "archive.cetus.zone"],
  },
};

export default nextConfig;
