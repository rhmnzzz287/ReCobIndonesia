-- 20260922090400_lead.sql
-- Sumber: Docs/SCHEMA.md §3.4
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
