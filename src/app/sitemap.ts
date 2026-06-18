import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";

// ─── Dynamic Sitemap ─────────────────────────────────────────────────────────
// Next.js 16 will emit this at /sitemap.xml.  It lists every navigable subpage
// and the deep-link anchors used by the SPA-style section router.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sections = [
    { path: "/", anchor: "", priority: 1.0, changeFreq: "weekly" as const },
    { path: "/", anchor: "#home", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#audit", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#frontend", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#proxy", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#architecture", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#marketplace", priority: 0.9, changeFreq: "weekly" as const },
    { path: "/", anchor: "#docs", priority: 0.9, changeFreq: "weekly" as const },
  ];

  return sections.map((s) => ({
    url: `${SITE_URL}/${s.anchor}`,
    lastModified: now,
    changeFrequency: s.changeFreq,
    priority: s.priority,
    alternates: {
      languages: {
        "en-US": `${SITE_URL}/${s.anchor}`,
        "en-GB": `${SITE_URL}/${s.anchor}`,
      },
    },
  }));
}
