import { SITE_URL } from "../layout";

// ─── RSS 2.0 Feed ────────────────────────────────────────────────────────────
// Route: /feed.xml  —  helps feed readers and AI summarisers discover updates.
export const dynamic = "force-static";

export async function GET() {
  const now = new Date().toUTCString();

  const items = [
    {
      title: "Skill Stack Architecture v0.2.0 — GSAP + Framer Motion hybrid",
      link: `${SITE_URL}/?section=audit`,
      description:
        "Added a hybrid GSAP + Framer Motion animation system with useReducedMotion accessibility, scroll-driven reveals, and infographic-motion patterns across all 7 subpages.",
      pubDate: now,
      guid: `${SITE_URL}/v0.2.0`,
    },
    {
      title: "SP-7 radar chart and skill pipeline diagram",
      link: `${SITE_URL}/?section=audit`,
      description:
        "Interactive Recharts radar visualising the 7-dimensional SP-7 scoring algorithm plus a horizontal pipeline diagram showing the T0 → T3 skill invocation flow with AbortController-based cancellation.",
      pubDate: now,
      guid: `${SITE_URL}/sp7-radar`,
    },
    {
      title: "Proxy topology comparison — 6 proxy types",
      link: `${SITE_URL}/?section=proxy`,
      description:
        "Comparison matrix for Transparent, Anonymous, Reverse, Forward, SSL/TLS, and Caching proxies with use-case routing, performance characteristics, and security posture.",
      pubDate: now,
      guid: `${SITE_URL}/proxy-topology`,
    },
    {
      title: "Architecture tree diagram — 4-tier dependency hierarchy",
      link: `${SITE_URL}/?section=architecture`,
      description:
        "Visual tree of the 4-tier dependency hierarchy (T0 Foundation → T1 Interactive → T2 Visual Asset → T3 Portal) with strict install order enforcement.",
      pubDate: now,
      guid: `${SITE_URL}/arch-tree`,
    },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Skill Stack Architecture</title>
    <link>${SITE_URL}</link>
    <description>45 skills, 4 tiers, 5 design options, SP-7 algorithm — every item installable via npx skills add.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    ${items
      .map(
        (item) => `
    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid isPermaLink="false">${item.guid}</guid>
    </item>`
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
