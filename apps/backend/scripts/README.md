# Skrip `apps/backend`

| Skrip | Kegunaan |
|---|---|
| `preflight.mjs` | Memastikan project Supabase tertaut masih kosong sebelum migrasi. Menolak berjalan bila ada tabel aplikasi (risiko R-1). |
| `dev-db.mjs` | Menjalankan Postgres lokal untuk tes RLS — tanpa Docker, tanpa menyentuh project Supabase. |
| `gen-types.mjs` | Menghasilkan `packages/shared/src/db/database.types.ts` dari project tertaut. |
| `check-env.mjs` | Gate: setiap `process.env.X` tercantum di `.env.example`. |

## Postgres lokal untuk tes RLS

Tes di `tests/rls/` berbicara langsung ke Postgres: policy RLS, `GRANT`, dan trigger tidak dapat
diuji dengan mock. Mesin ini tidak memakai Docker, jadi `supabase start` tidak tersedia.
`dev-db.mjs` menjalankan Postgres 18 tertanam di `.dev-db/` (tidak di-commit).

```bash
# terminal 1 — biarkan berjalan
npm run dev-db --workspace @recobid/backend

# terminal 2
export SUPABASE_DB_URL=postgresql://recob:recob@127.0.0.1:55432/postgres
npm run test:rls --workspace @recobid/backend
```

`dev-db.mjs` juga memasang stub `auth.jwt()` dan `auth.role()` yang disediakan Supabase,
serta peran `anon`, `authenticated`, dan `service_role`. Stub ini hanya untuk pengujian lokal.

### Catatan npm 12

`embedded-postgres` memasang binari lewat `postinstall` yang diblokir kebijakan `allowScripts`
npm 12. Bila binari tidak ada, jalankan sekali:

```bash
node node_modules/@embedded-postgres/linux-x64/scripts/hydrate-symlinks.js
```
