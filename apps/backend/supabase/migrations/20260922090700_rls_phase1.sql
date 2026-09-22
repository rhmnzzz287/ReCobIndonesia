-- 20260922090700_rls_phase1.sql
-- Sumber: Docs/SCHEMA.md §3.7
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
