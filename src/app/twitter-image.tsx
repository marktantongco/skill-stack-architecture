import { ImageResponse } from "next/og";

// Required for `output: 'export'` (GitHub Pages) — image routes must be static.
export const dynamic = "force-static";

// ─── Twitter X Card Image ────────────────────────────────────────────────────
// Route: /twitter-image  →  1200×600 for Twitter's summary_large_image card.
// Satori (the OG image renderer) requires every multi-child container to have
// explicit display:flex — keep that in mind when editing.
export const size = { width: 1200, height: 600 };
export const contentType = "image/png";
export const alt = "Skill Stack Architecture — 45 Skills · 4 Tiers · SP-7";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#1a1a1a",
          color: "#fbfaf7",
          padding: "56px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "18px",
            color: "#c43939",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              backgroundColor: "#c43939",
              borderRadius: "50%",
              display: "flex",
            }}
          />
          Skill Stack Architecture
        </div>

        <div
          style={{
            fontSize: "88px",
            fontWeight: 700,
            lineHeight: 1.0,
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex" }}>45 Skills.</div>
          <div style={{ color: "#c43939", display: "flex" }}>SP-7 Algorithm.</div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "26px",
            color: "#bbb",
            lineHeight: 1.4,
            maxWidth: "900px",
            fontStyle: "italic",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <span>A 4-tier dependency registry of AI agent skills — installable via </span>
          <span
            style={{
              color: "#fbfaf7",
              fontStyle: "normal",
              fontFamily: "monospace",
              backgroundColor: "rgba(196, 57, 57, 0.2)",
              padding: "2px 8px",
              borderRadius: "4px",
              marginLeft: "6px",
            }}
          >
            npx skills add
          </span>
          <span>.</span>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: "32px",
            right: "56px",
            fontSize: "16px",
            color: "#666",
            fontFamily: "monospace",
          }}
        >
          github.com/marktantongco/skill-stack-architecture
        </div>
      </div>
    ),
    { ...size }
  );
}
