# Landing Page Conversion Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every ReCob.id landing route concise, product-led, conversion-focused, and responsive at mobile/tablet widths.

**Architecture:** Reuse existing product sections and form. Add one small shared `ProductCta` section for routes that need a closing conversion block; keep direct CTA pairs inside `Hero`, `ProductHero`, and `ProductComparison`. Move the product catalog after product ingredients, remove dead/generic home content, and keep all product data/form contracts unchanged.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind utility classes, Vitest, Playwright, existing `ButtonLink`, `Section`, `Card`, and shared lead contract.

**Spec:** `Docs/specs/2026-09-24-landing-page-conversion-refresh.md`

## Global Constraints

- Use only existing retail product `recob-pelet-50kg`; no fictional products, testimonials, metrics, or route `/produk/[slug]`.
- Product name, price, unit, and image path remain DB/generated-data driven; do not hand-edit `apps/web/lib/data/demo-data.ts`.
- All product CTA destinations use `/kontak#form-sampel`; internal links stay in the current tab.
- Exact conversion labels: `Preorder Sekarang` and `Klaim Sampel Gratis`.
- Keep existing form validation, rate limiting, lead API, database, metadata, canonical, and JSON-LD contracts.
- No new dependency, no checkout/payment system, no commit, no push.
- Preserve unrelated working-tree changes.
- Responsive QA viewports: 390px, 768px, 1024px, and 1440px; body horizontal overflow is forbidden, tables may scroll locally.
- All new UI copy lives in `apps/web/content/copy/id.ts`; no display strings in JSX.

## Review Focus

- A visitor can reach the existing form from every conversion CTA without a new tab or dead link.
- `/produk` order stays exact after catalog move, including one H1 and no duplicate product-detail route.
- Mobile sticky CTA cannot cover form controls or create layout shift; keyboard focus remains visible.
- Long Indonesian labels wrap at 390px and 768px without changing CTA semantics.
- Removed home sections are absent from rendered DOM, while legal, validation, FAQ, partnership, and education content remains reachable where specified.

---

### Task 1: Lock conversion copy and route contracts with failing tests

**Files:**
- Modify: `apps/web/tests/unit/copy.test.ts`
- Modify: `apps/web/tests/unit/site-header.test.tsx`
- Modify: `apps/web/tests/unit/sections-top.test.tsx`
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces copy keys used by later tasks: `copy.cta.preorderLabel`, `copy.cta.sampleLabel`, `copy.cta.compact`, `copy.nav.primaryCta`.
- Produces E2E selectors for `/produk` DOM order and every conversion CTA target.

- [x] **Step 1: Add failing unit assertions for exact CTA copy and removed home sections**

Add assertions equivalent to:

```ts
expect(copy.cta.preorderLabel).toBe("Preorder Sekarang");
expect(copy.cta.sampleLabel).toBe("Klaim Sampel Gratis");
expect(copy.nav.primaryCta).toBe("Preorder Sekarang");
expect(copy.cta.compact.title.length).toBeGreaterThan(3);
expect("productSummary" in copy).toBe(false);
expect("toolLinks" in copy).toBe(false);
```

Update the section list in `copy.test.ts` so it no longer requires dead `productSummary` and `toolLinks` objects.

- [x] **Step 2: Add failing header/sticky assertions**

Assert the desktop header has the preorder link, mobile navigation exposes both labels, and every new CTA href is exactly `/kontak#form-sampel`.

- [x] **Step 3: Add failing E2E route-order and CTA assertions**

For `/produk`, collect the DOM positions of `#produk-hero`, `#formulasi`, `#katalog-produk`, and `#perbandingan`; assert:

```ts
expect(positions.produkHero).toBeLessThan(positions.formulasi);
expect(positions.formulasi).toBeLessThan(positions.katalog);
expect(positions.katalog).toBeLessThan(positions.perbandingan);
```

Assert the product hero has links named `Preorder Sekarang` and `Klaim Sampel Gratis`, both targeting `/kontak#form-sampel`. Add route-level checks for compact CTA on `/kalkulator`, `/spesifikasi-produk`, `/edukasi`, and `/mitra`.

- [x] **Step 4: Run RED tests and confirm the failures are about missing behavior**

Run:

```bash
cd apps/web
npx vitest run tests/unit/copy.test.ts tests/unit/site-header.test.tsx tests/unit/sections-top.test.tsx
npx playwright test tests/e2e/smoke.spec.ts -g "CTA|katalog|spesifikasi|edukasi|mitra"
```

Expected: failures for missing copy keys, old home blocks, old product order, and old CTA labels/hrefs. Do not change production code before recording this RED result.

---

### Task 2: Move product catalog and update direct product conversion points

**Files:**
- Modify: `apps/web/app/produk/page.tsx`
- Modify: `apps/web/components/sections/product-hero.tsx`
- Modify: `apps/web/components/sections/product-catalog.tsx`
- Modify: `apps/web/components/sections/product-comparison.tsx`
- Modify: `apps/web/content/copy/id.ts`

**Interfaces:**
- `ProductCatalog` continues to accept `products: ReadonlyArray<DemoProduct>`.
- Product page continues to call `Promise.all([getPrimaryProduct(), getProducts()])`.
- Product JSON-LD remains unchanged.

- [x] **Step 1: Move the existing render call without changing catalog implementation**

Change the JSX order to:

```tsx
<main id="konten">
  <ProductHero />
  <ProductMarquee />
  <ProductIngredients />
  <ProductCatalog products={products} />
  <ProductComparison />
</main>
```

Update the nearby comment so it describes product hero first and catalog after ingredients.

- [x] **Step 2: Add exact product-hero CTA pair**

Keep the existing calculator link as a tertiary text/action only if it remains below the primary pair. The first two buttons must render:

```tsx
<ButtonLink href="/kontak#form-sampel" size="lg" variant="accent">
  {copy.cta.preorderLabel}
</ButtonLink>
<ButtonLink href="/kontak#form-sampel" size="lg" variant="secondary">
  {copy.cta.sampleLabel}
</ButtonLink>
```

Do not add a dynamic product route.

- [x] **Step 3: Update catalog card actions**

Keep the calculator link and specification link. Add the primary preorder link as the first card action:

```tsx
<ButtonLink href="/kontak#form-sampel" variant="accent">
  {copy.cta.preorderLabel}
</ButtonLink>
```

Do not hardcode product price, unit, or image fallback beyond the existing generated-data fallback.

- [x] **Step 4: Update comparison closing actions**

Replace the generic contact-secondary action with the two form CTAs, using `copy.cta.preorderLabel` and `copy.cta.sampleLabel`; keep the comparison table and transition content unchanged.

- [x] **Step 5: Add the copy keys and exact labels**

Add under `copy.cta`:

```ts
preorderLabel: "Preorder Sekarang",
sampleLabel: "Klaim Sampel Gratis",
compact: {
  eyebrow: "Langkah Berikutnya",
  title: "Siap Uji Pakan di Kandang?",
  intro: "Kirim permintaan sampel atau preorder. Tim ReCob.id akan menghubungi Anda untuk jadwal dan ketersediaan.",
},
```

Use these keys in JSX. Keep the existing form title/validation unless Task 3 changes request wording.

- [x] **Step 6: Run focused GREEN tests**

Run:

```bash
cd apps/web
npx vitest run tests/unit/copy.test.ts tests/unit/data.test.ts tests/unit/produk-interaktif.test.tsx
npx playwright test tests/e2e/smoke.spec.ts -g "produk|katalog|CTA"
```

Expected: product order and direct CTA assertions pass; no route or type failure.

---

### Task 3: Add one compact conversion section to supporting routes

**Files:**
- Create: `apps/web/components/sections/product-cta.tsx`
- Modify: `apps/web/app/kalkulator/page.tsx`
- Modify: `apps/web/app/spesifikasi-produk/page.tsx`
- Modify: `apps/web/app/edukasi/page.tsx`
- Modify: `apps/web/app/mitra/page.tsx`
- Modify: `apps/web/tests/unit/sections-bottom.test.tsx`
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- `ProductCta` is a server-compatible component with no props:

```tsx
export function ProductCta(): ReactNode;
```

- It renders one `Section` with `id="cta-produk"` and two `ButtonLink`s targeting `/kontak#form-sampel`.

- [x] **Step 1: Write the failing component test**

Render `ProductCta` in the existing section test harness and assert exactly one `link` named `Preorder Sekarang`, one named `Klaim Sampel Gratis`, and two identical hrefs. Assert the section heading uses `copy.cta.compact.title`.

- [x] **Step 2: Run the component test RED**

Run:

```bash
cd apps/web
npx vitest run tests/unit/sections-bottom.test.tsx -t "ProductCta"
```

Expected: fail because `product-cta.tsx` does not exist.

- [x] **Step 3: Implement the minimal shared component**

Use existing `Section`, `Container`, and `ButtonLink`; keep buttons stacked on narrow screens:

```tsx
<div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap">
  <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="accent">
    {copy.cta.preorderLabel}
  </ButtonLink>
  <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="secondary">
    {copy.cta.sampleLabel}
  </ButtonLink>
</div>
```

Do not add a form, API call, prop-driven configuration, or new card abstraction.

- [x] **Step 4: Render it only on routes without an existing conversion block**

Append `<ProductCta />` after the existing main content on:

```tsx
// apps/web/app/kalkulator/page.tsx
<CostCompare />
<ProductCta />

// apps/web/app/spesifikasi-produk/page.tsx
<ProductUsage />
<ProductCta />

// apps/web/app/edukasi/page.tsx
<Education />
<ProductCta />

// apps/web/app/mitra/page.tsx
<Partnership />
<ProductCta />
```

Do not render `ProductCta` on `/` or `/kontak`; those pages already have the full `Cta` form.

- [x] **Step 5: Run focused GREEN tests**

Run:

```bash
cd apps/web
npx vitest run tests/unit/sections-bottom.test.tsx
npx playwright test tests/e2e/smoke.spec.ts -g "kalkulator|spesifikasi|edukasi|mitra"
```

Expected: all four routes show the compact CTA pair and existing content still renders.

---

### Task 4: Align global header, sticky CTA, home funnel, and dead content

**Files:**
- Modify: `apps/web/components/blocks/site-header.tsx`
- Modify: `apps/web/components/blocks/sticky-cta.tsx`
- Modify: `apps/web/app/page.tsx`
- Modify: `apps/web/components/sections/hero.tsx`
- Modify: `apps/web/components/sections/cta.tsx`
- Modify: `apps/web/content/copy/id.ts`
- Delete: `apps/web/components/sections/product-summary.tsx`
- Delete: `apps/web/components/sections/tool-links.tsx`
- Modify: `apps/web/tests/unit/site-header.test.tsx`
- Modify: `apps/web/tests/unit/copy.test.ts`
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Header desktop primary CTA: `copy.nav.primaryCta` → `/kontak#form-sampel`.
- Header mobile menu and sticky bar expose both `copy.cta.preorderLabel` and `copy.cta.sampleLabel` → `/kontak#form-sampel`.
- `Cta` remains the only full sample/preorder request form.

- [x] **Step 1: Update failing header and home assertions**

Assert the desktop header uses preorder copy; mobile menu and sticky CTA expose both labels; `/` does not render `ProductSummary`, `ToolLinks`, or the removed generic `Problem`/`ImpactStrip` blocks. Keep assertions for `Solution`, `Validation`, `Faq`, and `Cta`.

- [x] **Step 2: Run RED tests**

Run:

```bash
cd apps/web
npx vitest run tests/unit/site-header.test.tsx tests/unit/copy.test.ts
npx playwright test tests/e2e/smoke.spec.ts -g "beranda|header|CTA"
```

Expected: old header label, dead sections, and old home composition fail.

- [x] **Step 3: Update global CTA copy and header behavior**

Add:

```ts
// copy.nav
primaryCta: "Preorder Sekarang",
sampleCta: "Klaim Sampel Gratis",
```

Keep `SAMPLE_HREF` as `/kontak#form-sampel`. Render the primary preorder button in the desktop header. In the mobile menu, render both labels as full-width stacked buttons. Do not change navigation routes.

- [x] **Step 4: Update sticky CTA behavior**

Render the two form links with `copy.cta.preorderLabel` and `copy.cta.sampleLabel`; remove the WhatsApp label from the sticky bar if no longer used. Keep the bar `md:hidden`, add bottom padding to the page shell only if the fixed bar can cover focused content, and preserve focus-visible styling through `ButtonLink`.

- [x] **Step 5: Make home product-led**

Change the home render order to:

```tsx
<Hero />
<Solution />
<Validation />
<Faq />
<Cta />
```

Remove `Problem` and `ImpactStrip` imports/renders. Keep the hero price, product solution, validation evidence, FAQ, legal/form CTA, and JSON-LD. Rewrite only short visible intros that still describe generic scale or problem framing; do not delete factual legal or validation copy.

- [x] **Step 6: Delete dead sections and copy objects**

Confirm repository-wide references are absent, then delete `product-summary.tsx` and `tool-links.tsx`. Remove `copy.productSummary` and `copy.toolLinks` only after all runtime and unit references are gone. Leave `problem`/`impact` component files untouched unless a later task proves they are dead and deletion is required; this task only removes them from home render.

- [x] **Step 7: Run focused GREEN tests**

Run:

```bash
cd apps/web
npx vitest run tests/unit/site-header.test.tsx tests/unit/copy.test.ts tests/unit/sections-top.test.tsx
npx playwright test tests/e2e/smoke.spec.ts -g "beranda|header|CTA"
```

Expected: home has no removed blocks, header/sticky labels match copy, and form links resolve.

---

### Task 5: Apply focused mobile/tablet layout polish

**Files:**
- Modify: `apps/web/components/blocks/site-header.tsx`
- Modify: `apps/web/components/blocks/sticky-cta.tsx`
- Modify: `apps/web/components/sections/product-cta.tsx`
- Modify: `apps/web/components/sections/cta.tsx`
- Modify: `apps/web/components/sections/education.tsx`
- Modify: `apps/web/components/sections/partnership.tsx`
- Modify: `apps/web/components/sections/product-catalog.tsx`
- Modify: `apps/web/components/sections/product-comparison.tsx`
- Modify: `apps/web/tests/e2e/smoke.spec.ts`

**Interfaces:**
- Existing Tailwind breakpoints remain: mobile below 768px, tablet at 768px, desktop at 1024px.
- No new CSS framework or viewport-specific JavaScript.

- [x] **Step 1: Add failing viewport assertions**

Extend the existing no-overflow test to run at 390px and 768px for `/`, `/produk`, `/kalkulator`, `/spesifikasi-produk`, `/edukasi`, `/mitra`, and `/kontak`. Assert `document.documentElement.scrollWidth <= window.innerWidth`; keep table checks scoped to the table wrapper.

- [x] **Step 2: Run RED viewport test**

Run:

```bash
cd apps/web
npx playwright test tests/e2e/smoke.spec.ts -g "overflow|viewport"
```

Expected: fail if current labels, long CTA text, or fixed bar cause overflow/overlap.

- [x] **Step 3: Apply minimal responsive class fixes**

Use these rules:

```tsx
// compact CTA
<div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap">
  <ButtonLink className="w-full sm:w-auto" ... />

// mobile menu actions
<div className="flex flex-col gap-xs">
  <ButtonLink className="w-full" ... />
</div>

// card grids
"grid gap-lg sm:grid-cols-2 lg:grid-cols-3"

// prose/forms remain one column until existing lg breakpoint
"grid gap-2xl lg:grid-cols-[0.9fr_1.1fr]"
```

Keep `overflow-x-auto` on comparison/table wrappers. Add `min-w-0` only where a grid child demonstrably causes body overflow. Do not hide content or reduce touch targets to fit labels.

- [x] **Step 4: Run GREEN viewport tests and inspect key screenshots**

Run the focused Playwright test at 390px, 768px, and 1024px. Check sticky CTA visibility after scroll, form submit visibility, product image/card stacking, and long Indonesian CTA wrapping. Use `page.emulateMedia({ reducedMotion: "reduce" })` for any `toBeInViewport()` assertion.

---

### Task 6: Full verification and review handoff

**Files:**
- No production files unless a verification failure identifies a direct regression.
- Update: this plan's checkboxes after each verified task.

- [x] **Step 1: Run web unit and type/lint checks**

```bash
npm run lint
npm run typecheck
npm run test --workspace @recobid/web
```

Expected: exit `0`.

- [x] **Step 2: Run full E2E suite**

```bash
npm run test:e2e --workspace @recobid/web
```

Expected: all existing and new tests pass; no horizontal overflow at required viewports.

- [x] **Step 3: Run full repository verification**

```bash
npm run verify
git diff --check
npm run check:secrets
```

Expected: exit `0`, clean diff check, and no secret findings.

- [x] **Step 4: Review diff scope**

Confirm no product data, backend contract, generated file, unrelated route, or dependency changed. Confirm no commit or push was made. Report exact test counts and any skipped tests.
