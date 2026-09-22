-- 20260922090100_helper_functions.sql
-- Sumber: Docs/SCHEMA.md §3.1
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

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
