-- ============================================================================
-- Unite Foundation Scholarship: OR logic for care_experienced / estranged
-- ============================================================================
-- The Unite Foundation Scholarship accepts students who are EITHER
-- care-experienced OR estranged (not both required). The standard matching
-- function uses AND logic across demographic flags, which would exclude
-- estranged-only students. This migration:
--   1. Sets requires_estranged = true on the row (was NULL — data was incomplete)
--   2. Rewrites match_bursaries_for_student() to special-case this bursary
-- ============================================================================

-- 1. Fix the data: Unite Foundation requires care_experience OR estranged
UPDATE bursaries
SET requires_estranged = true
WHERE slug = 'unite-foundation-scholarship';

-- 2. Recreate matching function with OR-logic special case
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
      -- Special case: Unite Foundation uses OR logic for care/estranged.
      -- "definite" if student has EITHER flag.
      WHEN b.slug = 'unite-foundation-scholarship'
        AND (COALESCE(s.care_experienced, false) IS TRUE
             OR COALESCE(s.is_estranged, false) IS TRUE)
        THEN 'definite'

      -- Definite: bursary names a demographic gate AND we have a YES on profile
      WHEN (b.requires_care_experience IS TRUE     AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE           AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE               AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE          AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE   AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        OR (b.requires_young_parent IS TRUE        AND COALESCE(s.is_young_parent, false) IS TRUE)
        THEN 'definite'
      -- Likely: universal entitlement — no gates of any kind
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND COALESCE(b.requires_young_parent, false) = false
        AND b.income_threshold_max IS NULL
        AND b.simd_quintile_max IS NULL
        AND b.min_age IS NULL
        AND b.max_age IS NULL
        THEN 'likely'
      ELSE 'check_eligibility'
    END AS match_confidence
  FROM bursaries b
  WHERE b.is_active = true
    -- ----------------------------------------------------------------
    -- Special case: Unite Foundation Scholarship uses OR logic for
    -- care_experienced and estranged (either qualifies, not both
    -- required). The schema cannot express OR across two demographic
    -- columns, so we handle it here. If more OR-eligibility bursaries
    -- are added in future, consider a dedicated eligibility expression
    -- column (JSONB rule) rather than extending this special case.
    -- ----------------------------------------------------------------
    AND (
      CASE WHEN b.slug = 'unite-foundation-scholarship' THEN
        -- Include if student is EITHER care-experienced OR estranged,
        -- or if either flag is still unknown (show as check_eligibility
        -- so student is prompted to complete their profile)
        COALESCE(s.care_experienced, false) = true
        OR COALESCE(s.is_estranged, false) = true
        OR s.care_experienced IS NULL
        OR s.is_estranged IS NULL
      ELSE
        -- Standard AND logic for all other bursaries
        TRUE
      END
    )
    -- Care experience (standard bursaries only; Unite Foundation handled above)
    AND (b.slug = 'unite-foundation-scholarship'
         OR COALESCE(b.requires_care_experience, false) = false
         OR COALESCE(s.care_experienced, false) = true)
    -- Estranged (standard bursaries only; Unite Foundation handled above)
    AND (b.slug = 'unite-foundation-scholarship'
         OR COALESCE(b.requires_estranged, false) = false
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
    -- Young parent
    AND (COALESCE(b.requires_young_parent, false) = false
         OR COALESCE(s.is_young_parent, false) = true)
    -- SIMD
    AND (b.simd_quintile_max IS NULL
         OR s.simd_decile IS NULL
         OR CEIL(s.simd_decile::numeric / 2) <= b.simd_quintile_max)
    -- School stage
    AND (s_stage_label IS NULL
         OR s_stage_label = ANY(b.student_stages))
  ORDER BY
    CASE
      -- Unite Foundation special case in sort order
      WHEN b.slug = 'unite-foundation-scholarship'
        AND (COALESCE(s.care_experienced, false) IS TRUE
             OR COALESCE(s.is_estranged, false) IS TRUE)
        THEN 0
      WHEN (b.requires_care_experience IS TRUE     AND COALESCE(s.care_experienced, false) IS TRUE)
        OR (b.requires_estranged IS TRUE           AND COALESCE(s.is_estranged, false) IS TRUE)
        OR (b.requires_carer IS TRUE               AND (COALESCE(s.is_carer, false) IS TRUE OR COALESCE(s.is_young_carer, false) IS TRUE))
        OR (b.requires_disability IS TRUE          AND COALESCE(s.has_disability, false) IS TRUE)
        OR (b.requires_refugee_or_asylum IS TRUE   AND COALESCE(s.is_refugee_or_asylum_seeker, false) IS TRUE)
        OR (b.requires_young_parent IS TRUE        AND COALESCE(s.is_young_parent, false) IS TRUE)
        THEN 0
      WHEN COALESCE(b.requires_care_experience, false) = false
        AND COALESCE(b.requires_estranged, false) = false
        AND COALESCE(b.requires_carer, false) = false
        AND COALESCE(b.requires_disability, false) = false
        AND COALESCE(b.requires_refugee_or_asylum, false) = false
        AND COALESCE(b.requires_young_parent, false) = false
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

GRANT EXECUTE ON FUNCTION match_bursaries_for_student(UUID) TO authenticated;
