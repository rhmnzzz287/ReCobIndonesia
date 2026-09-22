-- membersihkan seluruh objek Phase 1 dari project percobaan.
-- TIDAK dijalankan otomatis. Urutan mengikuti dependensi.

drop trigger if exists impact_metric_public_requires_reference on impact_metric;
drop function if exists enforce_public_metric_has_reference();
drop function if exists submit_sample_lead(text, text, integer, text, text, text, lead_source, jsonb, text);

drop table if exists impact_metric_reference;
drop table if exists impact_metric;
drop table if exists lead_event;
drop table if exists lead;
drop table if exists product_ingredient;
drop table if exists product;
drop table if exists kud;
drop table if exists region;

drop function if exists app_role();
drop function if exists set_updated_at();
drop type if exists metric_period;
drop type if exists metric_unit;
drop type if exists lead_source;
drop type if exists lead_status;
