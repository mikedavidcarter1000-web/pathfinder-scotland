-- Bursaries Remediation: remove hallucinated and duplicate entries
-- Expected result: 28 rows remain after deletion

-- 1. Delete "Supplementary Grant for Mature Students"
-- Reason: This scheme does not exist in SAAS. Not in source document.
-- Mature students get Independent Students' Bursary instead.
DELETE FROM public.bursaries
WHERE name = 'Supplementary Grant for Mature Students';

-- 2. Delete "Care Experienced Bursary for FE Students" (GBP 8,100/year)
-- Reason: Wrong figure. FE care-experienced students receive GBP 225/week
-- (GBP 9,000/year) via the FE Bursary route -- captured in the "Further Education
-- Bursary" entry. GBP 8,100 was the old HE rate before 2023.
DELETE FROM public.bursaries
WHERE name = 'Care Experienced Bursary for FE Students';

-- Verify expected row count
DO $$
DECLARE
  row_count INTEGER;
BEGIN
  SELECT count(*) INTO row_count FROM public.bursaries;
  IF row_count <> 28 THEN
    RAISE WARNING 'Expected 28 bursary rows after remediation, found %', row_count;
  END IF;
END $$;

-- ============================================================
-- Add missing columns for matching logic, sort order, and filtering
-- ============================================================
ALTER TABLE public.bursaries
  ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 50,
  ADD COLUMN IF NOT EXISTS amount_frequency text CHECK (amount_frequency IN (
    'per_week', 'per_month', 'per_year', 'one_off', 'total_package', 'variable'
  )),
  ADD COLUMN IF NOT EXISTS is_government_scheme boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_charitable_trust boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_universal boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_competitive boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_verification boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_nomination boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_lone_parent boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS requires_young_carer boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS not_eligible_for_saas boolean DEFAULT false;

-- ============================================================
-- Populate columns for existing 28 rows
-- ============================================================
UPDATE public.bursaries SET priority_score = 70, amount_frequency = 'one_off', is_government_scheme = true
  WHERE name = 'Best Start Grant School Age Payment';

UPDATE public.bursaries SET priority_score = 100, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Care Experienced Students'' Bursary';

UPDATE public.bursaries SET priority_score = 40, amount_frequency = 'per_week', is_government_scheme = true
  WHERE name = 'Carer''s Allowance';

UPDATE public.bursaries SET priority_score = 70, amount_frequency = 'per_year', is_charitable_trust = true, is_competitive = true
  WHERE name = 'Carnegie Trust Undergraduate Fee Grant';

UPDATE public.bursaries SET priority_score = 85, amount_frequency = 'per_year', is_government_scheme = true, is_universal = true
  WHERE name = 'Council Tax Exemption for Full-Time Students';

UPDATE public.bursaries SET priority_score = 75, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Dependants'' Grant';

UPDATE public.bursaries SET priority_score = 90, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Disabled Students'' Allowance';

UPDATE public.bursaries SET priority_score = 80, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Discretionary / Hardship Fund';

UPDATE public.bursaries SET priority_score = 90, amount_frequency = 'per_week', is_government_scheme = true, is_universal = true
  WHERE name = 'Education Maintenance Allowance';

UPDATE public.bursaries SET priority_score = 95, amount_frequency = 'total_package', is_government_scheme = true
  WHERE name = 'Estranged Students Support Package';

UPDATE public.bursaries SET priority_score = 60, amount_frequency = 'per_year', is_government_scheme = true, is_universal = true
  WHERE name = 'Free NHS Eye Tests';

UPDATE public.bursaries SET priority_score = 60, amount_frequency = 'per_year', is_government_scheme = true, is_universal = true
  WHERE name = 'Free NHS Prescriptions';

UPDATE public.bursaries SET priority_score = 85, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Free School Meals';

UPDATE public.bursaries SET priority_score = 100, amount_frequency = 'per_year', is_government_scheme = true, is_universal = true
  WHERE name = 'Free Tuition Fees (SAAS)';

UPDATE public.bursaries SET priority_score = 90, amount_frequency = 'per_week', is_government_scheme = true, is_universal = true
  WHERE name = 'Further Education Bursary';

UPDATE public.bursaries SET priority_score = 85, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Independent Students'' Bursary';

UPDATE public.bursaries SET priority_score = 80, amount_frequency = 'per_year', is_government_scheme = true, requires_lone_parent = true
  WHERE name = 'Lone Parent Grant';

UPDATE public.bursaries SET priority_score = 75, amount_frequency = 'per_year', is_government_scheme = true, requires_lone_parent = true
  WHERE name = 'Lone Parents'' Childcare Grant';

UPDATE public.bursaries SET priority_score = 100, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Paramedic, Nursing and Midwifery Students'' Bursary';

UPDATE public.bursaries SET priority_score = 88, amount_frequency = 'per_year', is_charitable_trust = true, is_competitive = true, needs_verification = true
  WHERE name = 'Robertson Trust Scholarship';

UPDATE public.bursaries SET priority_score = 80, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'School Clothing Grant';

UPDATE public.bursaries SET priority_score = 75, amount_frequency = 'per_week', is_government_scheme = true
  WHERE name = 'Scottish Child Payment';

UPDATE public.bursaries SET priority_score = 92, amount_frequency = 'one_off', is_government_scheme = true
  WHERE name = 'Summer Accommodation Grant';

UPDATE public.bursaries SET priority_score = 70, amount_frequency = 'variable', is_government_scheme = true
  WHERE name = 'Travel Expenses Grant (Islands)';

UPDATE public.bursaries SET priority_score = 90, amount_frequency = 'per_year', is_charitable_trust = true, is_competitive = true
  WHERE name = 'Unite Foundation Scholarship';

UPDATE public.bursaries SET priority_score = 75, amount_frequency = 'one_off', is_government_scheme = true, requires_young_carer = true
  WHERE name = 'Young Carer Grant';

UPDATE public.bursaries SET priority_score = 80, amount_frequency = 'per_year', is_government_scheme = true, is_universal = true
  WHERE name = 'Young Persons'' Free Bus Travel Scheme';

UPDATE public.bursaries SET priority_score = 95, amount_frequency = 'per_year', is_government_scheme = true
  WHERE name = 'Young Students'' Bursary';
