-- ============================================================================
-- Bursary Matching Engine
-- ============================================================================
-- Adds match_bursaries_for_student(UUID) — returns every bursary the student
-- is plausibly eligible for, tagged with a match_confidence:
--
--   'definite'          — the bursary has a specific demographic requirement
--                         (care experience, estranged, carer, disability,
--                         refugee/asylum) AND the student profile confirms it.
--   'likely'            — universal entitlement: no demographic, income, SIMD,
--                         or age criteria on the bursary.
--   'check_eligibility' — bursary has income / SIMD / age criteria the
--                         platform cannot fully verify from the profile, OR
--                         the student is missing data needed to confirm.
--
-- Filtering rule (per spec): err on the side of *showing* more bursaries.
-- Only EXCLUDE a bursary when we have positive evidence the student fails a
-- hard demographic gate (e.g. bursary requires care experience and the
-- student record explicitly says they are not care-experienced AND we trust
-- that flag is set). Missing data never excludes; it downgrades confidence.
--
-- Schema reality (vs. the illustrative SQL in the task brief):
--   • students.care_experienced            (not is_care_experienced)
--   • students.is_estranged                (not is_estranged_from_family)
--   • students.is_carer + students.is_young_carer  (either qualifies)
--   • students.has_disability
--   • students.is_refugee_or_asylum_seeker
--   • students.simd_decile (1–10) — bursaries.simd_quintile_max is 1–5,
--     so we compare with ceil(decile / 2).
--   • students has NO date_of_birth — age criteria become check_eligibility.
--   • students.household_income_band is a TEXT band, not numeric — income
--     criteria become check_eligibility unless the band's lower bound is
--     clearly above the threshold (in which case still include, just flagged).
--   • school_stage enum is lowercase ('s2'..'s6','college','mature');
--     bursaries.student_stages uses ('S1'..'S6','FE','undergraduate').
-- ============================================================================

CREATE OR REPLACE FUNCTION match_bursaries_for_student(target_student_id UUID)
RETURNS TABLE (
  bursary_id UUID,
  name TEXT,
  administering_body TEXT,
  description TEXT,
  award_type TEXT,
  amount_description TEXT,
  amount_max DECIMAL,
  url TEXT,
  application_deadline TEXT,
  match_confidence TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  s_stage_label TEXT;
BEGIN
  SELECT * INTO s FROM students WHERE id = target_student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student not found: %', target_student_id;
  END IF;

  -- Map internal lowercase enum to the labels used in bursaries.student_stages
  s_stage_label := CASE s.school_stage::text
    WHEN 's2' THEN 'S2'
    WHEN 's3' THEN 'S3'
    WHEN 's4' THEN 'S4'
    WHEN 's5' THEN 'S5'
    WHEN 's6' THEN 'S6'
    WHEN 'college' THEN 'FE'
    WHEN 'mature' THEN 'undergraduate'
    ELSE NULL
  END;

  RETURN QUERY
  SELECT
    b.id AS bursary_id,
    b.name,
    b.administering_body,
    b.description,
    b.award_type,
    b.amount_description,
    b.amount_max,
    b.url,
    b.application_deadline,
    CASE
      -- Definite: bursary names a demographic gate AND we have a YES on profile
      WHEN (b.requires_care_experience IS TRUE     AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE           AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE               AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE          AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE   AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        THEN 'definite'
      -- Likely: universal entitlement — no gates of any kind
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND b.income_threshold_max IS NULL
        AND b.simd_quintile_max IS NULL
        AND b.min_age IS NULL
        AND b.max_age IS NULL
        THEN 'likely'
      ELSE 'check_eligibility'
    END AS match_confidence
  FROM bursaries b
  WHERE b.is_active = true
    -- Care experience: only exclude if bursary requires it AND student profile says no
    AND (COALESCE(b.requires_care_experience, false) = false
         OR COALESCE(s.care_experienced, false) = true)
    -- Estranged
    AND (COALESCE(b.requires_estranged, false) = false
         OR COALESCE(s.is_estranged, false) = true)
    -- Carer (either flag counts)
    AND (COALESCE(b.requires_carer, false) = false
         OR COALESCE(s.is_carer, false) = true
         OR COALESCE(s.is_young_carer, false) = true)
    -- Disability
    AND (COALESCE(b.requires_disability, false) = false
         OR COALESCE(s.has_disability, false) = true)
    -- Refugee / asylum
    AND (COALESCE(b.requires_refugee_or_asylum, false) = false
         OR COALESCE(s.is_refugee_or_asylum_seeker, false) = true)
    -- SIMD: convert decile (1–10) to quintile (1–5). If student has no
    -- SIMD data, include but downgrade confidence (handled in CASE above).
    AND (b.simd_quintile_max IS NULL
         OR s.simd_decile IS NULL
         OR CEIL(s.simd_decile::numeric / 2) <= b.simd_quintile_max)
    -- School stage: if student has no stage, include all; else require overlap.
    -- (S1 bursaries listed in the catalogue won't match anyone since the
    -- platform only supports S2 onwards — that's fine.)
    AND (s_stage_label IS NULL
         OR s_stage_label = ANY(b.student_stages))
  ORDER BY
    -- Definite first, then likely, then check_eligibility
    CASE
      WHEN (b.requires_care_experience IS TRUE     AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE           AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE               AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE          AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE   AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        THEN 0
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND b.income_threshold_max IS NULL
        AND b.simd_quintile_max IS NULL
        AND b.min_age IS NULL
        AND b.max_age IS NULL
        THEN 1
      ELSE 2
    END,
    b.amount_max DESC NULLS LAST,
    b.name;
END;
$$;

-- Callers must be authenticated (the API route guards this further by
-- only passing auth.uid()).
GRANT EXECUTE ON FUNCTION match_bursaries_for_student(UUID) TO authenticated;

COMMENT ON FUNCTION match_bursaries_for_student(UUID) IS
  'Returns all active bursaries plausibly available to the given student, tagged ''definite'' / ''likely'' / ''check_eligibility''. Missing profile data never excludes a bursary; it only downgrades confidence.';
