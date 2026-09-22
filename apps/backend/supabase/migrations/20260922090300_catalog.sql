-- 20260922090300_catalog.sql
-- Sumber: Docs/SCHEMA.md §3.3
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
