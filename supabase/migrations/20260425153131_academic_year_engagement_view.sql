-- Authority-4: academic year derivation + engagement view recreation.
--
-- Adds a SQL helper to map a timestamptz to the Scottish academic year
-- ("YYYY-YY", e.g. "2025-26"), then drops and recreates mv_authority_engagement
-- with the derived academic_year column included so dashboard queries can
-- filter by year. The unique index is recreated to include academic_year
-- (otherwise REFRESH MATERIALIZED VIEW CONCURRENTLY would fail to dedupe).
--
-- pg_cron job refresh_mv_engagement keeps its existing schedule because the
-- view name is unchanged. We re-stamp it defensively so a re-run of this
-- migration is idempotent.

-- Map a timestamptz to the Scottish academic year ("YYYY-YY").
-- Aug 1 inclusive flips to the new year; Jul 31 still in the old year.
CREATE OR REPLACE FUNCTION public.get_academic_year(d TIMESTAMPTZ)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
DECLARE
  yr  INT := EXTRACT(YEAR FROM d)::INT;
  mo  INT := EXTRACT(MONTH FROM d)::INT;
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
  'Returns the Scottish academic year ("YYYY-YY") that contains the supplied timestamp. Aug 1 starts the new year; Jul 31 ends the old year. IMMUTABLE so it can index/group on derived values.';

-- Drop the existing view + index and rebuild with academic_year.
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

-- Unique index needed for REFRESH MATERIALIZED VIEW CONCURRENTLY.
-- NULLS NOT DISTINCT (PG 15+) keeps NULL group keys collapsed across rows.
-- academic_year is functionally determined by week (both derived from
-- created_at) so this is logically equivalent to the previous index, but
-- including the column lets future queries that group by academic_year alone
-- benefit from the same uniqueness guarantee.
CREATE UNIQUE INDEX idx_mv_engagement
  ON public.mv_authority_engagement
    (school_id, event_type, event_category, event_detail, gender, simd_quintile, week, academic_year)
  NULLS NOT DISTINCT;

-- Re-stamp the pg_cron schedule. The view name is unchanged so the existing
-- job would still work, but we unschedule + reschedule so the migration is
-- idempotent across re-runs and visible in cron.job after a fresh apply.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_engagement') THEN
    PERFORM cron.unschedule('refresh_mv_engagement');
  END IF;
  PERFORM cron.schedule(
    'refresh_mv_engagement',
    '0 */6 * * *',
    'REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_authority_engagement'
  );
END
$$;
