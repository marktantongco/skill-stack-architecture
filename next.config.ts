import type { NextConfig } from "next";

// ─── Deployment-aware Next.js config ─────────────────────────────────────────
// Two deployment targets:
//   1. Vercel            — root path (/)         — primary, AI gateway enabled
//   2. GitHub Pages      — /skill-stack-architecture/ — mirror, static export
//
// Detection: env var DEPLOY_TARGET = "gh-pages" | "vercel" (default)
//
// GitHub Pages requires basePath + assetPrefix because the repo is served
// from https://<user>.github.io/<repo>/, not the root.

const isGitHubPages = process.env.DEPLOY_TARGET === "gh-pages";
const repoName = "skill-stack-architecture";
const basePath = isGitHubPages ? `/${repoName}` : "";
const assetPrefix = isGitHubPages ? `/${repoName}/` : "";

const nextConfig: NextConfig = {
  // Vercel uses "standalone" for production.  GitHub Pages needs "export"
  // because Pages serves only static files.
  output: isGitHubPages ? "export" : "standalone",
  reactStrictMode: true,
  basePath,
  assetPrefix,
  // Images: GitHub Pages can't run the Next.js image optimiser (it's a
  // static host).  Disable optimisation there.
  images: isGitHubPages
    ? {
        unoptimized: true,
      }
    : {
        formats: ["image/avif", "image/webp"],
        remotePatterns: [
          { protocol: "https", hostname: "z-cdn.chatglm.cn" },
          { protocol: "https", hostname: "images.unsplash.com" },
        ],
      },
  // Trailing slash makes GitHub Pages asset resolution reliable.
  trailingSlash: isGitHubPages,
  allowedDevOrigins: ["21.0.15.191", "127.0.0.1", "localhost"],
  // Headers for the Vercel deployment (security + caching best-practice).
  async headers() {
    if (isGitHubPages) return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
