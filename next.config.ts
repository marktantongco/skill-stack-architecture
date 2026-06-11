import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  allowedDevOrigins: ["21.0.15.191", "127.0.0.1", "localhost"],
};

export default nextConfig;
