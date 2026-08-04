import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0d1117";
const GOLD = "#d4b06a";
const FG_HEADING = "#f4f7fa";
const FG_SECONDARY = "#9aa4af";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "90px 100px",
          background: NAVY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 40 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              border: `2.5px solid ${GOLD}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: 999, background: GOLD }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: FG_HEADING, letterSpacing: -0.5 }}>
            Milestoned
          </div>
        </div>

        <div
          style={{
            fontSize: 58,
            fontWeight: 700,
            color: FG_HEADING,
            letterSpacing: -1.5,
            lineHeight: 1.08,
            maxWidth: 920,
            marginBottom: 28,
          }}
        >
          Client documents, drafted in minutes.
        </div>

        <div
          style={{
            fontSize: 27,
            color: FG_SECONDARY,
            lineHeight: 1.5,
            maxWidth: 820,
            marginBottom: 44,
          }}
        >
          Scope of Work, Contract, Proposal, and Invoice — for dev consultants, with
          milestone-based, interest-free payment terms built in.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 20px",
            borderRadius: 999,
            background: "rgba(212, 176, 106, 0.14)",
            fontSize: 22,
            fontWeight: 600,
            color: GOLD,
          }}
        >
          0% interest, always
        </div>
      </div>
    ),
    { ...size }
  );
}
