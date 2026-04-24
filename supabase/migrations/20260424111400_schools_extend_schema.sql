-- Schools-1: extend existing schools / school_staff / school_student_links /
-- students tables to match the Schools-1 spec (territory FK, subscription
-- tier, stripe customer id, operational settings, staff permission matrix,
-- consent tracking, MIS-oriented student fields).
--
-- Non-destructive: every column uses ADD COLUMN IF NOT EXISTS and every
-- CHECK constraint is DROP + re-ADD so re-running the migration against an
-- already-extended schema is a no-op.
--
-- Columns that the Schools-1 spec lists under students but that already
-- exist under a different name in the Pathfinder codebase:
--   spec `fsm_eligible`      => existing `receives_free_school_meals`
--   spec `young_carer`       => existing `is_young_carer`
--   spec `care_experienced`  => existing `care_experienced` (same name)
-- These are NOT duplicated; the schools dashboard reads the existing
-- canonical columns. Adding a second boolean would create two sources of
-- truth for the same demographic fact.

-- =====================================================================
-- schools: territory FK, subscription tier, stripe customer id, ops settings
-- =====================================================================
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS territory_id UUID REFERENCES public.territories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS roll_count INTEGER,
  ADD COLUMN IF NOT EXISTS tracking_cycles_per_year INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS year_groups_offered TEXT[] DEFAULT ARRAY['S1','S2','S3','S4','S5','S6']::TEXT[],
  ADD COLUMN IF NOT EXISTS subjects_offered TEXT[],
  ADD COLUMN IF NOT EXISTS column_structure JSONB DEFAULT '{}'::jsonb;

-- Back-fill territory_id on existing schools (all are Scottish at this
-- stage -- the pilot has no non-Scottish schools).
UPDATE public.schools
SET territory_id = (SELECT id FROM public.territories WHERE code = 'SCO')
WHERE territory_id IS NULL;

-- Back-fill roll_count from the pre-existing total_roll column where both
-- exist. New rows should use roll_count going forward; total_roll stays
-- as-is for backwards compatibility (the dashboard reads whichever is
-- populated).
UPDATE public.schools
SET roll_count = total_roll
WHERE roll_count IS NULL AND total_roll IS NOT NULL;

ALTER TABLE public.schools DROP CONSTRAINT IF EXISTS schools_subscription_tier_check;
ALTER TABLE public.schools ADD CONSTRAINT schools_subscription_tier_check
  CHECK (subscription_tier IS NULL OR subscription_tier IN ('trial','standard','premium'));

CREATE INDEX IF NOT EXISTS idx_schools_territory ON public.schools(territory_id);

-- =====================================================================
-- school_staff: expand role to 8, add permissions matrix, department,
-- caseload arrays.
-- =====================================================================

-- Role CHECK: add class_teacher + faculty_head (pre-existing: guidance_teacher,
-- pt_guidance, dyw_coordinator, depute, head_teacher, admin).
ALTER TABLE public.school_staff DROP CONSTRAINT IF EXISTS school_staff_role_check;
ALTER TABLE public.school_staff ADD CONSTRAINT school_staff_role_check
  CHECK (role IN (
    'class_teacher',
    'faculty_head',
    'guidance_teacher',
    'pt_guidance',
    'dyw_coordinator',
    'depute',
    'head_teacher',
    'admin'
  ));

-- Permission matrix. `can_view_individual_students` already exists on the
-- table; the remaining five spec-listed permissions are added here.
-- `can_manage_school` is the admin/SMT-only one (school settings, staff
-- management, join-code rotation).
ALTER TABLE public.school_staff
  ADD COLUMN IF NOT EXISTS can_view_tracking BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_edit_tracking BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_guidance_notes BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_edit_guidance_notes BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_analytics BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_manage_school BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS caseload_year_groups TEXT[],
  ADD COLUMN IF NOT EXISTS caseload_house_groups TEXT[];

-- Back-fill permission defaults for existing staff based on role.
-- Head teacher / Depute: everything.
UPDATE public.school_staff
SET can_view_tracking = true,
    can_edit_tracking = true,
    can_view_guidance_notes = true,
    can_edit_guidance_notes = true,
    can_view_analytics = true,
    can_manage_school = true
WHERE role IN ('head_teacher','depute');

-- PT Guidance / Guidance Teacher: see all of their students, edit their
-- guidance notes, see tracking and analytics, but no school-management.
UPDATE public.school_staff
SET can_view_tracking = true,
    can_view_guidance_notes = true,
    can_edit_guidance_notes = true,
    can_view_analytics = true
WHERE role IN ('pt_guidance','guidance_teacher')
  AND can_view_tracking = false;

-- DYW coordinator: tracking visibility + analytics, no guidance notes.
UPDATE public.school_staff
SET can_view_tracking = true,
    can_view_analytics = true
WHERE role = 'dyw_coordinator'
  AND can_view_tracking = false;

-- School admin: manage school + analytics, no guidance notes by default.
UPDATE public.school_staff
SET can_view_tracking = true,
    can_view_analytics = true,
    can_manage_school = true
WHERE role = 'admin'
  AND can_manage_school = false;

-- =====================================================================
-- school_student_links: consent tracking
-- =====================================================================
ALTER TABLE public.school_student_links
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS consent_text TEXT;

-- Existing rows (all test rows today) were linked under the implicit
-- consent flow; treat them as consented.
UPDATE public.school_student_links
SET consent_given = true
WHERE consent_given IS NULL;

-- =====================================================================
-- students: MIS-oriented fields
-- (Spec columns `fsm_eligible`, `young_carer`, `care_experienced` are not
--  added -- the equivalent canonical columns already exist:
--   receives_free_school_meals, is_young_carer, care_experienced.)
-- =====================================================================
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS scn TEXT,
  ADD COLUMN IF NOT EXISTS registration_class TEXT,
  ADD COLUMN IF NOT EXISTS house_group TEXT,
  ADD COLUMN IF NOT EXISTS eal BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_asn BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS attendance_pct DECIMAL(5,2);

-- Scottish Candidate Number is unique per pupil. Partial index so NULLs
-- are still allowed (most pilot students will not have their SCN loaded
-- until a SEEMIS import happens).
CREATE UNIQUE INDEX IF NOT EXISTS idx_students_scn_unique
  ON public.students (scn)
  WHERE scn IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_registration_class
  ON public.students (school_id, registration_class)
  WHERE registration_class IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_students_house_group
  ON public.students (school_id, house_group)
  WHERE house_group IS NOT NULL;

COMMENT ON COLUMN public.schools.territory_id IS
  'FK to territories. Drives qualification framework, inspection framework, wellbeing framework, career framework, funding body for this school.';
COMMENT ON COLUMN public.schools.roll_count IS
  'Canonical total student roll. Synonymous with total_roll (the older column kept for backward compatibility).';
COMMENT ON COLUMN public.schools.column_structure IS
  'Per-school overrides for tracking-column display (e.g. custom predicted-grade columns). JSONB rather than a separate table because the shape is per-school and rarely queried.';
COMMENT ON COLUMN public.school_staff.can_manage_school IS
  'Administer school profile, staff, join codes, subscription. Defaults to head_teacher / depute / admin.';
COMMENT ON COLUMN public.school_student_links.consent_given IS
  'Explicit consent from the student to link this account to the school. Required before any school-facing visibility.';
COMMENT ON COLUMN public.students.scn IS
  'Scottish Candidate Number. Unique per pupil (partial unique index where NOT NULL).';
COMMENT ON COLUMN public.students.attendance_pct IS
  'Most recent attendance percentage (0-100) -- populated from SEEMIS import, not student-editable.';
