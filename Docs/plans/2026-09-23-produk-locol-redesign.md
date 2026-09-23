# Rombak Halaman Produk dengan Acuan LOCOL — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rancang ulang `/produk` agar alur hero → pita bukti/proses → manfaat/formulasi → penawaran meniru ritme editorial LOCOL tanpa menyalin aset atau membuat klaim baru.

**Architecture:** Pertahankan RSC dan komponen interaktif yang sudah ada; ubah hero menjadi komposisi editorial terang yang menonjolkan foto produk. Susun ulang komponen halaman yang ada, gunakan pita proses yang aksesibel sebagai pengganti logo mitra yang tidak tersedia, dan pertahankan sumber data/copy, komposisi, harga, CTA, metadata, serta JSON-LD.

**Tech Stack:** Next.js App Router, React Server Components, Tailwind CSS dan token desain repo, TypeScript, Vitest, Playwright. Tidak ada dependensi baru.

**Spec:** `Docs/specs/2026-09-23-produk-locol-redesign.md`

## Global Constraints

- Salinan UI/alt berada di `apps/web/content/copy/id.ts` (ADR-015), bukan literal JSX.
- Tidak menyalin tulisan, logo, foto, atau angka LOCOL.
- Jangan membuat testimoni, logo mitra, angka dampak, atau deskripsi aset yang tidak terverifikasi.
- Sumber harga dan produk tetap `getPrimaryProduct()`; sumber komposisi tetap `getPrimaryProduct().ingredients`.
- Pertahankan `#formulasi`, satu `<h1>`, metadata, `JsonLd`, CTA sampel dan kalkulator.
- Patuhi `Docs/DESIGN.md` untuk token warna, tipografi, aksesibilitas, dan gerak; pita non-esensial berhenti pada `prefers-reduced-motion`.
- Jangan mengubah atau membuang perubahan lain yang sudah ada di worktree; verifikasi `git status` sebelum edit.

## Review Focus

- Klaim atau angka tanpa konteks sumber → uji copy halaman agar testimoni/angka LOCOL tidak muncul.
- Logo/KUD fallback dianggap mitra terverifikasi → pita memakai alur proses dari `copy.productStory.marquee`, bukan `getActiveKudNames()` yang punya fallback demo.
- Gerak marquee saat reduced motion → e2e memeriksa `animation: none` saat media emulasi aktif.
- Aset atau teks alternatif mengada-ada → pertahankan nama dan alt netral sampai isi foto diverifikasi.
- Layout ponsel menyempit/overflow karena foto editorial → e2e cek lebar 390 px dan 1440 px serta batas scroll horizontal.

---

### Task 1: Ganti hero gelap menjadi hero editorial terang

**Files:**
- Modify: `apps/web/components/sections/product-hero.tsx`
- Modify: `apps/web/content/copy/id.ts` (`productStory` hero fields)
- Test: `apps/web/tests/e2e/smoke.spec.ts`
- Test: `apps/web/tests/unit/produk-interaktif.test.tsx`

**Interfaces:**
- Consumes: `copy.productStory.heroBadge`, `heroTitle`, `heroLead`, `heroCaption`, `heroPhotoAlt`, `figures*`; gambar `/img/produk/produk-hero.webp`; CTA yang sudah ada.
- Produces: `ProductHero()` tetap RSC, mempertahankan satu H1, ID `produk-hero`, nilai metrik dan link CTA.

- [ ] **Step 1: Kunci struktur hero editorial lewat E2E gagal**

Tambahkan test untuk `/produk`: H1 tunggal terlihat, hero berisi foto produk, copy singkat dan CTA, serta struktur desktop dua kolom/mobile satu kolom. Gunakan label aksesibel/ID semantik, bukan selector kelas rapuh.

- [ ] **Step 2: Jalankan test target dan pastikan gagal**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "hero produk editorial"`
Expected: FAIL karena hero saat ini berlatar foto gelap dan tidak memenuhi kontrak tata letak editorial.

- [ ] **Step 3: Ubah copy dan hero dengan token yang tersedia**

Perbarui hero copy agar ringkas dan faktual. Ubah `ProductHero` ke permukaan `surface`/`cream`, judul besar, copy dan CTA pada satu kolom, foto lokal dominan pada kolom lain. Jangan gunakan `productStory.figures` sebagai kumpulan klaim baru di hero; pertahankan hanya angka yang faktual dan kontekstual atau hapus tampilan kartu angka tersebut. Nama/alt foto tetap netral.

- [ ] **Step 4: Jalankan test target dan pemeriksaan statis**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "hero produk editorial"`
Expected: PASS. Run `npm run typecheck --workspace @recobid/web` dan `npm run lint --workspace @recobid/web`; keduanya PASS.

- [ ] **Step 5: Periksa keterbacaan copy**

Pastikan salinan angka yang dipertahankan punya sumber/konteks sesuai PRD, CTA mengarah ke formulir dan kalkulator yang benar, dan tidak ada `<h1>` tambahan.

### Task 2: Jadikan pita sebagai alur produk yang aman dan sesuai referensi

**Files:**
- Modify: `apps/web/components/sections/product-marquee.tsx`
- Modify: `apps/web/content/copy/id.ts` (`productStory.marquee*`)
- Modify: `apps/web/app/globals.css`
- Test: `apps/web/tests/unit/produk-interaktif.test.tsx`
- Test: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: alur proses yang sudah ada di `copy.productStory.marquee`.
- Produces: `ProductMarquee()` menampilkan pita tipis horizontal yang mengalir, berhenti saat reduced-motion dan mengumumkan daftar proses sekali untuk screen reader.

- [ ] **Step 1: Tambahkan uji DOM dan reduced motion**

Uji bahwa pita mempunyai daftar semantik tunggal untuk screen reader (salinan animasi dekoratif tersembunyi), menampilkan semua butir proses, dan `getComputedStyle(track).animationName` adalah `none` ketika `page.emulateMedia({ reducedMotion: "reduce" })`.

- [ ] **Step 2: Jalankan uji terkait dan pastikan gagal**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "pita proses"`
Expected: FAIL jika pita duplikasi terbaca ganda atau gerak masih aktif.

- [ ] **Step 3: Terapkan pita proses editorial**

Pertahankan alur yang didukung copy saat ini; rapikan styling menjadi pita ringkas yang menyambung dengan hero, tanpa menambah mitra/logo. Pertahankan reduced-motion CSS dan `aria-hidden` hanya pada track duplikat dekoratif; daftar aksesibel tersembunyi harus berisi proses utuh.

- [ ] **Step 4: Jalankan uji target**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "pita proses"`
Expected: PASS, termasuk `animationName: none` untuk reduced motion.

### Task 3: Susun manfaat, formulasi, dan rincian produk dalam alur terang

**Files:**
- Modify: `apps/web/app/produk/page.tsx`
- Modify: `apps/web/components/sections/product-ingredients.tsx`
- Modify: `apps/web/components/sections/product-usage.tsx`
- Modify: `apps/web/components/sections/product-comparison.tsx`
- Modify: `apps/web/content/copy/id.ts` (`productStory` copy)
- Test: `apps/web/tests/e2e/smoke.spec.ts`
- Test: `apps/web/tests/unit/produk-interaktif.test.tsx`

**Interfaces:**
- Consumes: `getPrimaryProduct()`, `copy.product`, `copy.productStory`, `copy.costCompare`.
- Produces: urutan hero → pita → manfaat/formulasi (`#formulasi`) → cara pakai/penawaran; produk dan harga tetap terikat pada data yang sama.

- [ ] **Step 1: Perbarui uji urutan, fakta, dan anchor**

E2E cek urutan DOM seksi, `#formulasi`, komposisi tiga bahan, harga dari data produk, CTA dan tidak adanya testimoni palsu. Pastikan perbandingan tetap hanya satu sumber angka yang dipakai `/kalkulator`.

- [ ] **Step 2: Jalankan uji target dan pastikan urutan lama gagal**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "alur editorial produk"`
Expected: FAIL pada urutan lama/kartu angka yang berlebihan.

- [ ] **Step 3: Rapikan alur seksi dan hierarchy**

Pertahankan bahan, batang komposisi, rujukan, cara pakai, transisi pakan, spesifikasi/penyimpanan, dan perbandingan yang memenuhi tujuan produk. Gunakan bidang terang sesuai token. Buang duplikasi/angka yang tidak perlu; jangan membuat seksi testimoni placeholder atau metrik dampak. Posisikan harga, kemasan, syarat sampel dan CTA sebagai penawaran produk yang mudah ditemukan. Perbarui komentar `page.tsx` agar tepat menggambarkan desain baru.

- [ ] **Step 4: Jalankan uji target serta unit yang terdampak**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "alur editorial produk"` dan `npm test --workspace @recobid/web -- tests/unit/produk-interaktif.test.tsx tests/unit/sections-top.test.tsx`.
Expected: PASS; `#formulasi`, tabs keyboard/click, harga dan tautan tetap berfungsi.

### Task 4: Verifikasi visual responsif, aksesibilitas, dan seluruh gerbang

**Files:**
- Modify: `apps/web/tests/e2e/smoke.spec.ts`
- Modify: `apps/web/tests/unit/produk-interaktif.test.tsx` bila test tambahan diperlukan

**Interfaces:**
- Verifies: seluruh kontrak spesifikasi tanpa mengubah komponen lain.

- [ ] **Step 1: Tambahkan E2E viewport dan semantik**

Uji pada 390 px dan 1440 px: tidak ada horizontal overflow, tepat satu H1, gambar produk termuat, semua seksi ada, CTA dapat difokuskan, anchor formulasi tetap berfungsi, dan reduced-motion mematikan gerak marquee.

- [ ] **Step 2: Jalankan pengujian halaman**

Run: `npm run test:e2e --workspace @recobid/web -- --grep "produk|pita proses|hero produk editorial|alur editorial produk"`
Expected: PASS untuk kedua viewport dan media reduced-motion.

- [ ] **Step 3: Jalankan semua gerbang repo**

Run: `npm run verify`
Expected: exit 0; lint, typecheck, design tokens, env, emoji, terms, secrets, alur pelanggan, unit, build, dan E2E semuanya lulus.

- [ ] **Step 4: Tinjau diff khusus halaman dan pertahankan perubahan tak terkait**

Run: `git diff --check` dan `git status --short`.
Expected: tak ada whitespace errors; hanya edit halaman produk/tests/docs yang direncanakan bersama seluruh perubahan awal yang sudah ada.

## Eksekusi

Implementasi tidak dimulai oleh dokumen ini. Minta pemilik meninjau spesifikasi dan rencana, lalu memilih eksekusi native atau subagent-driven. Worktree sudah berisi perubahan awal halaman produk yang belum dikomit; jangan reset atau menghapus perubahan itu.
