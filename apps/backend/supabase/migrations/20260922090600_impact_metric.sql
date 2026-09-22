-- 20260922090600_impact_metric.sql
-- Sumber: Docs/SCHEMA.md §3.6
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
