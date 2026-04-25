-- Authority-15: National tier foundation
--
-- Adds the national-staff access tier above LA, the opt-in aggregation
-- materialised views (only opted-in LAs are included), the national
-- audit log, and the Challenge Authority flag used by the Authority-16
-- comparison views.
--
-- Schema notes:
--   * `local_authorities.share_national` and `share_national_opted_at`
--     already exist (added in Authority-1) so this migration only
--     consumes them, never adds them.
--   * National MVs intentionally mirror `mv_authority_*` shape so the
--     query layer can reuse helpers, with these differences:
--       - The schools.local_authority text column is joined to
--         local_authorities.name to surface `local_authority_code`.
--       - WHERE filters: la.share_national = true AND s.visible_to_authority = true
--       - GROUP BY adds la.code so per-LA aggregation is queryable.
--   * NULLS NOT DISTINCT (PG 15+) lets the unique indexes span nullable
--     demographic columns without COALESCE gymnastics, required for
--     REFRESH MATERIALIZED VIEW CONCURRENTLY.
--   * pg_cron schedules are offset 30 min from the LA-tier refreshes
--     (mv_authority_subject_choices: 02:00, mv_authority_engagement: */6)
--     so concurrent refresh load does not stack up on a single CPU.

-- ---------------------------------------------------------------------------
-- 1. national_staff
-- ---------------------------------------------------------------------------
CREATE TABLE national_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  organisation TEXT NOT NULL CHECK (organisation IN (
    'Scottish Government',
    'Education Scotland',
    'Scottish Funding Council',
    'Qualifications Scotland',
    'Skills Development Scotland',
    'Pathfinder Scotland'
  )),
  role TEXT NOT NULL CHECK (role IN ('national_admin', 'national_analyst')),
  can_export_data BOOLEAN DEFAULT true,
  can_manage_staff BOOLEAN DEFAULT false,
  can_access_api BOOLEAN DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

CREATE INDEX idx_national_staff_user_id ON national_staff(user_id);
CREATE INDEX idx_national_staff_role ON national_staff(role);

-- ---------------------------------------------------------------------------
-- 2. national_audit_log (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE national_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES national_staff(id),
  action TEXT NOT NULL,
  resource TEXT,
  filters_applied JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_national_audit_log_staff_id ON national_audit_log(staff_id);
CREATE INDEX idx_national_audit_log_created_at ON national_audit_log(created_at DESC);

-- ---------------------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE national_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE national_audit_log ENABLE ROW LEVEL SECURITY;

-- Helper: returns true when the current user is a registered national-staff
-- member with a non-null user_id link. SECURITY DEFINER bypasses RLS on
-- national_staff so the read in the predicate cannot recurse.
CREATE OR REPLACE FUNCTION is_national_staff()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM national_staff
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_national_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM national_staff
    WHERE user_id = auth.uid() AND role = 'national_admin'
  );
$$;

-- national_staff: any national staff member can read the directory
CREATE POLICY "national_staff_read_all"
  ON national_staff FOR SELECT TO authenticated
  USING (is_national_staff());

-- national_staff: only national admins can insert / update / delete
CREATE POLICY "national_admin_insert_staff"
  ON national_staff FOR INSERT TO authenticated
  WITH CHECK (is_national_admin());

CREATE POLICY "national_admin_update_staff"
  ON national_staff FOR UPDATE TO authenticated
  USING (is_national_admin())
  WITH CHECK (is_national_admin());

CREATE POLICY "national_admin_delete_staff"
  ON national_staff FOR DELETE TO authenticated
  USING (is_national_admin());

-- (No self-update policy: RLS cannot restrict which COLUMNS get updated, so
-- a self-update policy would let a non-admin escalate their own role to
-- national_admin. last_active_at is bumped via the service-role admin
-- client inside requireNationalStaffApi() instead.)

-- national_audit_log: read-only for national staff, insert allowed (typed
-- by the SECURITY DEFINER side once we wire log helpers); no UPDATE / DELETE
-- policies = append-only.
CREATE POLICY "national_staff_read_audit_log"
  ON national_audit_log FOR SELECT TO authenticated
  USING (is_national_staff());

CREATE POLICY "national_staff_insert_audit_log"
  ON national_audit_log FOR INSERT TO authenticated
  WITH CHECK (is_national_staff());

-- ---------------------------------------------------------------------------
-- 4. Challenge Authority flag
-- ---------------------------------------------------------------------------
ALTER TABLE local_authorities
  ADD COLUMN IF NOT EXISTS is_challenge_authority BOOLEAN DEFAULT false;

COMMENT ON COLUMN local_authorities.is_challenge_authority IS
  'True for the 9 Challenge Authorities receiving Attainment Scotland Fund support. Used by national tier comparison views.';

-- ---------------------------------------------------------------------------
-- 5. National materialised views
-- ---------------------------------------------------------------------------

-- 5a. Subject choices, opted-in LAs only
CREATE MATERIALIZED VIEW mv_national_subject_choices AS
SELECT
  la.name AS local_authority_name,
  la.code AS local_authority_code,
  s.id AS school_id,
  s.name AS school_name,
  ca.academic_year,
  ca.year_group,
  ca.subject_id,
  sub.name AS subject_name,
  curr.name AS subject_category,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END AS simd_quintile,
  st.care_experienced AS is_care_experienced,
  st.has_asn,
  st.receives_free_school_meals AS is_fsm_registered,
  st.eal AS is_eal,
  st.is_young_carer,
  st.is_home_educated,
  COUNT(*) AS student_count
FROM class_students cs
  JOIN class_assignments ca ON cs.class_assignment_id = ca.id
  JOIN schools s ON ca.school_id = s.id
  JOIN local_authorities la ON s.local_authority = la.name
  JOIN subjects sub ON ca.subject_id = sub.id
  LEFT JOIN curricular_areas curr ON sub.curricular_area_id = curr.id
  JOIN students st ON cs.student_id = st.id
WHERE la.share_national = true
  AND s.visible_to_authority = true
GROUP BY
  la.name, la.code, s.id, s.name,
  ca.academic_year, ca.year_group,
  ca.subject_id, sub.name, curr.name,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END,
  st.care_experienced,
  st.has_asn,
  st.receives_free_school_meals,
  st.eal,
  st.is_young_carer,
  st.is_home_educated;

CREATE UNIQUE INDEX idx_mv_national_subject_choices ON mv_national_subject_choices (
  local_authority_code,
  school_id,
  academic_year,
  year_group,
  subject_id,
  gender,
  simd_quintile,
  is_care_experienced,
  has_asn,
  is_fsm_registered,
  is_eal,
  is_young_carer,
  is_home_educated
) NULLS NOT DISTINCT;

COMMENT ON MATERIALIZED VIEW mv_national_subject_choices IS
  'National tier: subject enrolment counts across all LAs that have set share_national = true. Refreshed daily 02:30 UTC.';

-- 5b. Engagement, opted-in LAs only
CREATE MATERIALIZED VIEW mv_national_engagement AS
SELECT
  la.name AS local_authority_name,
  la.code AS local_authority_code,
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
  get_academic_year(pel.created_at) AS academic_year,
  DATE_TRUNC('week', pel.created_at) AS week,
  COUNT(*) AS event_count,
  COUNT(DISTINCT pel.student_id) AS unique_students
FROM platform_engagement_log pel
  JOIN students st ON pel.student_id = st.id
  JOIN schools s ON pel.school_id = s.id
  JOIN local_authorities la ON s.local_authority = la.name
WHERE la.share_national = true
  AND s.visible_to_authority = true
GROUP BY
  la.name, la.code, s.id,
  pel.event_type, pel.event_category, pel.event_detail,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END,
  get_academic_year(pel.created_at),
  DATE_TRUNC('week', pel.created_at);

CREATE UNIQUE INDEX idx_mv_national_engagement ON mv_national_engagement (
  local_authority_code,
  school_id,
  event_type,
  event_category,
  event_detail,
  gender,
  simd_quintile,
  academic_year,
  week
) NULLS NOT DISTINCT;

COMMENT ON MATERIALIZED VIEW mv_national_engagement IS
  'National tier: weekly engagement counts across all LAs that have set share_national = true. Refreshed every 6h at *:30.';

-- ---------------------------------------------------------------------------
-- 6. pg_cron schedules
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_national_subject_choices') THEN
    PERFORM cron.unschedule('refresh_mv_national_subject_choices');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh_mv_national_engagement') THEN
    PERFORM cron.unschedule('refresh_mv_national_engagement');
  END IF;
END
$$;

SELECT cron.schedule(
  'refresh_mv_national_subject_choices',
  '30 2 * * *',
  $cron$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_national_subject_choices$cron$
);

SELECT cron.schedule(
  'refresh_mv_national_engagement',
  '30 */6 * * *',
  $cron$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_national_engagement$cron$
);

-- ---------------------------------------------------------------------------
-- 7. create_national_staff helper
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER, qualified table refs (search_path pinned). Callable by
-- the service-role admin client from the back-office tooling. Inserts a
-- placeholder UUID for user_id; once the invited user creates their account
-- the back-office tool updates the row with the real auth.users.id.
CREATE OR REPLACE FUNCTION create_national_staff(
  p_email TEXT,
  p_full_name TEXT,
  p_organisation TEXT,
  p_role TEXT
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_staff_id UUID;
BEGIN
  IF p_role NOT IN ('national_admin', 'national_analyst') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;

  INSERT INTO national_staff (
    user_id,
    full_name,
    email,
    organisation,
    role,
    can_manage_staff,
    can_access_api,
    can_export_data
  )
  VALUES (
    NULL,
    p_full_name,
    p_email,
    p_organisation,
    p_role,
    p_role = 'national_admin',
    TRUE,
    TRUE
  )
  RETURNING id INTO v_staff_id;

  RETURN v_staff_id;
END;
$$;

REVOKE ALL ON FUNCTION create_national_staff(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
-- Service role can call directly; no GRANT to anon/authenticated.
--
-- user_id is left nullable on national_staff so the invited account can be
-- registered in advance and linked to auth.users.id once the invitee signs
-- up. UNIQUE(user_id) permits multiple NULLs in PostgreSQL by default.

-- ---------------------------------------------------------------------------
-- 9. Seed Challenge Authorities
-- ---------------------------------------------------------------------------
-- The 9 LAs receiving Attainment Scotland Fund support. Slug values must
-- match those seeded by the LA portal migration (lowercase, hyphenated).
UPDATE local_authorities
SET is_challenge_authority = true
WHERE slug IN (
  'glasgow',
  'dundee',
  'inverclyde',
  'west-dunbartonshire',
  'north-ayrshire',
  'clackmannanshire',
  'north-lanarkshire',
  'east-ayrshire',
  'renfrewshire'
);
