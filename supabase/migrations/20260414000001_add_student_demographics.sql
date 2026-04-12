-- Add demographic columns to students table for enhanced bursary matching.
-- These allow the benefits finder to show exact entitlement amounts rather
-- than estimates based on SIMD proxy alone.

ALTER TABLE students ADD COLUMN IF NOT EXISTS household_income_band TEXT
  CHECK (household_income_band IN (
    'under_21000', '21000_24000', '24000_34000', '34000_45000', 'over_45000', 'prefer_not_say'
  ));

ALTER TABLE students ADD COLUMN IF NOT EXISTS is_single_parent_household BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS number_of_siblings INT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parental_education TEXT
  CHECK (parental_education IN (
    'no_qualifications', 'school_qualifications', 'college_qualifications',
    'degree', 'postgraduate', 'unknown'
  ));

ALTER TABLE students ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS disability_details TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_estranged BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_refugee_or_asylum_seeker BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_young_parent BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS receives_free_school_meals BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS receives_ema BOOLEAN DEFAULT false;
ALTER TABLE students ADD COLUMN IF NOT EXISTS local_authority TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS demographic_completed BOOLEAN DEFAULT false;
