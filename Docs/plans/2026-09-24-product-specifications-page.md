# Product Specifications Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memindahkan detail cara memberi dan spesifikasi kemasan dari `/produk` ke `/spesifikasi-produk`, serta membuat setiap langkah cara memberi tampil dalam kartu seperti panduan.

**Architecture:** `/produk` tetap menjadi halaman ringkas dan mewarisi `ProductUsage` sebagai komponen detail. Route statis baru merender `PageHeader` dan `ProductUsage`; komponen itu memakai `Card` yang sudah ada untuk grid kartu. Katalog, metadata, sitemap, dan E2E contract diperbarui tanpa mengubah sumber data atau menambah dependency.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind utility classes, Vitest, Playwright.

**Spec:** `Docs/specs/2026-09-24-product-specifications-page.md`

## Global Constraints

- Bahasa UI tetap Bahasa Indonesia dan semua teks baru masuk ke `apps/web/content/copy/id.ts`.
- Route detail baru statis: `/spesifikasi-produk`; jangan membuat `/produk/[slug]` atau produk fiktif.
- CTA utama katalog tetap menuju `/kalkulator`.
- Data produk tetap berasal dari DB melalui `getPrimaryProduct()`/`getProducts()`; jangan mengedit `demo-data.ts` manual.
- Jangan menambah dependency, route detail dinamis, testimonial, atau produk fiktif.
- Beranda harus menghapus `ProductSummary` dan `ToolLinks`; kalkulator harus menampilkan `Calculator` sebelum `CostCompare`.
- Jangan menghapus `Problem`, `Solution`, `Validation`, `Faq`, CTA, legalitas, atau halaman `Mitra`/`Edukasi`; setiap blok memiliki tugas informasi atau konversi.
- Jangan commit atau push; perubahan tetap di working tree.
- Verifikasi akhir memakai `npm run verify` dan `git diff --check`.

## Review Focus

- Route baru harus dapat dibuka langsung dan memiliki H1, metadata, serta sitemap entry.
- `/produk` tidak boleh lagi memuat `#cara-pakai` setelah pemindahan.
- Beranda tidak boleh lagi menampilkan blok harga/CTA duplikat atau navigasi yang sama dengan header.
- Kalkulator harus menjawab tugas utama(interaktif) sebelum tabel pembanding.
- Lima langkah harus berada dalam lima box, bukan daftar divider biasa.
- Tautan kalkulator harus tetap `/kalkulator`; tautan spesifikasi harus menuju `/spesifikasi-produk`.
- Layout 390px dan 1440px tidak boleh memiliki horizontal overflow.

---

### Task 1: Add failing route and layout contracts

**Files:**
- Modify: `apps/web/tests/e2e/smoke.spec.ts`
- Test only; no production files in this task.

**Interfaces:**
- Consumes: existing Playwright page fixture and `copy` import.
- Produces: failing assertions for `/spesifikasi-produk`, `data-testid="usage-step-card"`, the shortened `/produk` route, home without duplicate sections, and calculator interactive section first.

- [x] **Step 1: Add route to the public-route smoke loop**

Change the route list in `test("enam halaman balas 200 dan punya judul utama")` to include `"/spesifikasi-produk"` and update the test title to describe seven pages.

- [ ] **Step 2: Add failing detail-page test**

Add this test after the product-section test:

```ts
  test("halaman spesifikasi memisahkan cara memberi dan spesifikasi kemasan", async ({ page }) => {
    await page.goto("/spesifikasi-produk");

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.locator("#cara-pakai")).toHaveCount(1);
    await expect(page.locator('[data-testid="usage-step-card"]')).toHaveCount(
      copy.productStory.usageSteps.length,
    );
    await expect(page.locator("#cara-pakai")).toContainText("Spesifikasi Kemasan");
    await expect(page.locator("#cara-pakai")).toContainText("Cara Menyimpan");
  });
```

- [ ] **Step 3: Add failing shortened-product assertion**

Add this test before the existing responsive test:

```ts
  test("halaman produk ringkas dan menautkan halaman spesifikasi", async ({ page }) => {
    await page.goto("/produk");

    await expect(page.locator("#cara-pakai")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Lihat spesifikasi" })).toHaveAttribute(
      "href",
      "/spesifikasi-produk",
    );
    await expect(page.getByRole("link", { name: /Kalkulator Penghematan/i })).toHaveAttribute(
      "href",
      "/kalkulator",
    );
  });
```

- [ ] **Step 4: Add failing landing-page audit assertions**

Add this test before the existing home narrative test:

```ts
  test("beranda hanya mempertahankan blok yang punya tugas konversi atau informasi", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("#produk-ringkas")).toHaveCount(0);
    await expect(page.locator("#jelajahi")).toHaveCount(0);
    await expect(page.locator("#mutu")).toHaveCount(1);
    await expect(page.locator("#faq")).toHaveCount(1);
  });

  test("kalkulator menempatkan kalkulator interaktif sebelum tabel", async ({ page }) => {
    await page.goto("/kalkulator");

    const urutan = await page.locator("main > *").evaluateAll((nodes) =>
      nodes.map((node) => node.id),
    );
    expect(urutan.indexOf("kalkulator")).toBeLessThan(urutan.indexOf("penghematan"));
  });
```

- [ ] **Step 5: Run the new tests and verify RED**

Run:

```bash
npx playwright test tests/e2e/smoke.spec.ts -g "halaman spesifikasi|halaman produk ringkas|beranda hanya|kalkulator menempatkan"
```

Expected: FAIL because `/spesifikasi-produk` does not exist, `#cara-pakai` still exists on `/produk`, home still has duplicate sections, the catalog link is absent, and calculator order is reversed.

---

### Task 2: Add the static specifications route and boxed usage cards

**Files:**
- Create: `apps/web/app/spesifikasi-produk/page.tsx`
- Modify: `apps/web/content/copy/id.ts:426-455`
- Modify: `apps/web/components/sections/product-usage.tsx`
- Modify: `apps/web/app/produk/page.tsx`
- Test: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `PageHeader`, `JsonLd`, `ProductUsage`, `getPrimaryProduct`, `buildWebPageJsonLd`, and `copy.pages`.
- Produces: `/spesifikasi-produk` with `#cara-pakai`; `ProductUsage` renders `data-testid="usage-step-card"` on each step item.

- [ ] **Step 1: Add page copy**

Add this sibling under `pages` beside `produk`:

```ts
      spesifikasiProduk: {
        eyebrow: "Detail Produk",
        title: "Spesifikasi Produk",
        intro: "Lihat cara memberi pakan, isi karung, dan cara menyimpan ReCob.id.",
      },
```

- [ ] **Step 2: Create the route page**

Create `apps/web/app/spesifikasi-produk/page.tsx` with the existing page pattern:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { ProductUsage } from "@/components/sections/product-usage";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.spesifikasiProduk.title,
  description: copy.pages.spesifikasiProduk.intro,
  alternates: { canonical: "/spesifikasi-produk" },
};

export default function SpesifikasiProdukPage(): ReactNode {
  const pageCopy = copy.pages.spesifikasiProduk;

  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd(env.siteUrl, {
          path: "/spesifikasi-produk",
          name: pageCopy.title,
          description: pageCopy.intro,
        })}
      />
      <main id="konten">
        <PageHeader {...pageCopy} />
        <ProductUsage />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Convert usage steps to guide-style cards**

In `product-usage.tsx`, import `Card` and replace only the usage `<ol>` block with:

```tsx
            <ol className="mt-xl grid auto-rows-fr gap-md md:grid-cols-2">
              {copy.productStory.usageSteps.map((step, index) => (
                <li
                  className="h-full"
                  data-reveal=""
                  data-testid="usage-step-card"
                  key={step.title}
                  style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
                >
                  <Card className="flex h-full flex-col" tone="paper">
                    <span className="type-mono-data text-primary">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-2xs type-h3 text-ink">{step.title}</h3>
                    <p className="mt-xs type-body-sm text-text-secondary">{step.body}</p>
                  </Card>
                </li>
              ))}
            </ol>
```

Leave the image, price/specification list, storage block, and section heading unchanged.

- [ ] **Step 4: Remove the detail section from `/produk`**

Remove the `ProductUsage` import and its `<ProductUsage />` render from `apps/web/app/produk/page.tsx`. Keep `getPrimaryProduct()` because the page still builds product JSON-LD. Update the nearby page comment to say the page is the short catalog/hero/ingredients/comparison view.

- [ ] **Step 5: Run the focused E2E tests**

Run:

```bash
npx playwright test tests/e2e/smoke.spec.ts -g "halaman spesifikasi|halaman produk ringkas"
```

Expected: PASS for the new route, five card items, absent old section, and both links.

---

### Task 3: Add catalog discovery link and sitemap entry

**Files:**
- Modify: `apps/web/components/sections/product-catalog.tsx`
- Modify: `apps/web/content/copy/id.ts` catalog copy
- Modify: `apps/web/app/sitemap.ts`
- Test: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: existing `catalogCopy`, `ButtonLink`, `ArrowRight`, and `ROUTES`.
- Produces: visible `Lihat spesifikasi` link and `/spesifikasi-produk` sitemap URL while preserving `/kalkulator` CTA.

- [ ] **Step 1: Add catalog copy**

Add this key inside `pages.produk.catalog`:

```ts
        specificationCta: "Lihat spesifikasi",
```

- [ ] **Step 2: Add the secondary catalog link**

Inside each product card, after the existing `ButtonLink` to `/kalkulator`, add:

```tsx
                        <ButtonLink
                          className="mt-sm self-start px-0"
                          href="/spesifikasi-produk"
                          variant="ghost"
                        >
                          {catalogCopy.specificationCta}
                          <ArrowRight aria-hidden="true" size={16} strokeWidth={1.75} />
                        </ButtonLink>
```

Do not change the existing kalkulator button or its `href`.

- [ ] **Step 3: Add sitemap route**

Change the route comment to seven public routes and add this entry immediately after `/produk`:

```ts
  { path: "/spesifikasi-produk", changeFrequency: "monthly", priority: 0.8 },
```

- [ ] **Step 4: Update old product-section expectations**

In `smoke.spec.ts`, remove `cara-pakai` from the `/produk` section ID loops and DOM-order expected array. Keep the usage ID and photo assertions, but run them against `/spesifikasi-produk` in the new detail test or a focused detail test.

- [ ] **Step 5: Run affected tests**

Run:

```bash
npx playwright test tests/e2e/smoke.spec.ts -g "produk|spesifikasi"
npm run test --workspace @recobid/web
```

Expected: all affected tests pass; no `/produk` assertion still expects `#cara-pakai`.

---

### Task 4: Remove low-value landing-page duplication

**Files:**
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/app/kalkulator/page.tsx`
- Test: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: existing `Hero`, `ImpactStrip`, `Problem`, `Solution`, `Validation`, `Faq`, `Cta`, `Calculator`, and `CostCompare` components.
- Produces: shorter home conversion path and calculator-first information hierarchy; no compliance or FAQ content removed.

- [ ] **Step 1: Remove duplicate home sections**

From `apps/web/app/page.tsx`, remove the `ProductSummary` and `ToolLinks` imports and remove their JSX renders. Keep `getPrimaryProduct()` because the home JSON-LD still uses the product. Keep `Hero`, `ImpactStrip`, `Problem`, `Solution`, `Validation`, `Faq`, and `Cta`.

- [ ] **Step 2: Put interactive calculator first**

In `apps/web/app/kalkulator/page.tsx`, change only the render order:

```tsx
      <PageHeader {...copy.pages.kalkulator} />
      <Calculator />
      <CostCompare />
```

Keep the `HowTo` JSON-LD and both sections.

- [ ] **Step 3: Run the audit tests and verify GREEN**

Run:

```bash
npx playwright test tests/e2e/smoke.spec.ts -g "beranda hanya|kalkulator menempatkan"
```

Expected: PASS; home no longer has `#produk-ringkas` or `#jelajahi`, `#mutu` and `#faq` remain, and `#kalkulator` precedes `#penghematan`.

### Task 5: Full verification and diff review

**Files:**
- Review: all files changed by Tasks 1–4.

**Interfaces:**
- Consumes: completed route, card, copy, sitemap, and test changes.
- Produces: verified working tree; no commit or push.

- [ ] **Step 1: Run the full verification suite**

Run:

```bash
npm run verify
```

Expected: exit `0`, including unit tests, E2E tests, production build, token checks, environment checks, emoji/foreign-term checks, secret scan, and route generation.

- [ ] **Step 2: Run final diff checks**

Run:

```bash
git diff --check
npm run check:secrets
git status --short --untracked-files=all
```

Expected: no whitespace errors, clean direct secret scan, and only intended source/test/spec/plan files changed.

- [ ] **Step 3: Review acceptance criteria against implementation**

Confirm each criterion in `Docs/specs/2026-09-24-product-specifications-page.md` has a corresponding passing assertion. Do not commit or push.
