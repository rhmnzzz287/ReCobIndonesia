-- seed/pitch.sql — data demo pitching Phase 1 (Docs/SCHEMA.md §7).
-- Idempoten: aman dijalankan berulang. Wajib dijalankan ulang sebelum acara pitching.
begin;

-- 1. Wilayah
insert into region (code, name, province) values
  ('jabar',  'Jawa Barat',  'Jawa Barat'),
  ('jateng', 'Jawa Tengah', 'Jawa Tengah'),
  ('jatim',  'Jawa Timur',  'Jawa Timur')
on conflict (code) do update set name = excluded.name, province = excluded.province;

-- 2. KUD target (status 'target': calon mitra, bukan mitra aktif)
insert into kud (region_id, slug, name, city, status, farmer_count, daily_milk_l)
select r.id, v.slug, v.name, v.city, 'target', v.farmer_count, v.daily_milk_l
from (values
  ('jabar',  'kpbs-pangalengan', 'KPBS Pangalengan', 'Bandung',  4200, 85000.00),
  ('jateng', 'kud-mojosongo',    'KUD Mojosongo',    'Boyolali',  980, 21000.00),
  ('jateng', 'kud-cepogo',       'KUD Cepogo',       'Boyolali',  640, 13500.00),
  ('jatim',  'kud-setia-kawan',  'KUD Setia Kawan',  'Pasuruan', 1150, 26000.00)
) as v(region_code, slug, name, city, farmer_count, daily_milk_l)
join region r on r.code = v.region_code
on conflict (slug) do update set
  name = excluded.name,
  city = excluded.city,
  status = excluded.status,
  farmer_count = excluded.farmer_count,
  daily_milk_l = excluded.daily_milk_l;

-- 3. Produk
insert into product (sku, slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct, is_bulk)
values
  ('RECOB-50', 'recob-pelet-50kg', 'ReCob.id Pelet Konsentrat 50 kg',
   'Pelet konsentrat sapi perah dari bonggol jagung dan ampas tahu terfermentasi, dikeringkan dan dipres menjadi pelet.',
   'karung', 50.00, 160000.00, 200000.00, 16.00, false),
  ('RECOB-BULK', 'recob-bulk-curah', 'ReCob.id Curah (penawaran volume)',
   'Penawaran volume untuk peternakan komersial di luar skema KUD.',
   'karung', 50.00, 150000.00, null, 16.00, true)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  pack_weight_kg = excluded.pack_weight_kg,
  price_idr = excluded.price_idr,
  compare_price_idr = excluded.compare_price_idr,
  protein_pct = excluded.protein_pct,
  is_bulk = excluded.is_bulk;

-- 4. Bahan formulasi (pola: hapus lalu tulis ulang agar rentang selalu sinkron)
delete from product_ingredient
where product_id = (select id from product where slug = 'recob-pelet-50kg');

insert into product_ingredient (product_id, name, share_min_pct, share_max_pct, function_label, sort_order)
select p.id, v.name, v.share_min_pct, v.share_max_pct, v.function_label, v.sort_order
from (values
  ('Bonggol jagung terfermentasi', 50.00, 55.00, 'Sumber energi & serat, menekan biaya pakan', 1),
  ('Ampas tahu terfermentasi',     35.00, 40.00, 'Sumber protein utama hasil biokonversi', 2),
  ('Molase (tetes tebu)',           5.00, 10.00, 'Pengikat pelet, penambah palatabilitas', 3)
) as v(name, share_min_pct, share_max_pct, function_label, sort_order)
join product p on p.slug = 'recob-pelet-50kg';

-- 5. Metrik dampak Phase 1 (semua is_demo = true, wajib berlabel ilustrasi di UI)
insert into impact_metric (code, label, value_numeric, unit, period, period_label, is_demo, is_public, sort_order)
values
  ('corn_cob_potential_national', 'Potensi limbah bonggol jagung nasional', 4600000.00, 'ton',    'yearly',     '2022',       true, true, 1),
  ('saving_per_sack_50kg',        'Penghematan biaya per karung 50 kg',       40000.00, 'rupiah',  'monthly',    'per karung', true, true, 2),
  ('saving_per_cow_month',        'Penghematan per ekor per bulan',           96000.00, 'rupiah',  'monthly',    'per ekor',   true, true, 3),
  ('saving_per_10_cow_month',     'Penghematan peternak 10 ekor per bulan',  960000.00, 'rupiah',  'monthly',    '10 ekor',    true, true, 4),
  ('milk_yield_claim',            'Potensi kenaikan produksi susu',               2.00, 'liter',   'daily',      'per ekor',   true, true, 5)
on conflict (code) do update set
  label = excluded.label,
  value_numeric = excluded.value_numeric,
  unit = excluded.unit,
  period = excluded.period,
  period_label = excluded.period_label,
  is_public = excluded.is_public,
  sort_order = excluded.sort_order;

delete from impact_metric_reference
where metric_id in (select id from impact_metric where code in (
  'corn_cob_potential_national','saving_per_sack_50kg','saving_per_cow_month',
  'saving_per_10_cow_month','milk_yield_claim'));

insert into impact_metric_reference (metric_id, citation_label, citation_url, assumption_note)
select m.id, v.citation_label, v.citation_url, v.assumption_note
from (values
  ('corn_cob_potential_national', 'BPS (2022), Analisis produktivitas jagung dan kedelai di Indonesia 2021',
   'https://www.bps.go.id', 'Rentang nasional 3,45-4,6 juta ton per tahun; angka yang ditampilkan memakai batas atas.'),
  ('saving_per_sack_50kg', 'Harga dokumen sumber: Rp160.000 vs Rp180.000-200.000 per karung 50 kg',
   null, 'Selisih harga di gudang KUD mitra di sentra susu Jawa Barat dan Jawa Tengah, karung neto 50 kg.'),
  ('saving_per_cow_month', 'Turunan dari penghematan per karung', null,
   'Asumsi konsumsi konsentrat 4 kg per ekor per hari selama 30 hari.'),
  ('saving_per_10_cow_month', 'Turunan dari penghematan per ekor per bulan', null,
   'Asumsi populasi 10 ekor dengan konsumsi 4 kg per ekor per hari selama 30 hari.'),
  ('milk_yield_claim', 'Klaim dokumen sumber, menunggu validasi lapangan', null,
   'Klaim berbasis kajian: 1-2 liter per ekor per hari. Bukan capaian terbukti; wajib dilabeli sebagai klaim yang sedang diuji.')
) as v(metric_code, citation_label, citation_url, assumption_note)
join impact_metric m on m.code = v.metric_code;

-- 6. Lead contoh (is_demo = true, tidak pernah dihitung sebagai capaian nyata)
--    `source` adalah enum `lead_source`; nilai dari klausa VALUES bertipe text sehingga
--    memerlukan cast eksplisit (tanpa itu Postgres menolak dengan 42804).
insert into lead (full_name, phone_wa, cattle_count, region_id, kud_id, message, source, status, is_demo, idempotency_key, consented_at)
select v.full_name, v.phone_wa, v.cattle_count, r.id, k.id, v.message, v.source::lead_source, 'new', true,
       'seed-pitch-' || v.urut, now() - (v.urut || ' days')::interval
from (values
  (1, 'Tarno Sujarwo',     '081200000101',  8,  'jabar',  'kpbs-pangalengan', 'Ingin uji 2 karung untuk 8 ekor.',        'tiktok'),
  (2, 'Siti Aminah',       '081200000102', 12,  'jabar',  'kpbs-pangalengan', 'Tanya jadwal pengiriman ke Pangalengan.', 'instagram'),
  (3, 'Bambang Riyadi',    '081200000103', 25,  'jateng', 'kud-mojosongo',    'Tertarik skema potong setoran susu.',     'facebook'),
  (4, 'Joko Purnomo',      '081200000104',  6,  'jateng', 'kud-cepogo',       'Sapi kurang lahap pakan baru, minta panduan transisi.', 'field_visit'),
  (5, 'Rahmat Hidayat',    '081200000105', 18,  'jateng', 'kud-mojosongo',    null,                                      'whatsapp'),
  (6, 'Yusuf Maulana',     '081200000106', 30,  'jatim',  'kud-setia-kawan',  'Perlu penawaran volume untuk 30 ekor.',   'referral'),
  (7, 'Lestari Ningsih',   '081200000107',  9,  'jabar',  'kpbs-pangalengan', 'Apakah cocok untuk sapi laktasi awal?',   'tiktok'),
  (8, 'Hendra Wijaya',     '081200000108', 14,  'jatim',  'kud-setia-kawan',  null,                                      'instagram'),
  (9, 'Agus Setiawan',     '081200000109', 20,  'jateng', null,               'Belum tergabung KUD, minta info kemitraan.', 'other'),
  (10, 'Nur Kholis',       '081200000110',  7,  'jabar',  null,               'Ada sampel untuk dicoba minggu ini?',     'whatsapp')
) as v(urut, full_name, phone_wa, cattle_count, region_code, kud_slug, message, source)
join region r on r.code = v.region_code
left join kud k on k.slug = v.kud_slug
on conflict (idempotency_key) do nothing;

commit;
