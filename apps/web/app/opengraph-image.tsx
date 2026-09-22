import { ImageResponse } from "next/og.js";
import { copy } from "@/content/copy";

/**
 * Kartu pratinjau tautan 1200x630 (Open Graph + Twitter).
 *
 * Digambar dengan kode, bukan berkas gambar, supaya angkanya tidak pernah basi saat harga atau
 * judul berubah. Sengaja hanya memakai tipografi dan warna merek — tanpa gambar eksternal —
 * agar hasilnya deterministik dan tidak bergantung pada pemuatan aset saat build.
 *
 * Angka yang ditampilkan hanya yang sudah pasti (harga jangkar dari dokumen sumber). Tidak ada
 * klaim kenaikan produksi susu di sini: kartu pratinjau adalah tempat klaim paling mudah
 * disalahpahami karena muncul tanpa konteks halaman.
 */
export const alt = copy.meta.ogAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0d1216",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#7dbe35",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 800,
              color: "#0d1216",
            }}
          >
            R
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#ffffff" }}>
            {copy.meta.shortName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.1,
              color: "#ffffff",
              letterSpacing: "-0.02em",
            }}
          >
            Pakan Konsentrat Sapi Perah dari Bonggol Jagung Terfermentasi
          </div>
          <div style={{ marginTop: 28, fontSize: 30, color: "#ddebd2" }}>
            Hemat 11%-20% per karung 50 kg dibanding konsentrat komersial umum
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 12,
              background: "#084f2a",
              borderRadius: 14,
              padding: "18px 28px",
            }}
          >
            <span style={{ fontSize: 44, fontWeight: 800, color: "#7dbe35" }}>Rp160.000</span>
            <span style={{ fontSize: 24, color: "#ddebd2" }}>per karung 50 kg</span>
          </div>
          <div style={{ fontSize: 24, color: "#ddebd2" }}>Potong setoran susu via KUD</div>
        </div>
      </div>
    ),
    size,
  );
}
