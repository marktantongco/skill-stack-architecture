import { ImageResponse } from "next/og";

// Required for `output: 'export'` (GitHub Pages) — image routes must be static.
export const dynamic = "force-static";

// ─── Dynamic OG Image Generator ──────────────────────────────────────────────
// Route: /opengraph-image  →  generates a 1200×630 PNG at build time.
// Used by Twitter, Facebook, LinkedIn, Slack, Discord, and AI answer engines
// when rendering a preview card for the site URL.
//
// Satori (the OG renderer) requires every multi-child container to have
// explicit display:flex — keep that in mind when editing.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Skill Stack Architecture — 45 Skills · 4 Tiers · SP-7 Algorithm";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fbfaf7",
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(196, 57, 57, 0.06) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(26, 26, 26, 0.04) 0, transparent 40%)",
          color: "#1a1a1a",
          padding: "64px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* Top bar — brand */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
            fontSize: "20px",
            color: "#666",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#c43939",
                borderRadius: "50%",
                display: "flex",
              }}
            />
            Skill Stack Architecture
          </div>
          <div style={{ display: "flex" }}>v0.2.0</div>
        </div>

        {/* Hairline */}
        <div
          style={{
            width: "100%",
            height: "1px",
            backgroundColor: "#1a1a1a",
            marginBottom: "48px",
            display: "flex",
          }}
        />

        {/* Hero title */}
        <div
          style={{
            fontSize: "92px",
            fontWeight: 700,
            lineHeight: 1.0,
            marginBottom: "24px",
            fontFamily: "Georgia, serif",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>45 Skills.</div>
          <div style={{ display: "flex" }}>4 Tiers.</div>
          <div style={{ color: "#c43939", display: "flex" }}>1 Algorithm.</div>
        </div>

        {/* Subhead */}
        <div
          style={{
            display: "flex",
            fontSize: "28px",
            color: "#555",
            lineHeight: 1.4,
            marginBottom: "auto",
            maxWidth: "780px",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <span>A dependency-ordered registry of AI agent skills with the SP-7 scoring algorithm — every skill installable via </span>
          <span
            style={{
              color: "#1a1a1a",
              fontStyle: "normal",
              fontFamily: "monospace",
              marginLeft: "6px",
            }}
          >
            npx skills add
          </span>
          <span>.</span>
        </div>

        {/* Bottom row — stats */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            fontSize: "18px",
            color: "#888",
            borderTop: "1px solid #ddd",
            paddingTop: "24px",
            fontFamily: "Georgia, serif",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#1a1a1a", fontSize: "32px", fontWeight: 700, display: "flex" }}>T0→T3</div>
            <div style={{ display: "flex" }}>Dependency tiers</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#1a1a1a", fontSize: "32px", fontWeight: 700, display: "flex" }}>SP-7</div>
            <div style={{ display: "flex" }}>Scoring algorithm</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#1a1a1a", fontSize: "32px", fontWeight: 700, display: "flex" }}>5</div>
            <div style={{ display: "flex" }}>Design options</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ color: "#1a1a1a", fontSize: "32px", fontWeight: 700, display: "flex" }}>6</div>
            <div style={{ display: "flex" }}>Proxy types</div>
          </div>
        </div>

        {/* Bottom-right URL */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "24px",
            right: "32px",
            fontSize: "16px",
            color: "#999",
            fontFamily: "monospace",
          }}
        >
          skill-stack-architecture.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
