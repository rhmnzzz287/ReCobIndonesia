-- 20260922090500_lead_event.sql
-- Sumber: Docs/SCHEMA.md §3.5
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

create table lead_event (
  id           bigserial primary key,
  lead_id      uuid references lead(id) on delete cascade,
  session_id   text,
  event_name   text not null check (event_name in (
                 'page_view','cta_click','scroll_75','outbound_wa_click',
                 'sample_form_start','sample_form_submit','article_read_75','referral_click'
               )),
  path         text,
  placement    text,
  metadata     jsonb not null default '{}'::jsonb,
  occurred_at  timestamptz not null default now(),
  constraint lead_event_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index lead_event_name_time_idx on lead_event (event_name, occurred_at desc);
create index lead_event_lead_idx on lead_event (lead_id) where lead_id is not null;
