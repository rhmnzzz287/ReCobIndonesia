# Landing Page Conversion Refresh Specification

**Status:** Desain已在聊天中获用户批准（2026-09-24）。本文和实施计划获审后才开始改代码。

## Tujuan

把 ReCob.id landing pages 收敛成以产品购买决策为中心的销售漏斗：访客先看到产品规格、价格和差异，再清楚看到 `Preorder Sekarang` 或 `Klaim Sampel Gratis` 两个动作，并能直接抵达现有表单 `/kontak#form-sampel`。内容必须具体、可信、产品相关，避免重复叙事和泛化营销话术。

## Boundaries

- 只使用现有零售产品 `recob-pelet-50kg`；不新增产品、虚构评价、虚构指标或新依赖。
- 产品名称、价格、单位、图片路径继续来自 DB/`demo-data.ts`；不手改生成数据。
- 保留现有表单、API、数据库、metadata、canonical、JSON-LD 合约；CTA 只改变展示和链接。
- `Preorder Sekarang` 表示提交 minat/pemesanan melalui form, bukan konfirmasi pembayaran. Copy form harus menyatakan tim akan menghubungi pemesan.
- Tidak mengubah route dinamis `/produk/[slug]`.
- 不 commit、不 push；保留当前 working tree perubahan sebelumnya.

## Route and section order

### `/produk`

Urutan final:

1. `ProductHero`
2. `ProductMarquee`
3. `ProductIngredients` — `Tiga Bahan Lokal, Satu Karung Pelet Bernutrisi`
4. `ProductCatalog`
5. `ProductComparison`

Catalog tidak lagi menjadi pembuka. `ProductHero` tetap memiliki satu H1. `ProductCatalog` tetap stateless dan menerima `ReadonlyArray<DemoProduct>`.

### `/`

- `Hero` menjadi orientasi produk, harga, dan CTA.
- `ImpactStrip`, `Solution`, `Validation`, `Faq`, dan `Cta` hanya dipertahankan bila masih menjalankan tugas konversi atau信任/product proof.
- `Problem` dan blok naratif generic yang tidak lagi，回答 “produk ini apa, berapa, dan kenapa memilih” dihapus dari render beranda.
- `ProductSummary` dan `ToolLinks` tidak dirender; file dan copy yang benar-benar dead dihapus bila tidak dipakai route, schema, atau machine-readable content.

### `/kalkulator`

- `PageHeader`, `Calculator`, `CostCompare`, lalu compact product conversion CTA.
- Kalkulator tetap sebelum tabel.
- Asumsi dan disclaimer tetap karena diperlukan untuk kepercayaan; copy yang mengulang penjelasan elsewhere dipadatkan.

### `/spesifikasi-produk`

- `PageHeader`, `ProductUsage`, lalu compact product conversion CTA.
- Seluruh usage, packaging, dan storage content tetap; tidak ditambahkan produk fiktif.

### `/edukasi`

- `PageHeader`, `Education`, lalu compact product conversion CTA.
- Empat panduan dipertahankan hanya jika terkait dengan pemakaian, penyimpanan, biaya, atau keputusan candidatura produk.

### `/mitra`

- `PageHeader`, `Partnership`, lalu compact product conversion CTA.
- Alur KUD, wilayah, dan potong setoran susu tetap karena menjelaskan mekanisme pembelian.

### `/kontak`

- `PageHeader`, `Contact`, `Cta`/form.
- Tidak menambahkan CTA compact di atas form; halaman ini sudah titik konversi.
- Copy channel duplik dipadatkan; legalitas dan status NPP tetap karena memengaruhi kepercayaan.

## CTA policy

- Dua label exact: `Preorder Sekarang` dan `Klaim Sampel Gratis`.
- Semua CTA produk menuju `/kontak#form-sampel`.
- `/produk`: `ProductHero` dua CTA; `ProductCatalog` primary `Preorder Sekarang`, secondary `Lihat Spesifikasi`; `ProductComparison` closing dua CTA.
- `/`: `Hero` dua CTA; `Cta` menjadi form sample/preorder closing block.
- `/kalkulator`, `/spesifikasi-produk`, `/edukasi`, `/mitra`: satu compact conversion section dengan dua CTA, tanpa form duplicate.
- Desktop header menampilkan primary `Preorder Sekarang`; mobile menu dan sticky bar menampilkan `Preorder Sekarang` dan `Klaim Sampel Gratis` bila ruang memungkinkan, dengan target yang sama.
- CTA tidak bolehopened new tab untuk link internal. External WhatsApp hanya memakai config resmi yang sudah ada.
- CTA label disimpan di `apps/web/content/copy/id.ts`; JSX tidak menambah string UI baru.

## Content rules

- Setiap paragraph menjelaskan produk, harga, mekanisme, bukti, atau next action.
- Remove repeated “solusi”, impact, or education copy when same fact already appears nearer to CTA.
- Keep source captions, product price/unit, legal status, calculator assumptions, and claim disclaimers.
- No exclamation marks, emoji, fake urgency, fake scarcity, invented testimonials, or unsupported superlatives.
- Preserve one primary action and one secondary action per decision point. Avoid stacking three or more equal-weight CTAs in one card.
- Rewrite only copy that is rendered; remove dead copy/components only after repository-wide reference check.

## Responsive behavior

- Viewport minimum: 320px; primary QA: 390px, 768px, 1024px, 1440px.
- Below `md` (768px): one-column cards and compact CTA stack; buttons remain touch-friendly and full-width where stacked.
- `md` through `lg`: two columns only for cards/feature grids with enough content. Do not force two columns for prose, forms, or long labels.
- `lg` and wider: existing two-column editorial layouts remain.
- Tables use local horizontal overflow only (`overflow-x-auto`); body must never overflow horizontally.
- Images keep aspect ratio and responsive `sizes`; no fixed viewport-height dependence.
- Sticky mobile CTA must not cover form submit button or create layout shift.
- Keyboard focus order follows DOM order; anchor targets clear fixed header/sticky bars.

## Acceptance criteria

1. `/produk` DOM order is `ProductHero` → `ProductMarquee` → `ProductIngredients` → `ProductCatalog` → `ProductComparison`; catalog appears after the section titled `Tiga Bahan Lokal, Satu Karung Pelet Bernutrisi`.
2. `/produk` exposes both exact CTA labels, each with `href="/kontak#form-sampel"` where specified; calculator and specification links remain available where useful.
3. `/`, `/kalkulator`, `/spesifikasi-produk`, `/edukasi`, and `/mitra` expose focused product CTA paths without duplicate full forms.
4. Header/mobile sticky CTA labels and destinations follow the policy above.
5. Generic home blocks removed by this scope do not remain in the rendered home DOM; useful validation, FAQ, legal, partnership, and education content remains reachable where specified.
6. No body-level horizontal overflow at 390px, 768px, 1024px, or 1440px; tables are locally scrollable.
7. Unit tests lock copy keys, CTA destinations, route composition, and absence of removed sections.
8. E2E tests lock product order, CTA target, mobile layout, and focus/anchor behavior.
9. `npm run verify`, `git diff --check`, and `npm run check:secrets` pass.

## Test matrix

- Unit: copy keys and exact labels; header/sticky destinations; `ProductCta`; product page section order through server render or existing test harness; no dead copy references.
- E2E: `/produk` order after ingredients; all target CTA hrefs; all route 200/H1; mobile no horizontal overflow; anchor lands at `#form-sampel`; reduced-motion mode for visibility assertions.
- Visual/manual: 390px, 768px, 1024px, 1440px screenshots or Playwright viewport checks for home, product, calculator, education, partnership, and contact. No new visual test dependency.

## Non-goals

- No backend order/payment system.
- No CRM pipeline, inventory, or checkout redesign.
- No new product detail route.
- No wholesale product expansion in this change.
- No replacement of existing sample form validation or rate-limit behavior.
