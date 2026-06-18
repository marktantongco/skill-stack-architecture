import type { MetadataRoute } from "next";
import { SITE_URL, GITHUB_PAGES_URL, REPO_URL } from "./layout";

// ─── Robots.txt ──────────────────────────────────────────────────────────────
// Encourages crawling by Googlebot, Bingbot, GPTBot, ClaudeBot, PerplexityBot,
// AppleBot, and all major AI answer-engine crawlers.  Blocks /api/* internals.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/private/", "/admin/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "perplexitybot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "AppleBot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "CCBot",
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "Amazonbot",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
    // crawl-delay omitted — let crawlers pick their own pace for fresh content.
  };
}
