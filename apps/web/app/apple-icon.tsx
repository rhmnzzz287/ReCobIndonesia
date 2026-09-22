import { ImageResponse } from "next/og.js";

/** Ikon layar utama iOS 180x180, lambang merek pada bidang hijau tua. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b6e3b",
          fontSize: 116,
          fontWeight: 800,
          color: "#7dbe35",
          fontFamily: "sans-serif",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
