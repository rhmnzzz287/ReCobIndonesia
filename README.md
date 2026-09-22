# ReCobID

Platform digital ReCob.id — pelet konsentrat sapi perah dari limbah bonggol jagung terfermentasi.

## Struktur

| Bagian | Isi |
|---|---|
| `apps/web` | Front-end Next.js 16 (App Router, React 19, Tailwind v4) |
| `apps/backend` | Backend Supabase: migrasi, seed, Edge Function `notify-lead`, tes RLS |
| `packages/shared` | Kontrak Zod dan tipe basis data yang dipakai bersama |
| `Docs/` | `PRD.md`, `SCHEMA.md`, `DESIGN.md`, `specs/`, `plans/`, `stitch/` |

## Prasyarat

Node sesuai `.nvmrc`, npm 12+, akses ke project Supabase (untuk mode nyata), Supabase CLI
(dijalankan lewat `npx`, tidak perlu dipasang global). Docker **tidak** diperlukan dan **tidak**
dipakai: tidak ada basis data lokal, setiap perintah basis data menyentuh project tertaut.

Untuk mengembangkan dan menguji tanpa project tertaut, `apps/backend/scripts/dev-db.mjs`
menjalankan Postgres tertanam di port 55432 (lihat `apps/backend/scripts/README.md`).

## Menjalankan

```bash
npm install
cp apps/web/.env.example apps/web/.env.local        # isi kredensial web
cp apps/backend/.env.example apps/backend/.env      # isi kredensial backend
npm run dev                                          # http://localhost:3000
```

Tanpa kredensial Supabase, jalankan dengan `DEMO_MODE=true` di `apps/web/.env.local`: beranda
dirender dari data seed yang dibundel saat build, dan formulir menampilkan pesan mode demo.

## Deploy kontainer (Docker / Vercel)

`Dockerfile.vercel` di akar repositori membangun image untuk Vercel. Vercel mendeteksi berkas
itu dan mengarahkan seluruh trafik ke image hasilnya, dijalankan sebagai Vercel Function.

```bash
# Docker tidak terpasang di mesin pengembangan ini; podman adalah penggantinya.
podman build -f Dockerfile.vercel -t recobid-web .
podman run --rm -p 3000:3000 -e DEMO_MODE=true recobid-web
```

Karena image dibangun dari akar repo, **Root Directory Vercel dibiarkan pada akar** — justru
inilah keuntungannya untuk monorepo npm workspaces: resolusi `apps/web`, `apps/backend`, dan
`packages/shared` ditangani di dalam image, tanpa konfigurasi Root Directory dan tanpa
`transpilePackages` lintas direktori. Hanya `apps/web` yang berjalan di kontainer; backend
adalah Supabase (ADR-002), bukan layanan terpisah.

**Variabel `NEXT_PUBLIC_*` dibaca saat RUNTIME, bukan build.** Dibuktikan terukur pada Next.js
16.3.5: referensi `process.env.NEXT_PUBLIC_SUPABASE_URL` dipertahankan di bundel, tidak diganti
literal. Menjalankan image hasil build arg kosong dengan `-e NEXT_PUBLIC_SUPABASE_URL=...`
membuat `/api/health` menjawab `{"db":"down"}` (bukan `{"db":"ok","mode":"demo"}`), yang berarti
`demoMode` memang mati. Konsekuensinya: cukup berikan variabelnya sebagai environment Vercel,
tanpa build arg dan tanpa build ulang saat nilainya berubah.

Wajib diberikan di environment Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`, `DEMO_MODE=false`. Tanpa dua yang pertama, aplikasi berjalan dalam mode
demo — beranda tetap utuh, tetapi formulir tidak menyimpan lead.

Ukuran image: 295 MB (multi-stage, keluaran `standalone`, berjalan sebagai pengguna non-root).

## Variabel lingkungan (terpisah per aplikasi)

### `apps/web/.env.local`

| Variabel | Wajib | Rahasia | Keterangan |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ya (mode nyata) | tidak | URL project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ya (mode nyata) | tidak | kunci anon; RLS adalah gerbangnya |
| `NEXT_PUBLIC_SITE_URL` | ya saat deploy | tidak | dipakai metadata, sitemap, robots |
| `DEMO_MODE` | tidak | tidak | `true` memaksa data bundel |
| `LEAD_RATE_LIMIT_WINDOW_MS` | tidak | tidak | bawaan 600000 |
| `LEAD_RATE_LIMIT_MAX` | tidak | tidak | bawaan 5 |
| `NOTIFY_HOOK_URL` | tidak | tidak | URL Edge Function `notify-lead` |
| `NOTIFY_HOOK_SECRET` | tidak | **ya** | rahasia HMAC, minimal 32 karakter |
| `NEXT_PUBLIC_SENTRY_DSN` | tidak | tidak | diaktifkan pada Siklus C |
| `SENTRY_AUTH_TOKEN` | tidak | **ya** | diaktifkan pada Siklus C |

### `apps/backend/.env`

| Variabel | Wajib | Rahasia | Keterangan |
|---|---|---|---|
| `SUPABASE_URL` | ya | tidak | URL project |
| `SUPABASE_ANON_KEY` | ya | tidak | untuk uji RPC sebagai anon |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | **ya** | hanya skrip backend |
| `SUPABASE_DB_URL` | ya | **ya** | koneksi langsung untuk tes RLS |
| `SUPABASE_ACCESS_TOKEN` | untuk deploy fungsi | **ya** | token akun Supabase |
| `SUPABASE_PROJECT_REF` | untuk `link` | tidak | referensi project |
| `APP_ENV` | tidak | tidak | `production` menolak seeder demo |
| `NOTIFY_HOOK_SECRET` | ya | **ya** | harus sama dengan milik `apps/web` |
| `RESEND_API_KEY` | tidak | **ya** | kanal email |
| `NOTIFY_EMAIL_FROM` / `NOTIFY_EMAIL_TO` | tidak | tidak | pengirim dan penerima notifikasi |
| `NOTIFY_WA_GATEWAY_URL` / `NOTIFY_WA_GATEWAY_TOKEN` | tidak | **ya** | kanal WhatsApp bila gateway tersedia |

Berkas `.env` tidak pernah di-commit; hanya `.env.example`. Gate `npm run check:secrets` menolak
commit yang memuat nilai rahasia.

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | menjalankan front-end |
| `npm run verify` | seluruh gate mutu: lint, typecheck, token, env, emoji, rahasia, tes, build |
| `npm run e2e` | uji Playwright (menjalankan build produksi lebih dulu) |
| `npm run db:push --workspace @recobid/backend` | menerapkan migrasi ke project tertaut |
| `npm run db:seed --workspace @recobid/backend` | mengulang seed pitch (idempoten) |
| `npm run demo:export --workspace @recobid/backend` | menghasilkan ulang bundel data demo |
| `npm run db:gen-types --workspace @recobid/backend` | memperbarui tipe basis data bersama |
| `npm run db:gen-types:local --workspace @recobid/backend` | tipe dari Postgres lokal (tanpa project tertaut) |
| `npm run dev-db --workspace @recobid/backend` | menjalankan Postgres lokal untuk tes RLS |
| `npm run test:rls --workspace @recobid/backend` | tes RLS/RPC terhadap basis data nyata |
| `npm run test:e2e --workspace @recobid/backend` | jalur tulis lead end-to-end terhadap Postgres |
| `npm run fn:deploy --workspace @recobid/backend` | men-deploy Edge Function `notify-lead` |
| `npm run fn:secrets --workspace @recobid/backend` | menyalin rahasia notifikasi ke Edge Function |

## Urutan rilis

1. `npm run db:push --workspace @recobid/backend` (setelah `--dry-run` bersih)
2. `npm run db:seed --workspace @recobid/backend`
3. `npm run fn:deploy --workspace @recobid/backend` lalu `npm run fn:secrets --workspace @recobid/backend`
4. Deploy Vercel dengan **root directory `apps/web`**, isi variabel dari tabel di atas
5. `npm run verify`

## Catatan

- Token desain dihasilkan: `apps/web/styles/theme.css` berasal dari `Docs/DESIGN.md`. Ubah
  `DESIGN.md`, jalankan `npm run check:tokens`, jangan mengedit CSS hasil.
- Zero emoji: seluruh ikon memakai `lucide-react`; gate `npm run check:emoji` menegakkannya.
- Seluruh naskah UI berada di `apps/web/content/copy/id.ts`.
- Hanya `apps/web/lib/data/*` yang boleh memanggil Supabase (`Docs/DESIGN.md`). Komponen UI
  tidak pernah menyentuh basis data secara langsung.
- Migrasi `20260922090900_grants_phase1.sql` wajib ada: sejak 2026-05-30 Supabase tidak lagi
  memberi hak tabel otomatis kepada `anon`/`authenticated`, dan kegagalan hak akses terjadi
  **sebelum** RLS dievaluasi.
