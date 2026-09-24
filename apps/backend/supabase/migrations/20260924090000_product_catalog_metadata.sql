-- 20260924090000_product_catalog_metadata.sql
-- Metadata katalog untuk kartu produk di /produk.

alter table product
  add column category text not null default 'Sapi Perah',
  add column image_path text;
