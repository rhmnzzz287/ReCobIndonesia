-- 20260922090900_grants_phase1.sql
-- Sumber: Docs/SCHEMA.md §3.7 (tabel peran dan hak akses)
--
-- Mengapa berkas ini wajib ada:
-- Supabase tidak lagi memberi hak tabel otomatis kepada `anon` dan `authenticated` untuk tabel
-- yang baru dibuat (berlaku sejak 2026-05-30 untuk project baru). Tanpa GRANT eksplisit, seluruh
-- permintaan dari klien gagal dengan `42501 permission denied for table …` — dan kegagalan ini
-- terjadi SEBELUM RLS dievaluasi, sehingga policy apa pun tidak pernah berjalan.
--
-- Prinsip: hak minimum. GRANT membuka akses tingkat tabel; RLS (berkas 20260922090700) menyaring
-- barisnya. Keduanya diperlukan dan tidak saling menggantikan.

-- Hak atas skema diperiksa SEBELUM hak tabel dan sebelum RLS: tanpa USAGE, klien menerima
-- `relation "…" does not exist` alih-alih galat hak akses. Dinyatakan eksplisit agar migrasi
-- tetap benar bila skema `public` dibangun ulang dari nol.
grant usage on schema public to anon, authenticated, service_role;

-- Wilayah: daftar referensi publik.
grant select on table region to anon, authenticated;
-- KUD: RLS membatasi ke baris aktif untuk publik.
grant select on table kud to anon, authenticated;

-- Katalog produk dan komposisinya.
grant select on table product to anon, authenticated;
grant select on table product_ingredient to anon, authenticated;

-- Lead: publik hanya boleh MENULIS. Tidak ada hak SELECT untuk anon/authenticated.
grant insert on table lead to anon, authenticated;
grant select, update on table lead to authenticated;

-- Jejak funnel: append-only bagi publik.
grant insert on table lead_event to anon, authenticated;
grant select on table lead_event to authenticated;

-- Metrik dampak: RLS membatasi ke baris publik.
grant select on table impact_metric to anon, authenticated;
grant select on table impact_metric_reference to anon, authenticated;

-- `lead_event.id` bertipe bigserial: INSERT memerlukan hak atas sequence-nya.
grant usage, select on all sequences in schema public to anon, authenticated;

-- Peran istimewa: dipakai seeder dan Edge Function, tidak pernah oleh klien.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
