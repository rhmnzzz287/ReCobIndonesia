# SCHEMA — Model Data ReCob.id

| Field | Nilai |
|---|---|
| Versi | 1.0.0 |
| Tanggal | 21 September 2026 |
| Mesin basis data | PostgreSQL (Supabase, region Singapore) |
| Status | Spesifikasi. DDL di bawah **belum dieksekusi** ke proyek Supabase mana pun |
| Dokumen terkait | `PRD.md`, `DESIGN.md` |

Dokumen ini mendefinisikan (a) skema yang dibangun di Phase 1, dan (b) skema Phase 2–3 yang harus diramalkan sekarang agar tidak ada migrasi destruktif di kemudian hari.

---

## 1. Prinsip & Konvensi

1. **Postgres relasional, bukan dokumen.** Data transaksi (order, potong setoran, saldo) butuh constraint, foreign key, dan transaksi ACID. Tidak ada agregasi JSON untuk entitas inti.
2. **Uang disimpan dalam `numeric(14,2)` (rupiah), bukan `float`.** Masalah klasik pembulatan pada akuntansi. Berat dalam `numeric(10,2)` kg.
3. **Waktu dalam `timestamptz`, selalu UTC.** Konversi ke WIB (UTC+7) dilakukan di lapisan tampilan, bukan di basis data.
4. **Primary key `uuid` dengan `gen_random_uuid()`.** Aman digabung antar-region dan tidak membocorkan jumlah baris. Bila Postgres 18 tersedia, `uuidv7()` lebih baik untuk lokalitas indeks — keputusan ditinjau saat pembuatan proyek.
5. **Append-only untuk jejak keuangan dan event.** Baris pada `milk_deduction_entries` dan `*_events` tidak pernah di-`UPDATE` nilai atau dihapus; koreksi dilakukan dengan baris pembalik (reversal) yang mereferensikan baris asal.
6. **Idempotensi eksplisit.** Setiap operasi mutasi yang dipicu jaringan (form, order, pembayaran, job) membawa `idempotency_key` unik. Retry tidak pernah menggandakan data.
7. **RLS aktif di semua tabel tanpa kecuali.** Tidak ada tabel publik tanpa policy. Otorisasi berbasis peran disimpan di `app_metadata` (dikontrol server), bukan di klaim klien.
8. **Tidak ada PII di tabel event.** Analitik memakai `lead_id` sebagai pengait, bukan nomor telepon.
9. **Soft delete terbatas pada entitas yang punya nilai audit.** `deleted_at` untuk `farms`, `orders`, `leads`; tabel ledger dan event tidak pernah dihapus.
10. **Nama snake_case, tunggal untuk tabel referensi jamak untuk tabel fakta** (`product`, `lead`, `orders`, `milk_deduction_entries`).

---

## 2. Peta Domain (Bounded Context)

```text
+---------------------------+     +----------------------------+
|  Katalog & Konten         |     |  Akuisisi Lead             |
|  region, kud, product,    |     |  lead, lead_events         |
|  impact_metric(+_source)  |     |  (funnel: view -> submit)  |
+-------------+-------------+     +--------------+-------------+
              |                                  |
              |           FASE 1 (dibangun)      |
              +------------------+---------------+
                                 |
=================== Batas fase berikutnya ===================
                                 |
+---------------------------+     +----------------------------+
|  Kemitraan & Ledger       |     |  Produksi Ternak           |
|  farms, farmers, orders,  |     |  herds, milk_logs,         |
|  order_lines, deliveries, |     |  feed_logs                 |
|  settlement_periods,      |     |                            |
|  milk_deduction_entries,  |     |                            |
|  ledger_accounts,         |     |                            |
|  incentives, referrals    |     |                            |
+---------------------------+     +----------------------------+
              \                            /
               \---- read-only agregat ----/
                          |
                +---------------------+
                |  Pelaporan & Dampak |
                |  v_farm_balance,    |
                |  mv_impact_monthly  |
                +---------------------+
```

Alasan pemisahan: ledger keuangan punya aturan integritas dan retensi yang sangat berbeda dari konten pemasaran. Menggabungkannya dalam satu tabel membuat policy RLS mustahil dipelihara dan membuat kueri konten ikut membawa beban tabel transaksi.

---

## 3. Skema Phase 1 (Prototype)

### 3.1 Ekstensi, tipe, dan fungsi bantu

```sql
-- Ekstensi
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- email case-insensitive (opsional)

-- Tipe enumerasi
create type lead_status      as enum ('new', 'contacted', 'sampled', 'converted', 'rejected');
create type lead_source      as enum ('tiktok', 'instagram', 'facebook', 'whatsapp', 'referral', 'field_visit', 'other');
create type metric_unit      as enum ('ton', 'kg', 'rupiah', 'liter', 'count', 'percent');
create type metric_period    as enum ('daily', 'weekly', 'monthly', 'yearly', 'cumulative');

-- Fungsi: pembaruan kolom updated_at yang konsisten
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
```

### 3.2 Tabel referensi: wilayah dan KUD

```sql
create table region (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- 'jabar', 'jateng', 'jatim'
  name        text not null,                 -- 'Jawa Barat'
  province    text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint region_code_format check (code ~ '^[a-z0-9_]{2,32}$')
);

create table kud (
  id             uuid primary key default gen_random_uuid(),
  region_id      uuid not null references region(id) on delete restrict,
  slug           text not null unique,       -- 'kpbs-pangalengan'
  name           text not null,              -- 'KPBS Pangalengan'
  city           text not null,              -- 'Bandung'
  status         text not null default 'target'
                 check (status in ('target', 'prospect', 'active', 'churned')),
  farmer_count   integer not null default 0 check (farmer_count >= 0),
  daily_milk_l   numeric(12,2) not null default 0 check (daily_milk_l >= 0),
  contact_name   text,
  contact_phone  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint kud_phone_format check (contact_phone is null or contact_phone ~ '^[0-9+ -]{7,20}$')
);

create index kud_region_status_idx on kud (region_id, status);
```

Catatan: `kud.contact_phone` adalah data kontak bisnis institusi, bukan PII konsumen; tetap tidak ditampilkan ke publik dan hanya dibaca peran `admin`/`kud_officer` melalui RLS.

### 3.3 Katalog produk

```sql
create table product (
  id                uuid primary key default gen_random_uuid(),
  sku               text not null unique,
  slug              text not null unique,
  name              text not null,
  description       text not null default '',
  unit              text not null default 'karung' check (unit in ('karung', 'kg', 'ton')),
  pack_weight_kg    numeric(10,2) not null check (pack_weight_kg > 0),
  price_idr         numeric(14,2) not null check (price_idr >= 0),
  compare_price_idr numeric(14,2) check (compare_price_idr is null or compare_price_idr > 0),
  protein_pct       numeric(5,2) check (protein_pct between 0 and 100),
  category           text not null default 'Sapi Perah',
  image_path         text,
  is_bulk           boolean not null default false,
  is_active         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint product_compare_gt_price check (compare_price_idr is null or compare_price_idr > price_idr)
);

create table product_ingredient (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references product(id) on delete cascade,
  name           text not null,
  share_min_pct  numeric(5,2) not null check (share_min_pct between 0 and 100),
  share_max_pct  numeric(5,2) not null check (share_max_pct between 0 and 100),
  function_label text not null,
  sort_order     integer not null default 0,
  constraint ingredient_share_order check (share_max_pct >= share_min_pct)
);

create index product_ingredient_product_idx on product_ingredient (product_id, sort_order);

-- Harga termurah per Kg dapat dihitung; jangan disimpan duplikat di aplikasi.
create unique index product_slug_active_idx on product (slug) where is_active;
```

Seed produk Phase 1 merefleksikan dokumen sumber: `recob-pelet-50kg` (50 kg, Rp160.000, pembanding Rp180.000–200.000) dan satu produk curah (`is_bulk = true`) tanpa harga publik.

### 3.4 Tabel lead (permintaan sampel gratis)

```sql
create table lead (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null check (char_length(btrim(full_name)) between 2 and 120),
  phone_wa          text not null,
  cattle_count      integer not null check (cattle_count between 1 and 10000),
  region_id         uuid not null references region(id) on delete restrict,
  kud_id            uuid references kud(id) on delete set null,
  message           text check (message is null or char_length(message) <= 1000),
  source            lead_source not null default 'other',
  utm_source        text,
  utm_medium        text,
  utm_campaign      text,
  status            lead_status not null default 'new',
  sample_requested  boolean not null default true,
  is_demo           boolean not null default false,   -- baris seeder demo, wajib berlabel di UI
  idempotency_key   text not null,
  consented_at      timestamptz not null,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint lead_phone_format check (phone_wa ~ '^(\+?62|0)8[1-9][0-9]{6,11}$'),
  constraint lead_idempotency_unique unique (idempotency_key)
);

-- Dedupe alami: satu nomor WA satu lead aktif.
create unique index lead_phone_active_idx on lead (phone_wa) where deleted_at is null;

-- Kueri dashboard: lead terbaru per status
create index lead_status_created_idx on lead (status, created_at desc) where deleted_at is null;
create index lead_region_created_idx on lead (region_id, created_at desc) where deleted_at is null;
create index lead_source_idx on lead (source, created_at desc);

create trigger lead_set_updated_at
  before update on lead
  for each row execute function set_updated_at();
```

Keputusan penting: `lead_phone_active_idx` unik parsial membuat pengiriman ulang form yang sama gagal pada tingkat basis data (bukan hanya validasi aplikasi), lalu ditangani handler sebagai "sudah terdaftar" dengan respons sukses idempoten.

### 3.5 Jejak funnel (append-only)

```sql
create table lead_event (
  id           bigserial primary key,
  lead_id      uuid references lead(id) on delete cascade,
  session_id   text,
  event_name   text not null check (event_name in (
                 'page_view','cta_click','scroll_75','outbound_wa_click',
                 'sample_form_start','sample_form_submit','article_read_75','referral_click'
               )),
  path         text,
  placement    text,
  metadata     jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now(),
  constraint lead_event_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index lead_event_name_time_idx on lead_event (event_name, occurred_at desc);
create index lead_event_lead_idx on lead_event (lead_id) where lead_id is not null;
```

`lead_event` sengaja memakai `bigserial`, bukan `uuid`: volumenya paling besar, selalu disisipkan berurutan, dan tidak pernah dirujuk dari luar. Mulai Phase 3 tabel ini dipartisi per bulan (Bagian 6.2).

### 3.6 Metrik dampak dan sumbernya

```sql
create table impact_metric (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,        -- 'corn_cob_potential_national'
  label          text not null,
  value_numeric  numeric(18,2) not null,
  unit           metric_unit not null,
  period         metric_period not null,
  period_label   text,                        -- '2022', 'per bulan'
  region_id      uuid references region(id) on delete set null,
  is_demo        boolean not null default true,
  is_public      boolean not null default false,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table impact_metric_reference (
  id              uuid primary key default gen_random_uuid(),
  metric_id       uuid not null references impact_metric(id) on delete cascade,
  citation_label  text not null,
  citation_url    text,
  assumption_note text not null,              -- asumsi yang wajib tampil di UI
  created_at      timestamptz not null default now(),
  constraint reference_url_scheme check (citation_url is null or citation_url ~ '^https?://')
);

-- Aturan keras: metrik publik wajib punya minimal satu sumber.
create or replace function enforce_public_metric_has_reference()
returns trigger
language plpgsql
as $$
begin
  if new.is_public and not exists (
    select 1 from impact_metric_reference r where r.metric_id = new.id
  ) then
    raise exception 'impact_metric % bertanda is_public tetapi tidak memiliki referensi', new.code;
  end if;
  return new;
end;
$$;

create constraint trigger impact_metric_public_requires_reference
  after insert or update of is_public on impact_metric
  deferrable initially deferred
  for each row execute function enforce_public_metric_has_reference();
```

Constraint trigger ini menerjemahkan aturan `PRD.md` Bagian 7.1 ("metrik tanpa sumber tidak ditampilkan") menjadi aturan basis data, bukan sekadar konvensi konten.

### 3.7 RLS Phase 1

```sql
alter table region                 enable row level security;
alter table kud                    enable row level security;
alter table product                enable row level security;
alter table product_ingredient     enable row level security;
alter table lead                   enable row level security;
alter table lead_event             enable row level security;
alter table impact_metric          enable row level security;
alter table impact_metric_reference enable row level security;

-- Bantuan: peran dari app_metadata (server-controlled, tidak dapat dipalsukan klien)
create or replace function app_role()
returns text
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (case when auth.role() = 'anon' then 'anon' else 'authenticated' end)
  );
$$;

-- Katalog: hanya baris aktif untuk publik
create policy region_read_public on region
  for select to anon, authenticated using (true);

create policy kud_read_public on kud
  for select to anon, authenticated using (status = 'active');

create policy kud_read_staff on kud
  for select to authenticated using (app_role() in ('admin', 'staff'));

create policy product_read_public on product
  for select to anon, authenticated using (is_active);

create policy ingredient_read_public on product_ingredient
  for select to anon, authenticated
  using (exists (select 1 from product p where p.id = product_id and p.is_active));

create policy metric_read_public on impact_metric
  for select to anon, authenticated using (is_public);

create policy metric_reference_read_public on impact_metric_reference
  for select to anon, authenticated
  using (exists (select 1 from impact_metric m where m.id = metric_id and m.is_public));

-- Lead: publik hanya boleh MENULIS, tidak pernah membaca.
-- Tidak ada policy SELECT untuk anon/authenticated selain staf: data pribadi tidak pernah
-- dapat dibaca kembali dari klien, bahkan oleh pengirimnya.
create policy lead_insert_public on lead
  for insert to anon, authenticated with check (
    deleted_at is null
    and status = 'new'
    and is_demo = false
    and idempotency_key is not null
  );

create policy lead_read_staff on lead
  for select to authenticated using (app_role() in ('admin', 'staff'));

create policy lead_update_staff on lead
  for update to authenticated
  using (app_role() in ('admin', 'staff'))
  with check (app_role() in ('admin', 'staff'));

create policy lead_event_insert_public on lead_event
  for insert to anon, authenticated with check (event_name is not null);

create policy lead_event_read_staff on lead_event
  for select to authenticated using (app_role() in ('admin', 'staff'));
```

Peran dan hak akses:

| Peran | region | kud | product | lead | lead_event | impact_metric |
|---|---|---|---|---|---|---|
| `anon` | SELECT semua | SELECT yang aktif | SELECT yang aktif | **INSERT saja** | INSERT saja | SELECT yang publik |
| `authenticated` (peternak, Phase 2) | SELECT | SELECT | SELECT | tidak ada akses | INSERT saja | SELECT yang publik |
| `kud_officer` (Phase 2) | SELECT | SELECT miliknya | SELECT | SELECT/UPDATE lead di KUD-nya | SELECT milik KUD-nya | SELECT |
| `staff`/`admin` | semua | semua | semua | SELECT/UPDATE | SELECT | semua |

Catatan implementasi: penulisan form lewat Server Action/Route Handler dengan kunci `anon` **dan** verifikasi di server (rate limit per IP + honeypot). Klien tidak pernah diberi kunci `service_role`.

---

## 4. Kueri, Indeks, dan Aturan Anti-Bottleneck

| Kebutuhan | Pola kueri | Indeks pendukung |
|---|---|---|
| Halaman produk | `select ... from product where slug = $1 and is_active` | `product_slug_active_idx` |
| Dampak publik | `select m.*, r.* from impact_metric m left join impact_metric_reference r on r.metric_id = m.id where m.is_public order by m.sort_order` | `impact_metric(is_public, sort_order)` |
| Rekap lead mingguan | `select date_trunc('week', created_at), status, count(*) from lead where created_at >= now() - interval '90 days' group by 1,2` | `lead_status_created_idx` |
| KUD per wilayah | `select ... from kud where region_id = $1 and status = 'active'` | `kud_region_status_idx` |

Aturan yang mengikat seluruh kode aplikasi:

1. **Dilarang kueri N+1.** Daftar KUD + jumlah peternak diselesaikan dengan satu kueri bergabung atau satu RPC agregat. Tidak ada pemanggilan per baris di dalam loop komponen.
2. **Dilarang pemindaian tabel penuh pada tabel fakta.** `lead` dan `lead_event` selalu difilter lewat rentang waktu atau status yang berindeks. Kueri rekap > 12 bulan dipindahkan ke materialized view (Phase 3).
3. **Agregat berat dihitung di server.** Saldo dan total penghematan dihitung dengan SQL/view, bukan dengan mengambil seluruh baris ke JavaScript lalu menjumlahkan.
4. **RPC untuk operasi multi-tabel.** Pendaftaran lead + pencatatan event + pembaruan KUD dijalankan dalam satu fungsi `security definer` dengan satu transaksi, bukan tiga round-trip.
5. **`explain (analyze, buffers)`** wajib dijalankan untuk setiap kueri baru pada `lead`, `orders`, dan `milk_deduction_entries`; dipastikan memakai index scan, bukan sequential scan.

Contoh RPC pendaftaran lead (idempoten, satu transaksi):

```sql
create or replace function submit_sample_lead(
  p_full_name      text,
  p_phone_wa       text,
  p_cattle_count   integer,
  p_region_code    text,
  p_kud_slug       text default null,
  p_message        text default null,
  p_source         lead_source default 'other',
  p_utm            jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns table (lead_id uuid, created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_region_id uuid;
  v_kud_id    uuid;
  v_existing  uuid;
  v_new_id    uuid;
  v_key       text := coalesce(p_idempotency_key, gen_random_uuid()::text);
begin
  select id into v_region_id from region where code = p_region_code;
  if v_region_id is null then
    raise exception 'wilayah % tidak dikenal', p_region_code using errcode = '22023';
  end if;

  if p_kud_slug is not null then
    select id into v_kud_id from kud where slug = p_kud_slug;
  end if;

  select id into v_existing from lead
    where idempotency_key = v_key or (phone_wa = p_phone_wa and deleted_at is null)
    limit 1;

  if v_existing is not null then
    insert into lead_event (lead_id, event_name, metadata)
    values (v_existing, 'sample_form_submit', jsonb_build_object('duplicate', true));
    return query select v_existing, false;
    return;
  end if;

  insert into lead (
    full_name, phone_wa, cattle_count, region_id, kud_id, message,
    source, utm_source, utm_medium, utm_campaign, idempotency_key, consented_at
  )
  values (
    btrim(p_full_name), p_phone_wa, p_cattle_count, v_region_id, v_kud_id,
    nullif(btrim(coalesce(p_message, '')), ''), p_source,
    p_utm ->> 'source', p_utm ->> 'medium', p_utm ->> 'campaign',
    v_key, now()
  )
  returning id into v_new_id;

  insert into lead_event (lead_id, event_name, metadata)
  values (v_new_id, 'sample_form_submit', jsonb_build_object('duplicate', false));

  return query select v_new_id, true;
end;
$$;

revoke all on function submit_sample_lead from public;
grant execute on function submit_sample_lead to anon, authenticated;
```

Fungsi ini idempoten karena tiga lapis: kunci idempotensi klien, indeks unik nomor WhatsApp, dan pemeriksaan `v_existing` di dalam transaksi yang sama.

---

## 5. Skema Phase 2 (Dirancang Sekarang, Dibangun Nanti)

Tabel-tabel berikut **tidak dibuat** di Phase 1, tetapi bentuknya sudah dibekukan agar Phase 2 tidak memerlukan perubahan destruktif pada tabel Phase 1.

### 5.1 Aktor dan peternakan

```sql
create type farmer_role  as enum ('owner', 'member', 'operator');
create type order_status as enum ('draft','confirmed','dispatched','delivered','invoiced','settled','cancelled');

create table farmer (
  id            uuid primary key references auth.users(id) on delete cascade,
  full_name     text not null,
  phone_wa      text not null unique,
  role          farmer_role not null default 'owner',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table farm (
  id            uuid primary key default gen_random_uuid(),
  farmer_id     uuid not null references farmer(id) on delete restrict,
  kud_id        uuid references kud(id) on delete set null,
  name          text not null,
  region_id     uuid not null references region(id) on delete restrict,
  address       text,
  herd_size     integer not null default 0 check (herd_size >= 0),
  credit_limit_idr numeric(14,2) not null default 0 check (credit_limit_idr >= 0),
  deleted_at    timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index farm_kud_idx on farm (kud_id) where deleted_at is null;
create index farm_farmer_idx on farm (farmer_id) where deleted_at is null;
```

Kaitan fase: `lead` Phase 1 tidak diubah. Konversi lead menjadi `farm` dilakukan dengan tabel penghubung `lead_conversion` (lead_id, farm_id, converted_at) — penambahan tabel, bukan perubahan kolom.

### 5.2 Pesanan dan pengiriman (konsinyasi)

```sql
create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_no         text not null unique,              -- 'RCB-2026-000123'
  farm_id          uuid not null references farm(id) on delete restrict,
  kud_id           uuid references kud(id) on delete restrict,
  status           order_status not null default 'draft',
  payment_mode     text not null default 'milk_deduction'
                   check (payment_mode in ('milk_deduction', 'cash', 'transfer', 'consignment')),
  total_idr        numeric(14,2) not null default 0 check (total_idr >= 0),
  idempotency_key  text not null unique,
  placed_at        timestamptz,
  settled_at       timestamptz,
  cancelled_at     timestamptz,
  cancel_reason    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint order_settled_requires_time check (status <> 'settled' or settled_at is not null)
);

create table order_line (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references orders(id) on delete cascade,
  product_id    uuid not null references product(id) on delete restrict,
  quantity      integer not null check (quantity > 0),
  unit_price_idr numeric(14,2) not null check (unit_price_idr >= 0),
  line_total_idr numeric(14,2) not null check (line_total_idr >= 0),
  constraint line_total_matches check (line_total_idr = quantity * unit_price_idr)
);

create index order_line_order_idx on order_line (order_id);
create index orders_farm_status_idx on orders (farm_id, status, created_at desc);
create index orders_kud_status_idx on orders (kud_id, status, created_at desc);
```

Perhatikan constraint `line_total_matches`: total baris tidak boleh menyimpang dari `quantity × unit_price`. Kesalahan pembulatan terdeteksi saat penulisan, bukan saat rekonsiliasi bulanan.

### 5.3 Ledger potong setoran susu (inti keuangan)

Model: **append-only, dua sisi (double-entry), saldo dihitung dari view.** Saldo tidak pernah disimpan sebagai kolom yang di-`UPDATE`.

```sql
create type ledger_account_kind as enum (
  'feed_purchase',      -- debit ke peternak: pembelian pakan
  'milk_settlement',    -- kredit ke peternak: setoran susu
  'incentive',          -- kredit: insentif referral
  'adjustment',         -- koreksi manual (wajib beralasan)
  'payment'             -- pelunasan tunai/transfer
);

create type ledger_status as enum ('posted', 'reversed');

create table settlement_period (
  id           uuid primary key default gen_random_uuid(),
  kud_id       uuid not null references kud(id) on delete restrict,
  period_start date not null,
  period_end   date not null,
  status       text not null default 'open'
               check (status in ('open', 'locked', 'exported', 'reconciled')),
  locked_at    timestamptz,
  exported_at  timestamptz,
  created_at   timestamptz not null default now(),
  constraint period_order check (period_end >= period_start),
  constraint period_unique unique (kud_id, period_start, period_end)
);

create table ledger_entry (
  id                bigserial primary key,
  farm_id           uuid not null references farm(id) on delete restrict,
  kud_id            uuid references kud(id) on delete restrict,
  period_id         uuid references settlement_period(id) on delete restrict,
  account_kind      ledger_account_kind not null,
  order_id          uuid references orders(id) on delete restrict,
  amount_idr        numeric(14,2) not null check (amount_idr <> 0),
  direction         smallint not null check (direction in (-1, 1)), -- +1 kredit peternak, -1 debit peternak
  memo              text,
  idempotency_key   text not null unique,
  status            ledger_status not null default 'posted',
  reverses_entry_id bigint references ledger_entry(id) on delete restrict,
  posted_at         timestamptz not null default now(),
  created_by        uuid references auth.users(id) on delete set null,
  constraint reversal_requires_target check (status <> 'reversed' or reverses_entry_id is null)
);

create index ledger_entry_farm_time_idx on ledger_entry (farm_id, posted_at desc);
create index ledger_entry_period_idx on ledger_entry (period_id);
create unique index ledger_entry_reversal_once on ledger_entry (reverses_entry_id)
  where reverses_entry_id is not null;

-- Saldo berjalan dihitung, tidak disimpan.
create view v_farm_balance as
select
  f.id as farm_id,
  coalesce(sum(le.amount_idr * le.direction), 0)::numeric(14,2) as balance_idr,
  max(le.posted_at) as last_entry_at
from farm f
left join ledger_entry le
  on le.farm_id = f.id and le.status = 'posted'
group by f.id;
```

Aturan integritas ledger:

1. Tidak ada `UPDATE` pada `amount_idr`, `direction`, atau `farm_id`. Koreksi = baris baru dengan `reverses_entry_id` mengarah ke baris asal dan `direction` berlawanan.
2. Setiap baris punya `idempotency_key` unik; pengiriman ulang dari sistem KUD atau job terjadwal tidak menggandakan.
3. `unique index ledger_entry_reversal_once` mencegah satu baris dibalik dua kali.
4. Periode `locked` menolak penyisipan entry baru — ditegakkan pemicu (trigger) pada `ledger_entry` yang memeriksa `settlement_period.status`.
5. Saldo negatif melebihi `farm.credit_limit_idr` ditolak di fungsi pemesanan, bukan di UI.

Materialized view bulanan (Phase 3, saat volume menuntut):

```sql
create materialized view mv_impact_monthly as
select
  date_trunc('month', le.posted_at) as month,
  f.kud_id,
  sum(case when le.direction = -1 then abs(le.amount_idr) else 0 end)::numeric(18,2) as feed_spend_idr,
  count(distinct le.farm_id) as active_farms,
  sum(case when le.account_kind = 'milk_settlement' then le.amount_idr else 0 end)::numeric(18,2) as milk_value_idr
from ledger_entry le
join farm f on f.id = le.farm_id
where le.status = 'posted'
group by 1, 2;

create unique index mv_impact_monthly_key on mv_impact_monthly (month, kud_id);
```

Penyegaran dijadwalkan (`refresh materialized view concurrently`) — paralel memerlukan indeks unik di atas, sudah disediakan.

### 5.4 Referral dan insentif (member-get-member)

```sql
create table referral (
  id             uuid primary key default gen_random_uuid(),
  referrer_farm  uuid not null references farm(id) on delete restrict,
  referee_farm   uuid not null references farm(id) on delete restrict,
  code           text not null unique,
  converted_at   timestamptz,
  created_at     timestamptz not null default now(),
  constraint referral_no_self check (referrer_farm <> referee_farm)
);

create unique index referral_pair_once on referral (referrer_farm, referee_farm);
create index referral_referrer_idx on referral (referrer_farm, converted_at desc);

create table incentive (
  id            uuid primary key default gen_random_uuid(),
  referral_id   uuid not null references referral(id) on delete restrict,
  farm_id       uuid not null references farm(id) on delete restrict,
  kind          text not null check (kind in ('discount', 'cash', 'credit')),
  amount_idr    numeric(14,2) not null check (amount_idr > 0),
  applied_at    timestamptz,
  ledger_entry_id bigint references ledger_entry(id) on delete restrict,
  created_at    timestamptz not null default now(),
  constraint incentive_applied_has_entry check (applied_at is null or ledger_entry_id is not null)
);
```

`referral_pair_once` mencegah satu pasangan referrer–referee dihitung berulang, dan `incentive_applied_has_entry` memastikan insentif yang sudah dicairkan selalu terlacak ke baris ledger-nya.

### 5.5 Produksi ternak (pembuktian dampak)

```sql
create table milk_log (
  id             bigserial primary key,
  farm_id        uuid not null references farm(id) on delete restrict,
  log_date       date not null,
  milk_liters    numeric(10,2) not null check (milk_liters >= 0),
  herd_milked    integer not null check (herd_milked > 0),
  feed_kg        numeric(10,2) check (feed_kg >= 0),
  idempotency_key text not null unique,
  created_at     timestamptz not null default now(),
  constraint milk_log_one_per_day unique (farm_id, log_date)
);

create index milk_log_farm_date_idx on milk_log (farm_id, log_date desc);
```

`milk_log_one_per_day` + `idempotency_key` membuat pencatatan harian aman diulang dari perangkat lapangan dengan koneksi terputus.

---

## 6. Migrasi, Partisi, dan Operasi

### 6.1 Alur migrasi

| Aspek | Keputusan |
|---|---|
| Sumber kebenaran | Berkas SQL bernomor di `supabase/migrations/` — bukan perubahan manual lewat dashboard |
| Penamaan | `YYYYMMDDHHmmss_deskripsi_singkat.sql` |
| Pemeriksaan | `supabase db diff --linked` sebelum dan sesudah; selisih tak terduga wajib dijelaskan |
| Aturan | Perubahan bersifat **menambah dan memperluas** (expand), bukan mengganti nama kolom atau mengubah tipe destruktif |
| Pola ekspansi | Tambah kolom baru `nullable` → tulis ganda (dual-write) → isi data lama → alihkan pembacaan → hapus kolom lama setelah satu siklus rilis |
| Tanpa downtime | Kolom wajib diisi ditambahkan dengan `default` konstan atau lewat `not valid` pada constraint lalu `validate constraint` terpisah |
| Pembatalan | Setiap migrasi menyertakan komentar `-- rollback:` berisi pernyataan pembalikan yang telah diperiksa |

Contoh pola expand-contract yang benar:

```sql
-- Tahap 1 (rilis N): tambah kolom, izinkan null
alter table lead add column cattle_count_verified integer;

-- Tahap 2 (rilis N): tulis ganda dari aplikasi, backfill bertahap dengan batch kecil
update lead set cattle_count_verified = cattle_count
where id in (select id from lead where cattle_count_verified is null order by created_at limit 1000);

-- Tahap 3 (rilis N+1): jadikan wajib lewat validasi constraint yang tidak mengunci tabel lama
alter table lead add constraint lead_cattle_verified_present
  check (cattle_count_verified is not null) not valid;
alter table lead validate constraint lead_cattle_verified_present;

-- Tahap 4 (rilis N+2): hapus kolom lama
alter table lead drop column cattle_count;
```

### 6.2 Partisi (aktivasi Phase 3, ambang terukur)

`lead_event` dipartisi per bulan saat baris melewati 5 juta atau saat waktu kueri rekap > 300 ms. Pemicunya volume, bukan tanggal.

```sql
-- Contoh bentuk partisi rentang bulanan
create table lead_event_p2026_10 partition of lead_event
  for values from ('2026-10-01') to ('2026-11-01');
```

Catatan penting: `lead_event` ber-`primary key bigserial`. Untuk partisi rentang, kunci utama harus menyertakan kolom partisi (`occurred_at`) atau tabel dipecah menjadi `lead_event` (logis) + partisi fisik. Keputusan teknis ini diambil saat partisi benar-benar diaktifkan, dengan uji beban lebih dulu — bukan sekarang, agar tidak mengunci desain tanpa alasan.

### 6.3 Retensi, privasi, dan keamanan data

| Data | Retensi | Dasar |
|---|---|---|
| `lead` (PII: nama, WhatsApp) | 24 bulan sejak kontak terakhir, lalu dianonimkan | UU PDP No. 27/2022 — pembatasan tujuan |
| `lead_event` | 25 bulan, `lead_id` di-`null`-kan saat lead dianonimkan | Analitik tanpa identitas |
| `ledger_entry`, `orders` | ≥ 10 tahun | Kebutuhan audit keuangan |
| `milk_log` | ≥ 5 tahun | Pembuktian dampak dan sengketa |

Aturan: tidak ada kolom PII dalam bentuk bebas pada tabel event; analitik pihak ketiga (Vercel Analytics) tidak menerima nomor telepon atau nama; `service_role` hanya hidup di variabel lingkungan server Vercel (encrypted), tidak pernah dikirim ke bundel klien.

### 6.4 Uji yang wajib ada (dijalankan terhadap database, bukan mock)

1. Peternak/anon tidak dapat `SELECT` dari `lead` (harus `permission denied` / 0 baris).
2. Insert `lead` dengan `phone_wa` tidak valid ditolak constraint.
3. Dua kali panggil `submit_sample_lead` dengan kunci idempotensi sama → satu baris `lead`, dua baris `lead_event`.
4. Insert `impact_metric` dengan `is_public = true` tanpa referensi → transaksi gagal.
5. `ledger_entry` pada periode `locked` → ditolak.
6. Pembalikan ganda pada satu entry → ditolak indeks unik.
7. Kueri rekap lead 90 hari memakai index (diperiksa `explain analyze`), tanpa sequential scan.

---

## 7. Seed Data Phase 1 (Pitch)

| Tabel | Isi seed | Aturan |
|---|---|---|
| `region` | 3 baris: Jawa Barat, Jawa Tengah, Jawa Timur | data riil |
| `kud` | KPBS Pangalengan, KUD Mojosongo, KUD Cepogo, KUD Setia Kawan | `status='target'`, ditampilkan sebagai calon mitra — bukan mitra aktif — sampai ada perjanjian |
| `product` | 1 produk ritel 50 kg (Rp160.000), 1 produk curah | harga dari dokumen sumber |
| `product_ingredient` | 3 baris sesuai komposisi dokumen | proporsi 50–55%, 35–40%, 5–10% |
| `impact_metric` + referensi | 5 metrik dari `PRD.md` Bagian 7.1 | `is_demo = true`; metrik emisi **tidak diisi** karena belum ada koefisien |
| `lead` | 8–12 baris contoh lintas wilayah dan sumber | ditandai `is_demo = true`; seeder hanya berjalan bila `APP_ENV != production` kecuali disetujui |

Seeder produksi untuk demo pitching disediakan sebagai `supabase/seed/pitch.sql` dan **wajib** dijalankan ulang sebelum acara, dengan penanda `is_demo` yang tampil sebagai label di UI.

---

## 8. Bentuk Data untuk Lapisan Aplikasi

Aplikasi tidak boleh memakai tipe longgar. Kontrak data didefinisikan satu kali di TypeScript dan divalidasi runtime di batas sistem:

```ts
// lib/schema/lead.ts (ringkas)
import { z } from "zod";

export const submitLeadInput = z.object({
  fullName: z.string().trim().min(2).max(120),
  phoneWa: z.string().regex(/^(\+?62|0)8[1-9][0-9]{6,11}$/, "Nomor WhatsApp tidak valid"),
  cattleCount: z.number().int().min(1).max(10_000),
  regionCode: z.enum(["jabar", "jateng", "jatim"]),
  kudSlug: z.string().trim().min(2).max(64).optional(),
  message: z.string().trim().max(1000).optional(),
  source: z.enum(["tiktok", "instagram", "facebook", "whatsapp", "referral", "field_visit", "other"]),
  utm: z
    .object({
      source: z.string().max(64).optional(),
      medium: z.string().max(64).optional(),
      campaign: z.string().max(64).optional(),
    })
    .default({}),
  idempotencyKey: z.string().min(16).max(64),
});

export type SubmitLeadInput = z.infer<typeof submitLeadInput>;
```

Aturan batas sistem:

- Validasi di klien **dan** di server. Validasi klien hanya untuk pengalaman pengguna; kebenaran ditentukan server (dan satu lapis lagi oleh constraint Postgres).
- Tipe basis data digenerate (`supabase gen types typescript --linked`) dan **tidak diedit tangan**. Perubahan manual pada berkas hasil generate adalah pelanggaran review.
- Semua akses data lewat modul `lib/data/*` (contoh: `lib/data/leads.ts`, `lib/data/products.ts`, `lib/data/impact.ts`). Komponen UI tidak pernah memanggil klien Supabase secara langsung; ini yang membuat perpindahan basis data di kemudian hari hanya soal menukar adaptor.

---

## 9. Front Matter Konten (Skema Konten, Bukan Tabel)

Artikel edukasi disimpan sebagai MDX di repositori, dengan front matter yang divalidasi saat build:

```yaml
---
title: "Panduan Transisi Pakan: Memindahkan Sapi Tanpa Menurunkan Produksi"
slug: "panduan-transisi-pakan"
excerpt: "Langkah praktis perpindahan pakan selama 7-14 hari..."
publishedAt: "2026-09-25"
updatedAt: "2026-09-25"
category: "panduan-teknis"         # panduan-teknis | nutrisi | operasional | dampak
tags: ["transisi-pakan", "palatabilitas"]
author: "Tim Nutrisi ReCob.id"
reviewedBy: "drh. ..."             # wajib untuk artikel berisi klaim nutrisi
references: ["Rumondang et al., 2023"]
draft: false
---
```

Bila artikel memuat klaim nutrisi atau angka ilmiah, `reviewedBy` **wajib** diisi; build gagal bila kosong. Aturan ini menegakkan `PRD.md` Bagian 8 tanpa bergantung pada disiplin editorial.

---

## 10. Lampiran: Perubahan Skema yang Dilarang

| Dilarang | Alasan | Gantinya |
|---|---|---|
| Mengubah `numeric` harga menjadi `float` | Kesalahan pembulatan uang | tetap `numeric(14,2)` |
| `UPDATE` nilai pada `ledger_entry` | Merusak jejak audit | baris pembalik + `reverses_entry_id` |
| Menghapus baris `lead` | Menghilangkan bukti funnel | `deleted_at` (soft delete) + anonimisasi terjadwal |
| Menyimpan saldo sebagai kolom yang di-`UPDATE` | Rentan balapan penulisan (race condition) | hitung lewat `v_farm_balance`, cache di materialized view |
| Menambahkan kolom `not null` tanpa `default` pada tabel terisi | Mengunci tabel saat migrasi | `default` konstan atau `not valid` + `validate` |
| Memakai kunci `service_role` di kode klien | Kebocoran seluruh basis data | Server Action/Route Handler dengan `anon` + RLS |
| Menyimpan nomor WhatsApp di tabel event | Pelanggaran minimalisasi data | referensi `lead_id` |
| Menonaktifkan RLS "sementara" untuk mempercepat demo | Risiko data pribadi terbuka | policy khusus staf/demo, aktif sejak awal |
