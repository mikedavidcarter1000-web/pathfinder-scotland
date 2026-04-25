-- Authority-4 follow-up: pin get_academic_year to Edinburgh local time and
-- close the cron race window around the engagement view recreation.
--
-- The previous migration's get_academic_year() was marked IMMUTABLE but
-- EXTRACT(YEAR/MONTH FROM timestamptz) depends on the session TimeZone.
-- Under a UTC-default session, an event at 2026-08-01 00:30 Europe/London
-- (= 2026-07-31 23:30 UTC) would be mis-bucketed into 2025-26 instead of
-- 2026-27. Pinning the conversion to Europe/London makes the result
-- deterministic regardless of session TimeZone, but the conversion itself
-- depends on the timezone database, so STABLE is the correct volatility
-- category.
--
-- This migration recreates the function and the engagement materialised
-- view (the view's academic_year column is computed from the function so it
-- has to be rebuilt). Cron unscheduling is moved to the start of the block
-- so the refresh job cannot fire while the view is being dropped/rebuilt.

-- Unschedule the cron job FIRST so it can't fire mid-migration.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_engagement') THEN
    PERFORM cron.unschedule('refresh_mv_engagement');
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.get_academic_year(d TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
PARALLEL SAFE
RETURNS NULL ON NULL INPUT
AS $$
DECLARE
  local_date DATE := (d AT TIME ZONE 'Europe/London')::date;
  yr  INT := EXTRACT(YEAR FROM local_date)::INT;
  mo  INT := EXTRACT(MONTH FROM local_date)::INT;
  start_year INT;
BEGIN
  IF mo >= 8 THEN
    start_year := yr;
  ELSE
    start_year := yr - 1;
  END IF;
  RETURN start_year::TEXT || '-' || LPAD(((start_year + 1) % 100)::TEXT, 2, '0');
END;
$$;

COMMENT ON FUNCTION public.get_academic_year(TIMESTAMPTZ) IS
  'Returns the Scottish academic year ("YYYY-YY") that contains the supplied timestamp, evaluated in Europe/London local time so the 1 Aug boundary aligns with the school calendar regardless of session TimeZone. STABLE because timezone database lookups vary across Postgres releases.';

-- Recreate the materialised view so academic_year is computed under the
-- corrected function. DROP + CREATE because the column is materialised, not
-- a simple view rewrite.
DROP MATERIALIZED VIEW IF EXISTS public.mv_authority_engagement;

CREATE MATERIALIZED VIEW public.mv_authority_engagement AS
SELECT
  s.local_authority,
  s.id AS school_id,
  pel.event_type,
  pel.event_category,
  pel.event_detail,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END AS simd_quintile,
  date_trunc('week', pel.created_at) AS week,
  public.get_academic_year(pel.created_at) AS academic_year,
  count(*) AS event_count,
  count(DISTINCT pel.student_id) AS unique_students
FROM public.platform_engagement_log pel
  JOIN public.students st ON pel.student_id = st.id
  JOIN public.schools s ON pel.school_id = s.id
GROUP BY
  s.local_authority,
  s.id,
  pel.event_type,
  pel.event_category,
  pel.event_detail,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END,
  date_trunc('week', pel.created_at),
  public.get_academic_year(pel.created_at);

CREATE UNIQUE INDEX idx_mv_engagement
  ON public.mv_authority_engagement
    (school_id, event_type, event_category, event_detail, gender, simd_quintile, week, academic_year)
  NULLS NOT DISTINCT;

-- Reschedule the cron job after the view is fully rebuilt.
SELECT cron.schedule(
  'refresh_mv_engagement',
  '0 */6 * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_authority_engagement'
);
