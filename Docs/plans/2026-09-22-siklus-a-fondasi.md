# Rencana Implementasi Siklus A — Fondasi ReCobID (Monorepo, Backend Supabase, Beranda, Form Lead)

> **Untuk pekerja agentik:** SUB-SKILL WAJIB: gunakan `executing-plans` untuk mengeksekusi rencana ini
> task-per-task (pilihan tetap pemilik produk: eksekusi inline dalam sesi dengan checkpoint review).
> `subagent-driven-development` boleh dipakai bila satu task terasa terlalu besar untuk satu konteks.
> Setiap langkah memakai kotak centang (`- [ ]`).

**Tujuan:** Membangun fondasi Phase 1 ReCobID — monorepo dengan front-end (`apps/web`) dan backend
(`apps/backend`) yang terpisah, skema Supabase Phase 1 yang benar-benar berjalan, beranda 12 seksi
hasil port dari bahan Stitch, dan form permintaan sampel yang menyimpan lead nyata.

**Arsitektur:** Satu repositori npm workspaces dengan tiga bagian: `apps/web` (Next.js 16 App Router,
Server Component untuk konten, empat pulau klien), `apps/backend` (migrasi SQL, seed, Edge Function
notifikasi, tes RLS — bukan runtime HTTP), dan `packages/shared` (kontrak Zod + tipe DB hasil
generate, dikonsumsi sebagai sumber TypeScript tanpa langkah build). Server Action adalah batas
tepercaya: ia memvalidasi ulang, membatasi laju, lalu memanggil RPC `security definer` memakai kunci
`anon`; kunci `service_role` tidak pernah menyentuh `apps/web`.

**Tech Stack (versi dipatok eksak, tanpa `^`):**
next 16.3.5, react 19.3.0, react-dom 19.3.0, typescript 7.0.2, tailwindcss 4.3.3,
@tailwindcss/postcss 4.3.3, lucide-react 1.47.0, zod 4.6.5, @supabase/supabase-js 2.116.0,
class-variance-authority 0.7.1, tailwind-merge 3.7.0, clsx 2.1.1, motion 13.4.0,
react-hook-form 7.76.0, @hookform/resolvers 5.4.0, eslint 10.11.0, eslint-config-next 16.3.5,
prettier 3.9.8, vitest 5.0.1, @vitejs/plugin-react 6.1.1, @testing-library/react 16.3.3,
@testing-library/jest-dom 7.0.1, jsdom 30.1.0, @playwright/test 1.63.0, @types/react 19.3.0,
@types/react-dom 19.3.0, @types/node 26.6.2, yaml 2.9.1, pg 8.23.0, @types/pg 8.23.1,
supabase CLI 2.117.0 (dijalankan lewat `npx supabase@latest`).

**Spec:** `Docs/specs/2026-09-22-recobid-monorepo-design.md` (ADR-010 s/d ADR-020). Rencana ini
berargumen dari spec itu; eksekutor membaca keduanya.

## Global Constraints

- **Node 26.8.1**, npm 12.0.2. Repositori sudah di-`git init` pada cabang `main` dengan dua commit
  awal; jangan `git init` ulang.
- **Zero emoji** di UI, konten, label, alt text, pesan galat, maupun berkas yang di-commit. Ikon
  hanya `lucide-react` dengan `strokeWidth={1.75}`.
- **Tanpa `any` eksplisit**, tanpa `@ts-ignore`. `strict: true` + `noUncheckedIndexedAccess: true`.
- **Tanpa kode placeholder**: tidak ada `// TODO: implement`, stub kosong, atau `throw new Error("not
  implemented")` yang ditinggalkan. Bila sesuatu belum bisa dikerjakan, hentikan task dan laporkan.
- **Tanpa rahasia di repositori**: tidak ada kunci, token, atau nomor telepon pribadi di berkas yang
  di-commit. Hanya `.env.example` yang di-commit.
- **Seluruh salinan UI** berasal dari `apps/web/content/copy/id.ts`; tidak ada string tampilan di JSX
  `components/sections/**` maupun `app/page.tsx`.
- **Hanya `apps/web/lib/data/*`** yang boleh memanggil Supabase. Komponen tidak pernah menulis kueri.
- **Semua I/O keluar memakai batas waktu** (`AbortSignal.timeout(...)`); tidak ada fetch tanpa timeout.
- **`NODE_ENV` shell Tanpa arti tambahan, tetapi saat menjalankan `next dev`/`next build`/`next start`
  secara manual, pastikan `NODE_ENV` **tidak** di-export ke `production`** untuk `next dev` —
  ketidakcocokan ini membuat rute mengembalikan 404. Jalankan `unset NODE_ENV` sebelum `npm run dev`.
- **Nama direktori dokumentasi `Docs/`** (kapital). Jangan membuat `docs/`.
- Bahasa keluaran: **Bahasa Indonesia** untuk seluruh naskah, komentar, pesan, dan pesan commit.

### Berkas sumber yang menjadi otoritas isi (jangan mengarang)

| Kebutuhan | Sumber eksak |
|---|---|
| Naskah beranda 12 seksi | `Docs/stitch/code.html` (rentang baris per seksi ada di Task 11) |
| Skema SQL Phase 1 | `Docs/SCHEMA.md` baris 69–92 (§3.1), 94–125 (§3.2), 129–165 (§3.3), 169–207 (§3.4), 211–233 (§3.5), 235–283 (§3.6), 287–359 (§3.7) |
| RPC `submit_sample_lead` | `Docs/SCHEMA.md` baris 393–458 (§4) |
| Token visual | `Docs/DESIGN.md` blok YAML (baris 1–219) |
| Kontrak Zod lead | `Docs/SCHEMA.md` baris 774–797 (§8) |
| Aturan klaim & emoji | `Docs/PRD.md` Bagian 8; `Docs/DESIGN.md` "Do's and Don'ts" |
| Batas target performa | `Docs/DESIGN.md` "Anggaran Performa" |

---

## Struktur Berkas (dikunci sebelum task didefinisikan)

```text
ReCobID/
├─ apps/web/
│  ├─ app/{layout.tsx,page.tsx,globals.css,robots.ts,sitemap.ts}
│  ├─ app/api/{health/route.ts,lead/route.ts}
│  ├─ app/actions/{submit-lead.ts,track-event.ts}
│  ├─ components/{ui,sections,blocks}/
│  ├─ content/copy/{id.ts,index.ts}
│  ├─ lib/{env.ts,analytics.ts,rate-limit.ts,logging.ts}
│  ├─ lib/data/{products.ts,impact.ts,regions.ts,leads.ts,demo-data.ts}
│  ├─ lib/supabase/{client.ts,server.ts}
│  ├─ lib/utils/{cn.ts,format.ts,http.ts}
│  ├─ public/img/*
│  ├─ styles/{theme.css,tokens.json}      # DIHASILKAN
│  ├─ tests/unit/*  tests/e2e/*
│  ├─ .env.example  .gitignore  next.config.ts  postcss.config.mjs  eslint.config.mjs
│  └─ package.json  tsconfig.json  vitest.config.ts  playwright.config.ts
├─ apps/backend/
│  ├─ supabase/migrations/2026092209xxxx_*.sql   (9 berkas)
│  ├─ supabase/seed/pitch.sql
│  ├─ supabase/teardown/phase1_drop.sql
│  ├─ supabase/functions/notify-lead/index.ts
│  ├─ scripts/{check-env.mjs,gen-types.mjs,preflight.mjs,export-demo-data.mjs}
│  ├─ tests/unit/*  tests/rls/*
│  └─ .env.example  .gitignore  package.json  tsconfig.json  vitest.config.ts
├─ packages/shared/src/{constants,contracts,db}/
├─ Docs/{PRD,SCHEMA,DESIGN,BMC_DIGTREP_OCR}.md, Docs/specs/, Docs/plans/, Docs/stitch/, Docs/view.html
├─ scripts/{check-no-emoji.mjs,check-secrets.mjs,export-design-tokens.mjs}
└─ .github/workflows/ci.yml, package.json, .npmrc, .nvmrc, tsconfig.base.json, .gitignore, README.md
```

---

## Task 1: Bootstrap repositori workspace

**Files:**
- Create: `.gitignore`, `.npmrc`, `.nvmrc`, `tsconfig.base.json`, `package.json` (root), `README.md`
- Create: `apps/web/.gitignore`, `apps/backend/.gitignore`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: repositori yang sudah ada (dua commit awal).
- Produces: nama paket `@recobid/web`, `@recobid/backend`, `@recobid/shared`; perintah root
  `npm run typecheck|lint|test|check:tokens|check:env|check:emoji|check:secrets|verify`.

- [ ] **Step 1: Tulis `.gitignore` root**

```gitignore
# OS & editor
.DS_Store
Thumbs.db
*.log
.idea/
.vscode/
!.vscode/settings.json

# Node
node_modules/
.npm/
.turbo/
coverage/
playwright-report/
test-results/
*.tsbuildinfo

# Rahasia: abaikan seluruh berkas .env, kecualikan berkas contoh
.env
.env.*
!.env.example
!.env.*.example
```

- [ ] **Step 2: Tulis `.gitignore` per aplikasi**

`apps/web/.gitignore`:

```gitignore
.next/
.vercel/
out/
next-env.d.ts
.env
.env.*
!.env.example
!.env.*.example
```

`apps/backend/.gitignore`:

```gitignore
.env
.env.*
!.env.example
!.env.*.example
supabase/.temp/
supabase/.branches/
*.dump
*.sql.gz
```

- [ ] **Step 3: Tulis `.npmrc`, `.nvmrc`, dan `tsconfig.base.json`**

`.npmrc`:

```ini
save-exact=true
fund=false
```

`.nvmrc`:

```text
26.8.1
```

`tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true
  }
}
```

Catatan: `exactOptionalPropertyTypes` berarti properti opsional tidak boleh diberi nilai
`undefined` secara eksplisit. Pola yang dipakai di repositori ini:

```ts
const payload: Payload = { name, ...(kudSlug !== undefined ? { kudSlug } : {}) };
```

- [ ] **Step 4: Tulis `package.json` root**

```json
{
  "name": "recobid",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["apps/web", "apps/backend", "packages/shared"],
  "engines": { "node": ">=26" },
  "scripts": {
    "dev": "npm run dev --workspace @recobid/web",
    "build": "npm run build --workspace @recobid/web",
    "start": "npm run start --workspace @recobid/web",
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "test:rls": "npm run test:rls --workspace @recobid/backend",
    "test:e2e": "npm run test:e2e --workspace @recobid/web",
    "db:push": "npm run db:push --workspace @recobid/backend",
    "db:seed": "npm run db:seed --workspace @recobid/backend",
    "db:gen-types": "npm run db:gen-types --workspace @recobid/backend",
    "demo:export": "npm run demo:export --workspace @recobid/backend",
    "fn:deploy": "npm run fn:deploy --workspace @recobid/backend",
    "check:tokens": "node scripts/export-design-tokens.mjs --check",
    "check:emoji": "NO_EMOJI_EXTRA_IGNORE=Docs node scripts/check-no-emoji.mjs .",
    "check:secrets": "node scripts/check-secrets.mjs",
    "check:env": "node apps/backend/scripts/check-env.mjs",
    "verify": "npm run lint && npm run typecheck && npm run check:tokens && npm run check:env && npm run check:emoji && npm run check:secrets && npm run test && npm run build && npm run test:e2e"
  }
}
```

Skrip yang menunjuk berkas dari task lanjutan (`check:tokens`, `check:env`, `check:secrets`, `build`,
`test:e2e`) baru berfungsi setelah task terkait selesai. Verifikasi Task 1 hanya menjalankan yang
sudah tersedia.

- [ ] **Step 5: Tulis paket `@recobid/shared` (kerangka)**

`packages/shared/package.json`:

```json
{
  "name": "@recobid/shared",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    "./constants/limits": "./src/constants/limits.ts",
    "./constants/funnel-events": "./src/constants/funnel-events.ts",
    "./constants/regions": "./src/constants/regions.ts",
    "./contracts/lead": "./src/contracts/lead.ts",
    "./contracts/events": "./src/contracts/events.ts",
    "./db/types": "./src/db/types.ts"
  },
  "dependencies": {
    "zod": "4.6.5"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "lint": "eslint src"
  }
}
```

`packages/shared/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "include": ["src/**/*.ts"]
}
```

`packages/shared/src/index.ts` (berkas penanda paket; impor nyata memakai subpath ekspor):

```ts
export const SHARED_PACKAGE_NAME = "@recobid/shared";
```

- [ ] **Step 6: Tambahkan paket web dan backend minimal agar workspace terdaftar**

`apps/web/package.json` dan `apps/backend/package.json` diisi penuh pada Task 4 dan Task 6. Untuk
Task 1, buat keduanya dengan bentuk minimal berikut agar `npm install` mengenali workspace:

```json
{
  "name": "@recobid/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": { "typecheck": "tsc --noEmit" }
}
```

```json
{
  "name": "@recobid/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": { "typecheck": "tsc --noEmit" }
}
```

- [ ] **Step 7: Tulis `README.md` kerangka**

```markdown
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
```

- [ ] **Step 8: Jalankan `npm install` dan verifikasi workspace terdaftar**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm install
npm ls --workspaces --depth=0
```

Expected: keluaran memuat `@recobid/web`, `@recobid/backend`, `@recobid/shared`, tanpa `npm ERR!`.

- [ ] **Step 9: Commit**

```bash
git add .gitignore .npmrc .nvmrc tsconfig.base.json package.json package-lock.json README.md \
        apps/web/.gitignore apps/backend/.gitignore \
        apps/web/package.json apps/backend/package.json \
        packages/shared
git commit -m "chore: bootstrap workspaces npm (apps/web, apps/backend, packages/shared) + lapisan .gitignore"
```

---

## Task 2: Generator token desain dan gate kesetiaan token

**Files:**
- Create: `scripts/export-design-tokens.mjs`
- Create: `apps/web/styles/theme.css` (dihasilkan), `apps/web/styles/tokens.json` (dihasilkan)
- Create: `apps/backend/tests/unit/design-tokens.test.ts`, `apps/backend/vitest.config.ts`,
  `apps/backend/package.json` (tambahan devDependencies + script `test`)
- Modify: `apps/web/package.json` (tambahkan dependency `yaml`)

**Interfaces:**
- Consumes: `Docs/DESIGN.md` blok YAML baris 1–219.
- Produces: `scripts/export-design-tokens.mjs` dengan mode `--check` (exit 1 bila hasil berbeda);
  kelas CSS `.type-<token>` untuk 12 token tipografi; variabel `--color-*`, `--font-*`, `--text-*`,
  `--font-weight-*`, `--leading-*`, `--tracking-*`, `--radius-*`, `--spacing-*`.

- [ ] **Step 1: Tulis pengujian yang gagal**

`apps/backend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

`apps/backend/package.json` (ganti isi minimal dari Task 1):

```json
{
  "name": "@recobid/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run tests/unit",
    "test:rls": "vitest run tests/rls",
    "check:env": "node scripts/check-env.mjs"
  },
  "devDependencies": {
    "@types/node": "26.6.2",
    "@types/pg": "8.23.1",
    "pg": "8.23.0",
    "typescript": "7.0.2",
    "vitest": "5.0.1",
    "yaml": "2.9.1"
  }
}
```

`apps/backend/tests/unit/design-tokens.test.ts`:

```ts
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const GENERATOR = join(ROOT, "scripts", "export-design-tokens.mjs");
const THEME = join(ROOT, "apps", "web", "styles", "theme.css");

describe("generator token desain", () => {
  it("menghasilkan berkas yang identik saat dijalankan ulang", () => {
    execFileSync("node", [GENERATOR], { cwd: ROOT });
    const first = readFileSync(THEME, "utf8");
    execFileSync("node", [GENERATOR], { cwd: ROOT });
    const second = readFileSync(THEME, "utf8");
    expect(second).toBe(first);
  });

  it("memuat seluruh warna DESIGN.md ke dalam @theme", () => {
    const css = readFileSync(THEME, "utf8");
    for (const line of [
      "--color-surface: #ffffff;",
      "--color-cream: #fff8ee;",
      "--color-primary: #0b6e3b;",
      "--color-primary-strong: #084f2a;",
      "--color-accent: #7dbe35;",
      "--color-corn: #edc22e;",
      "--color-tan: #d9c89a;",
      "--color-ink: #0d1216;",
      "--color-ink-deep: #123326;",
      "--color-border: #ddebd2;",
      "--color-amber-soft: #fff3d1;",
      "--color-amber-ink: #7a5c12;",
    ]) {
      expect(css).toContain(line);
    }
  });

  it("membuat kelas komposit untuk setiap token tipografi", () => {
    const css = readFileSync(THEME, "utf8");
    for (const name of [
      "display-xl",
      "h1",
      "h2",
      "h3",
      "body-lg",
      "body-md",
      "body-sm",
      "label-md",
      "caption",
      "metric-lg",
      "metric-md",
      "mono-data",
    ]) {
      expect(css).toContain(`.type-${name} {`);
    }
    expect(css).toMatch(/\.type-metric-md \{[\s\S]*?font-feature-settings: "tnum";/);
  });

  it("meloloskan mode --check pada keadaan bersih", () => {
    expect(() => execFileSync("node", [GENERATOR, "--check"], { cwd: ROOT })).not.toThrow();
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm install && npm run test --workspace @recobid/backend`
Expected: FAIL — `Cannot find module '.../scripts/export-design-tokens.mjs'`.

- [ ] **Step 3: Tulis generator**

`scripts/export-design-tokens.mjs`:

```js
#!/usr/bin/env node
/**
 * export-design-tokens.mjs
 *
 * Menghasilkan apps/web/styles/theme.css dan apps/web/styles/tokens.json dari blok YAML
 * di Docs/DESIGN.md (ADR-005). Berkas hasil TIDAK boleh diedit tangan.
 *
 * Pemakaian:
 *   node scripts/export-design-tokens.mjs           # tulis berkas
 *   node scripts/export-design-tokens.mjs --check   # gagal bila berkas di repo berbeda
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DESIGN_PATH = join(ROOT, "Docs", "DESIGN.md");
const OUT_CSS = join(ROOT, "apps", "web", "styles", "theme.css");
const OUT_JSON = join(ROOT, "apps", "web", "styles", "tokens.json");
const CHECK = process.argv.includes("--check");

const FONT_STACKS = {
  Rubik: 'var(--font-rubik), "Rubik", ui-sans-serif, system-ui, sans-serif',
  "Plus Jakarta Sans":
    'var(--font-plus-jakarta), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  "IBM Plex Mono": 'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
};

function readDesignTokens() {
  const text = readFileSync(DESIGN_PATH, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/u.exec(text);
  if (match === null) {
    throw new Error(`Blok YAML tidak ditemukan di ${DESIGN_PATH}`);
  }
  return parseYaml(match[1]);
}

function buildCss(tokens) {
  const lines = [
    "/* BERKAS INI DIHASILKAN dari Docs/DESIGN.md oleh scripts/export-design-tokens.mjs. */",
    "/* Jangan diedit tangan: ubah Docs/DESIGN.md lalu jalankan `npm run check:tokens`. */",
    "",
    "@theme {",
  ];

  for (const [name, value] of Object.entries(tokens.colors)) {
    lines.push(`  --color-${name}: ${String(value).toLowerCase()};`);
  }

  for (const [name, token] of Object.entries(tokens.typography)) {
    const stack = FONT_STACKS[token.fontFamily];
    if (stack === undefined) {
      throw new Error(`Keluarga font tidak dikenal pada token ${name}: ${token.fontFamily}`);
    }
    lines.push(`  --font-${name}: ${stack};`);
    lines.push(`  --text-${name}: ${token.fontSize};`);
    lines.push(`  --font-weight-${name}: ${token.fontWeight};`);
    lines.push(`  --leading-${name}: ${token.lineHeight};`);
    if (token.letterSpacing !== undefined) {
      lines.push(`  --tracking-${name}: ${token.letterSpacing};`);
    }
  }

  for (const [name, value] of Object.entries(tokens.rounded)) {
    lines.push(`  --radius-${name}: ${value};`);
  }

  for (const [name, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --spacing-${name}: ${value};`);
  }

  lines.push("}", "");
  lines.push("/* Kelas komposit: satu kelas membawa satu gaya ketik utuh. */");
  lines.push("@layer components {");

  for (const [name, token] of Object.entries(tokens.typography)) {
    lines.push(`  .type-${name} {`);
    lines.push(`    font-family: var(--font-${name});`);
    lines.push(`    font-size: var(--text-${name});`);
    lines.push(`    font-weight: var(--font-weight-${name});`);
    lines.push(`    line-height: var(--leading-${name});`);
    if (token.letterSpacing !== undefined) {
      lines.push(`    letter-spacing: var(--tracking-${name});`);
    }
    if (name.startsWith("metric-")) {
      lines.push('    font-feature-settings: "tnum";');
    }
    lines.push("  }");
  }

  lines.push("}", "");
  return lines.join("\n");
}

function buildJson(tokens) {
  const flat = {
    colors: Object.fromEntries(
      Object.entries(tokens.colors).map(([k, v]) => [k, String(v).toLowerCase()]),
    ),
    typography: Object.fromEntries(
      Object.entries(tokens.typography).map(([name, token]) => [
        name,
        {
          fontFamily: FONT_STACKS[token.fontFamily],
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing ?? null,
        },
      ]),
    ),
    rounded: tokens.rounded,
    spacing: tokens.spacing,
  };
  return `${JSON.stringify(flat, null, 2)}\n`;
}

function writeOrCheck(path, content) {
  if (!CHECK) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
    process.stdout.write(`ditulis: ${path}\n`);
    return true;
  }
  let current = null;
  try {
    current = readFileSync(path, "utf8");
  } catch {
    current = null;
  }
  if (current !== content) {
    process.stderr.write(
      `check-tokens: GAGAL. ${path} berbeda dari hasil ekspor Docs/DESIGN.md.\n` +
        "Jalankan: node scripts/export-design-tokens.mjs lalu commit hasilnya.\n",
    );
    return false;
  }
  return true;
}

const tokens = readDesignTokens();
const okCss = writeOrCheck(OUT_CSS, buildCss(tokens));
const okJson = writeOrCheck(OUT_JSON, buildJson(tokens));

if (CHECK) {
  process.stdout.write(okCss && okJson ? "check-tokens: bersih.\n" : "");
  process.exit(okCss && okJson ? 0 : 1);
}
```

- [ ] **Step 4: Jalankan generator, lalu ulangi pengujian**

Run:

```bash
node scripts/export-design-tokens.mjs
npm run test --workspace @recobid/backend
```

Expected: dua berkas tertulis; seluruh tes PASS.

- [ ] **Step 5: Buktikan gate menolak penyimpangan**

Run:

```bash
printf '\n/* penyimpangan */\n' >> apps/web/styles/theme.css
node scripts/export-design-tokens.mjs --check ; echo "exit=$?"
git checkout -- apps/web/styles/theme.css
node scripts/export-design-tokens.mjs --check ; echo "exit=$?"
```

Expected: percobaan pertama mencetak `check-tokens: GAGAL...` dan `exit=1`; setelah dipulihkan
`check-tokens: bersih.` dan `exit=0`.

- [ ] **Step 6: Commit**

```bash
git add scripts/export-design-tokens.mjs apps/web/styles apps/web/package.json \
        apps/backend/package.json apps/backend/vitest.config.ts apps/backend/tests/unit/design-tokens.test.ts package-lock.json
git commit -m "feat(tokens): generator theme.css dari Docs/DESIGN.md + gate check:tokens"
```

---

## Task 3: Gate rahasia dan gate variabel lingkungan

**Files:**
- Create: `scripts/check-secrets.mjs`
- Create: `apps/backend/scripts/check-env.mjs`
- Create: `apps/backend/tests/unit/gates.test.ts`

**Interfaces:**
- Consumes: `git ls-files` (isi repositori), berkas `*.env.example`.
- Produces: `check-secrets.mjs` (exit 1 bila menemukan pola rahasia pada berkas yang tidak
  dikecualikan), `check-env.mjs` (exit 1 bila ada variabel lingkungan yang dirujuk kode tetapi tidak
  tercantum di `.env.example` aplikasinya, atau kunci rahasia memakai nilai contoh pendek).

- [ ] **Step 1: Tulis pengujian yang gagal**

`apps/backend/tests/unit/gates.test.ts`:

```ts
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const SECRETS = join(ROOT, "scripts", "check-secrets.mjs");

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "recob-secrets-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function runScan(target: string): { code: number; stderr: string } {
  try {
    execFileSync("node", [SECRETS, target], { encoding: "utf8" });
    return { code: 0, stderr: "" };
  } catch (error) {
    const failure = error as { status?: number; stderr?: string };
    return { code: failure.status ?? 1, stderr: failure.stderr ?? "" };
  }
}

describe("check-secrets", () => {
  it("meloloskan berkas contoh", () => {
    writeFileSync(join(dir, ".env.example"), "SUPABASE_SERVICE_ROLE_KEY=isi-di-lokal\n");
    expect(runScan(dir).code).toBe(0);
  });

  it("menolak kunci service_role pada berkas biasa", () => {
    writeFileSync(join(dir, "notes.md"), "pakai service_role untuk seed\n");
    const result = runScan(dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("service_role");
  });

  it("menolak JWT Supabase pada berkas biasa", () => {
    writeFileSync(
      join(dir, "config.json"),
      '{"key":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiJ9.abcdefghijklmnop"}\n',
    );
    expect(runScan(dir).code).toBe(1);
  });

  it("menolak kunci privat", () => {
    writeFileSync(join(dir, "id_rsa"), "-----BEGIN RSA PRIVATE KEY-----\n");
    expect(runScan(dir).code).toBe(1);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/backend`
Expected: FAIL — berkas `scripts/check-secrets.mjs` belum ada.

- [ ] **Step 3: Tulis `scripts/check-secrets.mjs`**

```js
#!/usr/bin/env node
/**
 * check-secrets.mjs
 *
 * Menolak commit yang memuat kredensial. Memindai berkas yang dilacak git dan berkas baru yang
 * belum diabaikan, kecuali berkas contoh (`.env.example`, `*.example`).
 *
 * Pemakaian:
 *   node scripts/check-secrets.mjs [rootDir]
 */

import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? process.cwd());
const MAX_BYTES = 2_000_000;

const PATTERNS = [
  { label: "jwt-supabase", re: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/u },
  { label: "service_role", re: /service_role/iu },
  { label: "supabase-pat", re: /sbp_[a-f0-9]{20,}/u },
  { label: "resend-key", re: /re_[A-Za-z0-9]{16,}/u },
  { label: "anthropic-key", re: /sk-ant-[A-Za-z0-9_-]{16,}/u },
  { label: "openai-key", re: /sk-[A-Za-z0-9]{20,}/u },
  { label: "aws-access-key", re: /AKIA[0-9A-Z]{16}/u },
  { label: "private-key-block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/u },
];

function listCandidateFiles() {
  const output = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return output.split("\0").filter((entry) => entry.length > 0);
}

function isExampleFile(path) {
  const base = path.split("/").pop() ?? path;
  return base.endsWith(".example") || base.includes(".env.example");
}

function looksBinary(buffer) {
  const window = buffer.subarray(0, 4096);
  return window.includes(0);
}

const findings = [];
let scanned = 0;

for (const relativePath of listCandidateFiles()) {
  if (isExampleFile(relativePath)) continue;
  const absolute = isAbsolute(relativePath) ? relativePath : join(ROOT, relativePath);
  let stat;
  try {
    stat = statSync(absolute);
  } catch {
    continue;
  }
  if (!stat.isFile() || stat.size > MAX_BYTES) continue;
  const buffer = readFileSync(absolute);
  if (looksBinary(buffer)) continue;
  scanned += 1;
  const text = buffer.toString("utf8");
  const lines = text.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const { label, re } of PATTERNS) {
      if (re.test(line)) {
        findings.push({ path: relativePath, line: index + 1, label });
        break;
      }
    }
  }
}

if (findings.length === 0) {
  process.stdout.write(`check-secrets: bersih. ${scanned} berkas dipindai.\n`);
  process.exit(0);
}

process.stderr.write(
  `check-secrets: GAGAL. ${findings.length} temuan pada ${scanned} berkas yang dipindai.\n` +
    "Pindahkan nilai ke .env lokal (diabaikan git) dan hapus dari berkas yang di-commit.\n\n",
);
for (const finding of findings) {
  process.stderr.write(`  ${finding.path}:${finding.line}  ${finding.label}\n`);
}
process.exit(1);
```

Catatan: pola `service_role` sengaja menyala bahkan saat hanya disebut sebagai kata. Karena itu
kata tersebut **tidak boleh muncul** di berkas yang di-commit; rujuk selalu lewat nama variabel
(`SUPABASE_SERVICE_ROLE_KEY`) yang berada di **berkas contoh**, dan di kode gunakan
`process.env.SUPABASE_SERVICE_ROLE_KEY` — kecocokan pola bersifat case-insensitive, sehingga
referensi itu pun akan tertangkap bila berada di berkas non-contoh. Konsekuensi: `apps/backend`
tidak menyimpan skrip yang menyebut nama kunci itu secara literal; skrip seed membaca
`process.env.SUPABASE_DB_URL` (nama tanpa kata terlarang) dan hanya `.env.example` yang menyebut
keduanya. Bila eksekutor menemukan kebutuhan nyata menyebut nama itu di kode, **hentikan task** dan
diskusikan dengan pemilik produk alih-alih melonggarkan gate.

- [ ] **Step 4: Tulis `apps/backend/scripts/check-env.mjs`**

```js
#!/usr/bin/env node
/**
 * check-env.mjs
 *
 * Memastikan setiap variabel lingkungan yang dirujuk kode tercantum di berkas `.env.example`
 * aplikasinya (ADR-011 konsekuensi 3), dan bahwa kunci rahasia tidak memakai nilai contoh pendek.
 *
 * Pemakaian:
 *   node apps/backend/scripts/check-env.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));

const SCAN_ROOTS = [
  { dir: join(ROOT, "apps", "web"), example: join(ROOT, "apps", "web", ".env.example") },
  { dir: join(ROOT, "apps", "backend"), example: join(ROOT, "apps", "backend", ".env.example") },
  { dir: join(ROOT, "packages", "shared"), example: join(ROOT, "apps", "backend", ".env.example") },
];

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage", "tests"]);
const SCANNED_EXT = new Set([".ts", ".tsx", ".mjs", ".js", ".json"]);
const ENV_REF = /process\.env\.([A-Z0-9_]{2,})/gu;
const VERCEL_INJECTED = new Set(["NODE_ENV", "VERCEL", "VERCEL_ENV", "CI"]);

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      yield* walk(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!SCANNED_EXT.has(entry.name.slice(entry.name.lastIndexOf(".")))) continue;
    yield full;
  }
}

function parseExample(path) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return new Map();
  }
  const map = new Map();
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    map.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  return map;
}

const problems = [];

for (const { dir, example } of SCAN_ROOTS) {
  const declared = parseExample(example);
  const referenced = new Set();
  for (const file of walk(dir)) {
    if (statSync(file).size > 1_000_000) continue;
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(ENV_REF)) {
      const name = match[1];
      if (name === undefined) continue;
      if (VERCEL_INJECTED.has(name)) continue;
      referenced.add(name);
    }
  }
  for (const name of [...referenced].sort()) {
    if (!declared.has(name)) {
      problems.push(`${relative(ROOT, file)}` === "" ? name : `variabel ${name} dirujuk kode tetapi tidak ada di ${relative(ROOT, example)}`);
    }
  }
  for (const [name, value] of declared) {
    const isSecret = /(SERVICE_ROLE|ACCESS_TOKEN|API_KEY|SECRET|TOKEN)/u.test(name);
    if (isSecret && value.length > 0 && value.length < 32) {
      problems.push(`${name} pada ${relative(ROOT, example)} memakai nilai contoh pendek (panjang ${value.length}); kosongkan atau isi >= 32 karakter`);
    }
  }
}

if (problems.length === 0) {
  process.stdout.write("check-env: bersih.\n");
  process.exit(0);
}

process.stderr.write("check-env: GAGAL.\n");
for (const problem of problems) {
  process.stderr.write(`  ${problem}\n`);
}
process.exit(1);
```

Catatan: berkas `.env.example` kedua aplikasi baru ada pada Task 4 dan Task 6. Sebelum itu,
`check:env` melaporkan variabel yang hilang — itu perilaku yang benar; jalankan gate ini setelah
`.env.example` dibuat. Untuk menghindari kegagalan sementara, langkah verifikasi Task 3 memakai
direktori contoh di luar repositori.

- [ ] **Step 5: Perluas pengujian `check-env` dan jalankan seluruh tes**

Tambahkan ke `apps/backend/tests/unit/gates.test.ts`:

```ts
import { mkdirSync } from "node:fs";

const CHECK_ENV = join(ROOT, "apps", "backend", "scripts", "check-env.mjs");

it("check-env meloloskan repositori pada keadaan akhir Task 4", () => {
  expect(() => execFileSync("node", [CHECK_ENV], { cwd: ROOT, encoding: "utf8" })).not.toThrow();
});
```

Tes terakhir baru berjalan setelah `.env.example` kedua aplikasi ada (Task 4 dan Task 6). Tandai
dengan `it.skip` sementara dan aktifkan di Task 6 Step terakhir; cantumkan komentar alasan di baris
`it.skip` agar tidak dilupakan:

```ts
// Diaktifkan pada Task 6 setelah apps/backend/.env.example ada.
it.skip("check-env meloloskan repositori pada keadaan akhir Task 4", () => {
```

Run:

```bash
mkdir -p apps/backend/tests/fixtures/env-demo
npm run test --workspace @recobid/backend
```

Expected: tes `check-secrets` PASS (empat kasus), tes `check-env` di-`skip`.

- [ ] **Step 6: Commit**

```bash
git add scripts/check-secrets.mjs apps/backend/scripts/check-env.mjs apps/backend/tests/unit/gates.test.ts
git commit -m "feat(gates): check-secrets dan check-env untuk melindungi rahasia dan kontrak variabel"
```

---

## Task 4: Scaffold front-end `@recobid/web`

**Files:**
- Create: `apps/web/package.json` (penuh), `apps/web/tsconfig.json`, `apps/web/next.config.ts`,
  `apps/web/postcss.config.mjs`, `apps/web/eslint.config.mjs`, `apps/web/vitest.config.ts`
- Create: `apps/web/app/layout.tsx`, `apps/web/app/globals.css`, `apps/web/app/page.tsx` (kerangka), `apps/web/app/not-found.tsx`
- Create: `apps/web/lib/utils/cn.ts`, `apps/web/lib/utils/format.ts`, `apps/web/.env.example`
- Create: `apps/web/tests/unit/setup.ts`, `apps/web/tests/unit/utils.test.ts`

**Interfaces:**
- Consumes: `apps/web/styles/theme.css` (Task 2), `@recobid/shared` (Task 1).
- Produces: `cn(...inputs: ClassValue[]): string`; `formatIdr(value: number): string`;
  `formatMetricValue(value: number, unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent"): string`;
  `formatDateWib(iso: string): string`; aplikasi Next yang dapat `next build` dengan root direktori
  `apps/web`; header keamanan aktif; `transpilePackages: ["@recobid/shared"]`.

- [ ] **Step 1: Tulis `apps/web/package.json`**

```json
{
  "name": "@recobid/web",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@recobid/shared": "0.1.0",
    "@supabase/supabase-js": "2.116.0",
    "@hookform/resolvers": "5.4.0",
    "class-variance-authority": "0.7.1",
    "clsx": "2.1.1",
    "lucide-react": "1.47.0",
    "next": "16.3.5",
    "react": "19.3.0",
    "react-dom": "19.3.0",
    "react-hook-form": "7.76.0",
    "tailwind-merge": "3.7.0",
    "zod": "4.6.5"
  },
  "devDependencies": {
    "@playwright/test": "1.63.0",
    "@tailwindcss/postcss": "4.3.3",
    "@testing-library/jest-dom": "7.0.1",
    "@testing-library/react": "16.3.3",
    "@types/node": "26.6.2",
    "@types/react": "19.3.0",
    "@types/react-dom": "19.3.0",
    "@vitejs/plugin-react": "6.1.1",
    "eslint": "9.39.5",
    "eslint-config-next": "16.3.5",
    "jsdom": "30.1.0",
    "prettier": "3.9.8",
    "tailwindcss": "4.3.3",
    "typescript": "7.0.2",
    "vitest": "5.0.1"
  }
}
```

`motion`, `@sentry/nextjs`, `@vercel/analytics`, dan `@vercel/speed-insights` **belum** dipasang:
animasi masuk dipasang pada Siklus C bersama observabilitas, agar pulau klien tetap minimal selama
Siklus A. Ini dicatat sebagai penyimpangan terjadwal dari tabel Tech Stack `DESIGN.md`.

- [ ] **Step 2: Tulis konfigurasi TypeScript, PostCSS, ESLint, dan Vitest**

`apps/web/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "ES2023"],
    "jsx": "preserve",
    "allowJs": true,
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "tests/e2e"]
}
```

`apps/web/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

`apps/web/eslint.config.mjs` (flat config; `eslint-config-next@16.3.5` sudah berupa array
`Linter.Config[]`):

```js
import next from "eslint-config-next/core-web-vitals";

export default [
  ...next,
  {
    rules: {
      "no-console": ["error", { allow: ["warn", "error"] }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    ignores: [".next/**", "node_modules/**", "tests/e2e/**", "next-env.d.ts"],
  },
];
```

`apps/web/vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
```

`apps/web/tests/unit/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Tulis `next.config.ts` dengan header keamanan**

```ts
import type { NextConfig } from "next";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseHost = supabaseOrigin.length > 0 ? new URL(supabaseOrigin).host : "";
const supabaseRealtimeOrigin = supabaseOrigin.replace(/^https:/u, "wss:");

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  `connect-src 'self'${supabaseHost.length > 0 ? ` ${supabaseOrigin} ${supabaseRealtimeOrigin}` : ""}`,
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@recobid/shared"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
```

Catatan: `script-src 'unsafe-inline'` diperlukan karena Next menyisipkan skrip bootstrap inline.
Saat Sentry dan Vercel Analytics dipasang (Siklus C), daftar `connect-src`/`script-src` diperluas
sesuai `DESIGN.md` (`*.sentry.io`, `va.vercel-scripts.com`) pada task Siklus C yang bersangkutan.

- [ ] **Step 4: Tulis `globals.css`, `layout.tsx`, `page.tsx` kerangka, dan `not-found.tsx`**

`apps/web/app/globals.css`:

```css
@import "tailwindcss";
@import "../styles/theme.css";

@source "../";
```

`apps/web/app/layout.tsx` (metadata diganti Task 9 dengan `copy.meta`):

```tsx
import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ReCob.id — Pakan Konsentrat Sapi Perah dari Limbah Bonggol Jagung",
  description:
    "Pelet konsentrat sapi perah berprotein tinggi dari bonggol jagung dan ampas tahu terfermentasi. Rp160.000 per karung 50 kg.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${rubik.variable} ${jakarta.variable} ${plexMono.variable}`}>
      <body className="type-body-md bg-surface text-ink">{children}</body>
    </html>
  );
}
```

`apps/web/app/page.tsx` (kerangka; diganti utuh pada Task 11):

```tsx
export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1200px] px-lg py-section">
      <h1 className="type-h1 text-ink">ReCob.id</h1>
      <p className="type-body-lg text-text-secondary">
        Fondasi front-end aktif. Beranda lengkap dipasang pada Task 11.
      </p>
    </main>
  );
}
```

`apps/web/app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-[720px] flex-col justify-center gap-lg px-lg">
      <h1 className="type-h1 text-ink">Halaman tidak ditemukan</h1>
      <p className="type-body-lg text-text-secondary">
        Tautan yang Anda buka tidak tersedia. Kembali ke beranda untuk melanjutkan.
      </p>
      <Link className="type-label-md text-primary underline" href="/">
        Kembali ke beranda
      </Link>
    </main>
  );
}
```

- [ ] **Step 5: Tulis utilitas `cn` dan `format`, lalu pengujiannya**

`apps/web/lib/utils/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`apps/web/lib/utils/format.ts`:

```ts
const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const IDR_PLAIN = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const WIB_DATE_TIME = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

/** "Rp160.000" */
export function formatIdr(value: number): string {
  return IDR.format(value).replace(/\s/gu, "");
}

/** "160.000" tanpa simbol mata uang */
export function formatNumberId(value: number): string {
  return IDR_PLAIN.format(value);
}

/** "22 September 2026 pukul 14.05 WIB" */
export function formatDateWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Tanggal tidak valid: ${iso}`);
  }
  return `${WIB_DATE_TIME.format(date)} WIB`;
}
```

`apps/web/tests/unit/utils.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";
import { formatDateWib, formatIdr, formatNumberId } from "@/lib/utils/format";

describe("cn", () => {
  it("menggabungkan kelas dan membuang konflik Tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-ink", false, undefined, "mt-2")).toBe("text-ink mt-2");
  });
});

describe("format", () => {
  it("memformat rupiah tanpa spasi", () => {
    expect(formatIdr(160000)).toBe("Rp160.000");
    expect(formatIdr(200000)).toBe("Rp200.000");
  });

  it("memformat angka polos", () => {
    expect(formatNumberId(1234567)).toBe("1.234.567");
  });

  it("memformat tanggal dalam WIB", () => {
    expect(formatDateWib("2026-09-22T07:05:00.000Z")).toContain("22 September 2026");
    expect(formatDateWib("2026-09-22T07:05:00.000Z")).toContain("WIB");
  });

  it("menolak tanggal tidak valid", () => {
    expect(() => formatDateWib("bukan-tanggal")).toThrow(/Tanggal tidak valid/u);
  });
});
```

- [ ] **Step 6: Tulis `apps/web/.env.example`**

```ini
# ==== Klien (aman dipublikasikan; dipakai bundel peramban) ====
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# ==== Server (tidak berprefiks NEXT_PUBLIC_) ====
# Mode demo: true memaksa seluruh data dari bundel, tanpa Supabase. Berguna di venue tanpa jaringan.
DEMO_MODE=false

# Batas laju form sampel (jendela milidetik, jumlah maksimum per jendela per IP)
LEAD_RATE_LIMIT_WINDOW_MS=600000
LEAD_RATE_LIMIT_MAX=5

# Notifikasi lead (opsional; kosong berarti kanal notifikasi dilewati dan dicatat di log)
NOTIFY_HOOK_URL=
# Rahasia HMAC untuk memanggil Edge Function notify-lead (>= 32 karakter)
NOTIFY_HOOK_SECRET=

# Observabilitas (dipasang pada Siklus C; boleh dikosongkan)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

- [ ] **Step 7: Jalankan build, typecheck, lint, dan tes**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm install
npx playwright install chromium
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
npm run test --workspace @recobid/web
npm run build --workspace @recobid/web
```

Expected: typecheck tanpa galat, lint tanpa galat, tes `utils` PASS (5 kasus), `next build`
mencetak rute `/` sebagai statis dan `not-found`, tanpa galat. Bila muncul galat 404 saat memeriksa
`npm run dev` di luar build, jalankan `unset NODE_ENV` lalu ulangi (lihat Global Constraints).

- [ ] **Step 8: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts \
        apps/web/postcss.config.mjs apps/web/eslint.config.mjs apps/web/vitest.config.ts \
        apps/web/app apps/web/lib apps/web/tests/unit apps/web/.env.example package-lock.json
git commit -m "feat(web): scaffold Next.js 16 + Tailwind v4 + header keamanan + utilitas cn/format"
```

---

## Task 5: Kontrak bersama (`@recobid/shared`)

**Files:**
- Create: `packages/shared/src/constants/limits.ts`
- Create: `packages/shared/src/constants/funnel-events.ts`
- Create: `packages/shared/src/constants/regions.ts`
- Create: `packages/shared/src/contracts/lead.ts`
- Create: `packages/shared/src/contracts/events.ts`
- Create: `packages/shared/src/db/types.ts` (diisi hasil generate pada Task 6; Task 5 menulis berkas penanda bertipe)
- Test: `apps/backend/tests/unit/contracts.test.ts`

**Interfaces:**
- Consumes: `zod@4.6.5`.
- Produces (nama eksak yang dipakai task lain):
  - `LIMITS: { fullNameMin: 2; fullNameMax: 120; messageMax: 1000; cattleMin: 1; cattleMax: 10_000; idempotencyKeyMin: 16; idempotencyKeyMax: 64; rateLimitWindowMs: 600_000; rateLimitMax: 5 }`
  - `FUNNEL_EVENTS` (array `as const`) dan `type FunnelEventName`
  - `REGION_CODES = ["jabar", "jateng", "jatim"] as const`, `type RegionCode`, `REGION_LABELS`
  - `submitLeadInput` (skema Zod), `type SubmitLeadInput`
  - `trackEventInput` (skema Zod), `type TrackEventInput`
  - `phoneWaSchema` (dipakai ulang di klien dan server)

- [ ] **Step 1: Tulis pengujian yang gagal**

`apps/backend/tests/unit/contracts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { submitLeadInput } from "@recobid/shared/contracts/lead";
import { trackEventInput } from "@recobid/shared/contracts/events";
import { FUNNEL_EVENTS } from "@recobid/shared/constants/funnel-events";
import { REGION_CODES } from "@recobid/shared/constants/regions";

const valid = {
  fullName: "Tarno Sujarwo",
  phoneWa: "081234567890",
  cattleCount: 8,
  regionCode: "jabar" as const,
  source: "tiktok" as const,
  idempotencyKey: "abcdefghijklmnop",
};

describe("submitLeadInput", () => {
  it("menerima masukan minimum yang sah", () => {
    const parsed = submitLeadInput.parse(valid);
    expect(parsed.fullName).toBe("Tarno Sujarwo");
    expect(parsed.utm).toEqual({});
    expect(parsed.kudSlug).toBeUndefined();
  });

  it("memangkas spasi pada nama dan pesan", () => {
    const parsed = submitLeadInput.parse({ ...valid, fullName: "  Tarno  ", message: "  halo  " });
    expect(parsed.fullName).toBe("Tarno");
    expect(parsed.message).toBe("halo");
  });

  it.each([
    ["081234567890", true],
    ["+6281234567890", true],
    ["6281234567890", true],
    ["08123", false],
    ["021234567890", false],
    ["0812345678901234567", false],
  ])("memvalidasi nomor WhatsApp %s -> %s", (phoneWa, ok) => {
    const result = submitLeadInput.safeParse({ ...valid, phoneWa });
    expect(result.success).toBe(ok);
  });

  it("menolak jumlah ternak di luar batas", () => {
    expect(submitLeadInput.safeParse({ ...valid, cattleCount: 0 }).success).toBe(false);
    expect(submitLeadInput.safeParse({ ...valid, cattleCount: 10_001 }).success).toBe(false);
  });

  it("menolak wilayah yang tidak dikenal", () => {
    expect(submitLeadInput.safeParse({ ...valid, regionCode: "bali" }).success).toBe(false);
  });

  it("menolak kunci idempotensi yang terlalu pendek", () => {
    expect(submitLeadInput.safeParse({ ...valid, idempotencyKey: "pendek" }).success).toBe(false);
  });

  it("menolak properti tak dikenal secara ketat", () => {
    expect(submitLeadInput.safeParse({ ...valid, rahasia: "x" }).success).toBe(false);
  });
});

describe("trackEventInput", () => {
  it("menerima nama event funnel yang dikenal", () => {
    expect(trackEventInput.safeParse({ eventName: "cta_click", path: "/" }).success).toBe(true);
  });

  it("menolak nama event di luar daftar", () => {
    expect(trackEventInput.safeParse({ eventName: "buy_now", path: "/" }).success).toBe(false);
  });

  it("membatasi panjang metadata string", () => {
    expect(
      trackEventInput.safeParse({ eventName: "cta_click", path: "/", placement: "x".repeat(65) })
        .success,
    ).toBe(false);
  });
});

describe("konstanta", () => {
  it("memuat 8 nama event funnel", () => {
    expect(FUNNEL_EVENTS).toHaveLength(8);
    expect(FUNNEL_EVENTS).toContain("sample_form_submit");
  });

  it("memuat 3 kode wilayah", () => {
    expect(REGION_CODES).toEqual(["jabar", "jateng", "jatim"]);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm install && npm run test --workspace @recobid/backend`
Expected: FAIL — modul `@recobid/shared/contracts/lead` tidak ditemukan (berkas belum ada).

- [ ] **Step 3: Tulis konstanta bersama**

`packages/shared/src/constants/limits.ts`:

```ts
export const LIMITS = {
  fullNameMin: 2,
  fullNameMax: 120,
  messageMax: 1000,
  cattleMin: 1,
  cattleMax: 10_000,
  idempotencyKeyMin: 16,
  idempotencyKeyMax: 64,
  rateLimitWindowMs: 600_000,
  rateLimitMax: 5,
} as const;

export type Limits = typeof LIMITS;
```

`packages/shared/src/constants/funnel-events.ts`:

```ts
export const FUNNEL_EVENTS = [
  "page_view",
  "cta_click",
  "scroll_75",
  "outbound_wa_click",
  "sample_form_start",
  "sample_form_submit",
  "article_read_75",
  "referral_click",
] as const;

export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];
```

`packages/shared/src/constants/regions.ts`:

```ts
export const REGION_CODES = ["jabar", "jateng", "jatim"] as const;

export type RegionCode = (typeof REGION_CODES)[number];

export const REGION_LABELS: Record<RegionCode, string> = {
  jabar: "Jawa Barat",
  jateng: "Jawa Tengah",
  jatim: "Jawa Timur",
};
```

- [ ] **Step 4: Tulis kontrak lead dan event**

`packages/shared/src/contracts/lead.ts` (mengikuti `Docs/SCHEMA.md` §8, ditambah `.strict()`):

```ts
import { z } from "zod";
import { FUNNEL_EVENTS } from "../constants/funnel-events";
import { LIMITS } from "../constants/limits";
import { REGION_CODES } from "../constants/regions";

export const phoneWaSchema = z
  .string()
  .trim()
  .regex(/^(\+?62|0)8[1-9][0-9]{6,11}$/u, "Nomor WhatsApp tidak valid");

export const submitLeadInput = z
  .object({
    fullName: z.string().trim().min(LIMITS.fullNameMin).max(LIMITS.fullNameMax),
    phoneWa: phoneWaSchema,
    cattleCount: z.number().int().min(LIMITS.cattleMin).max(LIMITS.cattleMax),
    regionCode: z.enum(REGION_CODES),
    kudSlug: z.string().trim().min(2).max(64).optional(),
    message: z.string().trim().max(LIMITS.messageMax).optional(),
    source: z.enum(FUNNEL_EVENTS.length > 0 ? [
      "tiktok",
      "instagram",
      "facebook",
      "whatsapp",
      "referral",
      "field_visit",
      "other",
    ] : []),
    utm: z
      .object({
        source: z.string().max(64).optional(),
        medium: z.string().max(64).optional(),
        campaign: z.string().max(64).optional(),
      })
      .default({}),
    idempotencyKey: z
      .string()
      .min(LIMITS.idempotencyKeyMin)
      .max(LIMITS.idempotencyKeyMax),
    honeypot: z.string().max(0).optional(),
  })
  .strict();

export type SubmitLeadInput = z.infer<typeof submitLeadInput>;
```

Catatan: ekspresi `FUNNEL_EVENTS.length > 0 ? [...] : []` tidak diperlukan dan menyesatkan — ganti
dengan daftar sumber yang eksplisit (persis seperti di atas tanpa kondisional):

```ts
    source: z.enum([
      "tiktok",
      "instagram",
      "facebook",
      "whatsapp",
      "referral",
      "field_visit",
      "other",
    ]),
```

`packages/shared/src/contracts/events.ts`:

```ts
import { z } from "zod";
import { FUNNEL_EVENTS } from "../constants/funnel-events";

export const trackEventInput = z
  .object({
    eventName: z.enum(FUNNEL_EVENTS),
    path: z.string().min(1).max(256),
    placement: z.string().max(64).optional(),
    metadata: z.record(z.string(), z.union([z.string().max(64), z.number(), z.boolean()])).default({}),
  })
  .strict();

export type TrackEventInput = z.infer<typeof trackEventInput>;
```

- [ ] **Step 5: Tulis berkas penanda tipe basis data**

`packages/shared/src/db/types.ts` (diganti isi sungguhan pada Task 6 dengan hasil
`supabase gen types`):

```ts
/**
 * Tipe basis data ReCob.id.
 *
 * BERKAS INI DIHASILKAN ULANG oleh `npm run db:gen-types` (Task 6) dan ditulis ke
 * `packages/shared/src/db/database.types.ts`, lalu diekspor ulang di sini.
 * Jangan mengedit daftar tipe di bawah ini secara manual.
 */

export type Database = Record<string, never>;
```

- [ ] **Step 6: Jalankan pengujian sampai lulus**

Run: `npm run test --workspace @recobid/backend`
Expected: seluruh kasus `contracts.test.ts` PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/shared apps/backend/tests/unit/contracts.test.ts
git commit -m "feat(shared): kontrak Zod lead & event funnel + konstanta wilayah, batas, dan nama event"
```

---

## Task 6: Migrasi skema, RLS, dan RPC ke project Supabase

**Files:**
- Create: `apps/backend/supabase/config.toml` (hasil `supabase init`)
- Create: `apps/backend/supabase/migrations/20260922090000_extensions_and_enums.sql` … `…090800_rpc_submit_sample_lead.sql` (9 berkas)
- Create: `apps/backend/supabase/teardown/phase1_drop.sql`
- Create: `apps/backend/scripts/preflight.mjs`, `apps/backend/scripts/gen-types.mjs`
- Create: `apps/backend/.env.example` (isi penuh), `apps/backend/.env` (lokal, tidak di-commit)
- Create: `apps/backend/tests/rls/phase1.test.ts`, `apps/backend/tests/rls/helpers.ts`
- Modify: `apps/backend/package.json` (skrip `db:push`, `db:seed`, `db:gen-types`, `fn:deploy`),
  `packages/shared/src/db/types.ts`

**Interfaces:**
- Consumes: kredensial Supabase di `apps/backend/.env` (diisi manusia), `Docs/SCHEMA.md` §3 dan §4.
- Produces: tabel `region`, `kud`, `product`, `product_ingredient`, `lead`, `lead_event`,
  `impact_metric`, `impact_metric_reference`; RLS aktif; RPC `submit_sample_lead(text, text, integer,
  text, text, text, lead_source, jsonb, text) returns table(lead_id uuid, created boolean)`;
  `packages/shared/src/db/types.ts` memuat `Database` hasil generate.

**Praktik keselamatan (wajib):** langkah pertama task ini adalah preflight yang memverifikasi project
tertaut **kosong**. Bila preflight menemukan tabel aplikasi yang sudah ada, eksekutor berhenti dan
melaporkan ke pemilik produk. Tanpa Docker, tidak ada basis data lokal: setiap perintah menyentuh
project nyata.

- [ ] **Step 1: Inisialisasi struktur Supabase dan tulis `.env.example` backend**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia/apps/backend"
npx supabase@latest init --workdir .
```

`apps/backend/.env.example`:

```ini
# Kontrak variabel backend (ADR-012). Salin ke .env lalu isi nilainya.
# .env TIDAK boleh di-commit.

# URL dan kunci project
SUPABASE_URL=
SUPABASE_ANON_KEY=

# Kunci dengan hak istimewa. Hanya dipakai skrip di apps/backend, tidak pernah di apps/web.
# (nama variabel kunci istimewa sengaja hanya muncul di berkas contoh ini, demi gate check-secrets)
SUPABASE_SERVICE_ROLE_KEY=

# Koneksi Postgres langsung (dipakai migrasi & tes RLS).
# Ambil dari Supabase Dashboard > Project Settings > Database > Connection string (URI, mode Session).
SUPABASE_DB_URL=

# Token akses pribadi untuk perintah CLI non-interaktif dan deploy Edge Function
# (Supabase Dashboard > Account > Access Tokens)
SUPABASE_ACCESS_TOKEN=
SUPABASE_PROJECT_REF=

# Notifikasi lead (Edge Function notify-lead)
RESEND_API_KEY=
NOTIFY_EMAIL_FROM=
NOTIFY_EMAIL_TO=
NOTIFY_WA_GATEWAY_URL=
NOTIFY_WA_GATEWAY_TOKEN=
# Harus sama persis dengan NOTIFY_HOOK_SECRET di apps/web/.env.local
NOTIFY_HOOK_SECRET=

# Lingkungan: development | production. Seeder demo menolak berjalan di production.
APP_ENV=development
```

- [ ] **Step 2: Tulis skrip preflight**

`apps/backend/scripts/preflight.mjs`:

```js
#!/usr/bin/env node
/**
 * preflight.mjs
 *
 * Memeriksa project Supabase yang tertaut SEBELUM migrasi dijalankan: tanpa Docker, setiap
 * `db push` menyentuh basis data nyata, jadi project harus kosong (lihat spec, risiko R-1).
 *
 * Pemakaian:
 *   node apps/backend/scripts/preflight.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");

const ALLOWED_TABLES = new Set(["spatial_ref_sys", "schema_migrations", "migrations"]);

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  const path = join(BACKEND, ".env");
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return undefined;
  }
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    if (line.slice(0, eq).trim() !== name) continue;
    return line.slice(eq + 1).trim();
  }
  return undefined;
}

const dbUrl = readEnv("SUPABASE_DB_URL");
if (dbUrl === undefined || dbUrl.length === 0) {
  process.stderr.write("preflight: GAGAL. SUPABASE_DB_URL belum diisi di apps/backend/.env\n");
  process.exit(1);
}

const sql = "select table_schema || '.' || table_name from information_schema.tables " +
  "where table_schema not in ('pg_catalog','information_schema') order by 1";

let output;
try {
  output = execFileSync("npx", ["--yes", "supabase@latest", "db", "dump", "--help"], {
    cwd: BACKEND,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  output = "";
}

const { Client } = await import("pg");
const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
await client.connect();
const result = await client.query(sql);
await client.end();

const unexpected = result.rows
  .map((row) => row["?column?"] ?? Object.values(row)[0])
  .filter((name) => {
    const suffix = String(name).split(".")[1] ?? "";
    return !ALLOWED_TABLES.has(suffix);
  });

if (unexpected.length > 0) {
  process.stderr.write(
    `preflight: GAGAL. Project sudah memuat ${unexpected.length} tabel di luar skema ReCobID:\n`,
  );
  for (const name of unexpected) process.stderr.write(`  - ${name}\n`);
  process.stderr.write(
    "Hentikan. Laporkan ke pemilik produk sebelum menjalankan migrasi apa pun (risiko R-1).\n",
  );
  process.exit(1);
}

process.stdout.write("preflight: bersih. Project kosong, migrasi boleh dijalankan.\n");
```

Catatan untuk eksekutor: baris `execFileSync("npx", ["supabase", "db", "dump", "--help"], …)`
adalah pengecekan ketersediaan CLI yang hasilnya tidak dipakai. Hapus blok `try { … } catch { … }`
tersebut sebelum menjalankan skrip; jalankan `npx supabase@latest --version` secara manual di Step 3
untuk memastikan CLI tersedia. Skrip yang tersisa hanya memuat satu ketergantungan: `pg`.

- [ ] **Step 3: Jalankan preflight dengan kredensial nyata**

Pemilik produk mengisi `apps/backend/.env` (tidak boleh lewat chat):

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia/apps/backend"
npx supabase@latest --version
npx supabase@latest link --project-ref "$SUPABASE_PROJECT_REF"
node scripts/preflight.mjs
```

Expected: `preflight: bersih. Project kosong, migrasi boleh dijalankan.`
Bila sebaliknya: **berhenti**, jangan lanjut ke Step 4.

- [ ] **Step 4: Tulis 9 berkas migrasi dari `Docs/SCHEMA.md`**

Berkas dan isinya identik dengan `Docs/SCHEMA.md` (baris 69–92, 94–125, 129–165, 169–207, 211–233,
235–283, 287–359, 393–458). Header tiap berkas:

```sql
-- 20260922090000_extensions_and_enums.sql
-- Sumber: Docs/SCHEMA.md §3.1
```

Daftar berkas dan isi:

1. `20260922090000_extensions_and_enums.sql` — `pgcrypto`, `citext`, enum `lead_status`,
   `lead_source`, `metric_unit`, `metric_period`.
2. `20260922090100_helper_functions.sql` — `set_updated_at()`.
3. `20260922090200_region_and_kud.sql` — tabel `region`, `kud`, indeks `kud_region_status_idx`.
4. `20260922090300_catalog.sql` — `product`, `product_ingredient`, indeks `product_slug_active_idx`
   dan `product_ingredient_product_idx`.
5. `20260922090400_lead.sql` — tabel `lead`, `lead_phone_active_idx`, `lead_status_created_idx`,
   `lead_region_created_idx`, `lead_source_idx`, trigger `lead_set_updated_at`.
6. `20260922090500_lead_event.sql` — tabel `lead_event`, `lead_event_name_time_idx`,
   `lead_event_lead_idx`.
7. `20260922090600_impact_metric.sql` — `impact_metric`, `impact_metric_reference`, fungsi
   `enforce_public_metric_has_reference()`, constraint trigger
   `impact_metric_public_requires_reference`.
8. `20260922090700_rls_phase1.sql` — `alter table … enable row level security` untuk 8 tabel,
   fungsi `app_role()`, dan seluruh policy dari `Docs/SCHEMA.md` §3.7.
9. `20260922090800_rpc_submit_sample_lead.sql` — fungsi `submit_sample_lead` persis `Docs/SCHEMA.md`
   §4 (baris 393–458), termasuk `revoke all … from public;` dan
   `grant execute … to anon, authenticated;`.

- [ ] **Step 5: Tulis teardown dan jalankan `db push --dry-run` lalu `db push`**

`apps/backend/supabase/teardown/phase1_drop.sql`:

```sql
-- membersihkan seluruh objek Phase 1 dari project percobaan.
-- TIDAK dijalankan otomatis. Urutan mengikuti dependensi.

drop trigger if exists impact_metric_public_requires_reference on impact_metric;
drop function if exists enforce_public_metric_has_reference();
drop function if exists submit_sample_lead(text, text, integer, text, text, text, lead_source, jsonb, text);

drop table if exists impact_metric_reference;
drop table if exists impact_metric;
drop table if exists lead_event;
drop table if exists lead;
drop table if exists product_ingredient;
drop table if exists product;
drop table if exists kud;
drop table if exists region;

drop function if exists app_role();
drop function if exists set_updated_at();
drop type if exists metric_period;
drop type if exists metric_unit;
drop type if exists lead_source;
drop type if exists lead_status;
```

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia/apps/backend"
npx supabase@latest db push --linked --dry-run
npx supabase@latest db push --linked
npx supabase@latest migration list --linked
```

Expected: `--dry-run` mencetak 9 migrasi tanpa galat; `db push` menerapkan seluruhnya; `migration list`
menampilkan 9 berkas dengan tanda sudah diterapkan.

- [ ] **Step 6: Tulis generator tipe dan perbarui `packages/shared/src/db/`**

`apps/backend/scripts/gen-types.mjs`:

```js
#!/usr/bin/env node
/**
 * gen-types.mjs
 *
 * Menghasilkan tipe basis data dari project tertaut ke packages/shared/src/db/database.types.ts,
 * lalu menulis ulang packages/shared/src/db/types.ts sebagai re-ekspor bertipe.
 * Berkas hasil TIDAK boleh diedit tangan (Docs/SCHEMA.md §8).
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");
const GENERATED = join(ROOT, "packages", "shared", "src", "db", "database.types.ts");
const SHIM = join(ROOT, "packages", "shared", "src", "db", "types.ts");

mkdirSync(dirname(GENERATED), { recursive: true });

execFileSync(
  "npx",
  ["--yes", "supabase@latest", "gen", "types", "typescript", "--linked", "--schema", "public"],
  { cwd: BACKEND, stdio: ["ignore", "inherit", "inherit"] },
);

const emitted = execFileSync(
  "npx",
  ["--yes", "supabase@latest", "gen", "types", "typescript", "--linked", "--schema", "public"],
  { cwd: BACKEND, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
);

const banner =
  "/* BERKAS INI DIHASILKAN oleh `npm run db:gen-types`. Jangan diedit tangan. */\n";
writeFileSync(GENERATED, banner + emitted, "utf8");

const shim = [
  "/**",
  " * Tipe basis data ReCob.id — re-ekspor dari berkas hasil generate.",
  " * Perubahan manual pada tipe adalah pelanggaran review (Docs/SCHEMA.md §8).",
  " */",
  'export type { Database, Json } from "./database.types";',
  'export { Constants } from "./database.types";',
  "",
].join("\n");
writeFileSync(SHIM, shim, "utf8");

const check = readFileSync(GENERATED, "utf8");
if (!check.includes("export type Database")) {
  throw new Error("Hasil generate tidak memuat `export type Database` — periksa keluaran CLI.");
}
process.stdout.write(`ditulis: ${GENERATED}\nditulis: ${SHIM}\n`);
```

Catatan: pemanggilan CLI dua kali (inherit untuk melihat progres, lalu tangkap keluaran) memang
disengaja agar pengguna melihat progres; keduanya deterministik karena membaca skema yang sama.

`apps/backend/package.json` (tambahkan skrip; gabungkan dengan isi Task 2):

```json
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run tests/unit",
    "test:rls": "vitest run tests/rls",
    "check:env": "node scripts/check-env.mjs",
    "preflight": "node scripts/preflight.mjs",
    "db:push": "supabase db push --linked",
    "db:seed": "node scripts/seed.mjs",
    "db:gen-types": "node scripts/gen-types.mjs",
    "fn:deploy": "supabase functions deploy notify-lead"
  },
  "devDependencies": {
    "supabase": "2.117.0"
  }
```

Run: `npm install && npm run db:gen-types --workspace @recobid/backend`
Expected: `packages/shared/src/db/database.types.ts` dan `types.ts` tertulis; tipe memuat tabel
`lead`, `kud`, `product`, `impact_metric`.

- [ ] **Step 7: Tulis tes RLS/RPC yang gagal, lalu jalankan**

`apps/backend/tests/rls/helpers.ts`:

```ts
import { Client } from "pg";

export function databaseUrl(): string {
  const url = process.env.SUPABASE_DB_URL;
  if (url === undefined || url.length === 0) {
    throw new Error("SUPABASE_DB_URL belum diisi; tes RLS memerlukan basis data nyata.");
  }
  return url;
}

export interface RoleClaim {
  role: "anon" | "authenticated";
  appRole?: "staff" | "admin" | "kud_officer";
}

export async function withRollback<T>(
  claim: RoleClaim,
  body: (client: Client) => Promise<T>,
): Promise<T> {
  const client = new Client({ connectionString: databaseUrl(), connectionTimeoutMillis: 8000 });
  await client.connect();
  try {
    await client.query("begin");
    await client.query(`set local role ${claim.role}`);
    const jwt = {
      role: claim.role,
      app_metadata: claim.appRole === undefined ? {} : { role: claim.appRole },
    };
    await client.query("select set_config('request.jwt.claims', $1, true)", [
      JSON.stringify(jwt),
    ]);
    return await body(client);
  } finally {
    await client.query("rollback").catch(() => undefined);
    await client.end();
  }
}
```

`apps/backend/tests/rls/phase1.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { withRollback } from "./helpers";

const missingDb = process.env.SUPABASE_DB_URL === undefined || process.env.SUPABASE_DB_URL === "";
const suite = missingDb ? describe.skip : describe;

suite("RLS & RPC Phase 1 (basis data nyata)", () => {
  it("anon tidak dapat membaca tabel lead", async () => {
    await withRollback({ role: "anon" }, async (client) => {
      const result = await client.query("select count(*)::int as total from lead");
      expect(result.rows[0].total).toBe(0);
    });
  });

  it("anon tidak dapat menyisipkan lead berstatus converted", async () => {
    await withRollback({ role: "anon" }, async (client) => {
      await expect(
        client.query(
          `insert into lead (full_name, phone_wa, cattle_count, region_id, status, idempotency_key, consented_at)
           select 'Uji Ilegal', '081200000001', 3, id, 'converted', 'uji-ilegal-0001', now() from region limit 1`,
        ),
      ).rejects.toThrow();
    });
  });

  it("submit_sample_lead menyimpan lead baru dan mencatat event", async () => {
    await withRollback({ role: "anon" }, async (client) => {
      const result = await client.query(
        `select * from submit_sample_lead('Tarno Uji', '081200000002', 8, 'jabar', null, null, 'tiktok', '{}'::jsonb, 'kunci-uji-0001-abcd')`,
      );
      expect(result.rows[0].created).toBe(true);
      const events = await client.query(
        "select count(*)::int as total from lead_event where event_name = 'sample_form_submit'",
      );
      expect(events.rows[0].total).toBeGreaterThanOrEqual(1);
    });
  });

  it("submit_sample_lead bersifat idempoten untuk nomor yang sama", async () => {
    await withRollback({ role: "anon" }, async (client) => {
      const first = await client.query(
        `select * from submit_sample_lead('Tarno Uji', '081200000003', 8, 'jabar', null, null, 'tiktok', '{}'::jsonb, 'kunci-uji-0002-abcd')`,
      );
      const second = await client.query(
        `select * from submit_sample_lead('Tarno Uji', '081200000003', 8, 'jabar', null, null, 'tiktok', '{}'::jsonb, 'kunci-uji-0003-abcd')`,
      );
      expect(first.rows[0].created).toBe(true);
      expect(second.rows[0].created).toBe(false);
      expect(second.rows[0].lead_id).toBe(first.rows[0].lead_id);
    });
  });

  it("submit_sample_lead menolak wilayah tak dikenal", async () => {
    await withRollback({ role: "anon" }, async (client) => {
      await expect(
        client.query(
          `select * from submit_sample_lead('Tarno Uji', '081200000004', 8, 'bali', null, null, 'other', '{}'::jsonb, 'kunci-uji-0004-abcd')`,
        ),
      ).rejects.toThrow(/wilayah/u);
    });
  });

  it("metrik publik tanpa referensi ditolak oleh constraint trigger", async () => {
    await withRollback({ role: "staff", appRole: "staff" }, async (client) => {
      await expect(
        client.query(
          `insert into impact_metric (code, label, value_numeric, unit, period, is_public)
           values ('uji_tanpa_referensi', 'Uji', 1, 'ton', 'yearly', true)`,
        ),
      ).rejects.toThrow();
    });
  });

  it("kueri rekap lead 90 hari memakai index scan, bukan sequential scan", async () => {
    await withRollback({ role: "staff", appRole: "staff" }, async (client) => {
      const plan = await client.query(
        `explain (analyze, buffers, format text)
         select date_trunc('week', created_at) as minggu, status, count(*)
         from lead where created_at >= now() - interval '90 days' group by 1, 2`,
      );
      const text = plan.rows.map((row) => row["QUERY PLAN"]).join("\n");
      expect(text).not.toMatch(/Seq Scan on lead/u);
    });
  });
});
```

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
set -a; . apps/backend/.env; set +a
npm run test:rls --workspace @recobid/backend
```

Expected: 7 kasus PASS. Bila `Seq Scan on lead` muncul: jalankan `analyze lead;` pada project lalu
ulangi; bila masih muncul dengan tabel kosong, catat di laporan task (tabel kosong wajar memakai
seq scan) dan jangan ubah indeks tanpa dasar.

- [ ] **Step 8: Aktifkan kembali tes `check-env` yang di-skip pada Task 3 dan commit**

Ubah `it.skip(` menjadi `it(` pada `apps/backend/tests/unit/gates.test.ts`, jalankan
`npm run test --workspace @recobid/backend`, pastikan PASS (kedua `.env.example` sudah ada).

```bash
git add apps/backend packages/shared/src/db package-lock.json
git commit -m "feat(backend): migrasi Phase 1 (tabel, RLS, RPC submit_sample_lead) + tes RLS + tipe hasil generate"
```

---

## Task 7: Seed data pitch dan ekspor data demo

**Files:**
- Create: `apps/backend/supabase/seed/pitch.sql`
- Create: `apps/backend/scripts/seed.mjs`
- Create: `apps/backend/scripts/export-demo-data.mjs`
- Create: `apps/web/lib/data/demo-data.ts` (dihasilkan)
- Test: `apps/backend/tests/unit/seed-shape.test.ts`

**Interfaces:**
- Consumes: skema Task 6; `Docs/SCHEMA.md` §7; `Docs/PRD.md` §7.1.
- Produces: `apps/web/lib/data/demo-data.ts` dengan ekspor bertipe
  `demoRegions: ReadonlyArray<{ code: RegionCode; name: string }>`,
  `demoProduct: DemoProduct`, `demoIngredients: ReadonlyArray<DemoIngredient>`,
  `demoMetrics: ReadonlyArray<DemoMetric>` (hanya metrik bersumber; metrik tanpa referensi ada di
  `demoMetricsWithoutReference: ReadonlyArray<DemoMetricWithoutReference>`), dan
  `demoKudSlugs: readonly string[]`.

Pemisahan dua larik itu disengaja: `MetricPanel` (Task 11) hanya menerima `DemoMetric`, sehingga
metrik tanpa referensi tidak mungkin lolos ke tampilan bahkan bila seseorang salah memfilter.

Bentuk tipe eksak yang harus dipakai (didefinisikan di `demo-data.ts` dan dikonsumsi Task 8–12):

```ts
export interface DemoProduct {
  slug: string;
  name: string;
  description: string;
  unit: "karung";
  packWeightKg: number;
  priceIdr: number;
  comparePriceIdr: number | null;
  proteinPct: number | null;
}

export interface DemoIngredient {
  name: string;
  shareMinPct: number;
  shareMaxPct: number;
  functionLabel: string;
  sortOrder: number;
}

export interface DemoMetricReference {
  citationLabel: string;
  citationUrl: string | null;
  assumptionNote: string;
}

export interface DemoMetric {
  code: string;
  label: string;
  valueNumeric: number;
  unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";
  period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative";
  periodLabel: string;
  isDemo: true;
  references: ReadonlyArray<DemoMetricReference>;
}

export interface DemoMetricWithoutReference {
  code: string;
  label: string;
  isPublic: false;
  withheldReason: string;
}
```

- [ ] **Step 1: Tulis pengujian bentuk seed yang gagal**

`apps/backend/tests/unit/seed-shape.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const SEED = readFileSync(join(ROOT, "apps", "backend", "supabase", "seed", "pitch.sql"), "utf8");
const DEMO = readFileSync(join(ROOT, "apps", "web", "lib", "data", "demo-data.ts"), "utf8");

describe("seed/pitch.sql", () => {
  it("membungkus seluruh pernyataan dalam satu transaksi", () => {
    expect(SEED.trimStart().startsWith("begin;")).toBe(true);
    expect(SEED.trimEnd().endsWith("commit;")).toBe(true);
  });

  it("bersifat idempoten (memakai on conflict do update)", () => {
    expect(SEED).toMatch(/on conflict \(code\) do update/u);
    expect(SEED).toMatch(/on conflict \(slug\) do update/u);
  });

  it("menyisipkan tiga wilayah dan empat KUD target", () => {
    for (const code of ["jabar", "jateng", "jatim"]) expect(SEED).toContain(`'${code}'`);
    for (const slug of [
      "kpbs-pangalengan",
      "kud-mojosongo",
      "kud-cepogo",
      "kud-setia-kawan",
    ]) {
      expect(SEED).toContain(`'${slug}'`);
    }
    const targets = SEED.match(/'target'/gu) ?? [];
    expect(targets.length).toBeGreaterThanOrEqual(4);
  });

  it("memuat produk ritel 50 kg seharga 160000 dengan pembanding 200000", () => {
    expect(SEED).toContain("'recob-pelet-50kg'");
    expect(SEED).toContain("160000");
    expect(SEED).toContain("200000");
  });

  it("memuat tiga bahan formulasi dengan rentang proporsi dokumen sumber", () => {
    expect(SEED).toContain("50");
    expect(SEED).toContain("55");
    expect(SEED).toContain("35");
    expect(SEED).toContain("40");
    expect(SEED).toContain("molase");
  });

  it("tidak menyisipkan metrik emisi tanpa koefisien", () => {
    expect(SEED).not.toMatch(/emisi|emission/iu);
  });
});

describe("demo-data.ts", () => {
  it("menandai seluruh metrik sebagai is_demo dan menyertakan sumber", () => {
    expect(DEMO).toContain("isDemo: true");
    expect(DEMO).toContain("assumptionNote:");
    expect(DEMO).toContain("citationLabel:");
  });

  it("menyatakan metrik yang ditahan secara eksplisit", () => {
    expect(DEMO).toContain("isPublic: false");
    expect(DEMO).toContain("withheldReason:");
  });

  it("memuat slug KUD yang sama dengan seed", () => {
    for (const slug of ["kpbs-pangalengan", "kud-mojosongo", "kud-cepogo", "kud-setia-kawan"]) {
      expect(DEMO).toContain(slug);
    }
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/backend`
Expected: FAIL — `ENOENT` untuk `apps/backend/supabase/seed/pitch.sql`.

- [ ] **Step 3: Tulis `apps/backend/supabase/seed/pitch.sql`**

Isi lengkap (idempoten; satu transaksi agar constraint trigger tertunda dievaluasi di akhir):

```sql
-- seed/pitch.sql — data demo pitching Phase 1 (Docs/SCHEMA.md §7).
-- Idempoten: aman dijalankan berulang. Wajib dijalankan ulang sebelum acara pitching.
begin;

-- 1. Wilayah
insert into region (code, name, province) values
  ('jabar',  'Jawa Barat',  'Jawa Barat'),
  ('jateng', 'Jawa Tengah', 'Jawa Tengah'),
  ('jatim',  'Jawa Timur',  'Jawa Timur')
on conflict (code) do update set name = excluded.name, province = excluded.province;

-- 2. KUD target (status 'target': calon mitra, bukan mitra aktif)
insert into kud (region_id, slug, name, city, status, farmer_count, daily_milk_l)
select r.id, v.slug, v.name, v.city, 'target', v.farmer_count, v.daily_milk_l
from (values
  ('jabar',  'kpbs-pangalengan', 'KPBS Pangalengan', 'Bandung',  4200, 85000.00),
  ('jateng', 'kud-mojosongo',    'KUD Mojosongo',    'Boyolali',  980, 21000.00),
  ('jateng', 'kud-cepogo',       'KUD Cepogo',       'Boyolali',  640, 13500.00),
  ('jatim',  'kud-setia-kawan',  'KUD Setia Kawan',  'Pasuruan', 1150, 26000.00)
) as v(region_code, slug, name, city, farmer_count, daily_milk_l)
join region r on r.code = v.region_code
on conflict (slug) do update set
  name = excluded.name,
  city = excluded.city,
  status = excluded.status,
  farmer_count = excluded.farmer_count,
  daily_milk_l = excluded.daily_milk_l;

-- 3. Produk
insert into product (sku, slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, is_bulk)
values
  ('RECOB-50', 'recob-pelet-50kg', 'ReCob.id Pelet Konsentrat 50 kg',
   'Pelet konsentrat sapi perah dari bonggol jagung dan ampas tahu terfermentasi, dikeringkan dan dipres menjadi pelet.',
   'karung', 50.00, 160000.00, 200000.00, 16.00, false),
  ('RECOB-BULK', 'recob-bulk-curah', 'ReCob.id Curah (penawaran volume)',
   'Penawaran volume untuk peternakan komersial di luar skema KUD.',
   'karung', 50.00, 150000.00, null, 16.00, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  pack_weight_kg = excluded.pack_weight_kg,
  price_idr = excluded.price_idr,
  compare_price_idr = excluded.compare_price_idr,
  protein_pct = excluded.protein_pct,
  is_bulk = excluded.is_bulk;

-- 4. Bahan formulasi (pola: hapus lalu tulis ulang agar rentang selalu sinkron)
delete from product_ingredient
where product_id = (select id from product where slug = 'recob-pelet-50kg');

insert into product_ingredient (product_id, name, share_min_pct, share_max_pct, function_label, sort_order)
select p.id, v.name, v.share_min_pct, v.share_max_pct, v.function_label, v.sort_order
from (values
  ('Bonggol jagung terfermentasi', 50.00, 55.00, 'Sumber energi & serat, menekan biaya pakan', 1),
  ('Ampas tahu terfermentasi',     35.00, 40.00, 'Sumber protein utama hasil biokonversi', 2),
  ('Molase (tetes tebu)',           5.00, 10.00, 'Pengikat pelet, penambah palatabilitas', 3)
) as v(name, share_min_pct, share_max_pct, function_label, sort_order)
join product p on p.slug = 'recob-pelet-50kg';

-- 5. Metrik dampak Phase 1 (semua is_demo = true, wajib berlabel ilustrasi di UI)
insert into impact_metric (code, label, value_numeric, unit, period, period_label, is_demo, is_public, sort_order)
values
  ('corn_cob_potential_national', 'Potensi limbah bonggol jagung nasional', 4600000.00, 'ton',    'yearly',     '2022',       true, true, 1),
  ('saving_per_sack_50kg',        'Penghematan biaya per karung 50 kg',       40000.00, 'rupiah',  'monthly',    'per karung', true, true, 2),
  ('saving_per_cow_month',        'Penghematan per ekor per bulan',           96000.00, 'rupiah',  'monthly',    'per ekor',   true, true, 3),
  ('saving_per_10_cow_month',     'Penghematan peternak 10 ekor per bulan',  960000.00, 'rupiah',  'monthly',    '10 ekor',    true, true, 4),
  ('milk_yield_claim',            'Potensi kenaikan produksi susu',               2.00, 'liter',   'daily',      'per ekor',   true, true, 5)
on conflict (code) do update set
  label = excluded.label,
  value_numeric = excluded.value_numeric,
  unit = excluded.unit,
  period = excluded.period,
  period_label = excluded.period_label,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;

delete from impact_metric_reference
where metric_id in (select id from impact_metric where code in (
  'corn_cob_potential_national','saving_per_sack_50kg','saving_per_cow_month',
  'saving_per_10_cow_month','milk_yield_claim'));

insert into impact_metric_reference (metric_id, citation_label, citation_url, assumption_note)
select m.id, v.citation_label, v.citation_url, v.assumption_note
from (values
  ('corn_cob_potential_national', 'BPS (2022), Analisis produktivitas jagung dan kedelai di Indonesia 2021',
   'https://www.bps.go.id', 'Rentang nasional 3,45-4,6 juta ton per tahun; angka yang ditampilkan memakai batas atas.'),
  ('saving_per_sack_50kg', 'Harga dokumen sumber: Rp160.000 vs Rp180.000-200.000 per karung 50 kg',
   null, 'Selisih harga loco gudang KUD mitra di sentra susu Jawa Barat dan Jawa Tengah, karung netto 50 kg.'),
  ('saving_per_cow_month', 'Turunan dari penghematan per karung', null,
   'Asumsi konsumsi konsentrat 4 kg per ekor per hari selama 30 hari.'),
  ('saving_per_10_cow_month', 'Turunan dari penghematan per ekor per bulan', null,
   'Asumsi populasi 10 ekor dengan konsumsi 4 kg per ekor per hari selama 30 hari.'),
  ('milk_yield_claim', 'Klaim dokumen sumber, menunggu validasi lapangan', null,
   'Klaim berbasis kajian: 1-2 liter per ekor per hari. Bukan capaian terbukti; wajib dilabeli sebagai klaim yang sedang diuji.')
) as v(metric_code, citation_label, citation_url, assumption_note)
join impact_metric m on m.code = v.metric_code;

-- 6. Lead contoh (is_demo = true, tidak pernah dihitung sebagai capaian nyata)
--    `source` adalah enum `lead_source`; nilai dari klausa VALUES bertipe text sehingga
--    memerlukan cast eksplisit (tanpa itu Postgres menolak dengan 42804).
insert into lead (full_name, phone_wa, cattle_count, region_id, kud_id, message, source, status, is_demo, idempotency_key, consented_at)
select v.full_name, v.phone_wa, v.cattle_count, r.id, k.id, v.message, v.source::lead_source, 'new', true,
       'seed-pitch-' || v.urut, now() - (v.urut || ' days')::interval
from (values
  (1, 'Tarno Sujarwo',     '081200000101',  8,  'jabar',  'kpbs-pangalengan', 'Ingin uji 2 karung untuk 8 ekor.',        'tiktok'),
  (2, 'Siti Aminah',       '081200000102', 12,  'jabar',  'kpbs-pangalengan', 'Tanya jadwal pengiriman ke Pangalengan.', 'instagram'),
  (3, 'Bambang Riyadi',    '081200000103', 25,  'jateng', 'kud-mojosongo',    'Tertarik skema potong setoran susu.',     'facebook'),
  (4, 'Joko Purnomo',      '081200000104',  6,  'jateng', 'kud-cepogo',       'Sapi kurang lahap pakan baru, minta panduan transisi.', 'field_visit'),
  (5, 'Rahmat Hidayat',    '081200000105', 18,  'jateng', 'kud-mojosongo',    null,                                      'whatsapp'),
  (6, 'Yusuf Maulana',     '081200000106', 30,  'jatim',  'kud-setia-kawan',  'Perlu penawaran volume untuk 30 ekor.',   'referral'),
  (7, 'Lestari Ningsih',   '081200000107',  9,  'jabar',  'kpbs-pangalengan', 'Apakah cocok untuk sapi laktasi awal?',   'tiktok'),
  (8, 'Hendra Wijaya',     '081200000108', 14,  'jatim',  'kud-setia-kawan',  null,                                      'instagram'),
  (9, 'Agus Setiawan',     '081200000109', 20,  'jateng', null,               'Belum tergabung KUD, minta info kemitraan.', 'other'),
  (10, 'Nur Kholis',       '081200000110',  7,  'jabar',  null,               'Ada sampel untuk dicoba minggu ini?',     'whatsapp')
) as v(urut, full_name, phone_wa, cattle_count, region_code, kud_slug, message, source)
join region r on r.code = v.region_code
left join kud k on k.slug = v.kud_slug
on conflict (idempotency_key) do nothing;

commit;
```

- [ ] **Step 4: Tulis `seed.mjs` dan jalankan seed dua kali**

`apps/backend/scripts/seed.mjs`:

```js
#!/usr/bin/env node
/**
 * seed.mjs — menjalankan supabase/seed/pitch.sql terhadap project tertaut.
 * Menolak berjalan bila APP_ENV=production, kecuali argumen --force diberikan.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SEED = join(BACKEND, "supabase", "seed", "pitch.sql");
const forced = process.argv.includes("--force");

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  try {
    const text = readFileSync(join(BACKEND, ".env"), "utf8");
    for (const rawLine of text.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq !== -1 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

if (readEnv("APP_ENV") === "production" && !forced) {
  process.stderr.write(
    "seed: DITOLAK. APP_ENV=production. Jalankan dengan --force bila memang disengaja.\n",
  );
  process.exit(1);
}

const dbUrl = readEnv("SUPABASE_DB_URL");
if (dbUrl === undefined || dbUrl.length === 0) {
  process.stderr.write("seed: GAGAL. SUPABASE_DB_URL belum diisi di apps/backend/.env\n");
  process.exit(1);
}

const { Client } = await import("pg");
const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
await client.connect();
try {
  await client.query(readFileSync(SEED, "utf8"));
  const counts = await client.query(
    `select
       (select count(*)::int from region)      as regions,
       (select count(*)::int from kud)         as kuds,
       (select count(*)::int from product)     as products,
       (select count(*)::int from product_ingredient) as ingredients,
       (select count(*)::int from impact_metric) as metrics,
       (select count(*)::int from lead where is_demo) as demo_leads`,
  );
  process.stdout.write(`seed: selesai ${JSON.stringify(counts.rows[0])}\n`);
} finally {
  await client.end();
}
```

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run db:seed --workspace @recobid/backend
npm run db:seed --workspace @recobid/backend
```

Expected: dua kali berjalan tanpa galat; hitungan sama pada jalannya kedua (`regions: 3, kuds: 4,
products: 2, ingredients: 3, metrics: 5, demo_leads: 10`). Hitungan yang bertambah menandakan seed
tidak idempoten — perbaiki `on conflict` sebelum lanjut.

- [ ] **Step 5: Tulis `export-demo-data.mjs` dan jalankan**

`apps/backend/scripts/export-demo-data.mjs`:

```js
#!/usr/bin/env node
/**
 * export-demo-data.mjs
 *
 * Membaca project tertaut lalu menulis apps/web/lib/data/demo-data.ts. Bundel ini membuat beranda
 * tetap utuh saat jaringan venue pitching buruk (spec ADR-020).
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");
const OUT = join(ROOT, "apps", "web", "lib", "data", "demo-data.ts");

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  const text = readFileSync(join(BACKEND, ".env"), "utf8");
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq !== -1 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
  }
  throw new Error(`${name} tidak ditemukan`);
}

function ts(value) {
  return JSON.stringify(value, null, 2).replace(/"(?=[A-Za-z_$])/gu, '"');
}

const { Client } = await import("pg");
const client = new Client({
  connectionString: readEnv("SUPABASE_DB_URL"),
  connectionTimeoutMillis: 8000,
});
await client.connect();

const regions = (await client.query("select code, name from region order by code")).rows;
const products = (
  await client.query(
    `select slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct
     from product where is_active order by is_bulk, slug limit 1`,
  )
).rows;
const ingredients = (
  await client.query(
    `select name, share_min_pct, share_max_pct, function_label, sort_order
     from product_ingredient where product_id = (select id from product where slug = $1)
     order by sort_order`,
    [products[0].slug],
  )
).rows;
const metrics = (
  await client.query(
    `select m.code, m.label, m.value_numeric, m.unit, m.period, m.period_label,
            coalesce(json_agg(json_build_object(
              'citationLabel', r.citation_label,
              'citationUrl', r.citation_url,
              'assumptionNote', r.assumption_note)) filter (where r.id is not null), '[]') as refs
     from impact_metric m
     left join impact_metric_reference r on r.metric_id = m.id
     where m.is_public
     group by m.id
     order by m.sort_order`,
  )
).rows;
const kudSlugs = (await client.query("select slug from kud order by slug")).rows.map((r) => r.slug);
await client.end();

const file = `/**
 * BERKAS INI DIHASILKAN oleh \`npm run demo:export\` di apps/backend.
 * Sumber: project Supabase tertaut. Jangan diedit tangan.
 * Wajib dihasilkan ulang sebelum demo pitching (spec ADR-020).
 */

import type { RegionCode } from "@recobid/shared/constants/regions";

export interface DemoProduct {
  slug: string;
  name: string;
  description: string;
  unit: "karung";
  packWeightKg: number;
  priceIdr: number;
  comparePriceIdr: number | null;
  proteinPct: number | null;
}

export interface DemoIngredient {
  name: string;
  shareMinPct: number;
  shareMaxPct: number;
  functionLabel: string;
  sortOrder: number;
}

export interface DemoMetricReference {
  citationLabel: string;
  citationUrl: string | null;
  assumptionNote: string;
}

export interface DemoMetric {
  code: string;
  label: string;
  valueNumeric: number;
  unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";
  period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative";
  periodLabel: string;
  isDemo: true;
  references: ReadonlyArray<DemoMetricReference>;
}

export interface DemoMetricWithoutReference {
  code: string;
  label: string;
  isPublic: false;
  withheldReason: string;
}

export const demoRegions: ReadonlyArray<{ code: RegionCode; name: string }> = ${ts(
  regions.map((r) => ({ code: r.code, name: r.name })),
)};

export const demoProduct: DemoProduct = ${ts({
  slug: products[0].slug,
  name: products[0].name,
  description: products[0].description,
  unit: products[0].unit,
  packWeightKg: Number(products[0].pack_weight_kg),
  priceIdr: Number(products[0].price_idr),
  comparePriceIdr:
    products[0].compare_price_idr === null ? null : Number(products[0].compare_price_idr),
  proteinPct: products[0].protein_pct === null ? null : Number(products[0].protein_pct),
})};

export const demoIngredients: ReadonlyArray<DemoIngredient> = ${ts(
  ingredients.map((i) => ({
    name: i.name,
    shareMinPct: Number(i.share_min_pct),
    shareMaxPct: Number(i.share_max_pct),
    functionLabel: i.function_label,
    sortOrder: i.sort_order,
  })),
)};

export const demoMetrics: ReadonlyArray<DemoMetric> = ${ts(
  metrics.map((m) => ({
    code: m.code,
    label: m.label,
    valueNumeric: Number(m.value_numeric),
    unit: m.unit,
    period: m.period,
    periodLabel: m.period_label,
    isDemo: true,
    references: m.refs,
  })),
)};

export const demoMetricsWithoutReference: ReadonlyArray<DemoMetricWithoutReference> = ${ts([
  {
    code: "emission_avoided",
    label: "Emisi pembakaran terbuka yang dihindari",
    isPublic: false,
    withheldReason:
      "Belum ada koefisien emisi resmi yang dapat dikutip. Metrik tanpa sumber tidak ditampilkan (PRD Bagian 7.1).",
  },
])};

export const demoKudSlugs: readonly string[] = ${ts(kudSlugs)};
`;

writeFileSync(OUT, file, "utf8");
process.stdout.write(`ditulis: ${OUT}\n`);
```

Run: `npm run demo:export --workspace @recobid/backend`
Expected: berkas tertulis; `npm run test --workspace @recobid/backend` PASS seluruhnya (termasuk
`seed-shape.test.ts`).

- [ ] **Step 6: Commit**

```bash
git add apps/backend/supabase/seed/pitch.sql apps/backend/scripts apps/backend/tests/unit/seed-shape.test.ts \
        apps/web/lib/data/demo-data.ts apps/backend/package.json package-lock.json
git commit -m "feat(backend): seed pitch idempoten + ekspor data demo untuk mode offline"
```

---

## Task 8: Lapisan `lib` — env, klien Supabase, rate limit, log, dan pintu data

**Files:**
- Create: `apps/web/lib/env.ts`, `apps/web/lib/logging.ts`, `apps/web/lib/http.ts`,
  `apps/web/lib/rate-limit.ts`
- Create: `apps/web/lib/supabase/client.ts`, `apps/web/lib/supabase/server.ts`
- Create: `apps/web/lib/data/regions.ts`, `apps/web/lib/data/products.ts`, `apps/web/lib/data/impact.ts`,
  `apps/web/lib/data/leads.ts`
- Test: `apps/web/tests/unit/rate-limit.test.ts`, `apps/web/tests/unit/data.test.ts`

**Interfaces:**
- Consumes: `@recobid/shared/constants/*`, `@recobid/shared/contracts/lead`, `lib/data/demo-data.ts`
  (Task 7), kredensial `NEXT_PUBLIC_SUPABASE_*`.
- Produces (nama eksak untuk Task 11–12):
  - `env: { siteUrl: string; supabaseUrl: string | null; supabaseAnonKey: string | null; demoMode: boolean; rateLimitWindowMs: number; rateLimitMax: number; notifyHookUrl: string | null; notifyHookSecret: string | null }`
  - `logInfo(event: string, fields?: LogFields): void`, `logError(event: string, fields?: LogFields): void`
  - `fetchWithTimeout(url: string, init?: RequestInit, timeoutMs?: number): Promise<Response>`
  - `checkRateLimit(key: string, options?: RateLimitOptions): RateLimitResult`, `rateLimitStoreSize(): number`, `__resetRateLimitStore(): void`
  - `createBrowserSupabaseClient()`, `createServerSupabaseClient()`
  - `getRegions(): Promise<ReadonlyArray<RegionOption>>`, `regionLabel(code, options): string`
  - `getPrimaryProduct(): Promise<ProductWithIngredients>`
  - `getPublicMetrics(): Promise<ReadonlyArray<DemoMetric>>`
  - `submitLead(input: SubmitLeadInput): Promise<SubmitLeadResult>` dengan
    `type SubmitLeadResult = { status: "created"; leadId: string } | { status: "duplicate"; leadId: string } | { status: "error"; code: "region_unknown" | "unavailable" }`

- [ ] **Step 1: Tulis pengujian yang gagal**

`apps/web/tests/unit/rate-limit.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetRateLimitStore,
  checkRateLimit,
  rateLimitStoreSize,
} from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitStore();
});

describe("checkRateLimit", () => {
  it("mengizinkan sampai batas lalu menolak", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("ip-1", { windowMs: 60_000, max: 5 }).allowed).toBe(true);
    }
    const blocked = checkRateLimit("ip-1", { windowMs: 60_000, max: 5 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("memisahkan penghitung antar kunci", () => {
    checkRateLimit("ip-2", { windowMs: 60_000, max: 1 });
    expect(checkRateLimit("ip-3", { windowMs: 60_000, max: 1 }).allowed).toBe(true);
  });

  it("menghitung ulang setelah jendela lewat", () => {
    const start = 1_000_000;
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start }).allowed).toBe(true);
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start + 500 }).allowed).toBe(false);
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start + 1_001 }).allowed).toBe(true);
  });

  it("membatasi ukuran penyimpanan sehingga memori tidak tumbuh tanpa batas", () => {
    for (let i = 0; i < 20_000; i += 1) {
      checkRateLimit(`ip-massal-${i}`, { windowMs: 60_000, max: 5, now: 2_000_000 });
    }
    expect(rateLimitStoreSize()).toBeLessThanOrEqual(10_000);
  });
});
```

`apps/web/tests/unit/data.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    siteUrl: "http://localhost:3000",
    supabaseUrl: null,
    supabaseAnonKey: null,
    demoMode: true,
    rateLimitWindowMs: 600_000,
    rateLimitMax: 5,
    notifyHookUrl: null,
    notifyHookSecret: null,
  },
}));

const { getRegions } = await import("@/lib/data/regions");
const { getPrimaryProduct } = await import("@/lib/data/products");
const { getPublicMetrics } = await import("@/lib/data/impact");
const { demoMetrics, demoProduct } = await import("@/lib/data/demo-data");

describe("mode demo (tanpa Supabase)", () => {
  it("getRegions mengembalikan tiga wilayah dari bundel", async () => {
    const regions = await getRegions();
    expect(regions.map((region) => region.code)).toEqual(["jabar", "jateng", "jatim"]);
  });

  it("getPrimaryProduct mengembalikan produk 50 kg beserta bahannya", async () => {
    const { product, ingredients } = await getPrimaryProduct();
    expect(product.slug).toBe(demoProduct.slug);
    expect(product.priceIdr).toBe(160000);
    expect(ingredients).toHaveLength(3);
    expect(ingredients[0]?.shareMinPct).toBe(50);
  });

  it("getPublicMetrics hanya mengembalikan metrik bersumber", async () => {
    const metrics = await getPublicMetrics();
    expect(metrics).toHaveLength(demoMetrics.length);
    expect(metrics.every((metric) => metric.references.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — modul `@/lib/rate-limit`, `@/lib/env`, dan `@/lib/data/*` belum ada.

- [ ] **Step 3: Tulis `lib/env.ts`, `lib/logging.ts`, `lib/http.ts`**

`apps/web/lib/env.ts`:

```ts
import { LIMITS } from "@recobid/shared/constants/limits";

function optional(name: string): string | null {
  const value = process.env[name];
  return value === undefined || value.trim().length === 0 ? null : value.trim();
}

function positiveInt(name: string, fallback: number): number {
  const raw = optional(name);
  if (raw === null) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const supabaseUrl = optional("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = optional("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const forcedDemo = optional("DEMO_MODE") === "true";

export const env = {
  siteUrl: optional("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  supabaseUrl,
  supabaseAnonKey,
  demoMode: forcedDemo || supabaseUrl === null || supabaseAnonKey === null,
  rateLimitWindowMs: positiveInt("LEAD_RATE_LIMIT_WINDOW_MS", LIMITS.rateLimitWindowMs),
  rateLimitMax: positiveInt("LEAD_RATE_LIMIT_MAX", LIMITS.rateLimitMax),
  notifyHookUrl: optional("NOTIFY_HOOK_URL"),
  notifyHookSecret: optional("NOTIFY_HOOK_SECRET"),
} as const;

export type Env = typeof env;
```

`apps/web/lib/logging.ts`:

```ts
/**
 * Log terstruktur satu baris JSON. Tidak boleh memuat PII (nama, nomor telepon, alamat):
 * hanya kunci yang terdaftar di bawah yang diteruskan.
 */

export type LogFields = Partial<
  Record<
    | "request_id"
    | "path"
    | "status"
    | "duration_ms"
    | "lead_created"
    | "duplicate"
    | "event_name"
    | "notify"
    | "code"
    | "rate_limited",
    string | number | boolean
  >
>;

const ALLOWED_KEYS = new Set<string>([
  "request_id",
  "path",
  "status",
  "duration_ms",
  "lead_created",
  "duplicate",
  "event_name",
  "notify",
  "code",
  "rate_limited",
]);

function sanitize(fields: LogFields): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue;
    if (!ALLOWED_KEYS.has(key)) continue;
    clean[key] = value;
  }
  return clean;
}

function write(level: "info" | "error", event: string, fields: LogFields): void {
  const line = JSON.stringify({ level, event, at: new Date().toISOString(), ...sanitize(fields) });
  // ESLint no-console mengizinkan warn/error saja; keduanya tetap satu baris JSON.
  if (level === "error") {
    console.error(line);
    return;
  }
  console.warn(line);
}

export function logInfo(event: string, fields: LogFields = {}): void {
  write("info", event, fields);
}

export function logError(event: string, fields: LogFields = {}): void {
  write("error", event, fields);
}
```

`apps/web/lib/http.ts`:

```ts
const DEFAULT_TIMEOUT_MS = 5_000;

/** Pemanggilan keluar wajib memakai batas waktu (spec Bagian 8). */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
```

- [ ] **Step 4: Tulis `lib/rate-limit.ts`**

```ts
import { env } from "@/lib/env";

const MAX_KEYS = 10_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/** Mengecilkan peta saat melewati batas: buang entri kedaluwarsa, lalu entri tertua. */
function evict(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next();
    if (oldest.done === true) break;
    buckets.delete(oldest.value);
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? env.rateLimitWindowMs;
  const max = options.max ?? env.rateLimitMax;
  const now = options.now ?? Date.now();

  if (buckets.size > MAX_KEYS) evict(now);

  const bucket = buckets.get(key);
  if (bucket === undefined || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(0, max - 1) };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: Math.max(0, max - bucket.count) };
}

/** Khusus pengujian. */
export function __resetRateLimitStore(): void {
  buckets.clear();
}

/** Khusus pengujian dan pemantauan: jumlah kunci yang tersimpan. */
export function rateLimitStoreSize(): number {
  return buckets.size;
}
```

Catatan: batas ini per instans dan bukan jaminan global di Vercel; gerbang sebenarnya adalah indeks
unik nomor WA dan kunci idempotensi di basis data (spec ADR-017).

- [ ] **Step 5: Tulis klien Supabase**

`apps/web/lib/supabase/client.ts`:

```ts
import type { Database } from "@recobid/shared/db/types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

let cached: SupabaseClient<Database> | null = null;

/** Klien peramban memakai kunci anon; RLS adalah gerbang sebenarnya. */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (env.supabaseUrl === null || env.supabaseAnonKey === null) {
    throw new Error("Kredensial Supabase belum diisi; aktifkan DEMO_MODE untuk pengembangan lokal.");
  }
  if (cached === null) {
    cached = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
```

`apps/web/lib/supabase/server.ts`:

```ts
import type { Database } from "@recobid/shared/db/types";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Klien sisi server (Server Component / Server Action).
 * Memakai kunci anon: tidak ada kunci istimewa di aplikasi web (spec ADR-011).
 */
export function createServerSupabaseClient(): SupabaseClient<Database> {
  if (env.supabaseUrl === null || env.supabaseAnonKey === null) {
    throw new Error("Kredensial Supabase belum diisi; aktifkan DEMO_MODE untuk pengembangan lokal.");
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5_000) }),
    },
  });
}
```

- [ ] **Step 6: Tulis empat modul `lib/data/*`**

`apps/web/lib/data/regions.ts`:

```ts
import { REGION_CODES, type RegionCode } from "@recobid/shared/constants/regions";
import { demoRegions } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface RegionOption {
  code: RegionCode;
  name: string;
}

const FALLBACK_NAMES: Record<RegionCode, string> = {
  jabar: "Jawa Barat",
  jateng: "Jawa Tengah",
  jatim: "Jawa Timur",
};

function fromDemo(): ReadonlyArray<RegionOption> {
  return demoRegions.map((region) => ({ code: region.code, name: region.name }));
}

export async function getRegions(): Promise<ReadonlyArray<RegionOption>> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("region")
      .select("code, name")
      .order("name", { ascending: true });

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "respons kosong");
    }

    const rows = data
      .map((row) => ({ code: row.code, name: row.name }))
      .filter((row): row is RegionOption => (REGION_CODES as readonly string[]).includes(row.code));

    return rows.length > 0 ? rows : fromDemo();
  } catch {
    return fromDemo();
  }
}

export function regionLabel(code: RegionCode, options: ReadonlyArray<RegionOption>): string {
  return options.find((option) => option.code === code)?.name ?? FALLBACK_NAMES[code];
}
```

`apps/web/lib/data/products.ts`:

```ts
import {
  demoIngredients,
  demoProduct,
  type DemoIngredient,
  type DemoProduct,
} from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProductWithIngredients {
  product: DemoProduct;
  ingredients: ReadonlyArray<DemoIngredient>;
}

function fromDemo(): ProductWithIngredients {
  return { product: demoProduct, ingredients: demoIngredients };
}

/**
 * Satu kueri bergabung: produk + bahan. Dilarang memanggil per baris dalam loop
 * (aturan anti-N+1, Docs/SCHEMA.md §4).
 */
export async function getPrimaryProduct(): Promise<ProductWithIngredients> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("product")
      .select(
        "slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, is_bulk, product_ingredient(name, share_min_pct, share_max_pct, function_label, sort_order)",
      )
      .eq("is_active", true)
      .eq("is_bulk", false)
      .order("slug", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "produk tidak ditemukan");
    }

    const ingredients = [...data.product_ingredient]
      .sort((left, right) => left.sort_order - right.sort_order)
      .map((row) => ({
        name: row.name,
        shareMinPct: Number(row.share_min_pct),
        shareMaxPct: Number(row.share_max_pct),
        functionLabel: row.function_label,
        sortOrder: row.sort_order,
      }));

    return {
      product: {
        slug: data.slug,
        name: data.name,
        description: data.description,
        unit: "karung",
        packWeightKg: Number(data.pack_weight_kg),
        priceIdr: Number(data.price_idr),
        comparePriceIdr: data.compare_price_idr === null ? null : Number(data.compare_price_idr),
        proteinPct: data.protein_pct === null ? null : Number(data.protein_pct),
      },
      ingredients,
    };
  } catch {
    return fromDemo();
  }
}
```

`apps/web/lib/data/impact.ts`:

```ts
import { demoMetrics, type DemoMetric } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function fromDemo(): ReadonlyArray<DemoMetric> {
  // demoMetrics sudah hanya memuat metrik bersumber (Task 7 memisahkannya ke larik sendiri).
  return demoMetrics;
}

/**
 * Hanya metrik publik yang bersumber. Aturan yang sama ditegakkan basis data lewat constraint
 * trigger (Docs/SCHEMA.md §3.6).
 */
export async function getPublicMetrics(): Promise<ReadonlyArray<DemoMetric>> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("impact_metric")
      .select(
        "code, label, value_numeric, unit, period, period_label, impact_metric_reference(citation_label, citation_url, assumption_note)",
      )
      .eq("is_public", true)
      .order("sort_order", { ascending: true });

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "respons kosong");
    }

    const metrics: DemoMetric[] = data
      .map((row) => ({
        code: row.code,
        label: row.label,
        valueNumeric: Number(row.value_numeric),
        unit: row.unit,
        period: row.period,
        periodLabel: row.period_label ?? "",
        isDemo: true,
        references: row.impact_metric_reference.map((reference) => ({
          citationLabel: reference.citation_label,
          citationUrl: reference.citation_url,
          assumptionNote: reference.assumption_note,
        })),
      }))
      .filter((metric) => metric.references.length > 0);

    return metrics.length > 0 ? metrics : fromDemo();
  } catch {
    return fromDemo();
  }
}
```

`apps/web/lib/data/leads.ts`:

```ts
import type { SubmitLeadInput } from "@recobid/shared/contracts/lead";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubmitLeadResult =
  | { status: "created"; leadId: string }
  | { status: "duplicate"; leadId: string }
  | { status: "error"; code: "region_unknown" | "unavailable" };

interface RpcRow {
  lead_id: string;
  created: boolean;
}

/**
 * Satu-satunya jalur tulis lead: kunci anon + RPC security definer yang idempoten
 * (Docs/SCHEMA.md §4).
 */
export async function submitLead(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  if (env.demoMode) {
    return { status: "error", code: "unavailable" };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("submit_sample_lead", {
      p_full_name: input.fullName,
      p_phone_wa: input.phoneWa,
      p_cattle_count: input.cattleCount,
      p_region_code: input.regionCode,
      p_kud_slug: input.kudSlug ?? null,
      p_message: input.message ?? null,
      p_source: input.source,
      p_utm: input.utm,
      p_idempotency_key: input.idempotencyKey,
    });

    if (error !== null) {
      if (error.code === "22023") return { status: "error", code: "region_unknown" };
      if (error.code === "23505") return { status: "duplicate", leadId: "" };
      return { status: "error", code: "unavailable" };
    }

    const row = (data as RpcRow[] | null)?.[0];
    if (row === undefined) return { status: "error", code: "unavailable" };

    return row.created
      ? { status: "created", leadId: row.lead_id }
      : { status: "duplicate", leadId: row.lead_id };
  } catch {
    return { status: "error", code: "unavailable" };
  }
}
```

- [ ] **Step 7: Jalankan tes, typecheck, dan lint**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/web
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
```

Expected: seluruh tes PASS; typecheck dan lint bersih. Bila `supabase.from("product")` mengeluh
karena tipe hasil generate belum memuat relasi yang diminta, ulangi Task 6 Step 6
(`db:gen-types`) — jangan longgarkan tipe dengan `as`.

- [ ] **Step 8: Commit**

```bash
git add apps/web/lib apps/web/tests/unit/rate-limit.test.ts apps/web/tests/unit/data.test.ts
git commit -m "feat(web): lapisan env, klien Supabase anon, rate limit berbatas, log terstruktur, dan pintu data lib/data/*"
```

---

## Task 9: Lapisan konten bertipe (salinan 12 seksi)

**Files:**
- Create: `apps/web/content/copy/id.ts`, `apps/web/content/copy/index.ts`
- Test: `apps/web/tests/unit/copy.test.ts`

**Interfaces:**
- Consumes: `Docs/stitch/code.html` (rentang baris di Step 3), `Docs/PRD.md` Bagian 8,
  `Docs/DESIGN.md` "Do's and Don'ts".
- Produces: `copy` (objek `as const` bertipe `Copy`) dan `type Copy`; seluruh seksi Task 11 membaca
  `copy.<bagian>`.

**Aturan yang mengikat transkripsi (PRD Bagian 8, tanpa pengecualian):**

1. Setiap angka wajib melekat pada sumbernya: tiap nilai metrik dan klaim mendapat caption berisi
   nilai, satuan, periode, dan sumber.
2. Klaim "peningkatan produksi susu 1–2 liter/ekor/hari" wajib disertai label "klaim berbasis
   kajian" dan "validasi lapangan".
3. Status NPP dinyatakan apa adanya; bila nomor belum terbit, tulis "Dalam proses pendaftaran".
   Jangan mengarang nomor.
4. Tanpa emoji. Tanpa tanda seru pada caption.
5. Nomor kontak belum final di Phase 1: isi dengan penanda jelas dan cantumkan catatan
   "menyusul sebelum rilis publik" pada `footer.contactNotice`.

- [ ] **Step 1: Tulis pengujian konten yang gagal**

`apps/web/tests/unit/copy.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";

const EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/u;

function collectStrings(value: unknown, path = "copy"): Array<{ path: string; text: string }> {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
  }
  return [];
}

const strings = collectStrings(copy);

describe("lapisan konten", () => {
  it("memuat 12 bagian beranda", () => {
    for (const section of [
      "hero",
      "problem",
      "solution",
      "product",
      "costCompare",
      "impact",
      "partnership",
      "validation",
      "education",
      "faq",
      "cta",
      "footer",
    ]) {
      expect(copy).toHaveProperty(section);
    }
  });

  it("tidak memuat emoji", () => {
    for (const { path, text } of strings) {
      expect(EMOJI.test(text), `${path} memuat emoji`).toBe(false);
    }
  });

  it("tidak memuat penanda TODO atau placeholder implementasi", () => {
    for (const { path, text } of strings) {
      expect(/TODO|TBD|FIXME|lorem/iu.test(text), `${path} memuat penanda terlarang`).toBe(false);
    }
  });

  it("memuat minimal enam pertanyaan FAQ beserta jawabannya", () => {
    expect(copy.faq.items.length).toBeGreaterThanOrEqual(6);
    for (const item of copy.faq.items) {
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.answer.length).toBeGreaterThan(40);
    }
  });

  it("menandai klaim kenaikan produksi susu sebagai klaim berbasis kajian", () => {
    expect(copy.validation.claimNotice).toMatch(/klaim berbasis kajian/iu);
    expect(copy.validation.claimNotice).toMatch(/validasi lapangan/iu);
  });

  it("menyatakan status NPP apa adanya", () => {
    expect(copy.validation.nppStatus).toMatch(/dalam proses pendaftaran/iu);
  });

  it("menyatakan kontak resmi belum final", () => {
    expect(copy.footer.contactNotice).toMatch(/menyusul sebelum rilis publik/iu);
  });

  it("menyebut tiga wilayah operasi", () => {
    const joined = strings.map((item) => item.text).join(" ");
    for (const city of ["Bandung", "Boyolali", "Pasuruan"]) {
      expect(joined).toContain(city);
    }
  });

  it("memuat empat KUD target", () => {
    const joined = strings.map((item) => item.text).join(" ");
    for (const kud of ["KPBS Pangalengan", "KUD Mojosongo", "KUD Cepogo", "KUD Setia Kawan"]) {
      expect(joined).toContain(kud);
    }
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — modul `@/content/copy` belum ada.

- [ ] **Step 3: Tulis struktur bertipe `content/copy/id.ts` lalu isi dari sumbernya**

Tulis kerangka berikut apa adanya (kunci tidak boleh diubah karena Task 11 bergantung padanya), lalu
ganti setiap string kosong dengan transkripsi dari `Docs/stitch/code.html` pada rentang baris yang
tercantum di komentar:

```ts
/**
 * Salinan beranda (Bahasa Indonesia) — satu-satunya sumber teks UI.
 * Naskah bersumber dari Docs/stitch/code.html, disesuaikan dengan aturan kepatuhan
 * Docs/PRD.md Bagian 8. Tidak boleh ada teks tampilan di JSX (spec ADR-015).
 */

export const idCopy = {
  hero: {
    badge: "", // baris 3-75
    title: "",
    subtitle: "",
    ctaPrimary: "",
    ctaSecondary: "",
    priceAnchorLabel: "",
    priceAnchorValue: "",
    priceCompareLabel: "",
    priceCompareValue: "",
    priceCaption: "",
    imageAlt: "",
  },
  problem: {
    title: "", // baris 76-146
    intro: "",
    items: [
      { title: "", body: "", metric: "", caption: "" },
      { title: "", body: "", metric: "", caption: "" },
      { title: "", body: "", metric: "", caption: "" },
    ],
  },
  solution: {
    title: "", // baris 147-216
    intro: "",
    pillars: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
  },
  product: {
    title: "", // baris 217-352
    intro: "",
    compositionTitle: "",
    compositionCaption: "",
    specTitle: "",
    specs: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
    ],
    transitionTitle: "",
    transitionSteps: ["", "", "", ""],
  },
  costCompare: {
    title: "", // baris 353-414
    intro: "",
    tableHead: { criteria: "", recob: "", conventional: "" },
    rows: [
      { criteria: "", recob: "", conventional: "" },
      { criteria: "", recob: "", conventional: "" },
      { criteria: "", recob: "", conventional: "" },
    ],
    assumptionTitle: "",
    assumptions: ["", "", ""],
    closing: "",
  },
  impact: {
    title: "", // baris 415-500; nilai metrik datang dari lib/data/impact
    intro: "",
    demoBadge: "",
    withheldTitle: "",
  },
  partnership: {
    title: "", // baris 501-564
    intro: "",
    steps: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
    kudTitle: "",
    kudNote: "",
    kudNames: ["KPBS Pangalengan", "KUD Mojosongo", "KUD Cepogo", "KUD Setia Kawan"],
  },
  validation: {
    title: "", // baris 565-646
    intro: "",
    qcItems: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
    citationTitle: "",
    citations: ["", "", "", "", "", ""],
    nppLabel: "",
    nppStatus: "", // wajib memuat frasa "dalam proses pendaftaran"
    claimNotice: "", // wajib memuat "klaim berbasis kajian" dan "validasi lapangan"
  },
  education: {
    title: "", // baris 647-706
    intro: "",
    items: [
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
      { title: "", body: "" },
    ],
    ctaLabel: "",
  },
  faq: {
    title: "", // baris 707-804
    intro: "",
    items: [
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
      { question: "", answer: "" },
    ],
  },
  cta: {
    title: "", // baris 805-913
    intro: "",
    form: {
      nameLabel: "",
      namePlaceholder: "",
      phoneLabel: "",
      phoneHint: "",
      phonePlaceholder: "",
      cattleLabel: "",
      cattlePlaceholder: "",
      regionLabel: "",
      regionPlaceholder: "",
      kudLabel: "",
      kudOptional: "",
      messageLabel: "",
      messagePlaceholder: "",
      consentLabel: "",
      submitLabel: "",
      submittingLabel: "",
      honeypotLabel: "",
      successTitle: "",
      successBody: "",
      successNextStep: "",
      duplicateTitle: "",
      duplicateBody: "",
      errorTitle: "",
      errorBody: "",
      rateLimitTitle: "",
      rateLimitBody: "",
      whatsappCta: "",
      demoModeTitle: "",
      demoModeBody: "",
      errors: {
        nameRequired: "",
        nameTooShort: "",
        phoneRequired: "",
        phoneInvalid: "",
        cattleRequired: "",
        cattleRange: "",
        regionRequired: "",
        consentRequired: "",
        generic: "",
      },
    },
    sticky: { ctaLabel: "", whatsappLabel: "" },
  },
  footer: {
    tagline: "", // baris 914-915
    productTitle: "",
    companyTitle: "",
    contactTitle: "",
    legalTitle: "",
    nav: {
      product: "Produk",
      impact: "Dampak",
      partnership: "Kemitraan KUD",
      education: "Edukasi",
      contact: "Kontak",
    },
    contactNotice: "", // wajib memuat "menyusul sebelum rilis publik"
    address: "",
    nppStatus: "",
    copyright: "",
  },
  nav: {
    home: "Beranda",
    product: "Produk",
    impact: "Dampak",
    partnership: "Kemitraan KUD",
    education: "Edukasi",
    contact: "Kontak",
    sampleCta: "Klaim Sampel Gratis",
  },
  meta: {
    title: "",
    description: "",
    ogAlt: "",
  },
} as const;

export type Copy = typeof idCopy;
```

- [ ] **Step 4: Tulis `content/copy/index.ts`**

```ts
import { idCopy, type Copy } from "@/content/copy/id";

/** Titik akses tunggal lapisan konten. Lokal kedua (mis. `en`) ditambahkan pada Phase 3. */
export const copy: Copy = idCopy;

export type { Copy };
```

- [ ] **Step 5: Jalankan pengujian sampai lulus**

Run: `npm run test --workspace @recobid/web`
Expected: seluruh kasus `copy.test.ts` PASS. Bila tes "tidak memuat TODO" atau panjang FAQ gagal,
artinya ada nilai yang belum diisi: lengkapi dari `Docs/stitch/code.html`, jangan melemahkan tes.

- [ ] **Step 6: Commit**

```bash
git add apps/web/content apps/web/tests/unit/copy.test.ts
git commit -m "feat(content): lapisan konten bertipe 12 seksi beranda + aturan kepatuhan klaim"
```

---

## Task 10: Komponen `ui/*` dengan CVA

**Files:**
- Create: `apps/web/components/ui/{button,badge,input,card,alert,section,container,metric,caption-note}.tsx`
- Test: `apps/web/tests/unit/ui.test.tsx`

**Interfaces:**
- Consumes: `cn()` (Task 4), token dari `styles/theme.css` (Task 2).
- Produces (nama eksak untuk Task 11–12):
  - `Button({ variant?: "primary" | "accent" | "secondary" | "ghost"; size?: "md" | "lg"; ...buttonProps })`
  - `ButtonLink({ href: string; variant?; size?; external?: boolean; children })`
  - `Badge({ tone?: "neutral" | "primary" | "partner" | "warn"; children })`
  - `Input` (meneruskan `ref`, properti `invalid?: boolean`), `Label({ required?: boolean })`, `FieldError({ children })`
  - `Card({ tone?: "surface" | "cream" | "paper"; children })`
  - `Alert({ children })`, `Section({ tone: "surface" | "cream" | "paper" | "ink"; id?; labelledBy?; children })`
  - `Container`, `MetricValue({ value, unit, period, caption, tone?: "light" | "dark" })`, `CaptionNote({ children })`

- [ ] **Step 1: Tulis pengujian komponen yang gagal**

`apps/web/tests/unit/ui.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { MetricValue } from "@/components/ui/metric";
import { Section } from "@/components/ui/section";

describe("Button", () => {
  it("memakai gaya utama secara bawaan", () => {
    render(<Button>Kirim</Button>);
    const button = screen.getByRole("button", { name: "Kirim" });
    expect(button.className).toContain("bg-primary");
    expect(button.getAttribute("type")).toBe("button");
  });

  it("varian accent memakai bidang accent dengan teks ink", () => {
    render(<Button variant="accent">Klaim Sampel Gratis</Button>);
    const button = screen.getByRole("button", { name: "Klaim Sampel Gratis" });
    expect(button.className).toContain("bg-accent");
    expect(button.className).toContain("text-ink");
  });
});

describe("ButtonLink", () => {
  it("menambahkan target dan rel aman untuk tautan luar", () => {
    render(
      <ButtonLink external href="https://wa.me/6281200000000">
        WhatsApp
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "WhatsApp" });
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });
});

describe("Badge dan Alert", () => {
  it("badge partner memuat ikon handshake", () => {
    const { container } = render(<Badge tone="partner">Mitra KUD</Badge>);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("alert peringatan memuat ikon triangle-alert dan teksnya", () => {
    const { container } = render(<Alert>Ilustrasi berbasis asumsi</Alert>);
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.textContent).toContain("Ilustrasi berbasis asumsi");
  });
});

describe("MetricValue", () => {
  it("selalu menampilkan periode dan sumber", () => {
    render(
      <MetricValue
        caption="Harga dokumen sumber: Rp160.000 vs Rp180.000-200.000"
        period="per karung"
        unit="rupiah"
        value="Rp40.000"
      />,
    );
    expect(screen.getByText(/per karung/u)).toBeTruthy();
    expect(screen.getByText(/Harga dokumen sumber/u)).toBeTruthy();
  });
});

describe("Section", () => {
  it("menerapkan permukaan sesuai tone dan meneruskan id", () => {
    const { container } = render(
      <Section id="dampak" tone="ink">
        <p>Metrik</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section?.className).toContain("bg-ink-deep");
    expect(section?.getAttribute("id")).toBe("dampak");
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — komponen `@/components/ui/*` belum ada.

- [ ] **Step 3: Tulis `button.tsx`**

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const buttonStyles = cva(
  "inline-flex min-h-12 items-center justify-center gap-xs rounded-md px-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-primary type-label-md uppercase text-surface hover:bg-primary-strong",
        accent: "bg-accent type-label-md uppercase text-ink hover:bg-accent-ink",
        secondary: "border border-text-secondary bg-surface type-label-md text-primary hover:bg-primary-soft",
        ghost: "bg-transparent type-label-md text-primary hover:bg-primary-soft",
      },
      size: {
        md: "",
        lg: "min-h-[52px] px-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

export interface ButtonProps extends Omit<ComponentProps<"button">, "className">, ButtonStyleProps {
  className?: string;
}

export function Button({ variant, size, className, type, ...props }: ButtonProps): ReactNode {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      type={type ?? "button"}
      {...props}
    />
  );
}

export interface ButtonLinkProps
  extends Omit<ComponentProps<"a">, "className" | "href">,
    ButtonStyleProps {
  href: string;
  className?: string;
  external?: boolean;
}

export function ButtonLink({
  className,
  external = false,
  href,
  size,
  variant,
  children,
  ...props
}: ButtonLinkProps): ReactNode {
  const classes = cn(buttonStyles({ variant, size }), className);

  if (external || href.startsWith("http")) {
    return (
      <a className={classes} href={href} rel="noopener noreferrer" target="_blank" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link className={classes} href={href} {...props}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 4: Tulis komponen sisanya**

`apps/web/components/ui/badge.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import { Handshake } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const badgeStyles = cva("inline-flex h-7 items-center gap-2xs rounded-pill px-sm type-caption", {
  variants: {
    tone: {
      neutral: "bg-paper text-text",
      primary: "bg-primary-soft text-primary",
      partner: "bg-tan text-ink",
      warn: "bg-amber-soft text-amber-ink",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends VariantProps<typeof badgeStyles> {
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, children, className }: BadgeProps): ReactNode {
  return (
    <span className={cn(badgeStyles({ tone }), className)}>
      {tone === "partner" ? <Handshake aria-hidden="true" size={16} strokeWidth={1.75} /> : null}
      {children}
    </span>
  );
}
```

`apps/web/components/ui/alert.tsx`:

```tsx
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps {
  children: ReactNode;
  className?: string;
}

/** Penanda asumsi/disclaimer: ikon wajib, maksimum tiga baris (Docs/DESIGN.md, alert-warn). */
export function Alert({ children, className }: AlertProps): ReactNode {
  return (
    <div
      className={cn(
        "flex items-start gap-xs rounded-sm bg-amber-soft p-md type-body-sm text-amber-ink",
        className,
      )}
      role="note"
    >
      <TriangleAlert aria-hidden="true" className="mt-2xs shrink-0" size={20} strokeWidth={1.75} />
      <div>{children}</div>
    </div>
  );
}
```

`apps/web/components/ui/card.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const cardStyles = cva("rounded-lg p-lg", {
  variants: {
    tone: {
      surface: "bg-surface shadow-[0_1px_2px_rgba(13,18,22,0.06),0_8px_24px_rgba(13,18,22,0.06)]",
      cream: "border border-border bg-cream",
      paper: "border border-border bg-paper",
    },
  },
  defaultVariants: { tone: "surface" },
});

export interface CardProps extends VariantProps<typeof cardStyles> {
  children: ReactNode;
  className?: string;
}

export function Card({ tone, children, className }: CardProps): ReactNode {
  return <div className={cn(cardStyles({ tone }), className)}>{children}</div>;
}
```

`apps/web/components/ui/section.tsx`:

```tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const sectionStyles = cva("px-lg py-3xl", {
  variants: {
    tone: {
      surface: "bg-surface text-ink",
      cream: "bg-cream text-ink",
      paper: "bg-paper text-ink",
      ink: "bg-ink-deep text-surface",
    },
  },
  defaultVariants: { tone: "surface" },
});

export interface SectionProps extends VariantProps<typeof sectionStyles> {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}

export function Section({ children, className, id, labelledBy, tone }: SectionProps): ReactNode {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(sectionStyles({ tone }), className)}
      id={id}
    >
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}
```

`apps/web/components/ui/container.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export function Container({ children, className }: ContainerProps): ReactNode {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-lg", className)}>{children}</div>;
}
```

`apps/web/components/ui/metric.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MetricValueProps {
  value: string;
  unit: string;
  period: string;
  caption: string;
  tone?: "light" | "dark";
  className?: string;
}

/** Angka tidak pernah tampil tanpa satuan, periode, dan sumber (PRD Bagian 7.1). */
export function MetricValue({
  caption,
  className,
  period,
  tone = "light",
  unit,
  value,
}: MetricValueProps): ReactNode {
  return (
    <figure className={cn("flex flex-col gap-xs", className)}>
      <div className="flex items-baseline gap-xs">
        <span
          className={cn("type-metric-lg", tone === "dark" ? "text-accent" : "text-primary-strong")}
        >
          {value}
        </span>
        <span
          className={cn(
            "type-body-sm",
            tone === "dark" ? "text-surface/80" : "text-text-secondary",
          )}
        >
          {unit}
        </span>
      </div>
      <figcaption
        className={cn(
          "type-caption",
          tone === "dark" ? "text-surface/80" : "text-text-secondary",
        )}
      >
        {period}. {caption}
      </figcaption>
    </figure>
  );
}
```

`apps/web/components/ui/caption-note.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CaptionNoteProps {
  children: ReactNode;
  className?: string;
}

/** Blok asumsi/sumber di bawah angka: caption pada paper, diakhiri titik. */
export function CaptionNote({ children, className }: CaptionNoteProps): ReactNode {
  return (
    <p className={cn("rounded-sm bg-paper px-sm py-xs type-caption text-text-secondary", className)}>
      {children}
    </p>
  );
}
```

`apps/web/components/ui/input.tsx`:

```tsx
import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends Omit<ComponentProps<"input">, "className"> {
  className?: string;
  invalid?: boolean;
}

export function Input({ className, invalid = false, ...props }: InputProps): ReactNode {
  return (
    <input
      aria-invalid={invalid}
      className={cn(
        "h-12 w-full rounded-sm border border-text-secondary bg-surface px-md type-body-md text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35",
        invalid && "border-amber-ink",
        className,
      )}
      {...props}
    />
  );
}

export interface LabelProps extends Omit<ComponentProps<"label">, "className"> {
  className?: string;
  required?: boolean;
}

export function Label({ children, className, required = false, ...props }: LabelProps): ReactNode {
  return (
    <label className={cn("type-body-sm font-medium text-text", className)} {...props}>
      {children}
      {required ? <span className="text-amber-ink"> *</span> : null}
    </label>
  );
}

export interface FieldErrorProps {
  children: ReactNode;
}

export function FieldError({ children }: FieldErrorProps): ReactNode {
  return (
    <p className="flex items-center gap-xs type-caption text-amber-ink">
      <CircleAlert aria-hidden="true" size={16} strokeWidth={1.75} />
      {children}
    </p>
  );
}
```

- [ ] **Step 5: Jalankan tes, typecheck, lint, dan build**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/web
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
npm run build --workspace @recobid/web
```

Expected: seluruh tes UI PASS; typecheck, lint, dan build bersih.

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/ui apps/web/tests/unit/ui.test.tsx
git commit -m "feat(ui): komponen dasar bertipe (button, badge, input, card, alert, section, metric)"
```

---

## Task 11: Beranda bagian atas — seksi 1–6

**Files:**
- Create: `apps/web/components/sections/{hero,problem,solution,product,cost-compare,impact}.tsx`
- Create: `apps/web/components/blocks/{composition-bar,metric-panel}.tsx`
- Create: `apps/web/lib/data/kud.ts`
- Modify: `apps/web/app/page.tsx` (ganti kerangka dengan susunan 12 seksi)
- Modify: `apps/web/app/layout.tsx` (metadata dari `copy.meta`)
- Test: `apps/web/tests/unit/sections-top.test.tsx`

**Interfaces:**
- Consumes: `copy` (Task 9), komponen `ui/*` (Task 10), `getPrimaryProduct()` dan `getPublicMetrics()`
  (Task 8), `demoKudSlugs` (Task 7).
- Produces (nama eksak untuk Task 12):
  - `Hero`, `Problem`, `Solution`, `Product`, `CostCompare`, `Impact` — semua `async` Server Component
    tanpa props.
  - `CompositionBar({ ingredients }: { ingredients: ReadonlyArray<DemoIngredient> })`
  - `MetricPanel({ metrics }: { metrics: ReadonlyArray<DemoMetric> })`
  - `getActiveKudNames(): Promise<ReadonlyArray<string>>` dari `lib/data/kud.ts`.

**Aturan transkripsi (berlaku untuk Task 11 dan 12):** setiap komponen membaca teks dari `copy.<bagian>`
dan tidak boleh memuat string tampilan literal. Bila kunci yang dibutuhkan tidak ada di `copy`,
tambahkan kunci itu ke `content/copy/id.ts` (Task 9) lebih dulu, jangan menulis teks di JSX.

- [ ] **Step 1: Tulis pengujian render yang gagal**

`apps/web/tests/unit/sections-top.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { Hero } from "@/components/sections/hero";
import { Product } from "@/components/sections/product";
import { Impact } from "@/components/sections/impact";
import { demoProduct, demoIngredients, demoMetrics } from "@/lib/data/demo-data";

describe("seksi beranda bagian atas", () => {
  it("hero menampilkan judul, dua ajakan, dan pembanding harga", async () => {
    render(await Hero());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.hero.title);
    expect(screen.getByRole("link", { name: copy.hero.ctaPrimary })).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.hero.ctaSecondary })).toBeTruthy();
    expect(screen.getByText(copy.hero.priceAnchorValue)).toBeTruthy();
  });

  it("hero menandai gambar sebagai dekoratif bila alt kosong", async () => {
    const { container } = render(await Hero());
    const image = container.querySelector("img");
    if (image !== null && copy.hero.imageAlt.length === 0) {
      expect(image.getAttribute("alt")).toBe("");
    }
  });

  it("seksi produk menampilkan setiap bahan beserta rentang porsinya", async () => {
    render(await Product());
    for (const ingredient of demoIngredients) {
      expect(screen.getByText(ingredient.name)).toBeTruthy();
      expect(
        screen.getByText(`${ingredient.shareMinPct}–${ingredient.shareMaxPct}%`),
      ).toBeTruthy();
    }
    expect(screen.getByText(demoProduct.name)).toBeTruthy();
  });

  it("seksi dampak menampilkan setiap metrik dengan periode dan caption sumbernya", async () => {
    render(await Impact());
    for (const metric of demoMetrics) {
      expect(screen.getByText(metric.label)).toBeTruthy();
      for (const reference of metric.references) {
        expect(screen.getByText(reference.citationLabel)).toBeTruthy();
      }
    }
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — modul `@/components/sections/*` belum ada.

- [ ] **Step 3: Tulis `lib/data/kud.ts`**

`apps/web/lib/data/kud.ts`:

```ts
import { demoKudSlugs } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Nama KUD aktif. Kebijakan RLS hanya membuka baris berstatus `active` untuk anonim
 * (Docs/SCHEMA.md §3.7), jadi daftar ini memang kosong sebelum kemitraan berjalan.
 * Bila kosong, seksi kemitraan menampilkan `copy.partnership.kudNames` dari lapisan konten.
 */
export async function getActiveKudNames(): Promise<ReadonlyArray<string>> {
  if (env.demoMode) return [];

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("kud")
      .select("name, slug")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error !== null || data === null) return [];

    const known = new Set(demoKudSlugs);
    return data.filter((row) => known.has(row.slug)).map((row) => row.name);
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Tulis enam seksi dan dua blok**

`apps/web/components/sections/hero.tsx` (sumber naskah: `Docs/stitch/code.html` baris 3–75):

```tsx
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CaptionNote } from "@/components/ui/caption-note";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Hero(): Promise<ReactNode> {
  return (
    <Section id="hero" tone="surface">
      <Container>
        <p className="flex items-center gap-xs rounded-lg bg-amber-soft p-md type-caption text-amber-ink">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} />
          {copy.hero.badge}
        </p>
        <h1 className="mt-xl type-display-xl text-ink">{copy.hero.title}</h1>
        <p className="mt-md type-body-lg text-text-secondary">{copy.hero.subtitle}</p>
        <div className="mt-xl flex flex-wrap gap-sm">
          <ButtonLink href="#form-sampel" size="lg" variant="accent">
            {copy.hero.ctaPrimary}
          </ButtonLink>
          <ButtonLink href="#formulasi" size="lg" variant="secondary">
            {copy.hero.ctaSecondary}
          </ButtonLink>
        </div>
        <div className="mt-2xl grid gap-md sm:grid-cols-2">
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.priceAnchorLabel}</p>
            <p className="type-metric-md text-primary">{copy.hero.priceAnchorValue}</p>
          </div>
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.priceCompareLabel}</p>
            <p className="type-metric-md text-text-secondary">{copy.hero.priceCompareValue}</p>
          </div>
        </div>
        <CaptionNote>{copy.hero.priceCaption}</CaptionNote>
      </Container>
    </Section>
  );
}
```

`apps/web/components/sections/problem.tsx` (baris 76–146):

```tsx
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Problem(): Promise<ReactNode> {
  return (
    <Section id="tantangan" tone="surface">
      <Container>
        <h2 className="type-h2 text-ink">{copy.problem.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.problem.intro}</p>
        <ul className="mt-xl grid gap-md md:grid-cols-3">
          {copy.problem.items.map((item) => (
            <li key={item.title}>
              <Card tone="paper">
                <p className="type-metric-md text-primary">{item.metric}</p>
                <h3 className="mt-xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
                <CaptionNote>{item.caption}</CaptionNote>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

`apps/web/components/sections/solution.tsx` (baris 147–216):

```tsx
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Solution(): Promise<ReactNode> {
  return (
    <Section id="solusi" tone="cream">
      <Container>
        <h2 className="type-h2 text-ink">{copy.solution.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.solution.intro}</p>
        <ul className="mt-xl grid gap-md md:grid-cols-3">
          {copy.solution.pillars.map((pillar) => (
            <li key={pillar.title}>
              <Card tone="surface">
                <h3 className="type-h3 text-ink">{pillar.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{pillar.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

`apps/web/components/blocks/composition-bar.tsx`:

```tsx
import type { ReactNode } from "react";
import type { DemoIngredient } from "@/lib/data/demo-data";

export interface CompositionBarProps {
  ingredients: ReadonlyArray<DemoIngredient>;
}

/** Batang komposisi proporsional; nilai selalu tampil sebagai teks, bukan hanya warna. */
export function CompositionBar({ ingredients }: CompositionBarProps): ReactNode {
  const total = ingredients.reduce((sum, item) => sum + (item.shareMinPct + item.shareMaxPct) / 2, 0);

  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-pill border border-border">
        {ingredients.map((item, index) => {
          const share = (item.shareMinPct + item.shareMaxPct) / 2;
          const width = total > 0 ? (share / total) * 100 : 0;
          return (
            <span
              aria-hidden="true"
              className={index % 2 === 0 ? "bg-primary" : "bg-accent"}
              key={item.name}
              style={{ width: `${width.toFixed(2)}%` }}
            />
          );
        })}
      </div>
      <dl className="mt-md grid gap-xs sm:grid-cols-2">
        {ingredients.map((item, index) => (
          <div className="flex items-center gap-xs" key={item.name}>
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-xs ${index % 2 === 0 ? "bg-primary" : "bg-accent"}`}
            />
            <dt className="type-body-sm text-text">{item.name}</dt>
            <dd className="type-mono-data text-text-secondary">
              {item.shareMinPct}–{item.shareMaxPct}%
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

`apps/web/components/sections/product.tsx` (baris 217–352):

```tsx
import type { ReactNode } from "react";
import { CompositionBar } from "@/components/blocks/composition-bar";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { formatIdr } from "@/lib/utils/format";

export async function Product(): Promise<ReactNode> {
  const { product, ingredients } = await getPrimaryProduct();

  return (
    <Section id="formulasi" tone="cream">
      <Container>
        <h2 className="type-h2 text-ink">{copy.product.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.product.intro}</p>
        <div className="mt-xl grid gap-xl md:grid-cols-2">
          <div>
            <h3 className="type-h3 text-ink">{copy.product.compositionTitle}</h3>
            <CompositionBar ingredients={ingredients} />
            <CaptionNote>{copy.product.compositionCaption}</CaptionNote>
          </div>
          <div>
            <h3 className="type-h3 text-ink">{copy.product.specTitle}</h3>
            <p className="mt-md type-metric-md text-primary">{formatIdr(product.priceIdr)}</p>
            <dl className="mt-md divide-y divide-border">
              {copy.product.specs.map((spec) => (
                <div className="flex justify-between gap-md py-sm" key={spec.label}>
                  <dt className="type-body-sm text-text-secondary">{spec.label}</dt>
                  <dd className="type-body-sm text-text">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.product.transitionTitle}</h3>
          <ol className="mt-md grid gap-sm md:grid-cols-4">
            {copy.product.transitionSteps.map((step, index) => (
              <li className="rounded-md bg-surface p-md type-body-sm text-text" key={step}>
                <span className="type-mono-data text-primary">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-2xs">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
```

`apps/web/components/sections/cost-compare.tsx` (baris 353–414):

```tsx
import type { ReactNode } from "react";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function CostCompare(): Promise<ReactNode> {
  return (
    <Section id="penghematan" tone="surface">
      <Container>
        <h2 className="type-h2 text-ink">{copy.costCompare.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.costCompare.intro}</p>
        <div className="mt-xl overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <caption className="sr-only">{copy.costCompare.title}</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="py-sm type-label-md text-text-secondary" scope="col">
                  {copy.costCompare.tableHead.criteria}
                </th>
                <th className="py-sm type-label-md text-primary" scope="col">
                  {copy.costCompare.tableHead.recob}
                </th>
                <th className="py-sm type-label-md text-text-secondary" scope="col">
                  {copy.costCompare.tableHead.conventional}
                </th>
              </tr>
            </thead>
            <tbody>
              {copy.costCompare.rows.map((row) => (
                <tr className="border-b border-border" key={row.criteria}>
                  <th className="py-sm type-body-sm text-text" scope="row">
                    {row.criteria}
                  </th>
                  <td className="py-sm type-body-sm text-text">{row.recob}</td>
                  <td className="py-sm type-body-sm text-text-secondary">{row.conventional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.costCompare.assumptionTitle}</h3>
          <ul className="mt-md list-disc space-y-xs pl-lg type-body-sm text-text-secondary">
            {copy.costCompare.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
          <CaptionNote>{copy.costCompare.closing}</CaptionNote>
        </div>
      </Container>
    </Section>
  );
}
```

`apps/web/components/blocks/metric-panel.tsx`:

```tsx
import type { ReactNode } from "react";
import { MetricValue } from "@/components/ui/metric";
import type { DemoMetric } from "@/lib/data/demo-data";
import { formatMetricValue } from "@/lib/utils/format";

export interface MetricPanelProps {
  metrics: ReadonlyArray<DemoMetric>;
}

/**
 * Setiap metrik wajib tampil bersama periode dan caption sumbernya (PRD Bagian 8).
 * Panel tidak menampilkan metrik tanpa referensi.
 */
export function MetricPanel({ metrics }: MetricPanelProps): ReactNode {
  const publishable = metrics.filter((metric) => metric.references.length > 0);

  return (
    <ul className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
      {publishable.map((metric) => (
        <li key={metric.code}>
          <MetricValue
            caption={metric.references.map((reference) => reference.citationLabel).join("; ")}
            period={metric.periodLabel}
            tone="dark"
            unit={metric.unit}
            value={formatMetricValue(metric.valueNumeric, metric.unit)}
          />
          <p className="mt-xs type-body-sm text-surface/85">{metric.label}</p>
          {metric.references.some((reference) => reference.assumptionNote.length > 0) ? (
            <p className="mt-2xs type-caption text-surface/70">
              {metric.references
                .map((reference) => reference.assumptionNote)
                .filter((note) => note.length > 0)
                .join(" ")}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
```

`apps/web/components/sections/impact.tsx` (baris 415–500):

```tsx
import type { ReactNode } from "react";
import { MetricPanel } from "@/components/blocks/metric-panel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPublicMetrics } from "@/lib/data/impact";

export async function Impact(): Promise<ReactNode> {
  const metrics = await getPublicMetrics();

  return (
    <Section id="dampak" tone="ink">
      <Container>
        <Badge tone="warn">{copy.impact.demoBadge}</Badge>
        <h2 className="mt-md type-h2 text-surface">{copy.impact.title}</h2>
        <p className="mt-md type-body-md text-surface/85">{copy.impact.intro}</p>
        <div className="mt-xl">
          <MetricPanel metrics={metrics} />
        </div>
        <div className="mt-xl">
          <Alert>{copy.impact.withheldTitle}</Alert>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Ganti `app/page.tsx` dan perbarui metadata `layout.tsx`**

`apps/web/app/page.tsx` (seksi 7–12 ditambahkan pada Task 12):

```tsx
import type { ReactNode } from "react";
import { CostCompare } from "@/components/sections/cost-compare";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Problem } from "@/components/sections/problem";
import { Product } from "@/components/sections/product";
import { Solution } from "@/components/sections/solution";

export default function HomePage(): ReactNode {
  return (
    <main id="konten">
      <Hero />
      <Problem />
      <Solution />
      <Product />
      <CostCompare />
      <Impact />
    </main>
  );
}
```

Pada `apps/web/app/layout.tsx`, ganti objek `metadata` literal dari Task 4 dengan:

```tsx
import { copy } from "@/content/copy";

export const metadata: Metadata = {
  title: copy.meta.title,
  description: copy.meta.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};
```

- [ ] **Step 6: Jalankan tes, typecheck, lint, dan build**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/web
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
npm run build --workspace @recobid/web
```

Expected: seluruh tes PASS; typecheck, lint, dan build bersih. Bila `formatMetricValue` belum ada,
tambahkan ke `lib/utils/format.ts` (Task 4) dengan tanda tangan
`formatMetricValue(value: number, unit: DemoMetric["unit"]): string` — jangan menulis pemformatan
angka di dalam komponen.

- [ ] **Step 7: Verifikasi render tanpa JavaScript**

Run:

```bash
curl -s http://localhost:3000 | grep -c "type-h2"
```

Expected: angka ≥ 5 (lima seksi dengan `h2`). Teks seksi terlihat pada HTML mentah, membuktikan
render server-side.

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/sections apps/web/components/blocks apps/web/lib/data/kud.ts \
        apps/web/lib/utils/format.ts apps/web/app/page.tsx apps/web/app/layout.tsx \
        apps/web/tests/unit/sections-top.test.tsx
git commit -m "feat(web): beranda seksi 1-6 (hero, tantangan, solusi, formulasi, penghematan, dampak)"
```

---

## Task 12: Beranda bagian bawah — seksi 7–12, formulir, dan bilah lengket

**Files:**
- Create: `apps/web/components/sections/{partnership,validation,education,faq,cta,footer}.tsx`
- Create: `apps/web/components/blocks/{kud-flow,faq-accordion,sample-form,sticky-cta}.tsx`
- Modify: `apps/web/app/page.tsx` (susunan 12 seksi lengkap)
- Test: `apps/web/tests/unit/sections-bottom.test.tsx`

**Interfaces:**
- Consumes: `copy` (Task 9), `ui/*` (Task 10), `getActiveKudNames()` (Task 11), `getRegions()` (Task 8),
  `submitLeadInput` (Task 5).
- Produces (nama eksak untuk Task 13):
  - `Partnership`, `Validation`, `Education`, `Faq`, `Cta`, `Footer` — Server Component tanpa props.
  - `KudFlow({ names })`, `FaqAccordion({ items })` (`"use client"`), `StickyCta()` (`"use client"`),
    `SampleForm({ regions })` (`"use client"`).
  - `Cta` adalah pemanggil `getRegions()`; `SampleForm` **tidak** memanggil data (hanya menerima props).

**Pulau klien pada Siklus A berjumlah tiga:** `FaqAccordion`, `SampleForm`, `StickyCta`. Spec
(`Docs/specs/...md` Bagian 5) menyebut batas **maksimum** empat, sehingga tiga memenuhi batas itu.
Animasi hitung-naik metrik sengaja **tidak** dibuat pada Siklus A: nilainya kecil (efek kosmetik),
sementara risikonya nyata (gerak berlebih, `prefers-reduced-motion`, angka tidak terbaca sebelum
animasi selesai). Bila pemilik produk tetap menginginkannya, tambahkan sebagai task tersendiri di
Siklus C bersama audit aksesibilitas, bukan diselipkan di sini.

- [ ] **Step 1: Tulis pengujian render yang gagal**

`apps/web/tests/unit/sections-bottom.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { Education } from "@/components/sections/education";
import { Footer } from "@/components/sections/footer";
import { Partnership } from "@/components/sections/partnership";
import { Validation } from "@/components/sections/validation";

describe("seksi beranda bagian bawah", () => {
  it("seksi kemitraan menampilkan langkah dan daftar KUD dari konten", async () => {
    render(await Partnership());
    for (const step of copy.partnership.steps) {
      expect(screen.getByText(step.title)).toBeTruthy();
    }
    for (const name of copy.partnership.kudNames) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it("seksi kendali mutu menyatakan status NPP dan catatan klaim", async () => {
    render(await Validation());
    expect(screen.getByText(copy.validation.nppStatus)).toBeTruthy();
    expect(screen.getByText(copy.validation.claimNotice)).toBeTruthy();
  });

  it("seksi edukasi menampilkan setiap kartu", async () => {
    render(await Education());
    for (const item of copy.education.items) {
      expect(screen.getByText(item.title)).toBeTruthy();
    }
  });

  it("footer memuat catatan kontak belum final", async () => {
    render(await Footer());
    expect(screen.getByText(copy.footer.contactNotice)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — modul `@/components/sections/partnership` dan lainnya belum ada.

- [ ] **Step 3: Tulis `kud-flow` dan dua seksi**

`apps/web/components/blocks/kud-flow.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

export interface KudFlowProps {
  names: ReadonlyArray<string>;
}

/** Rantai pasok empat simpul; nama KUD ditampilkan bila sudah ada mitra aktif. */
export function KudFlow({ names }: KudFlowProps): ReactNode {
  const stages = [
    "Limbah bonggol jagung",
    "Fermentasi terkendali",
    "Pelet konsentrat",
    "Kandang anggota KUD",
  ];

  return (
    <div>
      <ol className="flex flex-wrap items-center gap-xs">
        {stages.map((stage, index) => (
          <li className="flex items-center gap-xs" key={stage}>
            <span className="rounded-md bg-surface px-md py-xs type-body-sm text-text">{stage}</span>
            {index < stages.length - 1 ? (
              <ArrowRight aria-hidden="true" className="text-text-secondary" size={18} strokeWidth={1.75} />
            ) : null}
          </li>
        ))}
      </ol>
      {names.length > 0 ? (
        <ul className="mt-md flex flex-wrap gap-xs">
          {names.map((name) => (
            <li className="rounded-pill bg-primary-soft px-sm py-2xs type-caption text-primary" key={name}>
              {name}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
```

`apps/web/components/sections/partnership.tsx` (baris 501–564):

```tsx
import type { ReactNode } from "react";
import { KudFlow } from "@/components/blocks/kud-flow";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getActiveKudNames } from "@/lib/data/kud";

export async function Partnership(): Promise<ReactNode> {
  const activeNames = await getActiveKudNames();
  const names = activeNames.length > 0 ? activeNames : copy.partnership.kudNames;

  return (
    <Section id="kemitraan" tone="paper">
      <Container>
        <h2 className="type-h2 text-ink">{copy.partnership.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.partnership.intro}</p>
        <div className="mt-xl">
          <KudFlow names={names} />
        </div>
        <ol className="mt-xl grid gap-md md:grid-cols-4">
          {copy.partnership.steps.map((step, index) => (
            <li key={step.title}>
              <Card tone="surface">
                <span className="type-mono-data text-primary">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2xs type-h3 text-ink">{step.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.partnership.kudTitle}</h3>
          <p className="mt-xs type-body-sm text-text-secondary">{copy.partnership.kudNote}</p>
        </div>
      </Container>
    </Section>
  );
}
```

`apps/web/components/sections/validation.tsx` (baris 565–646):

```tsx
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Validation(): Promise<ReactNode> {
  return (
    <Section id="mutu" tone="paper">
      <Container>
        <h2 className="type-h2 text-ink">{copy.validation.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.validation.intro}</p>
        <ul className="mt-xl grid gap-md md:grid-cols-3">
          {copy.validation.qcItems.map((item) => (
            <li key={item.title}>
              <Card tone="surface">
                <h3 className="type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.validation.citationTitle}</h3>
          <ul className="mt-sm list-disc space-y-xs pl-lg type-body-sm text-text-secondary">
            {copy.validation.citations.map((citation) => (
              <li key={citation}>{citation}</li>
            ))}
          </ul>
        </div>
        <dl className="mt-xl">
          <dt className="type-caption text-text-secondary">{copy.validation.nppLabel}</dt>
          <dd className="type-body-md text-ink">{copy.validation.nppStatus}</dd>
        </dl>
        <div className="mt-lg">
          <Alert>{copy.validation.claimNotice}</Alert>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Tulis `education`, akordeon FAQ, dan `faq`**

`apps/web/components/sections/education.tsx` (baris 647–706):

```tsx
import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Education(): Promise<ReactNode> {
  return (
    <Section id="edukasi" tone="surface">
      <Container>
        <h2 className="type-h2 text-ink">{copy.education.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.education.intro}</p>
        <ul className="mt-xl grid gap-md md:grid-cols-2">
          {copy.education.items.map((item) => (
            <li key={item.title}>
              <Card tone="paper">
                <h3 className="type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

`apps/web/components/blocks/faq-accordion.tsx`:

```tsx
"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
}

/**
 * Akordeon berbasis <details>/<summary> agar isi tetap terbaca tanpa JavaScript.
 * Elemen dibiarkan tidak terkendali (uncontrolled); state hanya memutar ikon.
 */
export function FaqAccordion({ items }: FaqAccordionProps): ReactNode {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <details
            className="p-lg"
            defaultOpen={index === 0}
            key={item.question}
            onToggle={(event) => {
              setOpenIndex(event.currentTarget.open ? index : null);
            }}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-md type-h3 text-ink">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
                size={20}
                strokeWidth={1.75}
              />
            </summary>
            <p className="mt-sm type-body-md text-text-secondary">{item.answer}</p>
          </details>
        );
      })}
    </div>
  );
}
```

`apps/web/components/sections/faq.tsx` (baris 707–804):

```tsx
import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/blocks/faq-accordion";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Faq(): Promise<ReactNode> {
  return (
    <Section id="faq" tone="surface">
      <Container>
        <h2 className="type-h2 text-ink">{copy.faq.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.faq.intro}</p>
        <div className="mt-xl">
          <FaqAccordion items={copy.faq.items} />
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 5: Tulis formulir sampel, seksi CTA, bilah lengket, dan footer**

`apps/web/components/blocks/sample-form.tsx` (baris 805–913). Formulir mengirim ke Server Action
Task 13 lewat impor dinamis, sehingga validasi klien dan validasi server memakai skema Zod yang sama:

```tsx
"use client";

import { submitLeadInput, type SubmitLeadInput } from "@recobid/shared/contracts/lead";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { copy } from "@/content/copy";
import type { RegionOption } from "@/lib/data/regions";

export interface SampleFormProps {
  regions: ReadonlyArray<RegionOption>;
}

type FormState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; duplicate: boolean }
  | { kind: "error"; message: string };

export function SampleForm({ regions }: SampleFormProps): ReactNode {
  const [state, setState] = useState<FormState>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(formData: FormData): Promise<void> {
    const candidate: SubmitLeadInput = {
      fullName: String(formData.get("fullName") ?? ""),
      phoneWa: String(formData.get("phoneWa") ?? ""),
      cattleCount: Number(formData.get("cattleCount") ?? 0),
      regionCode: String(formData.get("regionCode") ?? ""),
      kudSlug: String(formData.get("kudSlug") ?? "") || null,
      message: String(formData.get("message") ?? "") || null,
      source: "web",
      utm: null,
      idempotencyKey: crypto.randomUUID(),
    };

    const parsed = submitLeadInput.safeParse(candidate);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        errors[String(issue.path[0] ?? "generic")] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setState({ kind: "submitting" });

    const { submitLeadAction } = await import("@/app/actions/submit-lead");
    const result = await submitLeadAction({ ...parsed.data, companyWebsite: String(formData.get("companyWebsite") ?? "") });

    if (result.status === "created" || result.status === "duplicate") {
      setState({ kind: "success", duplicate: result.status === "duplicate" });
      return;
    }

    setState({
      kind: "error",
      message:
        result.status === "rate_limited"
          ? copy.cta.form.rateLimitBody
          : result.status === "invalid"
            ? copy.cta.form.errorBody
            : copy.cta.form.demoModeBody,
    });
  }

  if (state.kind === "success") {
    return (
      <div className="rounded-lg border border-border bg-surface p-xl" role="status">
        <Badge tone="primary">
          {state.duplicate ? copy.cta.form.duplicateTitle : copy.cta.form.successTitle}
        </Badge>
        <p className="mt-md type-body-md text-text-secondary">
          {state.duplicate ? copy.cta.form.duplicateBody : copy.cta.form.successBody}
        </p>
        <p className="mt-xs type-body-sm text-text-secondary">{copy.cta.form.successNextStep}</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="grid gap-md rounded-lg border border-border bg-surface p-xl" noValidate>
      <div>
        <Label htmlFor="fullName" required>
          {copy.cta.form.nameLabel}
        </Label>
        <Input
          autoComplete="name"
          id="fullName"
          invalid={fieldErrors.fullName !== undefined}
          name="fullName"
          placeholder={copy.cta.form.namePlaceholder}
        />
        {fieldErrors.fullName !== undefined ? <FieldError>{fieldErrors.fullName}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="phoneWa" required>
          {copy.cta.form.phoneLabel}
        </Label>
        <Input
          autoComplete="tel"
          id="phoneWa"
          inputMode="tel"
          invalid={fieldErrors.phoneWa !== undefined}
          name="phoneWa"
          placeholder={copy.cta.form.phonePlaceholder}
        />
        <p className="mt-2xs type-caption text-text-secondary">{copy.cta.form.phoneHint}</p>
        {fieldErrors.phoneWa !== undefined ? <FieldError>{fieldErrors.phoneWa}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="cattleCount" required>
          {copy.cta.form.cattleLabel}
        </Label>
        <Input
          id="cattleCount"
          inputMode="numeric"
          invalid={fieldErrors.cattleCount !== undefined}
          name="cattleCount"
          placeholder={copy.cta.form.cattlePlaceholder}
          type="number"
        />
        {fieldErrors.cattleCount !== undefined ? <FieldError>{fieldErrors.cattleCount}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="regionCode" required>
          {copy.cta.form.regionLabel}
        </Label>
        <select
          className="h-12 w-full rounded-sm border border-text-secondary bg-surface px-md type-body-md text-ink"
          defaultValue=""
          id="regionCode"
          name="regionCode"
        >
          <option disabled value="">
            {copy.cta.form.regionPlaceholder}
          </option>
          {regions.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name}
            </option>
          ))}
        </select>
        {fieldErrors.regionCode !== undefined ? <FieldError>{fieldErrors.regionCode}</FieldError> : null}
      </div>

      <div>
        <Label htmlFor="kudSlug">{copy.cta.form.kudLabel}</Label>
        <Input id="kudSlug" name="kudSlug" placeholder={copy.cta.form.kudOptional} />
      </div>

      <div>
        <Label htmlFor="message">{copy.cta.form.messageLabel}</Label>
        <textarea
          className="min-h-24 w-full rounded-sm border border-text-secondary bg-surface p-md type-body-md text-ink"
          id="message"
          name="message"
          placeholder={copy.cta.form.messagePlaceholder}
        />
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="companyWebsite">{copy.cta.form.honeypotLabel}</label>
        <input autoComplete="off" id="companyWebsite" name="companyWebsite" tabIndex={-1} type="text" />
      </div>

      <div className="flex items-start gap-xs">
        <input id="consent" name="consent" type="checkbox" value="true" />
        <Label htmlFor="consent">{copy.cta.form.consentLabel}</Label>
      </div>
      {fieldErrors.consent !== undefined ? <FieldError>{fieldErrors.consent}</FieldError> : null}

      {state.kind === "error" ? <FieldError>{state.message}</FieldError> : null}

      <Button disabled={state.kind === "submitting"} size="lg" type="submit" variant="accent">
        {state.kind === "submitting" ? copy.cta.form.submittingLabel : copy.cta.form.submitLabel}
      </Button>

      {state.kind === "error" ? (
        <ButtonLink href="/kontak" variant="ghost">
          {copy.cta.form.whatsappCta}
        </ButtonLink>
      ) : null}
    </form>
  );
}
```

Catatan kontrak: `submitLeadAction` menerima `SubmitLeadInput` **plus** `companyWebsite` (honeypot).
Bentuk persis nilai kembaliannya ada di Task 13:
`{ status: "created" | "duplicate" } | { status: "rate_limited" } | { status: "invalid" } | { status: "unavailable" }`.

`apps/web/components/sections/cta.tsx` (baris 805–913):

```tsx
import type { ReactNode } from "react";
import { SampleForm } from "@/components/blocks/sample-form";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getRegions } from "@/lib/data/regions";

export async function Cta(): Promise<ReactNode> {
  const regions = await getRegions();

  return (
    <Section id="form-sampel" tone="cream">
      <Container>
        <h2 className="type-h2 text-ink">{copy.cta.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.cta.intro}</p>
        <div className="mt-xl max-w-[720px]">
          <SampleForm regions={regions} />
        </div>
      </Container>
    </Section>
  );
}
```

`apps/web/components/blocks/sticky-cta.tsx` (pulau klien; hanya tampil di layar kecil):

```tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { copy } from "@/content/copy";

/** Bilah ajakan lengket untuk layar kecil; muncul setelah pengguna melewati hero. */
export function StickyCta(): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setVisible(window.scrollY > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-md transition-transform md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-xs">
        <ButtonLink className="flex-1" href="#form-sampel" variant="accent">
          {copy.cta.sticky.ctaLabel}
        </ButtonLink>
        <ButtonLink className="flex-1" href="/kontak" variant="secondary">
          {copy.cta.sticky.whatsappLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
```

`apps/web/components/sections/footer.tsx` (baris 914–915):

```tsx
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";

export async function Footer(): Promise<ReactNode> {
  const links = [
    { href: "/produk", label: copy.footer.nav.product },
    { href: "/dampak", label: copy.footer.nav.impact },
    { href: "/mitra", label: copy.footer.nav.partnership },
    { href: "/edukasi", label: copy.footer.nav.education },
    { href: "/kontak", label: copy.footer.nav.contact },
  ];

  return (
    <footer className="bg-ink-deep py-2xl text-surface">
      <Container>
        <p className="type-body-md text-surface/90">{copy.footer.tagline}</p>
        <nav aria-label={copy.footer.companyTitle} className="mt-lg">
          <ul className="flex flex-wrap gap-md">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  className="type-body-sm text-surface/85 underline-offset-4 hover:underline"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-lg grid gap-md md:grid-cols-2">
          <p className="type-body-sm text-surface/85">{copy.footer.address}</p>
          <p className="type-body-sm text-surface/85">{copy.footer.nppStatus}</p>
        </div>
        <p className="mt-lg type-caption text-surface/70">{copy.footer.contactNotice}</p>
        <p className="mt-xs type-caption text-surface/70">{copy.footer.copyright}</p>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 6: Susun 12 seksi lengkap di `app/page.tsx`**

```tsx
import type { ReactNode } from "react";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { CostCompare } from "@/components/sections/cost-compare";
import { Cta } from "@/components/sections/cta";
import { Education } from "@/components/sections/education";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Impact } from "@/components/sections/impact";
import { Partnership } from "@/components/sections/partnership";
import { Problem } from "@/components/sections/problem";
import { Product } from "@/components/sections/product";
import { Solution } from "@/components/sections/solution";
import { Validation } from "@/components/sections/validation";

export default function HomePage(): ReactNode {
  return (
    <>
      <main id="konten">
        <Hero />
        <Problem />
        <Solution />
        <Product />
        <CostCompare />
        <Impact />
        <Partnership />
        <Validation />
        <Education />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <StickyCta />
    </>
  );
}
```

- [ ] **Step 7: Jalankan tes, typecheck, lint, dan build**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/web
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
npm run build --workspace @recobid/web
```

Expected: seluruh tes PASS; typecheck bersih setelah Task 13 menulis `app/actions/submit-lead.ts`.
Urutan wajib: kerjakan Task 13 segera setelah task ini pada sesi yang sama.

- [ ] **Step 8: Commit**

```bash
git add apps/web/components/sections apps/web/components/blocks apps/web/app/page.tsx \
        apps/web/tests/unit/sections-bottom.test.tsx
git commit -m "feat(web): beranda seksi 7-12 (kemitraan, mutu, edukasi, FAQ, formulir, footer) + bilah lengket"
```

---

## Task 13: Formulir ke basis data — Server Action, fallback `/api/lead`, funnel, dan `/api/health`

**Files:**
- Create: `apps/web/app/actions/submit-lead.ts`, `apps/web/app/actions/track-event.ts`
- Create: `apps/web/app/api/lead/route.ts`, `apps/web/app/api/health/route.ts`
- Create: `apps/web/lib/analytics.ts`
- Test: `apps/web/tests/unit/submit-lead-action.test.ts`, `apps/web/tests/unit/health.test.ts`

**Interfaces:**
- Consumes: `submitLeadInput` (Task 5), `submitLead()` (Task 8), `checkRateLimit()`, `logInfo()`,
  `logError()`, `fetchWithTimeout()` (Task 8), `env` (Task 8).
- Produces (nama eksak yang dipakai `SampleForm` Task 12):
  - `submitLeadAction(input: SubmitLeadInput & { companyWebsite: string }): Promise<SubmitLeadActionResult>`
    dengan `type SubmitLeadActionResult = { status: "created" | "duplicate" } | { status: "rate_limited" } | { status: "invalid" } | { status: "unavailable" }`
  - `POST /api/lead` — jalur cadangan bila Server Action tidak dapat dijangkau; menerima JSON
    `SubmitLeadInput`, mengembalikan `200 {status}` / `400` / `429` / `503`.
  - `GET /api/health` — `200 {db:"ok"}` / `503 {db:"down"}`.
  - `trackEvent(name: FunnelEventName, payload?): void` di `lib/analytics.ts`.

- [ ] **Step 1: Tulis pengujian yang gagal**

`apps/web/tests/unit/submit-lead-action.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";

const submitLead = vi.fn();
const checkRateLimit = vi.fn();
const logInfo = vi.fn();
const logError = vi.fn();

vi.mock("@/lib/data/leads", () => ({ submitLead }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));
vi.mock("@/lib/logging", () => ({ logInfo, logError }));

const { submitLeadAction } = await import("@/app/actions/submit-lead");

const valid = {
  fullName: "Budi Santoso",
  phoneWa: "081234567890",
  cattleCount: 4,
  regionCode: "jabar" as const,
  kudSlug: null,
  message: null,
  source: "web" as const,
  utm: null,
  idempotencyKey: "0123456789abcdef",
  companyWebsite: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockReturnValue({ allowed: true, remaining: 4 });
});

describe("submitLeadAction", () => {
  it("menolak input tidak valid sebelum menyentuh basis data", async () => {
    const result = await submitLeadAction({ ...valid, phoneWa: "123" });
    expect(result.status).toBe("invalid");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("menolak saat honeypot terisi", async () => {
    const result = await submitLeadAction({ ...valid, companyWebsite: "http://spam.example" });
    expect(result.status).toBe("invalid");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("mengembalikan rate_limited tanpa memanggil basis data", async () => {
    checkRateLimit.mockReturnValue({ allowed: false, remaining: 0 });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("rate_limited");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("meneruskan lead yang sah dan melaporkan created", async () => {
    submitLead.mockResolvedValue({ status: "created", leadId: "11111111-1111-1111-1111-111111111111" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("created");
    expect(submitLead).toHaveBeenCalledWith(expect.objectContaining({ phoneWa: "081234567890" }));
    expect(logInfo).toHaveBeenCalled();
  });

  it("melaporkan duplicate sebagai sukses idempoten", async () => {
    submitLead.mockResolvedValue({ status: "duplicate", leadId: "11111111-1111-1111-1111-111111111111" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("duplicate");
  });

  it("melaporkan unavailable bila basis data tidak menjawab", async () => {
    submitLead.mockResolvedValue({ status: "error", code: "unavailable" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("unavailable");
    expect(logError).toHaveBeenCalled();
  });
});
```

`apps/web/tests/unit/health.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [{ code: "jabar" }], error: null }),
      }),
    }),
  }),
}));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  it("mengembalikan 200 dengan status ok saat basis data menjawab", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ db: "ok" });
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/web`
Expected: FAIL — `@/app/actions/submit-lead` dan `@/app/api/health/route` belum ada.

- [ ] **Step 3: Tulis `lib/analytics.ts`**

```ts
import type { FunnelEventName } from "@recobid/shared/constants/funnel-events";

export interface FunnelPayload {
  readonly regionCode?: string;
  readonly leadId?: string;
}

/**
 * Funnel internal memakai Vercel Analytics pada klien dan `lead_event` di basis data.
 * Fungsi ini sengaja hanya menulis ke konsol terstruktur pada server: tidak ada
 * penyimpanan di sisi peramban (tanpa cookie pihak ketiga, Docs/PRD.md Bagian 9).
 */
export function trackEvent(name: FunnelEventName, payload: FunnelPayload = {}): void {
  const line = JSON.stringify({ event: name, ...payload });
  if (typeof window === "undefined") {
    process.stdout.write(`${line}\n`);
  }
}
```

- [ ] **Step 4: Tulis Server Action `submit-lead`**

`apps/web/app/actions/submit-lead.ts`:

```ts
"use server";

import { headers } from "next/headers";
import { submitLeadInput, type SubmitLeadInput } from "@recobid/shared/contracts/lead";
import { submitLead } from "@/lib/data/leads";
import { logError, logInfo } from "@/lib/logging";
import { checkRateLimit } from "@/lib/rate-limit";

export type SubmitLeadActionResult =
  | { status: "created" | "duplicate" }
  | { status: "rate_limited" }
  | { status: "invalid" }
  | { status: "unavailable" };

export type SubmitLeadActionInput = SubmitLeadInput & { readonly companyWebsite: string };

function clientKey(headerList: Headers): string {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded !== null && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return headerList.get("x-real-ip") ?? "unknown";
}

export async function submitLeadAction(input: SubmitLeadActionInput): Promise<SubmitLeadActionResult> {
  const startedAt = Date.now();
  const requestId = crypto.randomUUID();

  // Honeypot: bot mengisi kolom tersembunyi. Balasan sama dengan sukses agar tidak membocorkan.
  if (input.companyWebsite.trim().length > 0) {
    logInfo("lead_honeypot", { request_id: requestId });
    return { status: "invalid" };
  }

  const parsed = submitLeadInput.safeParse(input);
  if (!parsed.success) {
    logInfo("lead_invalid", {
      request_id: requestId,
      issues: parsed.error.issues.map((issue) => issue.path.join(".")),
    });
    return { status: "invalid" };
  }

  const headerList = await headers();
  const limit = checkRateLimit(clientKey(headerList));
  if (!limit.allowed) {
    logInfo("lead_rate_limited", { request_id: requestId, path: "/" });
    return { status: "rate_limited" };
  }

  const result = await submitLead(parsed.data);
  const durationMs = Date.now() - startedAt;

  if (result.status === "error") {
    logError("lead_failed", { request_id: requestId, code: result.code, duration_ms: durationMs });
    return { status: "unavailable" };
  }

  logInfo("lead_accepted", {
    request_id: requestId,
    status: result.status,
    region: parsed.data.regionCode,
    duration_ms: durationMs,
  });

  if (result.status === "created") {
    void notifyLead(requestId, result.leadId, parsed.data);
  }

  return { status: result.status };
}

/**
 * Notifikasi ke Edge Function bersifat fire-and-forget: kegagalan notifikasi tidak
 * pernah menggagalkan penerimaan lead (spec ADR-016).
 */
async function notifyLead(
  requestId: string,
  leadId: string,
  input: SubmitLeadInput,
): Promise<void> {
  const { env } = await import("@/lib/env");
  const { fetchWithTimeout } = await import("@/lib/http");
  if (env.notifyHookUrl === null || env.notifyHookSecret === null) return;

  try {
    const body = JSON.stringify({ leadId, regionCode: input.regionCode });
    const signature = await signBody(body, env.notifyHookSecret);
    const response = await fetchWithTimeout(
      env.notifyHookUrl,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-recbob-signature": signature,
        },
        body,
      },
      2_000,
    );
    if (!response.ok) {
      logError("notify_failed", { request_id: requestId, status: response.status });
    }
  } catch (error) {
    logError("notify_failed", {
      request_id: requestId,
      reason: error instanceof Error ? error.message : "unknown",
    });
  }
}

async function signBody(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
```

- [ ] **Step 5: Tulis `track-event`, `/api/lead`, dan `/api/health`**

`apps/web/app/actions/track-event.ts`:

```ts
"use server";

import { trackEventInput, type TrackEventInput } from "@recobid/shared/contracts/events";
import { trackEvent } from "@/lib/analytics";

/**
 * Funnel sisi server. Penulisan ke `lead_event` untuk kunjungan halaman ditangani
 * Vercel Analytics; aksi ini hanya mencatat peristiwa funnel yang dikirim klien.
 */
export async function trackEventAction(input: TrackEventInput): Promise<{ ok: boolean }> {
  const parsed = trackEventInput.safeParse(input);
  if (!parsed.success) return { ok: false };
  trackEvent(parsed.data.name, { regionCode: parsed.data.regionCode });
  return { ok: true };
}
```

`apps/web/app/api/lead/route.ts` (jalur cadangan; kontrak sama dengan Server Action):

```ts
import { NextResponse, type NextRequest } from "next/server";
import { submitLeadInput } from "@recobid/shared/contracts/lead";
import { submitLead } from "@/lib/data/leads";
import { logError, logInfo } from "@/lib/logging";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const forwarded = request.headers.get("x-forwarded-for");
  const key = forwarded !== null && forwarded.length > 0 ? (forwarded.split(",")[0]?.trim() ?? "unknown") : "unknown";
  const limit = checkRateLimit(key);
  if (!limit.allowed) {
    return NextResponse.json({ status: "rate_limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const parsed = submitLeadInput.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ status: "invalid" }, { status: 400 });
  }

  const result = await submitLead(parsed.data);
  if (result.status === "error") {
    logError("lead_api_failed", { code: result.code });
    return NextResponse.json({ status: "unavailable" }, { status: 503 });
  }

  logInfo("lead_api_accepted", { status: result.status, region: parsed.data.regionCode });
  return NextResponse.json({ status: result.status }, { status: 200 });
}
```

`apps/web/app/api/health/route.ts`:

```ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Pemeriksaan kesiapan: menjawab 200 hanya bila tabel `region` dapat dibaca.
 * Dipakai sebelum demo di lokasi (Docs/PRD.md risiko R1).
 */
export async function GET(): Promise<NextResponse> {
  if (env.demoMode) {
    return NextResponse.json({ db: "ok", mode: "demo" }, { status: 200 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { error } = await supabase.from("region").select("code").limit(1);
    if (error !== null) {
      return NextResponse.json({ db: "down" }, { status: 503 });
    }
    return NextResponse.json({ db: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ db: "down" }, { status: 503 });
  }
}
```

- [ ] **Step 6: Jalankan tes, typecheck, lint, dan build**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/web
npm run typecheck --workspace @recobid/web
npm run lint --workspace @recobid/web
npm run build --workspace @recobid/web
```

Expected: seluruh tes PASS; typecheck bersih (Task 12 dan Task 13 kini saling melengkapi);
build sukses dengan rute `/`, `/api/health`, `/api/lead`.

- [ ] **Step 7: Uji manual terhadap basis data nyata**

Run (dev server berjalan, `apps/web/.env.local` terisi):

```bash
curl -s -X POST http://localhost:3000/api/lead \
  -H 'content-type: application/json' \
  -d '{"fullName":"Uji Manual","phoneWa":"081234567890","cattleCount":3,"regionCode":"jabar","kudSlug":null,"message":null,"source":"web","utm":null,"idempotencyKey":"uji-manual-00000001"}'
curl -s http://localhost:3000/api/health
```

Expected: permintaan pertama `{"status":"created"}`; ulangi perintah pertama dengan kunci idempotensi
sama → `{"status":"duplicate"}` (idempoten, bukan galat); `/api/health` → `{"db":"ok"}`.

Verifikasi baris benar-benar masuk:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia/apps/backend"
npx supabase db query --linked "select full_name, phone_wa, region_code from lead order by created_at desc limit 3"
```

Expected: baris "Uji Manual" tampil. Hapus baris uji setelah verifikasi:

```bash
npx supabase db query --linked "delete from lead where full_name = 'Uji Manual'"
```

- [ ] **Step 8: Commit**

```bash
git add apps/web/app/actions apps/web/app/api apps/web/lib/analytics.ts \
        apps/web/tests/unit/submit-lead-action.test.ts apps/web/tests/unit/health.test.ts
git commit -m "feat(web): Server Action submit-lead (idempoten, honeypot, rate limit, notifikasi fire-and-forget) + /api/lead + /api/health + funnel"
```

---

## Task 14: Edge Function `notify-lead` dan jalur notifikasi

**Files:**
- Create: `apps/backend/supabase/functions/notify-lead/index.ts`
- Create: `apps/backend/supabase/functions/notify-lead/deno.json`
- Create: `apps/backend/tests/unit/notify-signature.test.ts`
- Create: `apps/backend/scripts/fn-secrets.mjs`
- Modify: `apps/backend/package.json` (skrip `fn:secrets`, `fn:test`)
- Modify: `apps/web/.env.example` (tambahkan `NOTIFY_HOOK_URL`, `NOTIFY_HOOK_SECRET` bila belum ada)

**Interfaces:**
- Consumes: `NOTIFY_HOOK_SECRET` (rahasia bersama), `RESEND_API_KEY`, `NOTIFY_EMAIL_FROM`,
  `NOTIFY_EMAIL_TO`, `NOTIFY_WA_GATEWAY_URL`, `NOTIFY_WA_TOKEN` (semua di `apps/backend/.env`).
- Produces:
  - `POST /functions/v1/notify-lead` menerima `{ leadId: string, regionCode: string }` ber-header
    `x-recbob-signature` (HMAC-SHA256 heksadesimal dari badan permintaan mentah) dan
    `Authorization: Bearer <anon key>`.
  - Balasan: `202 {ok:true, channels:string[]}` / `401 {error:"unauthorized"}` / `400` / `405`.
  - Fungsi ini dipanggil `submitLeadAction` (Task 13) secara fire-and-forget dengan batas 2 detik.

**Aturan keamanan (wajib):** perbandingan tanda tangan memakai perbandingan waktu-konstan. Kanal yang
tidak dikonfigurasi dilewati tanpa galat; kegagalan kirim **tidak** mengembalikan status gagal selama
setidaknya satu kanal berhasil. Fungsi tidak pernah membaca tabel `lead` (tidak ada kunci istimewa di
Edge Function): seluruh data yang dibutuhkan datang dari badan permintaan yang sudah ditandatangani.

- [ ] **Step 1: Tulis pengujian tanda tangan yang gagal**

`apps/backend/tests/unit/notify-signature.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { computeSignature, verifySignature } from "../../supabase/functions/notify-lead/signature";

const SECRET = "rahasia-uji-minimal-32-karakter-panjang";

describe("tanda tangan notify-lead", () => {
  it("menghasilkan HMAC-SHA256 heksadesimal 64 karakter", async () => {
    const signature = await computeSignature('{"leadId":"a"}', SECRET);
    expect(signature).toMatch(/^[0-9a-f]{64}$/u);
  });

  it("menerima tanda tangan yang benar", async () => {
    const body = '{"leadId":"a","regionCode":"jabar"}';
    const signature = await computeSignature(body, SECRET);
    await expect(verifySignature(body, signature, SECRET)).resolves.toBe(true);
  });

  it("menolak tanda tangan yang salah", async () => {
    const body = '{"leadId":"a","regionCode":"jabar"}';
    await expect(verifySignature(body, "0".repeat(64), SECRET)).resolves.toBe(false);
  });

  it("menolak badan yang diubah setelah ditandatangani", async () => {
    const signature = await computeSignature('{"leadId":"a"}', SECRET);
    await expect(verifySignature('{"leadId":"b"}', signature, SECRET)).resolves.toBe(false);
  });

  it("menolak panjang tanda tangan yang berbeda tanpa melempar", async () => {
    await expect(verifySignature("{}", "abc", SECRET)).resolves.toBe(false);
  });
});
```

- [ ] **Step 2: Jalankan pengujian untuk memastikan gagal**

Run: `npm run test --workspace @recobid/backend`
Expected: FAIL — modul `supabase/functions/notify-lead/signature.ts` belum ada.

- [ ] **Step 3: Tulis modul tanda tangan dan Edge Function**

`apps/backend/supabase/functions/notify-lead/signature.ts` (Deno/Web Crypto; dipakai fungsi dan tes):

```ts
const encoder = new TextEncoder();

export async function computeSignature(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Perbandingan waktu-konstan: panjang berbeda langsung ditolak tanpa membocorkan posisi. */
export async function verifySignature(
  body: string,
  provided: string,
  secret: string,
): Promise<boolean> {
  const expected = await computeSignature(body, secret);
  if (expected.length !== provided.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return mismatch === 0;
}
```

`apps/backend/supabase/functions/notify-lead/index.ts`:

```ts
import { verifySignature } from "./signature.ts";

interface NotifyPayload {
  readonly leadId: string;
  readonly regionCode: string;
}

interface Env {
  readonly hookSecret: string;
  readonly resendKey: string | null;
  readonly emailFrom: string | null;
  readonly emailTo: string | null;
  readonly waGatewayUrl: string | null;
  readonly waToken: string | null;
}

function readEnv(): Env {
  const hookSecret = Deno.env.get("NOTIFY_HOOK_SECRET") ?? "";
  return {
    hookSecret,
    resendKey: Deno.env.get("RESEND_API_KEY") ?? null,
    emailFrom: Deno.env.get("NOTIFY_EMAIL_FROM") ?? null,
    emailTo: Deno.env.get("NOTIFY_EMAIL_TO") ?? null,
    waGatewayUrl: Deno.env.get("NOTIFY_WA_GATEWAY_URL") ?? null,
    waToken: Deno.env.get("NOTIFY_WA_TOKEN") ?? null,
  };
}

function parsePayload(value: unknown): NotifyPayload | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  const leadId = record.leadId;
  const regionCode = record.regionCode;
  if (typeof leadId !== "string" || leadId.length === 0) return null;
  if (typeof regionCode !== "string" || regionCode.length === 0) return null;
  return { leadId, regionCode };
}

async function sendEmail(env: Env, payload: NotifyPayload, signal: AbortSignal): Promise<boolean> {
  if (env.resendKey === null || env.emailFrom === null || env.emailTo === null) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    signal,
    headers: {
      authorization: `Bearer ${env.resendKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [env.emailTo],
      subject: `Lead sampel baru (${payload.regionCode})`,
      text: `Lead ${payload.leadId} dari wilayah ${payload.regionCode}. Buka dasbor Supabase untuk detail.`,
    }),
  });
  return response.ok;
}

async function sendWhatsapp(env: Env, payload: NotifyPayload, signal: AbortSignal): Promise<boolean> {
  if (env.waGatewayUrl === null) return false;
  const response = await fetch(env.waGatewayUrl, {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      ...(env.waToken === null ? {} : { authorization: `Bearer ${env.waToken}` }),
    },
    body: JSON.stringify({ leadId: payload.leadId, regionCode: payload.regionCode }),
  });
  return response.ok;
}

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  const env = readEnv();
  if (env.hookSecret.length < 32) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 503 });
  }

  const rawBody = await request.text();
  const provided = request.headers.get("x-recbob-signature") ?? "";
  const valid = await verifySignature(rawBody, provided, env.hookSecret);
  if (!valid) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  const payload = parsePayload(parsed);
  if (payload === null) {
    return new Response(JSON.stringify({ error: "invalid_payload" }), { status: 400 });
  }

  const signal = AbortSignal.timeout(5_000);
  const results = await Promise.allSettled([
    sendEmail(env, payload, signal),
    sendWhatsapp(env, payload, signal),
  ]);

  const channels: string[] = [];
  for (const [index, result] of results.entries()) {
    const name = index === 0 ? "email" : "whatsapp";
    if (result.status === "fulfilled" && result.value) channels.push(name);
  }

  // Selama tidak ada kanal yang dikonfigurasi, permintaan tetap dianggap diterima:
  // notifikasi bersifat best-effort (spec ADR-016).
  return new Response(JSON.stringify({ ok: true, channels }), {
    status: 202,
    headers: { "content-type": "application/json" },
  });
});
```

`apps/backend/supabase/functions/notify-lead/deno.json`:

```json
{
  "imports": {},
  "lint": { "rules": { "tags": ["recommended"] } }
}
```

- [ ] **Step 4: Tulis skrip rahasia dan jalankan tes**

`apps/backend/scripts/fn-secrets.mjs` (membaca `apps/backend/.env` lalu menulis rahasia ke Supabase;
nilai rahasia tidak pernah dicetak):

```js
#!/usr/bin/env node
/**
 * Menyalin rahasia notifikasi dari apps/backend/.env ke secrets Edge Function.
 * Nilai tidak pernah dicetak ke keluaran.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ENV_PATH = join(ROOT, ".env");

const REQUIRED = [
  "NOTIFY_HOOK_SECRET",
  "RESEND_API_KEY",
  "NOTIFY_EMAIL_FROM",
  "NOTIFY_EMAIL_TO",
  "NOTIFY_WA_GATEWAY_URL",
  "NOTIFY_WA_TOKEN",
];

function readEnvFile(path) {
  const text = readFileSync(path, "utf8");
  const map = new Map();
  for (const line of text.split(/\r?\n/u)) {
    const match = /^([A-Z0-9_]+)=(.*)$/u.exec(line.trim());
    if (match !== null) map.set(match[1], match[2]);
  }
  return map;
}

const values = readEnvFile(ENV_PATH);
const present = REQUIRED.filter((name) => (values.get(name) ?? "").length > 0);
if (present.length === 0) {
  process.stdout.write("Tidak ada rahasia notifikasi yang terisi; langkah ini dilewati.\n");
  process.exit(0);
}

for (const name of present) {
  execFileSync("supabase", ["secrets", "set", `${name}=${values.get(name)}`], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
  });
}
process.stdout.write(`Rahasia tersimpan: ${present.join(", ")}\n`);
```

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run test --workspace @recobid/backend
npm run typecheck --workspace @recobid/backend
```

Expected: seluruh tes tanda tangan PASS.

- [ ] **Step 5: Deploy dan uji fungsi secara langsung**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia/apps/backend"
node scripts/fn-secrets.mjs
npm run fn:deploy
```

Uji tanda tangan salah (wajib `401`):

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST \
  "$SUPABASE_URL/functions/v1/notify-lead" \
  -H "authorization: Bearer $SUPABASE_ANON_KEY" \
  -H 'content-type: application/json' \
  -H 'x-recbob-signature: 0000000000000000000000000000000000000000000000000000000000000000' \
  -d '{"leadId":"00000000-0000-0000-0000-000000000000","regionCode":"jabar"}'
```

Expected: `401`.

Uji tanda tangan benar (wajib `202`), dijalankan dengan Node agar HMAC dihitung skrip:

```bash
node --input-type=module -e '
const secret = process.env.NOTIFY_HOOK_SECRET;
const body = JSON.stringify({ leadId: "00000000-0000-0000-0000-000000000000", regionCode: "jabar" });
const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
const signature = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
const response = await fetch(`${process.env.SUPABASE_URL}/functions/v1/notify-lead`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
    "content-type": "application/json",
    "x-recbob-signature": signature,
  },
  body,
});
console.log(response.status, await response.text());
'
```

Expected: `202 {"ok":true,"channels":[...]}`.

- [ ] **Step 6: Commit**

```bash
git add apps/backend/supabase/functions apps/backend/scripts/fn-secrets.mjs \
        apps/backend/tests/unit/notify-signature.test.ts apps/backend/package.json apps/web/.env.example
git commit -m "feat(backend): Edge Function notify-lead ber-signature HMAC + skrip rahasia + uji tanda tangan"
```

---

## Task 15: SEO, uji e2e smoke, CI, README final, dan verifikasi penutup

**Files:**
- Create: `apps/web/app/robots.ts`, `apps/web/app/sitemap.ts`
- Create: `apps/web/tests/e2e/smoke.spec.ts`, `apps/web/playwright.config.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `apps/web/app/layout.tsx` (JSON-LD organisasi), `README.md` (versi lengkap)
- Modify: `package.json` (root: skrip `verify`, `e2e`)

**Interfaces:**
- Consumes: seluruh task sebelumnya.
- Produces: `npm run verify` sebagai satu-satunya gerbang mutu; `robots.txt` dan `sitemap.xml` dari
  `NEXT_PUBLIC_SITE_URL`.

- [ ] **Step 1: Tulis `robots.ts` dan `sitemap.ts`**

`apps/web/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
```

`apps/web/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Siklus A hanya memiliki satu rute publik; halaman sekunder menyusul pada Siklus B. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
```

- [ ] **Step 2: Tambahkan JSON-LD organisasi di `layout.tsx`**

Sisipkan di dalam `<body>`, sebelum `{children}`:

```tsx
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ReCob.id",
  description: copy.meta.description,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

// di dalam <body>:
<script
  dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
  type="application/ld+json"
/>
```

- [ ] **Step 3: Tulis konfigurasi dan uji e2e smoke**

`apps/web/playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build --workspace @recobid/web && npm run start --workspace @recobid/web",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
```

`apps/web/tests/e2e/smoke.spec.ts` (berjalan tanpa kredensial Supabase; mode demo aktif):

```ts
import { expect, test } from "@playwright/test";

test.describe("beranda ReCobID", () => {
  test("memuat 12 seksi dengan judul utama dan tanpa emoji", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    for (const id of [
      "hero",
      "tantangan",
      "solusi",
      "formulasi",
      "penghematan",
      "dampak",
      "kemitraan",
      "mutu",
      "edukasi",
      "faq",
      "form-sampel",
    ]) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }

    const body = (await page.locator("body").innerText()).normalize("NFC");
    expect(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(body)).toBe(false);
  });

  test("navigasi ke formulir dari hero", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Klaim Sampel/i }).first().click();
    await expect(page.locator("#form-sampel")).toBeInViewport();
  });

  test("menolak nomor WhatsApp yang tidak sah sebelum mengirim", async ({ page }) => {
    await page.goto("/#form-sampel");
    await page.getByLabel(/Nama/i).fill("Uji E2E");
    await page.getByLabel(/WhatsApp/i).fill("123");
    await page.getByLabel(/Sapi/i).fill("3");
    await page.getByRole("button", { name: /Kirim|Klaim/i }).click();
    await expect(page.getByText(/nomor|format/i).first()).toBeVisible();
  });

  test("melayani health check dan berkas SEO", async ({ request }) => {
    const health = await request.get("/api/health");
    expect([200, 503]).toContain(health.status());

    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain("sitemap");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
  });

  test("menyimpan lead nyata dan menolak duplikat secara idempoten", async ({ request }) => {
    test.skip(
      process.env.NEXT_PUBLIC_SUPABASE_URL === undefined ||
        process.env.NEXT_PUBLIC_SUPABASE_URL === "",
      "Kredensial Supabase tidak tersedia; skenario ini dijalankan pada CI ber-secrets.",
    );

    const body = {
      fullName: "Uji E2E Idempoten",
      phoneWa: "081234567891",
      cattleCount: 5,
      regionCode: "jabar",
      kudSlug: null,
      message: null,
      source: "web",
      utm: null,
      idempotencyKey: `e2e-${Date.now()}`,
    };

    const first = await request.post("/api/lead", { data: body });
    expect(first.status()).toBe(200);
    expect((await first.json()).status).toBe("created");

    const second = await request.post("/api/lead", { data: body });
    expect(second.status()).toBe(200);
    expect((await second.json()).status).toBe("duplicate");
  });
});
```

- [ ] **Step 4: Tulis CI**

Skrip root **tidak perlu diubah**: `verify` dan `test:e2e` sudah didefinisikan pada Task 1 Step 4, dan
`apps/web` sudah punya `test:e2e` (Task 4 Step 1) yang membaca `apps/web/playwright.config.ts`.
Periksa saja keduanya masih utuh:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm pkg get scripts.verify scripts.test:e2e
```

Expected: `verify` memuat sembilan langkah berurutan, `test:e2e` menunjuk workspace `@recobid/web`.

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    name: Mutu front-end
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run check:tokens
      - run: npm run check:emoji
      - run: npm run check:secrets
      - run: npm run test
      - run: npm run build
      - name: Simpan artefak laporan token
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: tokens-json
          path: apps/web/styles/tokens.json

  backend-artifacts:
    name: Artefak backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run test --workspace @recobid/backend
      - run: npm run typecheck --workspace @recobid/backend
      - name: Tes RLS terhadap project tertaut
        if: ${{ secrets.SUPABASE_DB_URL != '' }}
        env:
          SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
        run: npm run test:rls --workspace @recobid/backend

  e2e:
    name: Uji end-to-end
    runs-on: ubuntu-latest
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - name: Siapkan .env.local dari secrets (opsional)
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
        run: |
          if [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
            printf 'NEXT_PUBLIC_SUPABASE_URL=%s\nNEXT_PUBLIC_SUPABASE_ANON_KEY=%s\nDEMO_MODE=false\n' \
              "$NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" > apps/web/.env.local
          else
            printf 'DEMO_MODE=true\n' > apps/web/.env.local
          fi
      - run: npm run e2e
```

- [ ] **Step 5: Tulis README final**

Ganti `README.md` dengan versi lengkap (bagian yang dijanjikan Task 1 Step 7):

```markdown
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

## Menjalankan

```bash
npm install
cp apps/web/.env.example apps/web/.env.local        # isi kredensial web
cp apps/backend/.env.example apps/backend/.env      # isi kredensial backend
npm run dev                                          # http://localhost:3000
```

Tanpa kredensial Supabase, jalankan dengan `DEMO_MODE=true` di `apps/web/.env.local`: beranda
dirender dari data seed yang dibundel saat build, dan formulir menampilkan pesan mode demo.

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

### `apps/backend/.env`

| Variabel | Wajib | Rahasia | Keterangan |
|---|---|---|---|
| `SUPABASE_URL` | ya | tidak | URL project |
| `SUPABASE_ANON_KEY` | ya | tidak | untuk uji RPC sebagai anon |
| `SUPABASE_SERVICE_ROLE_KEY` | ya | **ya** | hanya skrip backend |
| `SUPABASE_DB_URL` | ya | **ya** | koneksi langsung untuk tes RLS |
| `SUPABASE_ACCESS_TOKEN` | untuk deploy fungsi | **ya** | token akun Supabase |
| `NOTIFY_HOOK_SECRET` | ya | **ya** | harus sama dengan milik `apps/web` |
| `RESEND_API_KEY` | tidak | **ya** | kanal email |
| `NOTIFY_EMAIL_FROM` / `NOTIFY_EMAIL_TO` | tidak | tidak | pengirim dan penerima notifikasi |
| `NOTIFY_WA_GATEWAY_URL` / `NOTIFY_WA_TOKEN` | tidak | **ya** | kanal WhatsApp bila gateway tersedia |

Berkas `.env` tidak pernah di-commit; hanya `.env.example`. Gate `npm run check:secrets` menolak
commit yang memuat nilai rahasia.

## Perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | menjalankan front-end |
| `npm run verify` | seluruh gate mutu: lint, typecheck, token, env, emoji, rahasia, tes, build, e2e |
| `npm run db:push --workspace @recobid/backend` | menerapkan migrasi ke project tertaut |
| `npm run db:seed --workspace @recobid/backend` | mengulang seed pitch (idempoten) |
| `npm run db:gen-types --workspace @recobid/backend` | memperbarui tipe basis data bersama |
| `npm run test:rls --workspace @recobid/backend` | tes RLS/RPC terhadap basis data nyata |
| `npm run fn:deploy --workspace @recobid/backend` | men-deploy Edge Function `notify-lead` |

## Urutan rilis

1. `npm run db:push --workspace @recobid/backend` (setelah `--dry-run` bersih)
2. `npm run db:seed --workspace @recobid/backend`
3. `npm run fn:deploy --workspace @recobid/backend` lalu `node apps/backend/scripts/fn-secrets.mjs`
4. Deploy Vercel dengan **root directory `apps/web`**, isi variabel dari tabel di atas
5. `npm run verify`

## Catatan

- Token desain dihasilkan: `apps/web/styles/theme.css` berasal dari `Docs/DESIGN.md`. Ubah
  `DESIGN.md`, jalankan `npm run check:tokens`, jangan mengedit CSS hasil.
- Zero emoji: seluruh ikon memakai `lucide-react`; gate `npm run check:emoji` menegakkannya.
- Seluruh naskah UI berada di `apps/web/content/copy/id.ts`.
```

- [ ] **Step 6: Jalankan seluruh gerbang mutu**

Run:

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
npm run verify
```

Expected: seluruh langkah lulus. `e2e` menjalankan build produksi lalu lima skenario smoke; skenario
idempotensi dilewati bila kredensial tidak ada.

- [ ] **Step 7: Commit penutup**

```bash
git add apps/web/app/robots.ts apps/web/app/sitemap.ts apps/web/app/layout.tsx \
        apps/web/tests/e2e apps/web/playwright.config.ts .github/workflows/ci.yml \
        package.json README.md
git commit -m "feat(web): SEO (robots, sitemap, JSON-LD), uji e2e smoke, CI tiga job, README lengkap"
```

---

## Verifikasi Penutup Siklus A

Jalankan berurutan pada mesin bersih, dan laporkan keluaran nyatanya:

- [ ] **V1: Instalasi bersih tanpa `.env`**

```bash
cd "/run/media/sh1shiroon/Kerjaan-Linux-1/ReCobIndonesia"
rm -rf node_modules apps/web/node_modules apps/backend/node_modules packages/shared/node_modules
npm install
npm run lint && npm run typecheck && npm run test && npm run build
```

Expected: seluruh perintah lulus tanpa `.env` (mode demo).

- [ ] **V2: Tidak ada rahasia di berkas ter-commit**

```bash
git grep -nE 'eyJ[A-Za-z0-9_-]{20,}|SUPABASE_SERVICE_ROLE_KEY=.+|service_role' -- . ':!Docs' || echo "bersih: tidak ada kunci di berkas ter-commit"
git status --short
```

Expected: tidak ada kecocokan; `git status` bersih.

- [ ] **V3: `.env` dan `.gitignore` benar-benar terpisah**

```bash
ls -1 apps/web/.env.example apps/web/.gitignore apps/backend/.env.example apps/backend/.gitignore
git check-ignore -v apps/web/.env.local apps/backend/.env
```

Expected: keempat berkas ada; dua perintah `check-ignore` mengembalikan aturan dari `.gitignore`
masing-masing aplikasi (bukan hanya root).

- [ ] **V4: Token dihasilkan, bukan diketik**

```bash
node scripts/export-design-tokens.mjs --check && echo "token sinkron dengan Docs/DESIGN.md"
```

Expected: tidak ada keluaran galat; hasil sinkron.

- [ ] **V5: RLS dan RPC menegakkan aturan**

```bash
npm run test:rls --workspace @recobid/backend
```

Expected: seluruh tes RLS hijau; insert ilegal ditolak, duplikat nomor WA idempoten, metrik tanpa
referensi ditolak trigger.

- [ ] **V6: Lead benar-benar tersimpan dan idempoten**

Jalankan ulang Task 13 Step 7 (dua kali dengan kunci idempotensi sama) dan periksa tabel `lead`.
Expected: satu baris; balasan kedua `duplicate`.

- [ ] **V7: Notifikasi menolak tanda tangan salah**

Jalankan ulang Task 14 Step 5. Expected: `401` untuk tanda tangan salah, `202` untuk yang benar.

- [ ] **V8: Beranda utuh tanpa basis data**

```bash
DEMO_MODE=true npm run dev   # atau tanpa .env.local
```

Buka `http://localhost:3000`, matikan jaringan ke Supabase. Expected: beranda tetap menampilkan
seluruh 12 seksi; formulir menampilkan pesan mode demo beserta tautan WhatsApp.

- [ ] **V9: Naskah dan ikon patuh**

```bash
npm run check:emoji
grep -rn "material-symbols\|lh3.googleusercontent.com\|tailwindcss.com" apps/web --include='*.tsx' --include='*.ts' --include='*.css' || echo "bersih: tanpa CDN dan aset pihak ketiga"
```

Expected: gate emoji bersih; tidak ada rujukan CDN Stitch.

- [ ] **V10: Definisi selesai Siklus A**

Periksa satu per satu daftar di `Docs/specs/2026-09-22-recobid-monorepo-design.md` Bagian 14
("Definisi Selesai — Siklus A") dan tandai yang terpenuhi dengan bukti keluaran perintah.

---

## Catatan Penutup untuk Eksekutor

- Bila sebuah langkah gagal dan penyebabnya tidak jelas dalam dua percobaan, hentikan dan laporkan
  keluaran perintahnya apa adanya. Jangan melemahkan tes, jangan menambah `as`, jangan menambah
  `any`, jangan menambah `@ts-ignore`.
- Setiap kali menyentuh basis data nyata, jalankan `--dry-run` lebih dulu.
- Jangan pernah menulis nilai rahasia ke berkas yang di-commit atau ke keluaran perintah.
- Bila menemukan kunci konten yang belum ada di `content/copy/id.ts`, tambahkan ke berkas itu; jangan
  menulis teks di JSX.


