import { ImageResponse } from "next/og";

export const alt = "WallPC — 4K Wallpapers. No Login. Just Download.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #09090d 0%, #111116 50%, #181822 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "60px",
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Logo and badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 900,
              boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)",
            }}
          >
            W
          </div>
          <span
            style={{
              fontSize: 56,
              fontWeight: 900,
              letterSpacing: "-2px",
              background: "linear-gradient(to right, #ffffff, #d4d4d8)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            WallPC
          </span>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              padding: "6px 16px",
              borderRadius: 10,
              background: "rgba(99, 102, 241, 0.15)",
              color: "#a5b4fc",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            4K Ultra HD
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 900,
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            maxWidth: 1000,
            marginBottom: "20px",
            color: "#ffffff",
          }}
        >
          4K Wallpapers. No Login. Just Download.
        </div>

        {/* Supporting text */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 500,
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Beautiful 4K wallpapers for your PC, instantly.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
