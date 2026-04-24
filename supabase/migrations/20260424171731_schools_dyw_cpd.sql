-- Schools-7: DYW (Developing the Young Workforce) + CPD tables
--
-- Three tables ship together because they share the same staff-only RLS model
-- and are all exercised by the /school/dyw and /school/cpd surfaces:
--
--   employer_contacts -- per-school commercial / public-sector partner ledger
--   work_placements   -- placement and group-event rows (student_id nullable
--                        for group events like careers talks / workplace tours)
--   cpd_records       -- per-staff professional learning log; staff see own,
--                        leadership see all for the school
--
-- No BEGIN / COMMIT per project convention; transactions are owned by the
-- applying tool.

-- ---------------------------------------------------------------------------
-- employer_contacts
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS employer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  sector_id UUID REFERENCES career_sectors(id) ON DELETE SET NULL,
  sector_notes TEXT,
  contact_name TEXT,
  contact_role TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  website TEXT,
  relationship_status TEXT NOT NULL DEFAULT 'identified'
    CHECK (relationship_status IN ('identified','contacted','engaged','active_partner','dormant')),
  partnership_types TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  first_contacted_at TIMESTAMPTZ,
  last_contacted_at TIMESTAMPTZ,
  created_by UUID REFERENCES school_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_employer_contacts_school_status
  ON employer_contacts (school_id, relationship_status);
CREATE INDEX IF NOT EXISTS idx_employer_contacts_school_sector
  ON employer_contacts (school_id, sector_id);

ALTER TABLE employer_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff see school employers" ON employer_contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff
      WHERE user_id = auth.uid() AND school_id = employer_contacts.school_id
    )
  );

CREATE POLICY "DYW coordinators + leadership manage employers insert" ON employer_contacts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = employer_contacts.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

CREATE POLICY "DYW coordinators + leadership manage employers update" ON employer_contacts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = employer_contacts.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

CREATE POLICY "DYW coordinators + leadership manage employers delete" ON employer_contacts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = employer_contacts.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

-- ---------------------------------------------------------------------------
-- work_placements
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS work_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer_contacts(id) ON DELETE SET NULL,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  is_group_event BOOLEAN NOT NULL DEFAULT false,
  group_year_groups TEXT[] DEFAULT '{}',
  group_student_count INTEGER,
  title TEXT NOT NULL,
  placement_type TEXT NOT NULL
    CHECK (placement_type IN (
      'work_experience','careers_talk','workplace_tour','mock_interview',
      'mentoring','industry_project','other'
    )),
  start_date DATE,
  end_date DATE,
  hours NUMERIC(6,2),
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned','confirmed','in_progress','completed','cancelled')),
  description TEXT,
  supervisor_name TEXT,
  supervisor_email TEXT,
  supervisor_phone TEXT,
  health_safety_completed BOOLEAN NOT NULL DEFAULT false,
  parental_consent_received BOOLEAN NOT NULL DEFAULT false,
  risk_assessment_url TEXT,
  student_feedback TEXT,
  student_rating INTEGER CHECK (student_rating BETWEEN 1 AND 5),
  employer_feedback TEXT,
  employer_rating INTEGER CHECK (employer_rating BETWEEN 1 AND 5),
  linked_sector_id UUID REFERENCES career_sectors(id) ON DELETE SET NULL,
  created_by UUID REFERENCES school_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Group events must not carry a student_id; individual placements must.
  CONSTRAINT work_placements_group_or_individual CHECK (
    (is_group_event = true AND student_id IS NULL) OR
    (is_group_event = false AND student_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_work_placements_school_status
  ON work_placements (school_id, status);
CREATE INDEX IF NOT EXISTS idx_work_placements_employer
  ON work_placements (employer_id);
CREATE INDEX IF NOT EXISTS idx_work_placements_student
  ON work_placements (student_id);
CREATE INDEX IF NOT EXISTS idx_work_placements_dates
  ON work_placements (school_id, start_date);

ALTER TABLE work_placements ENABLE ROW LEVEL SECURITY;

-- Broad school-level SELECT. Individual-student masking for staff without
-- can_view_individual_students is applied at the API layer (consistent with
-- the notifications + analytics RLS posture).
CREATE POLICY "Staff see school placements" ON work_placements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff
      WHERE user_id = auth.uid() AND school_id = work_placements.school_id
    )
  );

CREATE POLICY "Students see own placements" ON work_placements
  FOR SELECT USING (
    student_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM students WHERE students.id = work_placements.student_id AND students.id = auth.uid()
    )
  );

CREATE POLICY "DYW coordinators + leadership insert placements" ON work_placements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = work_placements.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

CREATE POLICY "DYW coordinators + leadership update placements" ON work_placements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = work_placements.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

CREATE POLICY "DYW coordinators + leadership delete placements" ON work_placements
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = work_placements.school_id
        AND (s.is_school_admin OR s.role IN ('dyw_coordinator','depute','head_teacher'))
    )
  );

-- ---------------------------------------------------------------------------
-- cpd_records
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cpd_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES school_staff(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  provider TEXT,
  cpd_type TEXT NOT NULL
    CHECK (cpd_type IN (
      'course','conference','workshop','self_study','peer_observation',
      'masters','teacher_led_research','collaborative_enquiry','other'
    )),
  date_completed DATE NOT NULL,
  hours NUMERIC(6,2),
  reflection TEXT,
  impact_on_practice TEXT,
  hgios4_indicator_id UUID REFERENCES inspection_indicators(id) ON DELETE SET NULL,
  gtcs_standard TEXT
    CHECK (gtcs_standard IN ('professional_values','professional_knowledge','professional_skills')),
  evidence_url TEXT,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cpd_records_school_staff
  ON cpd_records (school_id, staff_id);
CREATE INDEX IF NOT EXISTS idx_cpd_records_indicator
  ON cpd_records (hgios4_indicator_id);
CREATE INDEX IF NOT EXISTS idx_cpd_records_date
  ON cpd_records (school_id, date_completed);

ALTER TABLE cpd_records ENABLE ROW LEVEL SECURITY;

-- Staff see their own CPD. Leadership see all CPD for the school.
CREATE POLICY "CPD own + leadership select" ON cpd_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = cpd_records.school_id
        AND (
          s.id = cpd_records.staff_id
          OR s.is_school_admin
          OR s.role IN ('depute','head_teacher')
        )
    )
  );

CREATE POLICY "CPD own insert" ON cpd_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = cpd_records.school_id
        AND s.id = cpd_records.staff_id
    )
  );

CREATE POLICY "CPD own update" ON cpd_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = cpd_records.school_id
        AND s.id = cpd_records.staff_id
    )
  );

CREATE POLICY "CPD own or leadership delete" ON cpd_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff s
      WHERE s.user_id = auth.uid()
        AND s.school_id = cpd_records.school_id
        AND (s.id = cpd_records.staff_id OR s.is_school_admin OR s.role IN ('depute','head_teacher'))
    )
  );

-- ---------------------------------------------------------------------------
-- updated_at triggers (shared tiny function per-table pattern)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_dyw_cpd_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_employer_contacts_updated_at ON employer_contacts;
CREATE TRIGGER trg_employer_contacts_updated_at BEFORE UPDATE ON employer_contacts
  FOR EACH ROW EXECUTE FUNCTION set_dyw_cpd_updated_at();

DROP TRIGGER IF EXISTS trg_work_placements_updated_at ON work_placements;
CREATE TRIGGER trg_work_placements_updated_at BEFORE UPDATE ON work_placements
  FOR EACH ROW EXECUTE FUNCTION set_dyw_cpd_updated_at();

DROP TRIGGER IF EXISTS trg_cpd_records_updated_at ON cpd_records;
CREATE TRIGGER trg_cpd_records_updated_at BEFORE UPDATE ON cpd_records
  FOR EACH ROW EXECUTE FUNCTION set_dyw_cpd_updated_at();
