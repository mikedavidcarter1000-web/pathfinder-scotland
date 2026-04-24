-- Schools-8: SEEMIS import, SQA results with value-added, alumni
-- destinations, and primary-to-secondary transition profiles.
--
-- Adds 5 new tables, adjusts class_students with an import_id column so
-- class-list imports can be audited (and optionally rolled back later),
-- and wires RLS policies mirroring Schools-4/5/7 patterns: broad SELECT
-- for school staff where data is not individually sensitive; narrower
-- write paths restricted to admins / tracking managers; guidance-only
-- reads for transition profiles.

-- ------------------------------------------------------------------
-- 1. class_students: audit linkage to an import batch (nullable FK)
-- ------------------------------------------------------------------
ALTER TABLE class_students ADD COLUMN IF NOT EXISTS import_id UUID;
CREATE INDEX IF NOT EXISTS class_students_import_id_idx ON class_students(import_id);

-- ------------------------------------------------------------------
-- 2. seemis_imports
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seemis_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  import_type TEXT NOT NULL CHECK (import_type IN (
    'pupil_data', 'attendance', 'class_lists', 'transition'
  )),
  imported_by UUID REFERENCES school_staff(id),
  file_name TEXT,
  row_count INTEGER,
  matched_count INTEGER,
  created_count INTEGER,
  skipped_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  errors JSONB DEFAULT '[]',
  warnings JSONB DEFAULT '[]',
  notes JSONB DEFAULT '{}',
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS seemis_imports_school_idx ON seemis_imports(school_id);
CREATE INDEX IF NOT EXISTS seemis_imports_type_idx ON seemis_imports(import_type);
CREATE INDEX IF NOT EXISTS seemis_imports_imported_at_idx ON seemis_imports(imported_at DESC);

-- ------------------------------------------------------------------
-- 3. sqa_results_imports + sqa_results
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sqa_results_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  imported_by UUID REFERENCES school_staff(id),
  imported_at TIMESTAMPTZ DEFAULT now(),
  row_count INTEGER,
  matched_count INTEGER,
  unmatched_count INTEGER,
  unmatched_details JSONB DEFAULT '[]',
  file_name TEXT,
  notes JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS sqa_results_imports_school_idx ON sqa_results_imports(school_id);
CREATE INDEX IF NOT EXISTS sqa_results_imports_year_idx ON sqa_results_imports(academic_year);

CREATE TABLE IF NOT EXISTS sqa_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES sqa_results_imports(id) ON DELETE CASCADE,
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  scn TEXT,
  student_name TEXT,
  subject_name TEXT NOT NULL,
  qualification_type TEXT NOT NULL,
  grade TEXT NOT NULL,
  predicted_grade TEXT,
  value_added INTEGER,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sqa_results_school_idx ON sqa_results(school_id);
CREATE INDEX IF NOT EXISTS sqa_results_student_idx ON sqa_results(student_id);
CREATE INDEX IF NOT EXISTS sqa_results_scn_idx ON sqa_results(scn);
CREATE INDEX IF NOT EXISTS sqa_results_year_idx ON sqa_results(academic_year);
CREATE INDEX IF NOT EXISTS sqa_results_import_idx ON sqa_results(import_id);

-- ------------------------------------------------------------------
-- 4. alumni_destinations
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alumni_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  scn TEXT,
  student_name TEXT,
  leaving_year TEXT NOT NULL,
  leaving_stage TEXT NOT NULL,
  destination_type TEXT NOT NULL CHECK (destination_type IN (
    'higher_education', 'further_education', 'modern_apprenticeship',
    'graduate_apprenticeship', 'employment', 'training',
    'voluntary', 'gap_year', 'unemployed_seeking',
    'unemployed_not_seeking', 'unknown'
  )),
  institution_name TEXT,
  course_name TEXT,
  employer_name TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirmed_date DATE,
  data_source TEXT CHECK (data_source IN (
    'sds_followup', 'school_contact', 'student_reported', 'import', 'manual'
  )),
  subject_choices_snapshot JSONB,
  simd_decile INTEGER,
  was_widening_access BOOLEAN DEFAULT false,
  was_care_experienced BOOLEAN DEFAULT false,
  was_fsm BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS alumni_destinations_school_idx ON alumni_destinations(school_id);
CREATE INDEX IF NOT EXISTS alumni_destinations_student_idx ON alumni_destinations(student_id);
CREATE INDEX IF NOT EXISTS alumni_destinations_leaving_year_idx ON alumni_destinations(leaving_year);
CREATE INDEX IF NOT EXISTS alumni_destinations_scn_idx ON alumni_destinations(scn);
CREATE INDEX IF NOT EXISTS alumni_destinations_type_idx ON alumni_destinations(destination_type);

-- ------------------------------------------------------------------
-- 5. transition_profiles
-- ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transition_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  scn TEXT,
  student_name TEXT NOT NULL,
  source_primary TEXT NOT NULL,
  transition_year TEXT NOT NULL,
  reading_level TEXT CHECK (reading_level IN ('early', 'first', 'second', 'third', 'fourth')),
  writing_level TEXT CHECK (writing_level IN ('early', 'first', 'second', 'third', 'fourth')),
  listening_talking_level TEXT CHECK (listening_talking_level IN ('early', 'first', 'second', 'third', 'fourth')),
  numeracy_level TEXT CHECK (numeracy_level IN ('early', 'first', 'second', 'third', 'fourth')),
  wellbeing_concerns JSONB,
  asn_notes TEXT,
  pastoral_notes TEXT,
  snsa_reading_score INTEGER,
  snsa_numeracy_score INTEGER,
  additional_info JSONB,
  import_id UUID REFERENCES seemis_imports(id) ON DELETE SET NULL,
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transition_profiles_school_idx ON transition_profiles(school_id);
CREATE INDEX IF NOT EXISTS transition_profiles_student_idx ON transition_profiles(student_id);
CREATE INDEX IF NOT EXISTS transition_profiles_scn_idx ON transition_profiles(scn);
CREATE INDEX IF NOT EXISTS transition_profiles_primary_idx ON transition_profiles(source_primary);
CREATE INDEX IF NOT EXISTS transition_profiles_year_idx ON transition_profiles(transition_year);

-- ------------------------------------------------------------------
-- 6. Enable RLS
-- ------------------------------------------------------------------
ALTER TABLE seemis_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sqa_results_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sqa_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------
-- 7. seemis_imports RLS
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "seemis_imports_select" ON seemis_imports;
CREATE POLICY "seemis_imports_select" ON seemis_imports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = seemis_imports.school_id
      AND (s.is_school_admin OR s.can_manage_tracking)
  ));

DROP POLICY IF EXISTS "seemis_imports_insert" ON seemis_imports;
CREATE POLICY "seemis_imports_insert" ON seemis_imports
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = seemis_imports.school_id
      AND (s.is_school_admin OR s.can_manage_tracking)
  ));

DROP POLICY IF EXISTS "seemis_imports_update" ON seemis_imports;
CREATE POLICY "seemis_imports_update" ON seemis_imports
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = seemis_imports.school_id AND s.is_school_admin
  ));

DROP POLICY IF EXISTS "seemis_imports_delete" ON seemis_imports;
CREATE POLICY "seemis_imports_delete" ON seemis_imports
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = seemis_imports.school_id AND s.is_school_admin
  ));

-- ------------------------------------------------------------------
-- 8. sqa_results_imports RLS
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "sqa_results_imports_select" ON sqa_results_imports;
CREATE POLICY "sqa_results_imports_select" ON sqa_results_imports
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results_imports.school_id
  ));

DROP POLICY IF EXISTS "sqa_results_imports_insert" ON sqa_results_imports;
CREATE POLICY "sqa_results_imports_insert" ON sqa_results_imports
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = sqa_results_imports.school_id
      AND (s.is_school_admin OR s.can_manage_tracking)
  ));

DROP POLICY IF EXISTS "sqa_results_imports_update" ON sqa_results_imports;
CREATE POLICY "sqa_results_imports_update" ON sqa_results_imports
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results_imports.school_id AND s.is_school_admin
  ));

DROP POLICY IF EXISTS "sqa_results_imports_delete" ON sqa_results_imports;
CREATE POLICY "sqa_results_imports_delete" ON sqa_results_imports
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results_imports.school_id AND s.is_school_admin
  ));

-- ------------------------------------------------------------------
-- 9. sqa_results RLS
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "sqa_results_select" ON sqa_results;
CREATE POLICY "sqa_results_select" ON sqa_results
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results.school_id
  ));

DROP POLICY IF EXISTS "sqa_results_insert" ON sqa_results;
CREATE POLICY "sqa_results_insert" ON sqa_results
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = sqa_results.school_id
      AND (s.is_school_admin OR s.can_manage_tracking)
  ));

DROP POLICY IF EXISTS "sqa_results_update" ON sqa_results;
CREATE POLICY "sqa_results_update" ON sqa_results
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results.school_id AND s.is_school_admin
  ));

DROP POLICY IF EXISTS "sqa_results_delete" ON sqa_results;
CREATE POLICY "sqa_results_delete" ON sqa_results
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = sqa_results.school_id AND s.is_school_admin
  ));

-- ------------------------------------------------------------------
-- 10. alumni_destinations RLS
-- ------------------------------------------------------------------
DROP POLICY IF EXISTS "alumni_destinations_select" ON alumni_destinations;
CREATE POLICY "alumni_destinations_select" ON alumni_destinations
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = alumni_destinations.school_id
  ));

DROP POLICY IF EXISTS "alumni_destinations_insert" ON alumni_destinations;
CREATE POLICY "alumni_destinations_insert" ON alumni_destinations
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = alumni_destinations.school_id
      AND (s.is_school_admin
        OR s.role IN ('guidance_teacher','pt_guidance','dyw_coordinator','depute','head_teacher'))
  ));

DROP POLICY IF EXISTS "alumni_destinations_update" ON alumni_destinations;
CREATE POLICY "alumni_destinations_update" ON alumni_destinations
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = alumni_destinations.school_id
      AND (s.is_school_admin
        OR s.role IN ('guidance_teacher','pt_guidance','dyw_coordinator','depute','head_teacher'))
  ));

DROP POLICY IF EXISTS "alumni_destinations_delete" ON alumni_destinations;
CREATE POLICY "alumni_destinations_delete" ON alumni_destinations
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = alumni_destinations.school_id AND s.is_school_admin
  ));

-- ------------------------------------------------------------------
-- 11. transition_profiles RLS
-- ------------------------------------------------------------------
-- SELECT: guidance staff + leadership + admin. Guidance caseload matching
-- is enforced in the API layer (fetchCaseload) rather than RLS, following
-- Schools-4 convention.
DROP POLICY IF EXISTS "transition_profiles_select" ON transition_profiles;
CREATE POLICY "transition_profiles_select" ON transition_profiles
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = transition_profiles.school_id
      AND (s.is_school_admin
        OR s.role IN ('guidance_teacher','pt_guidance','depute','head_teacher'))
  ));

DROP POLICY IF EXISTS "transition_profiles_insert" ON transition_profiles;
CREATE POLICY "transition_profiles_insert" ON transition_profiles
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = transition_profiles.school_id
      AND (s.is_school_admin OR s.can_manage_tracking)
  ));

DROP POLICY IF EXISTS "transition_profiles_update" ON transition_profiles;
CREATE POLICY "transition_profiles_update" ON transition_profiles
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid()
      AND s.school_id = transition_profiles.school_id
      AND (s.is_school_admin
        OR s.role IN ('guidance_teacher','pt_guidance','depute','head_teacher'))
  ));

DROP POLICY IF EXISTS "transition_profiles_delete" ON transition_profiles;
CREATE POLICY "transition_profiles_delete" ON transition_profiles
  FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM school_staff s
    WHERE s.user_id = auth.uid() AND s.school_id = transition_profiles.school_id AND s.is_school_admin
  ));

-- ------------------------------------------------------------------
-- 12. updated_at trigger for alumni_destinations
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_alumni_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS alumni_destinations_touch_updated_at ON alumni_destinations;
CREATE TRIGGER alumni_destinations_touch_updated_at
  BEFORE UPDATE ON alumni_destinations
  FOR EACH ROW EXECUTE FUNCTION set_alumni_destinations_updated_at();
