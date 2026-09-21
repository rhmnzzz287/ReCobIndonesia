# ReCobID

Platform digital ReCob.id — pelet konsentrat sapi perah dari limbah bonggol jagung terfermentasi.

## Struktur

| Bagian | Isi |
|---|---|
| `apps/web` | Front-end Next.js 16 (App Router, React 19, Tailwind v4) |
| `apps/backend` | Backend Supabase: migrasi, seed, Edge Function `notify-lead`, tes RLS |
| `packages/shared` | Kontrak Zod dan tipe basis data yang dipakai bersama |
| `Docs/` | `PRD.md`, `SCHEMA.md`, `DESIGN.md`, `specs/`, `plans/` |

## Menjalankan

```bash
npm install
cp apps/web/.env.example apps/web/.env.local     # isi kredensial (lihat tabel di bawah)
npm run dev                                      # http://localhost:3000
```

Bagian ini dilengkapi pada Task 15 (tabel variabel per aplikasi, perintah seed, catatan deploy).
