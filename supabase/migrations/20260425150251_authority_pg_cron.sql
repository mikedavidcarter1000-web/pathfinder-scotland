-- Authority-3: enable pg_cron and schedule refreshes for the LA dashboard
-- materialised views.
--
-- Cadence:
--   * mv_authority_subject_choices -- daily 02:00 UTC (subject enrolments
--     change at most once a day via SEEMIS imports, usually less often).
--   * mv_authority_engagement      -- every 6 hours (engagement events
--     are continuous; 6h gives "near-live" feel without thrashing CPU).
--
-- Idempotency: cron.schedule will error on duplicate names, so we
-- unschedule any existing jobs of these names first. This makes the
-- migration safe to re-apply if a future change tweaks the cadence.

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_subject_choices') THEN
    PERFORM cron.unschedule('refresh_mv_subject_choices');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_engagement') THEN
    PERFORM cron.unschedule('refresh_mv_engagement');
  END IF;
END
$$;

SELECT cron.schedule(
  'refresh_mv_subject_choices',
  '0 2 * * *',
  $cron$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_authority_subject_choices$cron$
);

SELECT cron.schedule(
  'refresh_mv_engagement',
  '0 */6 * * *',
  $cron$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_authority_engagement$cron$
);
