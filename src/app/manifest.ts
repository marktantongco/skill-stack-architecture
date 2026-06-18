import type { MetadataRoute } from "next";

// Required for `output: 'export'` (GitHub Pages) — metadata routes must be static.
export const dynamic = "force-static";

// ─── Web App Manifest ────────────────────────────────────────────────────────
// PWA-installable + improves Lighthouse PWA score + gives Android Chrome
// the metadata it needs for "Add to Home Screen".
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skill Stack Architecture — 45 Skills, 4 Tiers, SP-7 Algorithm",
    short_name: "Skill Stack",
    description:
      "Interactive editorial web app mapping 45 production-ready AI agent skills across 4 dependency tiers, 5 design options, and the SP-7 scoring algorithm.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#fbfaf7",
    theme_color: "#fbfaf7",
    categories: ["developer", "productivity", "education", "design"],
    lang: "en-US",
    dir: "ltr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      {
        name: "Architecture Tree",
        short_name: "Architecture",
        description: "View the 4-tier dependency tree",
        url: "/?section=architecture",
      },
      {
        name: "Skill Marketplace",
        short_name: "Marketplace",
        description: "Browse all 45 installable skills",
        url: "/?section=marketplace",
      },
      {
        name: "SP-7 Radar",
        short_name: "SP-7",
        description: "Interactive SP-7 dimensional radar chart",
        url: "/?section=audit",
      },
      {
        name: "Proxy Topology",
        short_name: "Proxy",
        description: "Compare 6 proxy architecture types",
        url: "/?section=proxy",
      },
    ],
  };
}
