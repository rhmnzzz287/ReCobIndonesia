-- 20260922090000_extensions_and_enums.sql
-- Sumber: Docs/SCHEMA.md §3.1
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

-- Ekstensi
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- email case-insensitive (opsional)

-- Tipe enumerasi
create type lead_status      as enum ('new', 'contacted', 'sampled', 'converted', 'rejected');
create type lead_source      as enum ('tiktok', 'instagram', 'facebook', 'whatsapp', 'referral', 'field_visit', 'other');
create type metric_unit      as enum ('ton', 'kg', 'rupiah', 'liter', 'count', 'percent');
create type metric_period    as enum ('daily', 'weekly', 'monthly', 'yearly', 'cumulative');
