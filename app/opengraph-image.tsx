import { ImageResponse } from "next/og";

export const alt = "Sacred Basil — Thoughtfully Gifted Wellness";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Typographic Open Graph card. Replace with a Sacred Basil campaign
 * photograph (app/opengraph-image.jpg) once delivered.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "radial-gradient(ellipse at 75% 30%, #5a3a26 0%, #241610 60%)",
        color: "#F4EEE5",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ fontSize: 22, letterSpacing: 10, textTransform: "uppercase", opacity: 0.75 }}>Sacred Basil</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 92, lineHeight: 1, fontWeight: 300 }}>Wellness,</div>
        <div style={{ fontSize: 92, lineHeight: 1.1, fontWeight: 300 }}>thoughtfully gifted.</div>
        <div style={{ marginTop: 28, width: 120, height: 1, background: "#B08A4A" }} />
      </div>
    </div>,
    size,
  );
}
