-- Schools-4: Guidance hub
-- Adds two new permission columns to school_staff, six guidance tables,
-- a caseload-filter helper function, and RLS policies for all six tables.
--
-- Safeguarding tables are append-only (no UPDATE/DELETE policies). Access
-- logging is implemented in the API layer because PostgreSQL triggers do
-- not fire on SELECT.

-- ============================================================================
-- 1. New permission columns on school_staff
-- ============================================================================

ALTER TABLE school_staff
  ADD COLUMN IF NOT EXISTS can_view_safeguarding BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_view_sensitive_flags BOOLEAN DEFAULT false;

-- Backfill: PT Guidance, Depute, Head Teacher, and School Admin see safeguarding
-- and sensitive flags by default. Guidance teachers see sensitive flags (not
-- safeguarding unless explicitly granted by leadership).
UPDATE school_staff SET can_view_safeguarding = true
  WHERE role IN ('pt_guidance', 'depute', 'head_teacher')
  AND can_view_safeguarding = false;

UPDATE school_staff SET can_view_sensitive_flags = true
  WHERE role IN ('guidance_teacher', 'pt_guidance', 'depute', 'head_teacher')
  AND can_view_sensitive_flags = false;

UPDATE school_staff SET can_view_safeguarding = true, can_view_sensitive_flags = true
  WHERE is_school_admin = true
  AND (can_view_safeguarding = false OR can_view_sensitive_flags = false);

-- ============================================================================
-- 2. Tables
-- ============================================================================

-- 2a. interventions
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES school_staff(id),

  intervention_type TEXT NOT NULL CHECK (intervention_type IN (
    'guidance_meeting', 'parent_contact', 'mentoring', 'study_support',
    'behaviour_support', 'attendance_followup', 'wellbeing_check',
    'careers_guidance', 'subject_change', 'referral_external',
    'pef_intervention', 'other'
  )),

  title TEXT NOT NULL,
  notes TEXT,
  action_items JSONB DEFAULT '[]'::jsonb,
  outcome TEXT,

  related_subject_id UUID REFERENCES subjects(id),
  related_course_id UUID REFERENCES courses(id),
  pef_funded BOOLEAN DEFAULT false,
  pef_cost DECIMAL(10,2),

  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  follow_up_date DATE,

  is_confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interventions_student ON interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_staff ON interventions(staff_id);
CREATE INDEX IF NOT EXISTS idx_interventions_school ON interventions(school_id);
CREATE INDEX IF NOT EXISTS idx_interventions_follow_up ON interventions(follow_up_date) WHERE follow_up_date IS NOT NULL AND completed_at IS NULL;

-- 2b. safeguarding_concerns (append-only)
CREATE TABLE IF NOT EXISTS safeguarding_concerns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES school_staff(id) NOT NULL,

  concern_type TEXT NOT NULL CHECK (concern_type IN (
    'disclosure', 'observed_behaviour', 'third_party_report',
    'online_safety', 'self_harm_risk', 'domestic', 'neglect',
    'bullying', 'substance_misuse', 'other'
  )),

  description TEXT NOT NULL,
  immediate_actions_taken TEXT,

  escalation_level TEXT DEFAULT 'concern' CHECK (escalation_level IN (
    'concern', 'escalated_pt', 'escalated_dht', 'escalated_named_person',
    'referral_social_work', 'referral_police'
  )),
  escalated_to UUID REFERENCES school_staff(id),
  escalated_at TIMESTAMPTZ,

  outcome TEXT,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  supersedes_id UUID REFERENCES safeguarding_concerns(id)
);

CREATE INDEX IF NOT EXISTS idx_safeguarding_student ON safeguarding_concerns(student_id);
CREATE INDEX IF NOT EXISTS idx_safeguarding_school ON safeguarding_concerns(school_id);
CREATE INDEX IF NOT EXISTS idx_safeguarding_reported_by ON safeguarding_concerns(reported_by);

-- 2c. safeguarding_access_log (immutable audit)
CREATE TABLE IF NOT EXISTS safeguarding_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concern_id UUID REFERENCES safeguarding_concerns(id) ON DELETE CASCADE,
  accessed_by UUID REFERENCES school_staff(id),
  action TEXT NOT NULL CHECK (action IN ('viewed', 'created', 'escalated', 'exported')),
  accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safeguarding_access_log_concern ON safeguarding_access_log(concern_id);
CREATE INDEX IF NOT EXISTS idx_safeguarding_access_log_staff ON safeguarding_access_log(accessed_by);

-- 2d. wellbeing_surveys
CREATE TABLE IF NOT EXISTS wellbeing_surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_year_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  is_anonymous BOOLEAN DEFAULT false,
  created_by UUID REFERENCES school_staff(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_surveys_school ON wellbeing_surveys(school_id);

-- 2e. wellbeing_responses
CREATE TABLE IF NOT EXISTS wellbeing_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES wellbeing_surveys(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,

  safe_score INTEGER CHECK (safe_score BETWEEN 1 AND 5),
  healthy_score INTEGER CHECK (healthy_score BETWEEN 1 AND 5),
  achieving_score INTEGER CHECK (achieving_score BETWEEN 1 AND 5),
  nurtured_score INTEGER CHECK (nurtured_score BETWEEN 1 AND 5),
  active_score INTEGER CHECK (active_score BETWEEN 1 AND 5),
  respected_score INTEGER CHECK (respected_score BETWEEN 1 AND 5),
  responsible_score INTEGER CHECK (responsible_score BETWEEN 1 AND 5),
  included_score INTEGER CHECK (included_score BETWEEN 1 AND 5),

  free_text TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_responses_survey ON wellbeing_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_responses_student ON wellbeing_responses(student_id) WHERE student_id IS NOT NULL;

-- One response per student per survey (enforced only for named surveys; for
-- anonymous surveys student_id is set NULL before INSERT).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wellbeing_responses_student_survey_unique') THEN
    ALTER TABLE wellbeing_responses ADD CONSTRAINT wellbeing_responses_student_survey_unique
      UNIQUE (survey_id, student_id);
  END IF;
END $$;

-- 2f. asn_provisions
CREATE TABLE IF NOT EXISTS asn_provisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,

  provision_type TEXT NOT NULL CHECK (provision_type IN (
    'iep', 'csp', 'exam_access', 'reader', 'scribe',
    'extra_time', 'separate_room', 'assistive_tech',
    'modified_curriculum', 'support_worker', 'other'
  )),

  description TEXT,
  review_date DATE,
  responsible_staff_id UUID REFERENCES school_staff(id),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asn_provisions_student ON asn_provisions(student_id);
CREATE INDEX IF NOT EXISTS idx_asn_provisions_review ON asn_provisions(review_date) WHERE is_active = true;

-- ============================================================================
-- 3. updated_at triggers (reuse pattern from tracking tables)
-- ============================================================================

CREATE OR REPLACE FUNCTION set_guidance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interventions_updated_at ON interventions;
CREATE TRIGGER trg_interventions_updated_at
  BEFORE UPDATE ON interventions
  FOR EACH ROW EXECUTE FUNCTION set_guidance_updated_at();

DROP TRIGGER IF EXISTS trg_asn_provisions_updated_at ON asn_provisions;
CREATE TRIGGER trg_asn_provisions_updated_at
  BEFORE UPDATE ON asn_provisions
  FOR EACH ROW EXECUTE FUNCTION set_guidance_updated_at();

-- ============================================================================
-- 4. is_in_staff_caseload helper
-- ============================================================================
-- Shared caseload filter for RLS policies. Returns true if the staff's
-- caseload filters (year_groups + house_groups ARRAYs) include the student.
-- NULL filter = see-all-at-school (for leadership, pt_guidance, etc).
--
-- NB school_staff.caseload_year_groups and caseload_house_groups are TEXT[]
-- in live schema (not JSONB) so we use `= ANY(...)` rather than
-- jsonb_array_elements_text(). students.school_stage is a USER-DEFINED enum;
-- cast to TEXT for the comparison.

CREATE OR REPLACE FUNCTION is_in_staff_caseload(p_student_id UUID, p_staff_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_staff school_staff%ROWTYPE;
  v_student students%ROWTYPE;
BEGIN
  SELECT * INTO v_staff FROM public.school_staff WHERE user_id = p_staff_user_id LIMIT 1;
  IF NOT FOUND THEN RETURN false; END IF;

  -- Leadership / admin see everyone.
  IF v_staff.role IN ('depute', 'head_teacher') OR v_staff.is_school_admin THEN
    RETURN true;
  END IF;

  -- Individual-student view gate.
  IF NOT COALESCE(v_staff.can_view_individual_students, false) THEN
    RETURN false;
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id = p_student_id LIMIT 1;
  IF NOT FOUND THEN RETURN false; END IF;

  -- School match.
  IF v_student.school_id IS DISTINCT FROM v_staff.school_id THEN RETURN false; END IF;

  -- If no caseload filter, see all at school.
  IF (v_staff.caseload_year_groups IS NULL OR array_length(v_staff.caseload_year_groups, 1) IS NULL)
     AND (v_staff.caseload_house_groups IS NULL OR array_length(v_staff.caseload_house_groups, 1) IS NULL) THEN
    RETURN true;
  END IF;

  -- Year group filter (school_stage enum cast to text).
  IF v_staff.caseload_year_groups IS NOT NULL AND array_length(v_staff.caseload_year_groups, 1) > 0 THEN
    IF v_student.school_stage IS NULL OR NOT (v_student.school_stage::text = ANY(v_staff.caseload_year_groups)) THEN
      RETURN false;
    END IF;
  END IF;

  -- House group filter.
  IF v_staff.caseload_house_groups IS NOT NULL AND array_length(v_staff.caseload_house_groups, 1) > 0 THEN
    IF v_student.house_group IS NULL OR NOT (v_student.house_group = ANY(v_staff.caseload_house_groups)) THEN
      RETURN false;
    END IF;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 5. RLS
-- ============================================================================

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_concerns ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE asn_provisions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 5a. interventions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff view interventions in caseload" ON interventions;
CREATE POLICY "Staff view interventions in caseload" ON interventions
  FOR SELECT USING (
    (
      -- Confidential rows only to creator or can_view_sensitive_flags.
      (is_confidential = false AND is_in_staff_caseload(student_id, auth.uid()))
      OR
      EXISTS (
        SELECT 1 FROM school_staff ss
        WHERE ss.user_id = auth.uid()
          AND ss.id = interventions.staff_id
      )
      OR
      EXISTS (
        SELECT 1 FROM school_staff ss
        WHERE ss.user_id = auth.uid()
          AND ss.school_id = interventions.school_id
          AND (ss.can_view_sensitive_flags = true OR ss.is_school_admin = true
               OR ss.role IN ('depute', 'head_teacher'))
      )
    )
  );

DROP POLICY IF EXISTS "Guidance staff insert interventions" ON interventions;
CREATE POLICY "Guidance staff insert interventions" ON interventions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = interventions.school_id
        AND (
          ss.role IN ('guidance_teacher', 'pt_guidance', 'depute', 'head_teacher')
          OR ss.is_school_admin = true
        )
    )
  );

DROP POLICY IF EXISTS "Creator or senior updates interventions" ON interventions;
CREATE POLICY "Creator or senior updates interventions" ON interventions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND (
          ss.id = interventions.staff_id
          OR ss.can_view_sensitive_flags = true
          OR ss.is_school_admin = true
        )
    )
  );

DROP POLICY IF EXISTS "Admin deletes interventions" ON interventions;
CREATE POLICY "Admin deletes interventions" ON interventions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = interventions.school_id
        AND ss.is_school_admin = true
    )
  );

-- ----------------------------------------------------------------------------
-- 5b. safeguarding_concerns (append-only)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Safeguarding-permitted staff view" ON safeguarding_concerns;
CREATE POLICY "Safeguarding-permitted staff view" ON safeguarding_concerns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = safeguarding_concerns.school_id
        AND ss.can_view_safeguarding = true
    )
  );

DROP POLICY IF EXISTS "Safeguarding-permitted staff insert" ON safeguarding_concerns;
CREATE POLICY "Safeguarding-permitted staff insert" ON safeguarding_concerns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = safeguarding_concerns.school_id
        AND ss.can_view_safeguarding = true
    )
  );
-- NB: no UPDATE / DELETE policies -- safeguarding rows are append-only.
-- Corrections create a new row with supersedes_id pointing at the superseded one.

-- ----------------------------------------------------------------------------
-- 5c. safeguarding_access_log
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Safeguarding-permitted staff view log" ON safeguarding_access_log;
CREATE POLICY "Safeguarding-permitted staff view log" ON safeguarding_access_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.can_view_safeguarding = true
    )
  );
-- INSERT, UPDATE, DELETE denied -- only service-role API writes access rows.

-- ----------------------------------------------------------------------------
-- 5d. wellbeing_surveys
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "School members view surveys" ON wellbeing_surveys;
CREATE POLICY "School members view surveys" ON wellbeing_surveys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid() AND ss.school_id = wellbeing_surveys.school_id
    )
    OR
    EXISTS (
      SELECT 1 FROM students st
      WHERE st.id = auth.uid() AND st.school_id = wellbeing_surveys.school_id
    )
  );

DROP POLICY IF EXISTS "Tracking managers create surveys" ON wellbeing_surveys;
CREATE POLICY "Tracking managers create surveys" ON wellbeing_surveys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = wellbeing_surveys.school_id
        AND (ss.can_manage_tracking = true OR ss.is_school_admin = true
             OR ss.role IN ('guidance_teacher', 'pt_guidance', 'depute', 'head_teacher'))
    )
  );

DROP POLICY IF EXISTS "Tracking managers update surveys" ON wellbeing_surveys;
CREATE POLICY "Tracking managers update surveys" ON wellbeing_surveys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = wellbeing_surveys.school_id
        AND (ss.can_manage_tracking = true OR ss.is_school_admin = true
             OR ss.role IN ('pt_guidance', 'depute', 'head_teacher'))
    )
  );

DROP POLICY IF EXISTS "Tracking managers delete surveys" ON wellbeing_surveys;
CREATE POLICY "Tracking managers delete surveys" ON wellbeing_surveys
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = wellbeing_surveys.school_id
        AND ss.is_school_admin = true
    )
  );

-- ----------------------------------------------------------------------------
-- 5e. wellbeing_responses
-- ----------------------------------------------------------------------------
-- For named (non-anonymous) surveys: guidance staff + leadership see responses.
-- For anonymous surveys: no direct row SELECT is permitted; aggregate access
-- goes via service-role API that joins + aggregates in application code.
DROP POLICY IF EXISTS "Guidance staff view named responses" ON wellbeing_responses;
CREATE POLICY "Guidance staff view named responses" ON wellbeing_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wellbeing_surveys ws
      JOIN school_staff ss ON ss.school_id = ws.school_id
      WHERE ws.id = wellbeing_responses.survey_id
        AND ss.user_id = auth.uid()
        AND ss.can_view_individual_students = true
        AND ws.is_anonymous = false
    )
  );

DROP POLICY IF EXISTS "Students submit own response" ON wellbeing_responses;
CREATE POLICY "Students submit own response" ON wellbeing_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM wellbeing_surveys ws
      JOIN students st ON st.school_id = ws.school_id
      WHERE ws.id = wellbeing_responses.survey_id
        AND st.id = auth.uid()
        AND (ws.opens_at IS NULL OR now() >= ws.opens_at)
        AND (ws.closes_at IS NULL OR now() <= ws.closes_at)
    )
  );
-- NB: no UPDATE or DELETE policy -- responses are immutable once submitted.

-- ----------------------------------------------------------------------------
-- 5f. asn_provisions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Guidance staff view ASN in caseload" ON asn_provisions;
CREATE POLICY "Guidance staff view ASN in caseload" ON asn_provisions
  FOR SELECT USING (
    is_in_staff_caseload(student_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = asn_provisions.school_id
        AND (ss.can_view_sensitive_flags = true OR ss.id = asn_provisions.responsible_staff_id)
    )
  );

DROP POLICY IF EXISTS "Guidance staff insert ASN" ON asn_provisions;
CREATE POLICY "Guidance staff insert ASN" ON asn_provisions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = asn_provisions.school_id
        AND (
          ss.role IN ('guidance_teacher', 'pt_guidance', 'depute', 'head_teacher')
          OR ss.is_school_admin = true
        )
    )
  );

DROP POLICY IF EXISTS "Guidance staff update ASN" ON asn_provisions;
CREATE POLICY "Guidance staff update ASN" ON asn_provisions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = asn_provisions.school_id
        AND (
          ss.role IN ('guidance_teacher', 'pt_guidance', 'depute', 'head_teacher')
          OR ss.is_school_admin = true
        )
    )
  );

DROP POLICY IF EXISTS "Admin deletes ASN" ON asn_provisions;
CREATE POLICY "Admin deletes ASN" ON asn_provisions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = asn_provisions.school_id
        AND ss.is_school_admin = true
    )
  );
