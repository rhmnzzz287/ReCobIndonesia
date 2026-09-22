# Prototipe 6 Halaman ReCob.id — Rencana Implementasi

> **For agentic workers:** REQUIRED SUB-SKILL: gunakan executing-plans untuk menjalankan rencana ini
> langkah demi langkah. Langkah memakai kotak centang (`- [ ]`) sebagai penanda kemajuan.

**Goal:** Memenuhi acceptance criteria arahannya — minimum 5 halaman, alur pelanggan lintas halaman,
fungsi bisnis utama terlihat, interaksi pelanggan nyata, dan titik konversi — sekaligus memperbaiki
tiga cacat kalkulator dan menyederhanakan bahasa seluruh naskah.

**Architecture:** Shell situs (header, footer, sticky CTA, scroll reveal) dipindah dari `app/page.tsx`
ke `app/layout.tsx` supaya enam rute mewarisinya. Beranda menyusut jadi halaman naratif dengan
ringkasan produk dan kisi tautan; konten berat (katalog produk, kalkulator, kemitraan, edukasi,
kontak) masing-masing menjadi satu rute tersendiri. Aritmetika tetap satu sumber di
`lib/utils/feed-cost.ts`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4 (`styles/theme.css`),
Vitest (unit), Playwright (e2e), Supabase (backend, sudah ada).

**Spec:** `Docs/PRD.md` §5.1 (S1–S9), `Docs/DESIGN.md` (pohon berkas), desain yang disetujui
pemilik produk pada sesi 22 September 2026.

## Global Constraints

- Naskah tampilan HANYA di `apps/web/content/copy/id.ts`. Tidak ada string tampilan di JSX.
- Zero emoji. Ikon memakai `lucide-react`.
- Hanya `lib/data/*` boleh memanggil Supabase.
- Gate wajib lulus: `npm run check:terms`, `check:emoji`, `check:tokens`, `check:env`, `check:secrets`.
- Harga jangkar ReCob.id dibaca dari `getPrimaryProduct()`, tidak pernah ditulis di komponen.
- Angka kalkulator harus identik dengan tabel statis pada asumsi yang sama (PRD S9, dikunci uji silang).
- Jumlah ternak TIDAK PERNAH masuk URL (PRD S9) — pakai `sessionStorage` lewat `lib/utils/cattle-prefill.ts`.
- `unset NODE_ENV` sebelum build/test (shell mengekspor `NODE_ENV=production`).
- JANGAN sentuh 9router. Bunuh dev server per port: `ss -ltnp | grep -oP ':3000\s.*pid=\K[0-9]+'`.
- Tidak boleh mengarang data: tanpa nomor telepon, alamat, surel, `aggregateRating`, atau `sameAs`.

## Peta Berkas

**Rute baru**

| Berkas | Isi |
|---|---|
| `apps/web/app/produk/page.tsx` | S2 — komposisi, spesifikasi karung, transisi 7 hari |
| `apps/web/app/kalkulator/page.tsx` | S9 — tabel statis + kalkulator interaktif |
| `apps/web/app/mitra/page.tsx` | S5 — alur konsinyasi, potong setoran susu, daftar KUD |
| `apps/web/app/edukasi/page.tsx` | S4 — 4 kartu topik |
| `apps/web/app/kontak/page.tsx` | S7 — kanal kontak, status NPP, form sampel |

**Komponen baru**

| Berkas | Tanggung jawab |
|---|---|
| `apps/web/components/blocks/page-header.tsx` | Judul + intro halaman sekunder, satu pola untuk 5 rute |
| `apps/web/components/sections/product-summary.tsx` | Ringkasan produk di beranda + tautan ke `/produk` |
| `apps/web/components/sections/tool-links.tsx` | Kisi tautan ke 4 halaman sekunder |
| `apps/web/components/sections/contact.tsx` | Isi halaman `/kontak` |

**Diubah**

| Berkas | Perubahan |
|---|---|
| `apps/web/app/layout.tsx` | Memasang shell (SiteHeader, Footer, StickyCta, ScrollReveal) |
| `apps/web/app/page.tsx` | Hanya seksi beranda; shell dipindah keluar |
| `apps/web/components/blocks/site-header.tsx` | Navigasi rute (`/produk`), bukan anchor; baca `copy.nav` sendiri |
| `apps/web/components/blocks/sticky-cta.tsx` | Tautan ke `/kontak#form-sampel` |
| `apps/web/components/blocks/savings-calculator.tsx` | Validasi batas + perbaikan luber |
| `apps/web/components/sections/calculator.tsx` | Lebar penuh di halaman sendiri |
| `apps/web/components/sections/cta.tsx` | `id="form-sampel"` tetap; tanpa perubahan struktur |
| `apps/web/content/copy/id.ts` | Blok `pages`, `contact`, `productSummary`, `toolLinks`; bahasa disederhanakan; blok `impact` dihapus |
| `apps/web/app/sitemap.ts` | 6 URL |
| `apps/web/lib/seo/structured-data.ts` | Tambah `WebPage` per halaman |
| `apps/web/tests/**` | Uji baru untuk rute, validasi, naskah |

**Dihapus**

- `apps/web/components/sections/impact.tsx`
- `apps/web/components/blocks/metric-panel.tsx`
- `apps/web/lib/data/impact.ts` (bila tidak ada pemakai lain)
- `copy.impact`, `copy.nav.impact`, `copy.calculator.assumptionsTitle` (mati)

---

### Task 1: Bahasa disederhanakan + blok naskah baru

**Files:**
- Modify: `apps/web/content/copy/id.ts`
- Test: `apps/web/tests/unit/copy.test.ts`

**Interfaces:**
- Produces: `copy.pages.{produk,kalkulator,mitra,edukasi,kontak}.{eyebrow,title,intro}`, `copy.contact.*`, `copy.productSummary.*`, `copy.toolLinks.*`

- [ ] **Step 1: Tulis uji naskah yang gagal**

```ts
// apps/web/tests/unit/copy.test.ts — tambahkan
it("menyediakan naskah untuk lima halaman sekunder", () => {
  for (const key of ["produk", "kalkulator", "mitra", "edukasi", "kontak"] as const) {
    expect(copy.pages[key].title.length).toBeGreaterThan(3);
    expect(copy.pages[key].intro.length).toBeGreaterThan(20);
  }
});

it("memakai bahasa sederhana pada label kalkulator", () => {
  expect(copy.calculator.title).toBe("Hitung Penghematan Anda");
  expect(copy.costCompare.title).toBe("Perbandingan Harga Pakan");
  expect(copy.calculator.inputsTitle).toBe("Angka yang Bisa Anda Ubah");
});

it("tidak lagi menyimpan naskah metrik dampak", () => {
  expect("impact" in copy).toBe(false);
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `cd apps/web && npx vitest run tests/unit/copy.test.ts`
Expected: FAIL — `copy.pages` tidak ada.

- [ ] **Step 3: Perbarui `id.ts`**

Ganti istilah:

| Lama | Baru |
|---|---|
| `costCompare.title`: "Aritmetika Penghematan Transparan" | "Perbandingan Harga Pakan" |
| `costCompare.eyebrow`: "Aritmetika Penghematan Nyata" | "Harga Pakan Dibandingkan" |
| `costCompare.tableHead.criteria`: "Parameter Pakan Konsentrat" | "Yang Dibandingkan" |
| `costCompare.tableHead.conventional`: "Konsentrat Komersial Umum" | "Pakan Pabrik" |
| `costCompare.tableHead.difference`: "Selisih Penghematan" | "Selisih" |
| `costCompare.assumptionTitle`: "Asumsi Simulasi" | "Angka yang Dipakai" |
| `calculator.title`: "Hitung Sendiri Penghematan Pakan Anda" | "Hitung Penghematan Anda" |
| `calculator.eyebrow`: "Simulasi Mandiri" | "Hitung Sendiri" |
| `calculator.comparePriceLabel`: "Harga Konsentrat Pembanding" | "Harga Pakan Pabrik" |
| `calculator.inputsTitle`: "Asumsi yang Dapat Anda Ubah" | "Angka yang Bisa Anda Ubah" |
| `calculator.anchorTitle`: "Jangkar Harga ReCob.id" | "Harga ReCob.id (tetap)" |
| `calculator.anchorNote` | "Harga ReCob.id tidak bisa diubah di sini. Angkanya diambil dari data produk resmi." |
| `calculator.mathTitle`: "Aritmetika Terbuka" | "Cara Hitungnya" |
| `calculator.mathNote` | "Silakan cek dengan kalkulator ponsel Anda. Semua angka berasal dari isian Anda sendiri." |
| `calculator.resultTitle`: "Hasil Perhitungan" | "Hasil" |
| `calculator.invalidTitle` | "Angka belum lengkap" |
| `calculator.invalidBody` | "Isi jumlah sapi, harga pakan pabrik, dan asupan harian dengan angka lebih dari nol." |
| `product.transitionTitle`: "Prosedur Transisi Pakan 7 Hari" | "Cara Ganti Pakan (7 Hari)" |
| `product.transitionIntro` | "Ganti pakan bertahap supaya mikroba rumen sapi terbiasa dulu:" |
| `validation.title`: "Kendali Mutu & Transparansi QC" | "Cara Kami Menjaga Mutu" |
| `validation.eyebrow`: "Integritas Metodologi" | "Kendali Mutu" |
| `validation.citationTitle`: "Rujukan & Standar" | "Sumber Rujukan" |
| `partnership.title`: "Jalur Distribusi & Skema Potong Setoran Susu" | "Cara Bermitra dengan KUD" |
| `partnership.eyebrow`: "Distribusi Terintegrasi" | "Alur Kemitraan" |
| `education.eyebrow`: "Praktik Kandang Higienis" | "Panduan Kandang" |
| `education.title`: "Edukasi Manajemen Ruminansia" | "Panduan Beternak Sapi Perah" |
| `faq.title`: "Tanya Jawab Seputar ReCob.id" | "Pertanyaan yang Sering Ditanya" |
| `hero`/`problem`/`solution`: istilah "biokonversi limbah lignoselulosa", "ransum komplit ruminansia perah produktif", "palatabilitas", "organoleptik" → ganti dengan bahasa sehari-hari ("pengolahan limbah jadi pakan", "pakan lengkap sapi perah", "seberapa suka sapi memakannya", "pemeriksaan aroma") |

Tambah blok baru:

```ts
  pages: {
    produk: {
      eyebrow: "Produk",
      title: "Pakan ReCob.id",
      intro: "Bahan pembuat, isi karung, dan cara mengganti pakan lama ke ReCob.id.",
    },
    kalkulator: {
      eyebrow: "Hitung Sendiri",
      title: "Hitung Penghematan Anda",
      intro:
        "Bandingkan harga pakan pabrik dengan ReCob.id memakai jumlah sapi Anda sendiri. Semua angkanya bisa Anda periksa.",
    },
    mitra: {
      eyebrow: "Kemitraan",
      title: "Cara Bermitra dengan KUD",
      intro: "Alur pengambilan karung dan pemotongan setoran susu mingguan.",
    },
    edukasi: {
      eyebrow: "Panduan",
      title: "Panduan Beternak Sapi Perah",
      intro: "Empat panduan praktis dari tim lapangan ReCob.id untuk anggota KUD.",
    },
    kontak: {
      eyebrow: "Kontak",
      title: "Hubungi ReCob.id",
      intro: "Ajukan sampel gratis atau tanyakan ransum sapi Anda lewat WhatsApp.",
    },
  },
  productSummary: {
    eyebrow: "Produk",
    title: "Pakan Konsentrat dari Bonggol Jagung",
    intro: "Tiga bahan, satu karung 50 kg, satu harga tetap.",
    ctaLabel: "Lihat Detail Produk",
  },
  toolLinks: {
    title: "Yang Bisa Anda Lakukan di Sini",
    intro: "Empat halaman berikut menjawab pertanyaan yang paling sering ditanyakan peternak.",
    items: [
      { href: "/produk", title: "Produk", body: "Bahan, isi karung, dan cara pakainya." },
      { href: "/kalkulator", title: "Kalkulator", body: "Hitung sendiri penghematan pakan Anda." },
      { href: "/mitra", title: "Kemitraan KUD", body: "Alur potong setoran susu mingguan." },
      { href: "/kontak", title: "Kontak", body: "Ajukan sampel gratis lewat WhatsApp." },
    ],
  },
  contact: {
    channelsTitle: "Kanal Resmi",
    whatsappTitle: "WhatsApp Kemitraan",
    whatsappBody: "Tanya ransum, jadwal pengiriman, atau status permintaan sampel Anda.",
    whatsappCta: "Tanya via WhatsApp",
    legalTitle: "Legalitas",
    legalBody: "Status izin edar dan standar mutu yang kami pegang.",
    formTitle: "Ajukan Sampel Gratis",
  },
```

Hapus blok `impact: { ... }` seluruhnya dan `nav.impact`.

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `cd apps/web && npx vitest run tests/unit/copy.test.ts`
Expected: PASS

---

### Task 2: Shell dipindah ke root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`, `apps/web/app/page.tsx`, `apps/web/components/blocks/site-header.tsx`, `apps/web/components/blocks/sticky-cta.tsx`

**Interfaces:**
- Produces: setiap rute mewarisi header + footer + sticky CTA + scroll reveal dari layout.
- `SiteHeader` kehilangan prop; membaca `copy.nav` sendiri.

- [ ] **Step 1: `site-header.tsx` — navigasi rute**

```tsx
"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { href: "/", label: copy.nav.home },
  { href: "/produk", label: copy.nav.product },
  { href: "/kalkulator", label: copy.nav.calculator },
  { href: "/mitra", label: copy.nav.partnership },
  { href: "/edukasi", label: copy.nav.education },
  { href: "/kontak", label: copy.nav.contact },
] as const;

const SAMPLE_HREF = "/kontak#form-sampel";

export function SiteHeader(): ReactNode {
  const [open, setOpen] = useState(false);
  // ... struktur sama, tautan memakai <Link href>, CTA ke SAMPLE_HREF
}
```

Tautan nav memakai `<Link>` dari `next/link`. Tombol CTA memakai `ButtonLink` dengan `href={SAMPLE_HREF}`.

- [ ] **Step 2: `layout.tsx` — pasang shell**

```tsx
      <body>
        <a className="skip-link" href="#konten">{copy.nav.skipLabel}</a>
        <SiteHeader />
        {children}
        <Footer />
        <StickyCta />
        <ScrollReveal />
      </body>
```

`layout.tsx` tetap memegang metadata global (`metadataBase`, `openGraph`, `twitter`, `robots`, `alternates.canonical` untuk beranda TIDAK di sini — canonical per halaman).

- [ ] **Step 3: `page.tsx` — hanya seksi beranda**

```tsx
export default async function HomePage(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();
  const jsonLd = { "@context": "https://schema.org", "@graph": [...] };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</gu, "\\u003c") }} type="application/ld+json" />
      <main id="konten">
        <Hero />
        <ImpactStrip />
        <Problem />
        <Solution />
        <ProductSummary product={product} />
        <ToolLinks />
        <Validation />
        <Faq />
        <Cta />
      </main>
    </>
  );
}
```

- [ ] **Step 4: `sticky-cta.tsx` — tautan lintas halaman**

```tsx
        <ButtonLink className="flex-1" href="/kontak#form-sampel" variant="accent">
```

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: hanya galat dari komponen yang belum dibuat (ProductSummary, ToolLinks) — lanjut Task 3.

---

### Task 3: Komponen beranda baru + halaman sekunder

**Files:**
- Create: `apps/web/components/blocks/page-header.tsx`
- Create: `apps/web/components/sections/product-summary.tsx`
- Create: `apps/web/components/sections/tool-links.tsx`
- Create: `apps/web/components/sections/contact.tsx`
- Create: `apps/web/app/produk/page.tsx`, `app/kalkulator/page.tsx`, `app/mitra/page.tsx`, `app/edukasi/page.tsx`, `app/kontak/page.tsx`
- Delete: `apps/web/components/sections/impact.tsx`, `apps/web/components/blocks/metric-panel.tsx`, `apps/web/lib/data/impact.ts`

**Interfaces:**
- Consumes: `copy.pages.*`, `copy.productSummary.*`, `copy.toolLinks.*`, `copy.contact.*`
- Produces: 5 rute baru; `PageHeader({ eyebrow, title, intro })`

- [ ] **Step 1: `page-header.tsx`**

```tsx
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  intro: string;
}

/** Judul halaman sekunder. Satu pola untuk lima rute supaya tinggi dan jaraknya seragam. */
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps): ReactNode {
  return (
    <div className="border-b border-border bg-cream">
      <Container>
        <div className="max-w-[68ch] py-2xl">
          <p className="type-label-md uppercase text-primary">{eyebrow}</p>
          <h1 className="mt-sm type-h1 text-ink">{title}</h1>
          <p className="mt-md type-body-lg text-text-secondary">{intro}</p>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 2: `product-summary.tsx`** — komposisi ringkas + harga + tautan

```tsx
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { formatIdr } from "@/lib/utils/format";

export interface ProductSummaryProps {
  product: { name: string; description: string; priceIdr: number; packWeightKg: number };
}

export function ProductSummary({ product }: ProductSummaryProps): ReactNode {
  return (
    <Section id="produk-ringkas" tone="paper">
      <Container>
        <div className="max-w-[68ch]">
          <p className="type-label-md uppercase text-primary">{copy.productSummary.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink">{copy.productSummary.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">{copy.productSummary.intro}</p>
        </div>
        <p className="mt-lg font-mono-data type-metric-md text-primary-strong">
          {formatIdr(product.priceIdr)}
          <span className="type-body-sm text-text-secondary"> / karung {product.packWeightKg} kg</span>
        </p>
        <ButtonLink className="mt-lg" href="/produk" variant="secondary">
          {copy.productSummary.ctaLabel}
          <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
        </ButtonLink>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: `tool-links.tsx`** — kisi 4 tautan

```tsx
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export function ToolLinks(): ReactNode {
  return (
    <Section id="jelajahi" tone="surface">
      <Container>
        <div className="max-w-[68ch]">
          <h2 className="type-h2 text-ink">{copy.toolLinks.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">{copy.toolLinks.intro}</p>
        </div>
        <div className="mt-xl grid gap-lg sm:grid-cols-2">
          {copy.toolLinks.items.map((item, index) => (
            <Link
              className="group flex min-h-11 flex-col rounded-lg border border-border bg-paper p-lg hover:border-primary"
              href={item.href}
              key={item.href}
              style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
            >
              <span className="flex items-center gap-xs type-h3 text-ink">
                {item.title}
                <ArrowRight aria-hidden="true" className="transition-transform group-hover:translate-x-1" size={18} strokeWidth={1.75} />
              </span>
              <span className="mt-xs type-body-sm text-text-secondary">{item.body}</span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Lima halaman sekunder** — masing-masing memakai `PageHeader` + seksi yang sudah ada

```tsx
// apps/web/app/produk/page.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/blocks/page-header";
import { Product } from "@/components/sections/product";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: copy.pages.produk.title,
  description: copy.pages.produk.intro,
  alternates: { canonical: `${env.siteUrl}/produk` },
};

export default function ProdukPage(): ReactNode {
  return (
    <main id="konten">
      <PageHeader {...copy.pages.produk} />
      <Product />
    </main>
  );
}
```

Pola sama untuk `kalkulator` (CostCompare + Calculator), `mitra` (Partnership), `edukasi` (Education),
`kontak` (Contact).

- [ ] **Step 5: `contact.tsx`** — isi `/kontak`

Bagian: kanal WhatsApp (`copy.contact.whatsappTitle/Body/Cta`), status NPP dari
`copy.validation.nppStatus`, catatan legal dari `copy.footer.contactNotice`, lalu form sampel
(`<Cta />` sudah memuat `SampleForm` dengan `id="form-sampel"`).

- [ ] **Step 6: Hapus berkas mati**

```bash
git rm apps/web/components/sections/impact.tsx apps/web/components/blocks/metric-panel.tsx apps/web/lib/data/impact.ts
```

- [ ] **Step 7: Typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: bersih.

---

### Task 4: Perbaikan kalkulator — validasi batas dan luber

**Files:**
- Modify: `apps/web/components/blocks/savings-calculator.tsx`, `apps/web/components/sections/calculator.tsx`
- Test: `apps/web/tests/unit/savings-calculator.test.tsx`

**Interfaces:**
- Consumes: `calculateFeedSavings()` (tidak berubah), `FieldError` dari `@/components/ui/input`

**Akar masalah terukur:**
- Persentase meledak: input Rp123 → `-130.069%`; Rp1 → `-19.199.900%`.
- Kartu hasil meluber pada 1149 px: `dd` `scroll=264 client=182`, bahkan pada kasus normal
  Rp768.000 (`scroll=242 client=214`). Penyebab: `type-metric-md` = 40 px di dalam kartu 214 px.

- [ ] **Step 1: Tulis uji validasi yang gagal**

```tsx
it("menandai harga pembanding di luar rentang wajar", () => {
  renderCalculator();
  fireEvent.change(screen.getByLabelText(copy.calculator.comparePriceLabel), {
    target: { value: "123" },
  });
  expect(screen.getByText(copy.calculator.errors.compareRange)).toBeTruthy();
});

it("menampilkan keadaan tidak valid alih-alih angka meledak", () => {
  renderCalculator();
  fireEvent.change(screen.getByLabelText(copy.calculator.comparePriceLabel), {
    target: { value: "1" },
  });
  expect(screen.getByText(copy.calculator.invalidTitle)).toBeTruthy();
  expect(screen.queryByText(/-19\.199\.900%/u)).toBeNull();
});
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `cd apps/web && npx vitest run tests/unit/savings-calculator.test.tsx`
Expected: FAIL — `copy.calculator.errors` tidak ada.

- [ ] **Step 3: Tambah naskah galat**

```ts
    errors: {
      compareRange: "Harga pakan pabrik antara Rp50.000 dan Rp1.000.000 per karung.",
      cattleRange: "Jumlah sapi antara 1 dan 10.000 ekor.",
      intakeRange: "Asupan harian antara 0,5 dan 15 kg per ekor.",
    },
```

- [ ] **Step 4: Implementasi validasi di komponen**

```tsx
const COMPARE_MIN = 50_000;
const COMPARE_MAX = 1_000_000;

const comparePriceError =
  comparePrice.trim() === ""
    ? null
    : Number(comparePrice) < COMPARE_MIN || Number(comparePrice) > COMPARE_MAX
      ? copy.calculator.errors.compareRange
      : null;
const cattleError = /* pola sama, CATTLE_MIN..CATTLE_MAX */;
const intakeError = /* pola sama, INTAKE_MIN..INTAKE_MAX */;
const hasFieldError = comparePriceError !== null || cattleError !== null || intakeError !== null;

const result = hasFieldError ? null : calculateFeedSavings({ ... });
```

`Input` diberi `invalid={...}` dan `aria-describedby`, `FieldError` dirender di bawah tiap kolom.

- [ ] **Step 5: Perbaiki luber**

Pada kartu hasil: bungkus tiap item dengan `min-w-0`, dan pada `dd` tambah `break-words`. Kartu
utama diberi `min-w-0`. Nilai utama tetap `type-metric-md` — di halaman sendiri kartu selebar
~500 px sehingga tidak lagi terjepit.

- [ ] **Step 6: Jalankan uji**

Run: `cd apps/web && npx vitest run tests/unit/savings-calculator.test.tsx tests/unit/feed-cost.test.ts`
Expected: PASS

---

### Task 5: SEO per halaman, sitemap, dan bukti akhir

**Files:**
- Modify: `apps/web/app/sitemap.ts`, `apps/web/lib/seo/structured-data.ts`
- Test: `apps/web/tests/e2e/smoke.spec.ts`, `apps/web/tests/unit/structured-data.test.ts`

- [ ] **Step 1: `sitemap.ts` — 6 URL**

```ts
const ROUTES = ["", "/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"] as const;
export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: `${env.siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
```

- [ ] **Step 2: `structured-data.ts` — tambah `buildWebPageJsonLd(path, name, description)`**

- [ ] **Step 3: E2E — enam rute balas 200 dan navigasi bekerja**

```ts
for (const route of ["/", "/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]) {
  const response = await page.goto(route);
  expect(response?.status()).toBe(200);
}
```

Tambah: klik nav "Kalkulator" dari beranda → URL `/kalkulator`; isi kalkulator → klik CTA →
URL `/kontak#form-sampel` dan `#cattleCount` terisi.

- [ ] **Step 4: Probe luber diulang**

Run: `node probe-overflow.mjs` (390 px dan 1149 px, kasus Rp123 dan Rp200.000)
Expected: `elemen meluber: tidak ada` pada semua kasus.

- [ ] **Step 5: Verifikasi penuh**

```bash
unset NODE_ENV
npm run typecheck && npm run lint && npm run test
npm run check:terms && npm run check:emoji && npm run check:tokens && npm run check:env && npm run check:secrets
npm run build
cd apps/web && DEMO_MODE=true npx playwright test
```

Expected: semua hijau.

- [ ] **Step 6: Perbarui `Docs/PRD.md` dan `Docs/DESIGN.md`**

Catat struktur 6 halaman dan penghapusan S3.
