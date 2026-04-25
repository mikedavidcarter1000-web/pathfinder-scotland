-- Authority-3: pre-aggregated materialised views for the LA dashboard.
-- These collapse fine-grained student records into anonymisable cohort
-- counts so LA staff can never see individual rows. The views are
-- refreshed on a schedule (see follow-up pg_cron migration).
--
-- Schema notes:
--   * subject enrolment lives in class_assignments + class_students, not
--     a `subject_choices` table. class_assignments owns academic_year,
--     year_group, school_id, subject_id; class_students links each
--     student to a class assignment.
--   * subjects.category is not a column; the equivalent grouping is
--     curricular_areas.name (joined via subjects.curricular_area_id).
--   * student demographic columns use legacy names: care_experienced,
--     receives_free_school_meals, eal. We surface them under the
--     architecture-spec names (is_care_experienced, is_fsm_registered,
--     is_eal) for downstream dashboard consistency.
--   * NULLS NOT DISTINCT (PG 15+) lets the unique index span nullable
--     demographic columns without COALESCE gymnastics, which is required
--     for REFRESH MATERIALIZED VIEW CONCURRENTLY.

CREATE MATERIALIZED VIEW mv_authority_subject_choices AS
SELECT
  s.local_authority,
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
  JOIN subjects sub ON ca.subject_id = sub.id
  LEFT JOIN curricular_areas curr ON sub.curricular_area_id = curr.id
  JOIN students st ON cs.student_id = st.id
GROUP BY
  s.local_authority, s.id, s.name,
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

CREATE MATERIALIZED VIEW mv_authority_engagement AS
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
  DATE_TRUNC('week', pel.created_at) AS week,
  COUNT(*) AS event_count,
  COUNT(DISTINCT pel.student_id) AS unique_students
FROM platform_engagement_log pel
  JOIN students st ON pel.student_id = st.id
  JOIN schools s ON pel.school_id = s.id
GROUP BY
  s.local_authority, s.id,
  pel.event_type, pel.event_category, pel.event_detail,
  st.gender,
  CASE
    WHEN st.simd_decile BETWEEN 1 AND 2 THEN 'Q1'
    WHEN st.simd_decile BETWEEN 3 AND 4 THEN 'Q2'
    WHEN st.simd_decile BETWEEN 5 AND 6 THEN 'Q3'
    WHEN st.simd_decile BETWEEN 7 AND 8 THEN 'Q4'
    WHEN st.simd_decile BETWEEN 9 AND 10 THEN 'Q5'
  END,
  DATE_TRUNC('week', pel.created_at);

-- Unique indexes are required for REFRESH MATERIALIZED VIEW CONCURRENTLY.
-- NULLS NOT DISTINCT lets a single index span the nullable demographic
-- columns without forcing every NULL row to be considered unique.

CREATE UNIQUE INDEX idx_mv_subject_choices ON mv_authority_subject_choices (
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

CREATE UNIQUE INDEX idx_mv_engagement ON mv_authority_engagement (
  school_id,
  event_type,
  event_category,
  event_detail,
  gender,
  simd_quintile,
  week
) NULLS NOT DISTINCT;

COMMENT ON MATERIALIZED VIEW mv_authority_subject_choices IS
  'LA dashboard: subject enrolment counts grouped by school, year, subject, demographics. Refreshed daily.';

COMMENT ON MATERIALIZED VIEW mv_authority_engagement IS
  'LA dashboard: weekly engagement counts grouped by school, event, demographics. Refreshed every 6 hours.';
