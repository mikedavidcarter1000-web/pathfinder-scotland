-- ============================================================================
-- Bursary Finder Additions
-- ============================================================================
-- Adds requires_young_parent column, inserts bursaries missing from the
-- initial seed, and updates the matching function to handle young parents.
-- ============================================================================

-- 1. Add young parent requirement column
ALTER TABLE bursaries ADD COLUMN IF NOT EXISTS requires_young_parent BOOLEAN;

-- 2. Tag existing Lone Parent bursaries
UPDATE bursaries SET requires_young_parent = true WHERE name ILIKE '%lone parent%';

-- 3. Insert missing bursaries
-- ============================================================================

INSERT INTO bursaries (
  name, administering_body, description, student_stages, award_type,
  amount_description, amount_min, amount_max,
  is_means_tested, is_repayable,
  income_threshold_max, requires_care_experience, requires_estranged,
  requires_carer, requires_disability, requires_refugee_or_asylum,
  requires_young_parent,
  simd_quintile_max, min_age, max_age, specific_courses,
  requires_scottish_residency,
  application_process, url, notes,
  academic_year, last_verified_date
) VALUES
-- Dependants' Grant
(
  'Dependants'' Grant',
  'Student Awards Agency Scotland (SAAS)',
  'Means-tested grant for students with dependent adults or children to help with extra costs while studying.',
  ARRAY['undergraduate'], 'grant',
  'Up to £2,640 per year', NULL, 2640,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply online via SAAS.',
  'https://www.saas.gov.uk',
  'Available to students with financially dependent family members.',
  '2025-26', '2026-04-01'
),
-- Travel Expenses Grant (islands)
(
  'Travel Expenses Grant (Islands)',
  'Student Awards Agency Scotland (SAAS)',
  'Grant covering actual travel costs for students living on Scottish islands who need to travel to the mainland for study.',
  ARRAY['undergraduate'], 'grant',
  'Actual travel costs reimbursed', NULL, NULL,
  false, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via SAAS with evidence of island residency and travel costs.',
  'https://www.saas.gov.uk',
  'For students ordinarily resident on a Scottish island attending a mainland institution.',
  '2025-26', '2026-04-01'
),
-- Young Carer Grant
(
  'Young Carer Grant',
  'Social Security Scotland',
  'One-off annual payment for young carers aged 16-18 who provide regular unpaid care.',
  ARRAY['S5','S6'], 'grant',
  '£378.98 (one-off annual payment)', 378.98, 378.98,
  false, false,
  NULL, NULL, NULL, true, NULL, NULL, NULL,
  NULL, 16, 18, NULL,
  true,
  'Apply online via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/young-carer-grant',
  'Must care for someone who receives a qualifying disability benefit for an average of 16+ hours per week.',
  '2025-26', '2026-04-01'
),
-- Best Start Grant School Age Payment
(
  'Best Start Grant School Age Payment',
  'Social Security Scotland',
  'One-off payment to help with costs when a child starts or moves to a new school.',
  ARRAY['S1'], 'grant',
  '£294.70 (one-off)', 294.70, 294.70,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply via mygov.scot or Social Security Scotland.',
  'https://www.mygov.scot/best-start-grant-best-start-foods',
  'Paid to parent/carer. Requires qualifying benefit (Universal Credit, Child Tax Credit, etc.). For children starting P1 or transitioning to secondary.',
  '2025-26', '2026-04-01'
),
-- Supplementary Grant for Mature Students
(
  'Supplementary Grant for Mature Students',
  'Student Awards Agency Scotland (SAAS)',
  'Additional grant for students aged 25 or over in further or higher education.',
  ARRAY['FE','undergraduate'], 'grant',
  'Up to £1,072 per year', NULL, 1072,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, 25, NULL, NULL,
  true,
  'Apply via SAAS as part of your funding application.',
  'https://www.saas.gov.uk',
  'For mature students (25+) in full-time FE or HE courses.',
  '2025-26', '2026-04-01'
),
-- FE Bursary (college)
(
  'Further Education Bursary',
  'Colleges Scotland (individual college bursary funds)',
  'Means-tested bursary for full-time further education students at Scottish colleges.',
  ARRAY['FE'], 'bursary',
  'Variable (typically £500-£4,000 per year)', 500, 4000,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply directly to your college''s student funding team.',
  NULL,
  'Amount varies by college and personal circumstances. Covers living costs, travel, and study materials.',
  '2025-26', '2026-04-01'
),
-- Discretionary Funds (university)
(
  'Discretionary / Hardship Fund',
  'Individual Scottish universities',
  'Emergency or supplementary funding for students in financial difficulty.',
  ARRAY['undergraduate'], 'grant',
  'Variable (one-off or recurring)', NULL, NULL,
  true, false,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply to your university''s student services or funding office.',
  NULL,
  'Available to students who have already accessed all statutory funding and still face hardship. Prioritised for care-experienced, estranged, and disabled students at many institutions.',
  '2025-26', '2026-04-01'
),
-- Scottish Bursary for Care Experienced FE Students
(
  'Care Experienced Bursary for FE Students',
  'Colleges Scotland / Scottish Funding Council',
  'Non-means-tested bursary for care-experienced students in further education.',
  ARRAY['FE'], 'bursary',
  '£8,100 per year', 8100, 8100,
  false, false,
  NULL, true, NULL, NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL,
  true,
  'Apply through your college with evidence of care experience.',
  NULL,
  'Similar to the SAAS Care Experienced Students'' Bursary but for FE-level study. Non-repayable.',
  '2025-26', '2026-04-01'
),
-- Carer's Allowance
(
  'Carer''s Allowance',
  'Department for Work and Pensions (DWP)',
  'Weekly payment for people who spend at least 35 hours a week caring for someone with a qualifying disability.',
  ARRAY['S4','S5','S6','FE','undergraduate'], 'entitlement',
  '£81.90 per week', 81.90, 81.90,
  false, false,
  NULL, NULL, NULL, true, NULL, NULL, NULL,
  NULL, 16, NULL, NULL,
  true,
  'Apply online via gov.uk or by phone.',
  'https://www.gov.uk/carers-allowance',
  'Must be 16+, care for someone 35+ hours per week, and earn no more than £151 per week after deductions. Studying 21+ hours per week may affect eligibility.',
  '2025-26', '2026-04-01'
);

-- 4. Update matching function to handle requires_young_parent
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
    -- Care experience
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
