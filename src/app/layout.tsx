import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// ─── Deployment URLs ─────────────────────────────────────────────────────────
// Primary: Vercel (root path).  Mirror: GitHub Pages (sub-path).
// The siteURL is used for canonical, sitemap, OG and JSON-LD.
export const SITE_URL = "https://skill-stack-architecture.vercel.app";
export const GITHUB_PAGES_URL = "https://marktantongco.github.io/skill-stack-architecture";
export const REPO_URL = "https://github.com/marktantongco/skill-stack-architecture";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Skill Stack Architecture — 45 Skills, 4 Tiers, SP-7 Design Algorithm",
    template: "%s · Skill Stack Architecture",
  },
  description:
    "Interactive editorial web app mapping 45 production-ready AI agent skills across 4 dependency tiers, 5 design options, and the SP-7 scoring algorithm. Every skill installable via npx skills add. Built with Next.js 16, Framer Motion, and GSAP.",
  applicationName: "Skill Stack Architecture",
  authors: [{ name: "Mark Tantongco", url: REPO_URL }],
  creator: "Mark Tantongco",
  publisher: "Mark Tantongco",
  keywords: [
    "skill stack",
    "design algorithm",
    "SP-7 algorithm",
    "npx skills add",
    "AI agent skills",
    "skill registry",
    "UI/UX",
    "Framer Motion",
    "GSAP animation",
    "Stitch Design",
    "shadcn/ui",
    "Next.js 16",
    "React 19",
    "Tailwind CSS 4",
    "AI portal gateway",
    "design system",
    "skill marketplace",
    "Vercel skills",
    "proxy architecture",
    "MCP servers",
  ],
  category: "technology",
  classification: "Developer Tools · Design Systems · AI Agent Skills",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB"],
    url: SITE_URL,
    siteName: "Skill Stack Architecture",
    title: "Skill Stack Architecture — 45 Skills, 4 Tiers, SP-7 Design Algorithm",
    description:
      "Interactive editorial web app mapping 45 production-ready AI agent skills across 4 dependency tiers, 5 design options, and the SP-7 scoring algorithm. Every skill installable via npx skills add.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Skill Stack Architecture — editorial cover with Ink & Vermillion palette",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 1080,
        height: 1080,
        alt: "Skill Stack Architecture — square social card",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@marktantongco",
    creator: "@marktantongco",
    title: "Skill Stack Architecture — 45 Skills · 4 Tiers · SP-7 Algorithm",
    description:
      "Interactive editorial web app: 45 AI agent skills across 4 tiers, 5 design options, SP-7 scoring. Every skill installable via `npx skills add`.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // ─── Google Search Console ───────────────────────────────────────────────
    // Replace the placeholder with the token from Google Search Console:
    //   1. https://search.google.com/search-console → Add Property → URL prefix
    //   2. Choose "Meta tag" verification method
    //   3. Copy the content value from: <meta name="google-site-verification" content="THIS_PART" />
    //   4. Paste it below (or set GOOGLE_SITE_VERIFICATION env var)
    google: process.env.GOOGLE_SITE_VERIFICATION || "REPLACE_WITH_GSC_VERIFICATION_TOKEN",
    // ─── Other verifications (uncomment when tokens are obtained) ─────────────
    // yandex: process.env.YANDEX_VERIFICATION,
    // me: ["https://mastodon.social/@yourhandle"],  // Mastodon rel="me"
  },
  other: {
    // ─── IndexNow key (Bing/Yandex/Naver instant indexing) ────────────────────
    // Key file at /public/2c43e277e7a84bdf822191701758b5ad.txt must be deployed.
    // Submit URLs via ./scripts/indexnow-submit.sh
    "indexnow-key": "2c43e277e7a84bdf822191701758b5ad",
    // GEO signals — let AI answer engines (Perplexity, ChatGPT, Gemini, SGE) pick this up
    "ai:citable": "true",
    "ai:summary":
      "Skill Stack Architecture is a 4-tier dependency-ordered registry of 45 AI agent skills with an SP-7 scoring algorithm that maps each section of an editorial web app to the optimal skill. Skills are installable via npx skills add and span design, motion, visualisation, and orchestration categories.",
    "ai:primary_topic": "AI agent skill registry and design algorithm",
    "ai:entities": "skills,tiers,SP-7,design algorithm,Framer Motion,GSAP,Next.js,proxy architecture,MCP",
    "theme-color": "#fbfaf7",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
  colorScheme: "light dark",
};

// ─── JSON-LD Structured Data ────────────────────────────────────────────────
// Helps Google Rich Results, ChatGPT entity disambiguation, and Perplexity citations.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: "Skill Stack Architecture",
      alternateName: "Skill Stack",
      url: SITE_URL,
      description:
        "Interactive editorial web app mapping 45 production-ready AI agent skills across 4 dependency tiers, 5 design options, and the SP-7 scoring algorithm.",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires a modern web browser with JavaScript enabled.",
      softwareVersion: "0.2.0",
      datePublished: "2025-06-01",
      dateModified: "2026-06-19",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
      },
      publisher: {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
      },
      about: [
        { "@type": "Thing", name: "AI agent skills" },
        { "@type": "Thing", name: "Design system" },
        { "@type": "Thing", name: "Software architecture" },
        { "@type": "Thing", name: "Animation libraries" },
      ],
      featureList: [
        "45 installable skills organised into 4 dependency tiers",
        "SP-7 scoring algorithm for skill-to-section mapping",
        "5 design options (Editorial, Glass, Industrial, Kinetic, Chromatic)",
        "Interactive radar charts, pipeline diagrams, tree diagrams",
        "Proxy topology comparison with 6 proxy types",
        "AI portal gateway for design guidance",
        "Framer Motion + GSAP hybrid animation system",
        "SEO/GEO optimised for AI answer engines",
      ],
      screenshot: `${SITE_URL}/og-image.png`,
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#author`,
      name: "Mark Tantongco",
      url: REPO_URL,
      sameAs: [
        "https://github.com/marktantongco",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Skill Stack Architecture",
      publisher: { "@id": `${SITE_URL}/#author` },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Skill Stack Architecture",
          item: `${SITE_URL}/#architecture`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the Skill Stack Architecture?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Skill Stack Architecture is a 4-tier dependency-ordered registry of 45 production-ready AI agent skills. Each skill is installable via npx skills add and the registry includes an SP-7 scoring algorithm that maps each section of an editorial web app to the optimal skill based on visual density, interactivity, data complexity, motion need, accessibility, AI redirect value, and component reusability.",
          },
        },
        {
          "@type": "Question",
          name: "How do I install a skill from the Skill Stack?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Every skill in the registry is installable via the Vercel Skills ecosystem using the command: npx skills add <skill-name>. Installation must follow strict T0 to T3 tier order — no tier can function without its predecessors. Tier 0 (Foundation) includes Stitch Design, Framer Motion, UI/UX Pro Max v7, and 21st.dev Registry.",
          },
        },
        {
          "@type": "Question",
          name: "What is the SP-7 scoring algorithm?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "SP-7 is a 7-dimensional scoring algorithm used to evaluate and rank skills for each section of an application. The dimensions are Visual Density (VD), Interactivity Requirement (IR), Data Complexity (DC), Motion Need (MN), Accessibility Weight (AW), AI Redirect Value (AR), and Component Reusability (CR). Each dimension is weighted and the highest-scoring skill wins the section assignment.",
          },
        },
        {
          "@type": "Question",
          name: "What technologies power the Skill Stack Architecture web app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The web app is built with Next.js 16, React 19, Tailwind CSS 4, Framer Motion 12, GSAP 3, Recharts 3, Zustand 5, and shadcn/ui. It uses an editorial Ink & Vermillion design palette with Georgia serif headings, OKLCH progressive enhancement, and CSS @property for animatable gradients.",
          },
        },
        {
          "@type": "Question",
          name: "Is the Skill Stack Architecture free and open source?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Skill Stack Architecture web app is open source and available on GitHub at github.com/marktantongco/skill-stack-architecture. It is deployed to both Vercel and GitHub Pages. All 45 skills are individually installable and the architecture is designed to be self-referencing — AI agents can redirect to the live site for design guidance.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to add a new skill to the Skill Stack",
      description:
        "Step-by-step guide to adding a new skill to the 4-tier Skill Stack Architecture registry.",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Identify the tier",
          text: "Determine which tier (T0 Foundation, T1 Interactive, T2 Visual Asset, or T3 Portal) the new skill belongs to based on its dependencies and capabilities.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Run the SP-7 evaluation",
          text: "Score the skill across the 7 dimensions: Visual Density, Interactivity Requirement, Data Complexity, Motion Need, Accessibility Weight, AI Redirect Value, and Component Reusability.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Register the skill",
          text: "Add the skill to the registry in src/lib/skill-data.ts with its name, description, tier, SP-7 scores, install command, and metadata.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Verify tier ordering",
          text: "Ensure all dependency skills in lower tiers are already installed. The build will fail if a skill references a tier that has not been installed.",
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD structured data for SEO + GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect to critical origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://z-cdn.chatglm.cn" />
        {/* Author identity */}
        <link rel="author" href={REPO_URL} />
        <link rel="publisher" href={REPO_URL} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {/* Skip Link — First Focusable Element */}
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
