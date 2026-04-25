-- Authority-5: expose the most recent successful refresh time of the
-- authority materialised views to the dashboard header.
--
-- The cron schema is not exposed via PostgREST. A SECURITY DEFINER
-- function lets the Next.js admin/service-role client read the latest
-- end_time across the two refresh jobs (refresh_mv_subject_choices and
-- refresh_mv_engagement) without granting cron schema access broadly.
--
-- The function returns NULL when no successful runs have been recorded
-- (e.g. the first cron tick has not fired yet). The dashboard renders
-- "—" in that case.

CREATE OR REPLACE FUNCTION public.get_last_authority_mv_refresh()
RETURNS timestamptz
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, cron, pg_temp
AS $$
  SELECT MAX(jrd.end_time)
  FROM cron.job_run_details jrd
  JOIN cron.job j ON j.jobid = jrd.jobid
  WHERE jrd.status = 'succeeded'
    AND j.jobname IN ('refresh_mv_subject_choices', 'refresh_mv_engagement');
$$;

COMMENT ON FUNCTION public.get_last_authority_mv_refresh IS
  'Returns the most recent successful end_time across the authority materialised view refresh cron jobs. Used by /authority/dashboard to display the data freshness indicator. Returns NULL when no successful runs are recorded.';

REVOKE ALL ON FUNCTION public.get_last_authority_mv_refresh() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_last_authority_mv_refresh() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_last_authority_mv_refresh() TO service_role;
