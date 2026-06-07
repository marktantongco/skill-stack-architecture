import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Skill Stack Architecture | Editorial",
  description:
    "16 skills, 4 tiers, 5 design options, SP-7 algorithm — every item installable via npx skills add. AI portal gateway for design guidance.",
  keywords: [
    "skill stack",
    "design algorithm",
    "npx skills add",
    "UI/UX",
    "Framer Motion",
    "Stitch Loop",
    "SP-7",
  ],
  authors: [{ name: "Design Portal Skills" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Skill Stack Architecture | Editorial",
    description: "16 skills, 4 tiers, 5 design options, SP-7 algorithm — every item installable via npx skills add.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Skill Stack Architecture | Editorial",
    description: "16 skills, 4 tiers, 5 design options, SP-7 algorithm — every item installable via npx skills add.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
