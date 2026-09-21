# Spec — ReCobID Monorepo: Pemisahan Front-end, Backend, dan Lingkungan

| Field | Nilai |
|---|---|
| Versi | 1.0.0 |
| Tanggal | 22 September 2026 |
| Status | Disetujui pemilik produk (22 September 2026) |
| Dokumen sumber | `Docs/PRD.md`, `Docs/SCHEMA.md`, `Docs/DESIGN.md`, `Docs/BMC_DIGTREP_OCR.md` |
| Bahan mentah UI | `Docs/stitch/code.html` (hasil Google Stitch), `Docs/stitch/screen.png`, `Docs/view.html` |
| Cakupan | Struktur repositori, pemisahan backend, pemisahan `.env`/`.gitignore`, port UI Stitch ke Next.js, kontrak data dan API, gate kualitas, urutan eksekusi |
| Di luar cakupan | Fitur Phase 2–4 (`SCHEMA.md` Bagian 5), autentikasi, dashboard KUD, kalkulator penghematan |

Dokumen ini melengkapi `DESIGN.md` (ADR-001 s/d ADR-009 sudah berlaku), bukan menggantikannya. Setiap
keputusan baru di sini diberi nomor lanjutan ADR-010 ke atas. Bila terjadi pertentangan antara
dokumen ini dan `DESIGN.md`, yang berlaku adalah dokumen ini **hanya untuk butir yang secara
eksplisit dinyatakan sebagai perubahan**; sisanya `DESIGN.md` tetap sumber kebenaran.

---

## 1. Tujuan

1. Mengubah bahan mentah Stitch (satu berkas HTML dengan Tailwind CDN) menjadi aplikasi Next.js 16
   App Router bertipe ketat yang mengikuti token `DESIGN.md`.
2. Memisahkan front-end dan backend menjadi dua workspace terpisah di dalam satu repositori, dengan
   `.env` dan `.gitignore` masing-masing, tanpa mengorbankan ADR-002 (backend terpadu Supabase).
3. Menjaga jejak keputusan: struktur, kontrak, batas kepercayaan, jalur gagal, dan gate kualitas
   harus dapat diaudit oleh orang lain tanpa membaca riwayat percakapan.
4. Menjaga agar Phase 2–4 tetap berupa penambahan, bukan penulisan ulang (`DESIGN.md` bagian
   "Kesiapan Phase 2").

Kriteria keberhasilan spec ini: seorang engineer yang belum pernah melihat proyek dapat menjalankan
repositori, memahami batas front-end/backend, dan mengetahui tepatnya berkas mana yang harus diubah
untuk setiap jenis pekerjaan (konten, UI, skema, notifikasi, deploy).

---

## 2. Keputusan Arsitektur

### ADR-010 — Monorepo npm workspaces dengan pemisahan `apps/web` dan `apps/backend`

**Konteks.** Permintaan pemilik produk: front-end dan backend dipisah, termasuk `.env` dan
`.gitignore`. `DESIGN.md` (ADR-002) menetapkan Supabase sebagai backend terpadu sehingga tidak ada
runtime HTTP backend tersendiri; namun artefak backend (migrasi SQL, seed, Edge Function, tes RLS)
adalah pekerjaan dengan siklus hidup berbeda: berubah saat skema berubah, bukan saat UI berubah.

**Alternatif.**
(a) Satu repo dengan dua direktori `frontend/` dan `backend/` tanpa workspaces — sederhana, tetapi
tidak ada resolusi impor bersama sehingga kontrak Zod harus disalin manual (sumber duplikasi).
(b) Dua repositori git terpisah — isolasi maksimal, tetapi setiap perubahan kontrak berarti dua PR
dan tidak ada CI tunggal.
(c) npm workspaces: `apps/web` (front-end = "folder front-end" yang diminta) + `apps/backend`
(artefak backend) + `packages/shared` (kontrak bersama).

**Keputusan.** (c), dengan pemetaan istilah: **"front-end" = `apps/web`**, **"backend" =
`apps/backend`**. Pemisahan yang diminta diwujudkan sebagai batas workspace: direktori terpisah,
`package.json` terpisah, `.env` terpisah, `.gitignore` terpisah, perintah dev/build terpisah,
deployment terpisah.

**Konsekuensi negatif yang diterima.**
1. `node_modules` di-hoist ke root: Node naik satu tingkat direktori untuk mencari dependensi, yang
   memperlambat resolusi modul pada volume NTFS-FUSE (mount `/run/media/...` bertipe `fuseblk`).
   Mitigasi: `.npmrc` dengan `prefer-symlink=true` dan pemantauan waktu `next dev`; bila terbukti
   mengganggu, opsi mundurnya adalah `node-linker`-style salinan (`npm ci --install-strategy=nested`)
   untuk satu paket saja — dicatat sebagai risiko R-5, bukan diubah diam-diam.
2. Workspace backend berisi SQL dan bukan aplikasi; `npm run dev` di sana tidak berarti apa pun.
   Mitigasi: nama skrip di backend adalah perintah operasional (`db:push`, `fn:deploy`), bukan `dev`.
3. Dua CI job berarti waktu CI lebih lama. Diterima; job backend dilewati bila rahasia Supabase
   tidak tersedia.

### ADR-011 — Backend sebagai artefak Supabase, tanpa service HTTP

**Konteks.** Pemilik produk memilih "murni Supabase sesuai ADR-002": Server Action Next.js + RLS
sebagai batas tepercaya. Pertanyaan lanjutan: apa isi workspace backend bila tidak ada runtime HTTP?

**Keputusan.** `apps/backend` memuat: `supabase/migrations/*.sql`, `supabase/seed/pitch.sql`,
`supabase/functions/notify-lead/`, `types/database.types.ts` (hasil generate, di-commit),
`tests/rls/*.test.ts`, dan `.env` yang memegang **seluruh kunci rahasia**. Server Action di
`apps/web` tidak pernah menyentuh `service_role`: ia memakai kunci `anon` + RLS, persis seperti
klien, dengan tambahan rate limit dan honeypot di sisi server.

**Konsekuensi negatif yang diterima.**
1. Tidak ada satu tempat untuk logika lintas-klien; bila Phase 2 menambah klien kedua (mis. portal
   peternak dengan konsumsi API mobile), logika bersama harus dipindahkan ke RPC, bukan ke service
   baru. Ini disengaja: lebih murah sekarang, dan RPC sudah menjadi pola yang dipakai.
2. Notifikasi berjalan di Edge Function (runtime Deno), sehingga utilitas Node tidak dapat dipakai
   ulang di sana. Diterima; notifikasi hanya memanggil satu API eksternal.
3. Rahasia terbagi dua `.env` (web dan backend) → risiko salinan tidak sinkron. Mitigasi:
   satu tabel sumber di `README.md` yang menyebutkan variabel mana dimiliki siapa, dan gate
   `check:env` yang gagal bila `.env.example` tidak memuat variabel yang dirujuk kode.

### ADR-012 — `.env` dan `.gitignore` berlapis per aplikasi

**Konteks.** Permintaan eksplisit: setiap `.env` dipisah dan `.gitignore` juga.

**Keputusan.** Tiga lapis `.gitignore` (root untuk OS/editor/artefak global, `apps/web/.gitignore`,
`apps/backend/.gitignore`) dengan pola seragam: abaikan `.env` dan `.env.*`, kecualikan
`!.env.example`. Setiap aplikasi memiliki `.env.example` yang di-commit (tanpa nilai rahasia) dan
`.env`/`.env.local` yang diabaikan. Gate `check:secrets` memindai berkas yang di-stage terhadap pola
JWT Supabase (`eyJ...`), `service_role`, `sk-`, dan `PRIVATE KEY`, dan gagal bila menemukan
kecocokan di luar berkas contoh.

**Konsekuensi negatif yang diterima.** Dua berkas `.env` berarti dua tempat untuk diisi saat
onboarding. Mitigasi: `README.md` memuat blok penyalinan satu perintah per aplikasi, dan
`check:env` menyebut variabel yang kurang beserta nama aplikasinya.

### ADR-013 — npm workspaces sebagai package manager

**Konteks.** `DESIGN.md` menyinggung `pnpm dev`; lingkungan pengembangan hanya memiliki npm 12.0.2
dan `corepack` tidak lagi dibundel Node 25+.

**Keputusan.** npm workspaces. Tidak ada kebutuhan yang menuntut pnpm (tidak ada dependensi
dengan peer resolution rumit, tidak ada kebutuhan content-addressable store).

**Konsekuensi negatif yang diterima.** Instalasi lebih lambat dan pemakaian disk lebih besar.
Bila kelak dibutuhkan, perpindahan ke pnpm adalah pekerjaan mekanis (`pnpm import`), dicatat sebagai
utang teknis ringan, bukan blocker.

### ADR-014 — Strategi port UI Stitch

**Konteks.** `code.html` (70 KB) adalah beranda lengkap 12 seksi yang sudah mengikuti `DESIGN.md`,
tetapi memakai Tailwind CDN dengan konfigurasi runtime, ikon `material-symbols`, gambar eksternal
`lh3.googleusercontent.com`, font lewat `<link>` ke Google Fonts, navigasi anchor yang mati
(`href="#"`), dan form dengan `onsubmit="event.preventDefault()"` tanpa backend.

**Keputusan.** Naskah, struktur, dan sistem visual dipertahankan; enam lapisan teknis diganti:

| # | Yang diganti | Menjadi |
|---|---|---|
| 1 | Tailwind CDN + `tailwind.config` runtime | Tailwind v4 `@theme` dari `styles/theme.css` (dihasilkan dari `DESIGN.md`, ADR-005) |
| 2 | Ikon `material-symbols` (`eco`, `person`, `verified`) | `lucide-react` dengan `strokeWidth={1.75}` (`recycle`, `flask-conical`, `wallet`, `badge-check`, `sprout`, dll.) |
| 3 | Gambar `lh3.googleusercontent.com` | disalin ke `apps/web/public/img/` sebagai **placeholder berlabel** `STATUS_PLACEHOLDER.md`, wajib diganti foto sendiri sebelum rilis publik |
| 4 | Form tanpa backend | Zod klien → Server Action → Zod server → RPC `submit_sample_lead` |
| 5 | Font pihak ketiga via `<link>` | `next/font` (subset latin, tanpa permintaan ke domain pihak ketiga) |
| 6 | Navigasi `href="#"` yang mati | rute nyata (`/produk`, `/dampak`, `/mitra`, `/edukasi`, `/kontak`) dan anchor yang ada (`#formulasi`, `#faq`, `#form-sampel`) |

**Konsekuensi negatif yang diterima.** Naskah hasil port wajib ditinjau ulang terhadap
`PRD.md` Bagian 8 (klaim vs capaian, status NPP apa adanya, tanpa emoji) — port mekanis dapat
memindahkan klaim yang belum tervalidasi tanpa label. Karena itu langkah pertama port adalah
membuat lapisan konten bertipe, bukan menyalin string ke JSX (lihat ADR-015).

### ADR-015 — Lapisan konten bertipe menggantikan string literal

**Konteks.** `PRD.md` §9 mewajibkan tidak ada teks UI yang tertanam langsung di komponen
(persiapan i18n Phase 3, `PRD.md` §5.2 X6). Beranda Stitch memuat ratusan string literal.

**Keputusan.** Seluruh salinan beranda masuk `apps/web/content/copy/id.ts` sebagai objek bertipe
(`as const satisfies Copy`), dengan `content/copy/index.ts` mengekspor `copy` dan `type Copy =
typeof idCopy`. Komponen hanya membaca `copy.<bagian>.<kunci>`. Tidak ada berkas `en.ts` di Phase 1
(bukan placeholder kosong — struktur cukup untuk menambah lokal kedua tanpa mengubah komponen).

**Konsekuensi negatif yang diterima.** Menambah satu kata berarti menyentuh dua berkas (konten dan
komponen bila butuh markup baru). Diterima: ini harga dari syarat i18n dan audit klaim.

### ADR-016 — Notifikasi lead sebagai Edge Function, bukan bagian alur sukses

**Konteks.** `PRD.md` §3.3 mensyaratkan notifikasi internal saat lead masuk. Mengirim email/WA dari
Server Action berarti kegagalan penyedia pihak ketiga dapat menggagalkan pengiriman form; `R4`
menyebut WhatsApp belum tentu siap.

**Keputusan.** Edge Function `notify-lead` menerima POST ber-signature HMAC-SHA256
(`x-recbob-signature: t=<unix>,v1=<hex>`), memvalidasi ulang payload dengan Zod (Deno), lalu
mengirim email (Resend) dan/atau WhatsApp (gateway generik) bila dikonfigurasi. Server Action
memanggilnya secara **fire-and-forget** dengan batas 2 detik; kegagalan dicatat sebagai
`notify_failed` dan tidak mengubah respons sukses ke pengguna. Lead di basis data adalah sumber
kebenaran; notifikasi adalah upaya terbaik.

**Konsekuensi negatif yang diterima.** Ada jendela di mana lead tersimpan tetapi tidak ada yang
mengetahui kecuali membuka tabel. Mitigasi: halaman staf membaca `lead` lewat RLS `staff`/`admin`,
dan jalur gagal WhatsApp selalu ditampilkan ke pengguna pada layar sukses.

### ADR-017 — Rate limit di memori dengan basis data sebagai gerbang sebenarnya

**Konteks.** ADR-007 menetapkan 5 pengiriman/10 menit per IP. Pada Vercel, instans bersifat
sementara dan tersebar, sehingga penghitung di memori tidak global. Menambah Redis/KV berarti
infrastruktur baru untuk Phase 1.

**Keputusan.** Penghitung di memori dengan kunci IP ber-hash, jendela geser, dan **batas ukuran
peta wajib** (maksimum 10.000 kunci, eviksi entri kedaluwarsa saat akses, tanpa antrean tak
terbatas). Batas ini didokumentasikan sebagai upaya terbaik. Gerbang sesungguhnya tetap di basis
data: `lead_idempotency_unique` dan `lead_phone_active_idx` (SCHEMA §3.4).

**Konsekuensi negatif yang diterima.** Penyerang terdistribusi masih dapat membuat banyak lead
sampah; honeypot bernama wajar + dedupe nomor WA membatasi dampaknya. Bila kampanye besar dimulai,
Phase 2 memindahkan penghitung ke Vercel KV — perubahan satu modul (`lib/rate-limit.ts`).

### ADR-018 — Kontrak bersama di `packages/shared`, tanpa langkah build

**Konteks.** Skema Zod harus identik di klien, Server Action, dan tes (`SCHEMA.md` Bagian 8).

**Keputusan.** `packages/shared` adalah paket sumber TypeScript yang dikonsumsi apa adanya:
`apps/web/next.config.ts` memakai `transpilePackages: ['@recobid/shared']`, dan Vitest me-resolve
`exports` ke `.ts`. Tidak ada langkah build, tidak ada `dist/`. Isi: `contracts/*.ts` (Zod + tipe
turunan), `db/database.types.ts` (hasil `supabase gen types`, AUTO-GENERATED, dilarang diedit
tangan), `constants/*.ts` (kode wilayah, nama event funnel, batas ukuran).

**Konsekuensi negatif yang diterima.** Paket ini tidak dapat dikonsumsi konsumen non-bundler
(mis. skrip Node mentah tanpa loader TS). Diterima: seluruh konsumen Phase 1–2 adalah Next.js dan
Vitest, keduanya memahami TypeScript.

### ADR-019 — Pemetaan nama KUD dari lapisan konten, bukan dari tabel `kud`

**Konteks.** `SCHEMA.md` §7 menetapkan KUD di-seed dengan `status='target'` ("calon mitra, bukan
mitra aktif"), sementara policy RLS `kud_read_public` hanya membuka baris `status='active'`
(`SCHEMA.md` §3.7). Akibatnya halaman kemitraan **tidak dapat** membaca daftar KUD target memakai
kunci `anon`, dan melonggarkan RLS demi tampilan adalah pelanggaran aturan `SCHEMA.md` §10.

**Keputusan.** Nama dan urutan KUD pada halaman kemitraan berasal dari lapisan konten
(`content/copy/id.ts`), bukan dari tabel. Tabel `kud` tetap otoritatif untuk data operasional
Phase 2. Pemilih KUD pada formulir memakai daftar konten yang sama dan mengirim `kudSlug`; RPC
`submit_sample_lead` (SECURITY DEFINER) menyelesaikan slug ke `kud_id` tanpa terpengaruh RLS.

**Konsekuensi negatif yang diterima.** Nama KUD dapat berbeda antara konten dan tabel bila salah
satu diperbarui. Mitigasi: tes unit membandingkan daftar slug pada konten dengan daftar slug hasil
seed (`tests/unit/content-kud-sync.test.ts` di `apps/backend`), dan gagal bila tidak sinkron.

### ADR-020 — Data efek samping demo di-bundel saat build (mode demo)

**Konteks.** `PRD.md` risiko R1: jaringan venue pitching buruk. Halaman dampak harus tetap tampil.

**Keputusan.** Bila `DEMO_MODE=true` **atau** variabel Supabase tidak tersedia, `lib/data/*`
mengembalikan data dari `apps/web/lib/data/demo-data.ts` (hasil ekspor seed yang di-commit) alih-alih
memanggil Supabase. Beranda, produk, dampak, dan mitra tetap utuh; formulir menampilkan penanda
"mode demo" dan tautan WhatsApp alih-alih gagal diam-diam. Modul `demo-data.ts` diberi komentar
bahwa isinya **wajib** dihasilkan ulang dari `supabase/seed/pitch.sql` sebelum demo (skrip
`npm run demo:export` di workspace backend).

**Konsekuensi negatif yang diterima.** Dua jalur baca berarti dua jalur yang harus diuji. Mitigasi:
tes unit `lib/data/*` menjalankan dua kasus (klien Supabase palsu dan mode demo) untuk setiap fungsi.

---

## 3. Struktur Repositori

```text
ReCobID/                                  # root repo git (repositori: recobid)
├─ apps/
│  ├─ web/                                # FRONT-END — Next.js 16.3 App Router
│  │  ├─ app/
│  │  │  ├─ layout.tsx                    # font (next/font), metadata dasar, JSON-LD Organization
│  │  │  ├─ page.tsx                      # beranda (12 seksi, ISR tag 'impact'/'product')
│  │  │  ├─ globals.css                   # @import "tailwindcss"; @import "../styles/theme.css"
│  │  │  ├─ api/health/route.ts           # cek Supabase, timeout 2 s
│  │  │  ├─ api/lead/route.ts             # fallback POST tanpa JavaScript
│  │  │  ├─ actions/submit-lead.ts        # Server Action: Zod -> rate limit -> RPC
│  │  │  ├─ actions/track-event.ts        # Server Action funnel -> lead_event
│  │  │  ├─ robots.ts  sitemap.ts  opengraph-image.tsx
│  │  ├─ components/
│  │  │  ├─ ui/                           # button, badge, input, card, alert, caption-note, container
│  │  │  ├─ sections/                     # hero, problem, solution, product, cost-compare, impact,
│  │  │  │                                # partnership, validation, education, faq, cta, footer
│  │  │  └─ blocks/                       # composition-bar, metric-panel, kud-flow, sample-form
│  │  ├─ content/
│  │  │  ├─ copy/id.ts                    # seluruh salinan beranda (bertipe)
│  │  │  └─ copy/index.ts                 # ekspor `copy` dan tipe `Copy`
│  │  ├─ lib/
│  │  │  ├─ data/                         # SATU-SATUNYA pintu Supabase: regions, products, impact, leads
│  │  │  ├─ supabase/                     # client.ts, server.ts, admin-absent (tanpa service_role)
│  │  │  ├─ schema/                       # re-ekspor skema Zod dari @recobid/shared
│  │  │  ├─ analytics.ts                  # track() -> Server Action
│  │  │  ├─ rate-limit.ts                 # penghitung jendela geser berbatas
│  │  │  ├─ env.ts                        # validasi variabel lingkungan saat boot
│  │  │  └─ utils/{cn.ts, format.ts}      # cn(); Rupiah, tanggal WIB
│  │  ├─ public/img/                      # logo.png + gambar canva/Stitch (placeholder berlabel)
│  │  ├─ styles/theme.css                 # DIHASILKAN dari Docs/DESIGN.md
│  │  ├─ tests/{unit,e2e}/
│  │  ├─ scripts/check-tokens.mjs
│  │  ├─ .env.example  .gitignore  next.config.ts  postcss.config.mjs  eslint.config.mjs
│  │  └─ package.json  tsconfig.json  vitest.config.ts  playwright.config.ts
│  └─ backend/                            # BACKEND — artefak Supabase
│     ├─ supabase/
│     │  ├─ migrations/*.sql              # sumber kebenaran skema (SCHEMA.md §3)
│     │  ├─ seed/pitch.sql                # idempoten, dijalankan ulang sebelum demo
│     │  └─ functions/notify-lead/index.ts
│     ├─ types/database.types.ts          # AUTO-GENERATED (supabase gen types) — dilarang diedit
│     ├─ tests/rls/*.test.ts              # uji RLS/RPC terhadap basis data nyata (Vitest + pg)
│     ├─ tests/unit/content-kud-sync.test.ts
│     ├─ scripts/{check-env.mjs, export-demo-data.mjs}
│     ├─ .env.example  .gitignore  package.json  tsconfig.json  vitest.config.ts
├─ packages/shared/                       # kontrak bersama (sumber TS, tanpa build)
│  ├─ src/contracts/{lead.ts, events.ts, content.ts}
│  ├─ src/db/database.types.ts            # hasil generate, dire-ekspor untuk lib/data
│  ├─ src/constants/{regions.ts, limits.ts, funnel-events.ts}
│  └─ package.json  tsconfig.json
├─ Docs/
│  ├─ PRD.md  SCHEMA.md  DESIGN.md  BMC_DIGTREP_OCR.md
│  ├─ view.html                           # artefak tinjauan Stitch (dipertahankan)
│  ├─ specs/*.md                          # dokumen spec seperti berkas ini
│  └─ stitch/{code.html, screen.png, stitch_branded_ui_design_implementation.zip}
├─ scripts/{check-no-emoji.mjs, check-secrets.mjs, export-design-tokens.mjs}
├─ .github/workflows/ci.yml
├─ package.json  package-lock.json  .npmrc  .nvmrc  .gitignore  README.md
```

Catatan penting: direktori dokumentasi tetap bernama **`Docs/`** (kapital) mengikuti kondisi yang
sudah ada. Volume kerja bertipe `fuseblk` dan kepekaannya terhadap huruf besar-kecil tidak seragam,
sehingga `docs/` dan `Docs/` tidak boleh hidup berdampingan. Spec baru disimpan di `Docs/specs/`.

Aturan lapisan (diperluas dari `DESIGN.md`):

| Dari | Boleh mengimpor |
|---|---|
| `app/**` | `components/**`, `lib/**`, `@recobid/shared` |
| `components/**` | `lib/utils`, `lib/analytics`, `content/copy`, `@recobid/shared` |
| `lib/data/**` | `lib/supabase/**`, `@recobid/shared` |
| `lib/**` (selain `data`) | `@recobid/shared`, `lib/*` |

Dilarang: komponen memanggil Supabase; `apps/web` mengimpor dari `apps/backend`; kode klien
mengimpor `lib/supabase/server.ts`.

Kontrak bersama dikonsumsi sebagai sumber TypeScript: `apps/web/next.config.ts` memakai
`transpilePackages: ['@recobid/shared']`. Karena `next build` pada Vercel memakai berkas konfigurasi
yang sama, tidak ada penyiapan tambahan saat deploy — cukup root direktori proyek Vercel diarahkan
ke `apps/web` sementara repository root tetap menjadi akar workspace (Bagian 11).

---

## 4. Kontrak Variabel Lingkungan

### 4.1 `apps/web/.env.example` (di-commit)

| Variabel | Rahasia | Wajib | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | tidak | ya | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | tidak | ya | kunci `anon`; satu-satunya kunci Supabase di bundel klien |
| `NEXT_PUBLIC_SITE_URL` | tidak | ya | basis URL kanonik untuk metadata, sitemap, OG |
| `NEXT_PUBLIC_SENTRY_DSN` | tidak | tidak | bila kosong, Sentry tidak diinisialisasi (bukan gagal) |
| `SENTRY_AUTH_TOKEN` | ya | tidak | hanya unggah source map saat build |
| `LEAD_RATE_LIMIT_WINDOW_MS` | tidak | tidak | bawaan `600000` |
| `LEAD_RATE_LIMIT_MAX` | tidak | tidak | bawaan `5` |
| `NOTIFY_HOOK_URL` | tidak | tidak | URL Edge Function `notify-lead`; kosong = notifikasi dilewati |
| `NOTIFY_HOOK_SECRET` | ya | tidak | kunci HMAC; kosong = notifikasi dilewati (dicatat di log) |
| `DEMO_MODE` | tidak | tidak | `true` memaksa jalur data dari bundel (ADR-020) |
| `BRANCH_NAME` | tidak | tidak | diisi Vercel/GitHub Actions; `next.config.ts` menambahkan `allowedDevOrigins` hanya untuk cabang preview, tidak untuk produksi |
| `VERCEL_ENV` | tidak | tidak | diisi Vercel (`production`/`preview`/`development`) untuk cabang logika yang sama |

### 4.2 `apps/backend/.env.example` (di-commit)

| Variabel | Rahasia | Keterangan |
|---|---|---|
| `SUPABASE_URL` | tidak | URL project (dipakai skrip dan tes) |
| `SUPABASE_ANON_KEY` | tidak | dipakai tes RLS untuk simulasi peran `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | **ya** | hanya skrip seed/pembersihan tes; **tidak pernah** masuk `apps/web` |
| `SUPABASE_DB_URL` | **ya** | koneksi Postgres langsung untuk migrasi dan tes RLS |
| `SUPABASE_ACCESS_TOKEN` | **ya** | deploy Edge Function dan `supabase link` non-interaktif |
| `SUPABASE_PROJECT_REF` | tidak | referensi project untuk perintah CLI |
| `RESEND_API_KEY` | **ya** | kanal email notifikasi |
| `NOTIFY_EMAIL_FROM` | tidak | pengirim terverifikasi |
| `NOTIFY_EMAIL_TO` | tidak | tujuan notifikasi internal |
| `NOTIFY_WA_GATEWAY_URL` | tidak | gateway WhatsApp (opsional; kosong = kanal dilewati) |
| `NOTIFY_WA_GATEWAY_TOKEN` | **ya** | token gateway (opsional) |
| `NOTIFY_HOOK_SECRET` | **ya** | kunci HMAC yang **sama** dengan `apps/web` |
| `APP_ENV` | tidak | `development` / `production`; seeder demo menolak berjalan di `production` |

Rahasia Edge Function adalah milik project Supabase, bukan berkas: `.env` backend adalah sumber
lokal, dan `npm run fn:secrets` menjalankan `supabase secrets set --env-file .env` sehingga kedua
sisi tidak pernah berbeda tanpa disengaja.

### 4.3 Matriks `.gitignore`

| Berkas | Menangani |
|---|---|
| `.gitignore` (root) | `node_modules/`, `.DS_Store`, `*.log`, `.idea/`, `.vscode/` (kecuali `settings.json`), `.turbo/`, `coverage/`, `playwright-report/`, `test-results/`, `.env`, `.env.*`, `!.env.example`, `!.env.*.example` |
| `apps/web/.gitignore` | `.next/`, `.vercel/`, `out/`, `.env.local`, `.env*.local`, `!.env.example`, `!.env.*.example`, `next-env.d.ts` |
| `apps/backend/.gitignore` | `.env`, `.env.*`, `!.env.example`, `supabase/.temp/`, `supabase/.branches/`, `*.dump`, `*.sql.gz` |

Pola `.env` dan `!.env.example` diulang di tiap lapis dengan sengaja: berkas `.gitignore` di
subdirektori berlaku untuk subdirektori itu, dan pengulangan membuat setiap workspace dapat
dipindahkan tanpa kehilangan perlindungan.

---

## 5. Port UI: Pemetaan Stitch ke Komponen Next.js

| # | Seksi Stitch (heading) | Komponen tujuan | Permukaan | Sumber data |
|---|---|---|---|---|
| 1 | Hero | `sections/hero.tsx` | `surface` | konten |
| 2 | Tantangan Nyata Peternak | `sections/problem.tsx` | `surface` | konten + angka statis bersitasi |
| 3 | ReCob.id: Nutrisi dari Limbah Jadi | `sections/solution.tsx` | `cream` | konten |
| 4 | Komposisi Presisi & Spesifikasi Produk | `sections/product.tsx` + `blocks/composition-bar.tsx` | `cream` | `lib/data/products.ts` |
| 5 | Aritmetika Penghematan Transparan | `sections/cost-compare.tsx` | `surface` | konten (nominal dari produk) |
| 6 | Metrik Dampak & Skala Misi | `sections/impact.tsx` + `blocks/metric-panel.tsx` | `ink-deep` | `lib/data/impact.ts` |
| 7 | Jalur Distribusi & Potong Setoran | `sections/partnership.tsx` + `blocks/kud-flow.tsx` | `paper` | konten + `lib/data/kud.ts` (staf) |
| 8 | Kendali Mutu & Transparansi QC | `sections/validation.tsx` | `paper` | konten + status NPP |
| 9 | Edukasi Manajemen Ruminansia | `sections/education.tsx` | `surface` | konten (4 kartu; tautan ke `/edukasi` Siklus B) |
| 10 | Tanya Jawab | `sections/faq.tsx` (`"use client"`) | `surface` | konten (6 pertanyaan) |
| 11 | Klaim Sampel Gratis (form) | `sections/cta.tsx` + `blocks/sample-form.tsx` (`"use client"`) | `cream` | `lib/data/regions.ts` |
| 12 | Footer | `sections/footer.tsx` | `ink-deep` | konten |

Pulau klien dibatasi empat: akordeon FAQ, formulir sampel, bilah CTA lengket (mobile), dan animasi
hitung-naik metrik. Seksi lain adalah Server Component.

Komponen pada `components/ui/*` dibuat dengan `class-variance-authority` dan `cn()`, sesuai kontrak
visual `DESIGN.md` (tinggi minimum 48 px untuk tombol dan input, 44 px untuk target sentuh,
`focus-visible` memakai token `focus`, tanpa emoji, ikon `lucide-react` 1,75 px).

### 5.1 Kontrak generator token (memperluas ADR-005)

`scripts/export-design-tokens.mjs` membaca blok YAML pada `Docs/DESIGN.md` (garis depan
`---`...`---`) dan menghasilkan tiga artefak:

1. `apps/web/styles/theme.css` — blok `@theme` dengan token mentah: `--color-*`, `--font-*`,
   `--text-*`, `--tracking-*`, `--font-weight-*`, `--radius-*`, `--spacing-*`.
2. Kelas komposit `@layer components` pada berkas yang sama: `.type-display-xl`, `.type-h1`,
   `.type-h2`, `.type-h3`, `.type-body-lg`, `.type-body-md`, `.type-body-sm`, `.type-label-md`,
   `.type-caption`, `.type-metric-lg`, `.type-metric-md`, `.type-mono-data`. Setiap kelas memuat
   `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing`, dan
   `font-feature-settings: "tnum"` bila token metrik. Alasan: satu kelas Tailwind tidak dapat
   membawa lima properti sekaligus, dan kombinasi manual (`font-h2 text-h2 font-bold`) adalah
   sumber penyimpangan yang tidak terdeteksi.
3. `apps/web/styles/tokens.json` — representasi datar untuk pengujian dan perkakas.

Gate `check:tokens`: menjalankan ulang generator, membandingkan hasilnya dengan berkas di repo, dan
gagal bila berbeda. Konsekuensinya perubahan warna/ukuran harus lewat `Docs/DESIGN.md`.

---

## 6. Kontrak Data

### 6.1 Sumber kontrak

| Berkas | Isi | Konsumen |
|---|---|---|
| `packages/shared/src/contracts/lead.ts` | `submitLeadInput` (Zod) dan tipe `SubmitLeadInput`; identik dengan `SCHEMA.md` §8 | klien, Server Action, `/api/lead`, tes |
| `packages/shared/src/contracts/events.ts` | `funnelEventName` enum dan `trackEventInput` | `lib/analytics.ts`, Server Action `track-event` |
| `packages/shared/src/contracts/content.ts` | skema front matter artikel (Siklus B, disiapkan sekarang) | build konten |
| `packages/shared/src/db/database.types.ts` | hasil `supabase gen types typescript --linked` | `lib/data/*` |
| `packages/shared/src/constants/*.ts` | `REGION_CODES`, `FUNNEL_EVENTS`, `LIMITS` | semua |

Aturan: berkas hasil generate tidak diedit tangan (`SCHEMA.md` §8); perubahan manual dinyatakan
sebagai pelanggaran review.

### 6.2 Modul `lib/data/*` (satu-satunya pintu Supabase)

| Modul | Fungsi | Kueri | Cache |
|---|---|---|---|
| `regions.ts` | `getRegions()` | `select code,name from region order by name` | `unstable_cache` 3600 s, tag `content` |
| `products.ts` | `getPrimaryProduct()`, `getIngredients(productId)` | `product` + `product_ingredient` dalam satu kueri bergabung, **bukan N+1** (SCHEMA §4 aturan 1) | tag `product` |
| `impact.ts` | `getPublicMetrics()` | `impact_metric` + `impact_metric_reference` via join | tag `impact` |
| `kud.ts` | `getKudByRegion()`, `getKudBySlug()` | dipakai sisi staf/Phase 2 (lihat ADR-019) | tanpa cache |
| `leads.ts` | `submitLead()` (RPC), `getLeadsForStaff()` | RPC `submit_sample_lead` | tanpa cache |

Setiap fungsi mengembalikan tipe eksplisit; tidak ada `any` (aturan `DESIGN.md` Tech Stack).

---

## 7. Backend: Migrasi, RPC, Seed, Edge Function

### 7.1 Berkas migrasi (urut, satu topik per berkas)

| # | Berkas | Isi |
|---|---|---|
| 1 | `20260922090000_extensions_and_enums.sql` | `pgcrypto`, `citext`; enum `lead_status`, `lead_source`, `metric_unit`, `metric_period` |
| 2 | `20260922090100_helper_functions.sql` | `set_updated_at()` |
| 3 | `20260922090200_region_and_kud.sql` | tabel `region`, `kud` + indeks `kud_region_status_idx` |
| 4 | `20260922090300_catalog.sql` | `product`, `product_ingredient`, `product_slug_active_idx`, indeks produk-bahan |
| 5 | `20260922090400_lead.sql` | tabel `lead`, `lead_phone_active_idx`, `lead_status_created_idx`, `lead_region_created_idx`, `lead_source_idx`, trigger `lead_set_updated_at` |
| 6 | `20260922090500_lead_event.sql` | tabel `lead_event` + indeks |
| 7 | `20260922090600_impact_metric.sql` | tabel metrik + referensi + constraint trigger `impact_metric_public_requires_reference` |
| 8 | `20260922090700_rls_phase1.sql` | `app_role()`, aktifkan RLS 8 tabel, seluruh policy `SCHEMA.md` §3.7 |
| 9 | `20260922090800_rpc_submit_sample_lead.sql` | fungsi `submit_sample_lead` + `revoke`/`grant` |

Penurunan (teardown) disediakan di `apps/backend/supabase/teardown/phase1_drop.sql`: menghapus
fungsi, policy, trigger, dan tabel Phase 1 dalam urutan dependensi yang benar. Berkas ini **tidak
pernah** dijalankan otomatis; dipakai hanya untuk membersihkan project percobaan (risiko R-1).

Isi SQL diambil apa adanya dari `SCHEMA.md` §3 (bukan disusun ulang dari ingatan); penyimpangan
hanya boleh terjadi dengan alasan tertulis di berkas migrasi.

### 7.2 RPC `submit_sample_lead`

Signature dan isi tetap sesuai `SCHEMA.md` §4: `security definer`, `set search_path = public`,
idempoten tiga lapis (kunci idempotensi, indeks unik nomor WA, pemeriksaan `v_existing`), mencatat
`lead_event` dengan `metadata.duplicate`, mengembalikan `(lead_id uuid, created boolean)`, dan
`grant execute to anon, authenticated`.

Kode galat yang harus ditangani pemanggil: `22023` (wilayah tidak dikenal) → pesan validasi
wilayah; `23505` pada `lead_idempotency_unique` → diperlakukan sebagai duplikat sukses.

### 7.3 Seed `supabase/seed/pitch.sql`

Isi (idempoten, dibungkus satu transaksi `begin; ... commit;` agar constraint trigger tertunda
dievaluasi di akhir):

| Tabel | Isi |
|---|---|
| `region` | 3 baris: `jabar`/Jawa Barat, `jateng`/Jawa Tengah, `jatim`/Jawa Timur; `on conflict (code) do update` |
| `kud` | 4 baris `status='target'`: KPBS Pangalengan (jabar/Bandung), KUD Mojosongo (jateng/Boyolali), KUD Cepogo (jateng/Boyolali), KUD Setia Kawan (jatim/Pasuruan); `on conflict (slug) do update` |
| `product` | `recob-pelet-50kg` (50 kg, `price_idr` 160000, `compare_price_idr` 200000, protein sesuai dokumen sumber) dan satu produk `is_bulk = true` |
| `product_ingredient` | 3 baris: bonggol jagung terfermentasi 50–55%, ampas tahu terfermentasi 35–40%, molase 5–10%; pola seed: `delete` per `product_id` lalu `insert` |
| `impact_metric` + referensi | 5 metrik `PRD.md` §7.1 dengan `is_demo = true`, `is_public = true`, disertai `assumption_note` terbuka; metrik emisi **tidak** disisipkan (tanpa koefisien resmi) |
| `lead` | 10 baris `is_demo = true` lintas wilayah dan sumber, `idempotency_key` berpola `seed-pitch-<n>` |

Seeder menolak berjalan bila `APP_ENV=production` kecuali diberikan penanda `--force`.

### 7.4 Edge Function `notify-lead`

| Aspek | Ketetapan |
|---|---|
| Rute | `POST /functions/v1/notify-lead` |
| Auth | JWT proyek **aktif** (default Supabase); pemanggil mengirim `Authorization: Bearer <anon key>` + header `x-recbob-signature` |
| Signature | `t=<unix_seconds>,v1=<hex(HMAC-SHA256(secret, "${t}.${body}"))>`; tolak bila selisih `t` > 300 s |
| Body | `{ leadId, fullName, phoneWa, cattleCount, regionCode, kudSlug?, source, createdAt }` |
| Validasi | Zod (Deno) — 422 bila gagal |
| Aksi | kirim email (Resend) bila `RESEND_API_KEY` ada; kirim WhatsApp bila gateway ada; kanal yang tidak dikonfigurasi dilewati, bukan digagalkan |
| Respons sukses | `202 { delivered: { email: boolean, whatsapp: boolean }, skipped: string[] }` |
| Respons galat | `401` signature salah/kedaluwarsa, `422` payload tidak valid, `429` penyedia membatasi, `502` penyedia gagal |
| Timeout | 5 s per panggilan penyedia (`AbortSignal.timeout`) |
| Log | hanya `lead_id` dan status; **tidak pernah** nama atau nomor telepon |
| Deploy | `npm run fn:deploy` = `supabase functions deploy notify-lead` (JWT aktif, tanpa `--no-verify-jwt`) |

---

## 8. Alur Konversi End-to-End

```text
[Peramban, klien tidak tepercaya]
  sample-form.tsx
    ├─ validasi Zod klien (submitLeadInput)        -> galat inline, tanpa PII di URL
    ├─ kirim cta_click / sample_form_start         -> Server Action trackEvent
    ├─ leadIdempotencyKey dibuat sekali per mount (crypto.randomUUID)
    └─ panggil Server Action submitLead(input)
            │
[apps/web, batas tepercaya]
  actions/submit-lead.ts
    ├─ parse ulang dengan submitLeadInput (skema sama dari @recobid/shared)
    ├─ honeypot terisi? -> balas sukses palsu (tanpa menyimpan)
    ├─ rate limit 5/10 menit per IP (ADR-017) -> 429 dengan tautan WhatsApp
    ├─ lib/data/leads.ts -> rpc('submit_sample_lead', {...}) (kunci anon, AbortSignal 5 s)
    │      ├─ created = true  -> {"status":"created"}
    │      ├─ created = false -> {"status":"duplicate"}   (tetap sukses, idempoten)
    │      └─ galat 22023/23505/jaringan -> {"status":"error","code":...}
    ├─ catat lead_event sample_form_submit (server, tanpa PII)
    └─ notify-lead (fire-and-forget, 2 s, kegagalan -> log notify_failed)
            │
[Supabase]
  RPC security definer -> insert lead + insert lead_event (satu transaksi)
```

Jalur gagal yang wajib ada di UI:

| Kondisi | Perilaku pengguna |
|---|---|
| Rate limit terlampaui | pesan "terlalu banyak pengiriman, coba lagi nanti" + tombol WhatsApp |
| Wilayah tidak dikenal | galat pada pemilih wilayah (kondisi yang seharusnya tidak terjadi) |
| Duplikat nomor WA | layar sukses, teks "nomor ini sudah terdaftar, admin akan menghubungi" |
| Supabase tidak dapat dijangkau | pesan yang dapat ditindaklanjuti + tombol WhatsApp; **tidak pernah** gagal diam-diam |
| Notifikasi gagal | tidak terlihat pengguna; tercatat di log terstruktur |

Setiap panggilan keluar memakai `AbortSignal.timeout(5000)`; tidak ada I/O tanpa batas waktu.

---

## 9. Observabilitas

| Instrumen | Ketetapan | Aktif sejak |
|---|---|---|
| Log terstruktur | satu baris JSON per permintaan Server Action: `request_id`, `path`, `status`, `duration_ms`, `lead_created`, `notify` — tanpa PII | Siklus A |
| `/api/health` | cek Supabase, timeout 2 s, `200`/`503` dengan `{db:"ok"|"down"}` | Siklus A |
| Funnel | `lead_event` lewat Server Action `track-event`; `page_view` ditangani Vercel Analytics | Siklus A |
| Vercel Analytics + Speed Insights | dipasang di `layout.tsx`; tanpa variabel | Siklus C |
| Sentry | `@sentry/nextjs`, `traceSampleRate` 0.1, `beforeSend` menyaring PII; tidak aktif bila DSN kosong | Siklus C |

Catatan risiko sisa: policy RLS `lead_event_insert_public` (`SCHEMA.md` §3.7) masih mengizinkan
penyisipan langsung memakai kunci `anon`. Aplikasi mengirim event lewat Server Action (terbatas
laju), tetapi jalur langsung tetap terbuka. Tidak ditutup di Phase 1 karena mengubahnya berarti
menyimpang dari `SCHEMA.md`; dicatat sebagai kandidat pengetatan Phase 2.

---

## 10. Pengujian

| Lapis | Alat | Isi | Dijalankan |
|---|---|---|---|
| Unit front-end | Vitest + Testing Library | `submitLeadInput` (batas nilai), `lib/data/*` (klien palsu + mode demo, ADR-020), `rate-limit.ts` (batas peta, eviksi), `format.ts` (Rupiah, WIB), `cn()` | setiap commit |
| Unit backend | Vitest | sinkronisasi slug KUD konten vs seed (ADR-019); bentuk migrasi (berkas urut, tiap berkas ada); `check:env` (variabel yang dirujuk kode tersedia di `.env.example`, kunci rahasia tidak memakai nilai contoh) | setiap commit |
| RLS/RPC | Vitest + `pg` terhadap basis data nyata | skenario `SCHEMA.md` §6.4: `anon` tidak dapat `select lead`; insert `status='converted'` ditolak; duplikat nomor WA mengembalikan `created=false`; metrik publik tanpa referensi ditolak trigger; `explain` kueri lead 90 hari memakai index scan, bukan sequential scan | bila `SUPABASE_DB_URL` tersedia |
| E2E | Playwright (build produksi) | smoke: beranda render 12 seksi, navigasi, akordeon FAQ, validasi form kosong, `/api/health` 200, `sitemap.xml` | setiap commit (jalur form penuh hanya bila `.env.local` terisi) |
| Audit manual | checklist PR | kontras, operasi keyboard, lebar 360 px, jaringan lambat, kepatuhan klaim `PRD.md` §8, tanpa emoji, NPP apa adanya | setiap PR 

Cara uji RLS tanpa Docker: setiap tes membungkus pernyataannya dalam `begin; ... rollback;` pada
satu koneksi, dengan `set local role anon` (atau `authenticated`/`staff`) dan
`set local request.jwt.claims = '{"role":"anon"}'`, sehingga tidak ada baris uji yang tertinggal di
tabel produksi. Tidak ada `psql` yang dibutuhkan; koneksi memakai `pg` dari Vitest.

Gate tunggal `npm run verify` (root):

```text
lint -> typecheck -> check:tokens -> check:env -> check:emoji -> check:secrets -> test -> build -> e2e
```

`check:emoji` dijalankan pada root dengan `NO_EMOJI_EXTRA_IGNORE=Docs` (dokumentasi referensi dan
artefak Stitch tidak dipindai; kode, konten, dan konfigurasi dipindai). `check:env` memverifikasi
bahwa setiap variabel lingkungan yang dirujuk kode ada di `.env.example` aplikasinya (ADR-011
konsekuensi 3). `e2e` menjalankan smoke Playwright; peramban disiapkan sekali dengan
`npx playwright install chromium`.

---

## 11. CI dan Deployment

| Aspek | Ketetapan |
|---|---|
| CI | `.github/workflows/ci.yml`: job `web` (lint, typecheck, test unit, build), job `backend` (lint skrip, tes unit, tes RLS bila rahasia tersedia, `check:tokens`), job `gates` (emoji + secrets) |
| Rahasia CI | `SUPABASE_*` dan `NOTIFY_HOOK_SECRET` di GitHub Actions Secrets; job RLS dilewati bila tidak ada |
| Deploy web | Vercel, proyek menunjuk **root direktori `apps/web`**; Preview per PR, produksi dari `main` |
| Variabel Vercel | seluruh `apps/web/.env.example` sesuai lingkungan; hanya `NEXT_PUBLIC_*` yang boleh publik |
| Migrasi | `npm run db:push --linked` sebelum deploy kode yang membutuhkannya; urutan expand-first (`DESIGN.md` Deployment) |
| Deploy backend | `npm run fn:deploy`; rahasia lewat `npm run fn:secrets` |
| Rollback | `vercel rollback`; migrasi bersifat menambah sehingga tidak perlu dibalik |
| Pra-demo | `npm run db:seed`, cek `/api/health`, uji form dengan kunci idempotensi tetap, aset hero tersedia lokal |

---

## 12. Urutan Eksekusi dan Irisan Siklus

**Siklus A** adalah rencana implementasi pertama (dokumen terpisah, dibuat dengan skill
`writing-plans`). Siklus B dan C mendapat rencana sendiri agar Siklus A tetap dapat diselesaikan
dan diverifikasi utuh.

| Fase | Nama | Keluaran | Verifikasi | Siklus |
|---|---|---|---|---|
| 0 | Bootstrap repositori | `git init`, workspaces, `packages/shared`, `.gitignore` berlapis, `Docs/stitch/` dipindahkan, README kerangka | `npm install` bersih; `npm run typecheck` lulus; `check-no-emoji` bersih | A |
| 1 | Token dan gate | `export-design-tokens.mjs`, `theme.css` + `tokens.json` tergenerasi, `check:secrets.mjs`, `check:tokens`, CI kerangka | jalankan generator dua kali: hasil identik; gate gagal saat token sengaja dirusak | A |
| 2 | Backend: skema | 9 berkas migrasi dari `SCHEMA.md` §3, diterapkan ke project Supabase tertaut | tes RLS/RPC hijau; `explain` memakai index scan | A |
| 3 | Backend: seed + notifikasi | `seed/pitch.sql`, `export-demo-data.mjs`, Edge Function `notify-lead` ter-deploy | seed dua kali tidak menggandakan baris; panggilan `notify-lead` ber-signature mengembalikan 202; signature salah → 401 | A |
| 4 | Fondasi front-end | scaffold Next 16 + Tailwind v4 + `next/font`, `lib/env.ts`, `lib/supabase/*`, `lib/utils/*`, komponen `ui/*` | `next build` sukses; halaman kosong ber-`Type` bersih | A |
| 5 | Beranda | lapisan konten + 12 seksi + `lib/data/*` + mode demo | render SSR tanpa JavaScript menampilkan seluruh naskah; tes unit data hijau | A |
| 6 | Form dan funnel | `sample-form`, Server Action `submit-lead`, fallback `/api/lead`, `track-event`, jalur gagal | uji manual: lead benar-benar masuk tabel; duplikat → sukses idempoten; rate limit → 429 | A |
| 7 | Halaman sekunder | `/produk`, `/dampak`, `/mitra`, `/kontak`, `/privasi` | Lighthouse SEO tiap halaman ≥ 95 | B |
| 8 | Edukasi | MDX + front matter tervalidasi (`reviewedBy` wajib untuk klaim nutrisi), `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` | build gagal saat `reviewedBy` kosong; sitemap memuat seluruh artikel | B |
| 9 | Kualitas dan observabilitas | Sentry, Vercel Analytics, Speed Insights, Playwright penuh, audit Lighthouse/axe, uji 360 px + 4G lambat | Lighthouse: Performance ≥ 90, A11y ≥ 95, SEO ≥ 95; e2e hijau | C |
| 10 | Rilis | deploy Vercel produksi, domain, tag `v1.0.0-pitch`, `Docs/specs` final | checklist `PRD.md` §3.3 | C |

Ketergantungan: fase 2 membutuhkan konfirmasi bahwa project Supabase tertaut **kosong** sebelum
`db push` pertama; fase 3 memerlukan `SUPABASE_ACCESS_TOKEN`; fase 7–8 tidak memblokir fase 5–6.

---

## 13. Risiko dan Mitigasi

| # | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R-1 | Tanpa Docker, tidak ada basis data lokal; setiap iterasi skema menyentuh project nyata | Kesalahan migrasi merusak data | `db push --dry-run` wajib sebelum push; konfirmasi project kosong sebelum fase 2; pembersihan memakai `apps/backend/supabase/teardown/phase1_drop.sql` yang dijalankan manual (Bagian 7.1) |
| R-2 | Volume `fuseblk` (NTFS) memperlambat I/O `node_modules` | `next dev` dan build lambat | `.npmrc` `prefer-symlink=true`; bila masih mengganggu, instalasi bersarang untuk satu workspace (ADR-010 konsekuensi 1) |
| R-3 | Gambar Stitch adalah tautan eksternal milik pihak ketiga | Melanggar panduan visual dan berisiko hilang | Diunduh ke `public/img/` sebagai placeholder berlabel + berkas `STATUS_PLACEHOLDER.md`; wajib diganti sebelum rilis publik |
| R-4 | `lead_event` masih dapat ditulis langsung dengan kunci `anon` | Spam event funnel | Dicatat sebagai risiko sisa; pengetatan policy dijadwalkan Phase 2 |
| R-5 | Gateway WhatsApp belum tersedia | Notifikasi hanya email saat pitch | Kanal WA opsional; halaman sukses selalu menampilkan tombol WhatsApp ke admin |
| R-6 | Klaim hasil port mekanis belum sesuai `PRD.md` §8 | Risiko kepatuhan | Lapisan konten bertipe + checklist klaim di PR; label "klaim berbasis kajian" dipertahankan |
| R-7 | Batas laju di memori tidak global di Vercel | Penyalahgunaan form | Indeks unik nomor WA dan kunci idempotensi di basis data sebagai gerbang akhir |

---

## 14. Definisi Selesai

### Siklus A

- [ ] `npm install` lalu `npm run verify` lulus di mesin bersih (tanpa `.env`).
- [ ] `.env` dan `.gitignore` terpisah per aplikasi; tidak ada nilai rahasia di berkas yang di-commit (dibuktikan `git grep` atas pola kunci).
- [ ] Beranda 12 seksi tampil dari `apps/web`, seluruh salinan berasal dari `content/copy/id.ts`, tanpa emoji, ikon `lucide-react`.
- [ ] `theme.css` terbukti dihasilkan dari `Docs/DESIGN.md` dan gate `check:tokens` menolak penyimpangan.
- [ ] Migrasi, RLS, RPC, dan seed diterapkan ke project Supabase; tes RLS/RPC hijau.
- [ ] Formulir menyimpan lead nyata lewat Server Action; duplikat idempoten; jalur gagal menampilkan tautan WhatsApp.
- [ ] Notifikasi `notify-lead` ter-deploy dan terbukti mengembalikan 401 untuk signature salah.
- [ ] Mode demo membuktikan beranda tetap utuh tanpa koneksi Supabase.
- [ ] `README.md` memuat langkah menjalankan, daftar variabel per aplikasi, dan cara mengulang seed.

### Phase 1 penuh (setelah Siklus B dan C)

Mengikuti `PRD.md` §3.3 tanpa perubahan.

---

## 15. Lampiran

### 15.1 Pemetaan permintaan ke keputusan

| Permintaan pemilik produk | Diwujudkan oleh |
|---|---|
| "kembangkan dalam folder front-end" | `apps/web` (ADR-010), port UI (ADR-014) |
| "back-end dipisah" | `apps/backend` sebagai workspace terpisah (ADR-010, ADR-011) |
| "setiap `.env` dipisah" | Kontrak per aplikasi + rahasia terpisah (ADR-012, Bagian 4) |
| "`.gitignore` juga dipisah" | `.gitignore` berlapis + gate `check:secrets` (ADR-012, Bagian 4.3) |

### 15.2 Perubahan terhadap struktur lamina di root

| Saat ini | Menjadi |
|---|---|
| `styles/theme.css` (root) | `apps/web/styles/theme.css` (dihasilkan) |
| `scripts/check-no-emoji.mjs` (root) | tetap di `scripts/` root, dipakai bersama; skrip baru `check-secrets.mjs`, `export-design-tokens.mjs` |
| `logo.png` (root) | `apps/web/public/img/logo.png` |
| `Docs/view.html`, `Docs/*.zip` | `Docs/stitch/` (artefak tinjauan dipertahankan) |
| `Docs/*.md` | tetap di `Docs/` |

### 15.3 Akronim

ADR (Architecture Decision Record), CVA (class-variance-authority), HMAC (Hash-based Message
Authentication Code), ISR (Incremental Static Regeneration), NPP (Nomor Pendaftaran Pakan),
PII (Personally Identifiable Information), RLS (Row Level Security), RPC (Remote Procedure Call),
SSR (Server-Side Rendering), WIB (Waktu Indonesia Barat).
