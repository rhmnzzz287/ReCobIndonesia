# Spesifikasi Halaman Produk ReCob.id

## Tujuan

Tujuan: `/produk` harus menjadi ringkasan produk yang mudah dipindai. Detail kemasan dan cara memberi sapi pindah ke halaman statis `/spesifikasi-produk` agar informasi tidak berulang dan tidak membuat halaman katalog terlalu panjang.

## Keputusan

- Route detail baru: `/spesifikasi-produk`.
- Route tetap statis. Tidak ada `/produk/[slug]`, produk fiktif, atau perubahan data DB.
- `/produk` mempertahankan katalog, hero, pita alur, formulasi, dan perbandingan.
- `ProductUsage` pindah dari render `/produk` ke `/spesifikasi-produk`.
- Lima langkah `usageSteps` tampil sebagai kartu `Card tone="paper"` dalam grid dua kolom pada desktop dan satu kolom pada ponsel, sama seperti kartu modul `/edukasi`.
- `Spesifikasi Kemasan` dan `Cara Menyimpan` tetap berada di halaman detail.
- CTA utama katalog tetap `/kalkulator` sesuai keputusan sebelumnya.
- Kartu katalog mendapat tautan sekunder `Lihat spesifikasi` ke `/spesifikasi-produk`.
- Copy UI baru hanya masuk ke `apps/web/content/copy/id.ts`.
- Sitemap dan metadata route baru ikut diperbarui.

## Audit landing page

- Beranda menghapus `ProductSummary` karena harga dan CTA sudah tampil di `Hero`.
- Beranda menghapus `ToolLinks` karena tautan tersebut mengulang navigasi utama.
- Kalkulator menampilkan `Calculator` lebih dahulu; `CostCompare` tetap tersedia sebagai bukti pembanding.
- `Problem`, `Solution`, `Validation`, `Faq`, CTA, legalitas, dan halaman `Mitra`/`Edukasi` tetap dipertahankan karena masing-masing punya tugas informasi atau konversi yang berbeda.

## Struktur

`/produk`:
1. Katalog produk
2. Hero produk
3. Pita alur
4. Formulasi
5. Perbandingan

`/spesifikasi-produk`:
1. `PageHeader` dengan judul dan deskripsi singkat
2. `ProductUsage`
3. Lima kartu cara memberi
4. Spesifikasi kemasan
5. Cara menyimpan

## Acceptance Criteria

- `GET /spesifikasi-produk` merespons 200 dan memiliki satu H1.
- Halaman baru memuat `#cara-pakai`, lima kartu langkah, `Spesifikasi Kemasan`, dan `Cara Menyimpan`.
- `/produk` tidak lagi memiliki `#cara-pakai`.
- Beranda tidak lagi memiliki `#produk-ringkas` atau `#jelajahi`.
- Kalkulator menampilkan `#kalkulator` sebelum `#penghematan`.
- Kartu katalog memiliki link `Lihat spesifikasi` ke `/spesifikasi-produk`.
- Link kalkulator tetap ada dan menuju `/kalkulator`.
- Layout kartu tidak menyebabkan horizontal overflow pada 390px atau 1440px.
- Metadata canonical new route menunjuk `/spesifikasi-produk`.
- Sitemap mencantumkan route baru.
- Unit, E2E, lint, typecheck, build, token, copy, dan secret checks lulus.

## Test Plan

- RED: E2E assert route baru dan card `data-testid="usage-step-card"`; jalankan sebelum implementasi dan pastikan gagal karena route belum ada.
- GREEN: implement route, copy, card grid, catalog link, sitemap.
- E2E assert `/produk` tidak lagi memuat usage section dan route baru memiliki konten lengkap.
- Jalankan `npm run verify` sebelum klaim selesai.
