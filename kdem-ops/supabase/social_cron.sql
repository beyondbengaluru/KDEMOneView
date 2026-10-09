-- ============================================================
-- Optional: refresh social follower counts automatically, every 6 hours.
-- Needs the social-sync function deployed and its secrets set.
-- 1. Dashboard → Database → Extensions: enable pg_cron and pg_net.
-- 2. Store the service-role key in the Vault (Dashboard → Project Settings → API):
--      select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
-- 3. Replace <PROJECT_REF> below and run this file.
-- ============================================================
select cron.unschedule('social-sync') where exists (select 1 from cron.job where jobname = 'social-sync');
select cron.schedule('social-sync', '15 */6 * * *', $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/social-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key')),
    body := '{}'::jsonb);
$$);
