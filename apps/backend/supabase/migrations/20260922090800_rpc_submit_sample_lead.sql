-- 20260922090800_rpc_submit_sample_lead.sql
-- Sumber: Docs/SCHEMA.md §4
-- Disalin apa adanya dari dokumen sumber; jangan disunting di sini.

create or replace function submit_sample_lead(
  p_full_name      text,
  p_phone_wa       text,
  p_cattle_count   integer,
  p_region_code    text,
  p_kud_slug       text default null,
  p_message        text default null,
  p_source         lead_source default 'other',
  p_utm            jsonb default '{}'::jsonb,
  p_idempotency_key text default null
)
returns table (lead_id uuid, created boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_region_id uuid;
  v_kud_id    uuid;
  v_existing  uuid;
  v_new_id    uuid;
  v_key       text := coalesce(p_idempotency_key, gen_random_uuid()::text);
begin
  select id into v_region_id from region where code = p_region_code;
  if v_region_id is null then
    raise exception 'wilayah % tidak dikenal', p_region_code using errcode = '22023';
  end if;

  if p_kud_slug is not null then
    select id into v_kud_id from kud where slug = p_kud_slug;
  end if;

  select id into v_existing from lead
    where idempotency_key = v_key or (phone_wa = p_phone_wa and deleted_at is null)
    limit 1;

  if v_existing is not null then
    insert into lead_event (lead_id, event_name, metadata)
    values (v_existing, 'sample_form_submit', jsonb_build_object('duplicate', true));
    return query select v_existing, false;
    return;
  end if;

  insert into lead (
    full_name, phone_wa, cattle_count, region_id, kud_id, message,
    source, utm_source, utm_medium, utm_campaign, idempotency_key, consented_at
  )
  values (
    btrim(p_full_name), p_phone_wa, p_cattle_count, v_region_id, v_kud_id,
    nullif(btrim(coalesce(p_message, '')), ''), p_source,
    p_utm ->> 'source', p_utm ->> 'medium', p_utm ->> 'campaign',
    v_key, now()
  )
  returning id into v_new_id;

  insert into lead_event (lead_id, event_name, metadata)
  values (v_new_id, 'sample_form_submit', jsonb_build_object('duplicate', false));

  return query select v_new_id, true;
end;
$$;

revoke all on function submit_sample_lead from public;
grant execute on function submit_sample_lead to anon, authenticated;
