-- 20260922091000_revoke_default_public_lead_privileges.sql
-- Supabase hosted dapat memberi privilege default penuh pada tabel baru.
-- Lead dan lead_event wajib tetap append-only bagi publik: tanpa SELECT atau UPDATE.

revoke all on table lead from anon, authenticated;
revoke all on table lead_event from anon, authenticated;

grant insert on table lead to anon, authenticated;
grant select, update on table lead to authenticated;

grant insert on table lead_event to anon, authenticated;
grant select on table lead_event to authenticated;
