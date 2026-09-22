import { ImageResponse } from "next/og.js";

/**
 * Favicon 32x32 dari lambang merek. Sebelumnya tidak ada ikon sama sekali sehingga peramban
 * meminta `/favicon.ico` dan menerima 404 pada setiap kunjungan.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon(): ImageResponse {
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
          fontSize: 22,
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
