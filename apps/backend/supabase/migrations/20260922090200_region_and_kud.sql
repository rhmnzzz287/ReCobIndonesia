-- 20260922090200_region_and_kud.sql
-- Sumber: Docs/SCHEMA.md §3.2
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
