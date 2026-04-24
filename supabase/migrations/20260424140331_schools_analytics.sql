-- Schools-5: Analytics + HGIOS4 evidence portfolio
-- Six new tables for attendance, PEF allocation/spend, SIP priorities,
-- inspection evidence, curriculum rationale. All are strictly
-- leadership-scoped (depute / head_teacher / is_school_admin) except
-- where attendance row-level detail is gated by
-- can_view_individual_students. Aggregate attendance queries go through
-- API routes that use the service-role client and enforce filters
-- programmatically.

-- ============================================================================
-- 1. Tables
-- ============================================================================

-- 1a. attendance_records
-- Per-student per-term attendance counts. `attendance_pct` and
-- `is_below_90` are generated columns so the heatmap query does not
-- need to recompute them on every read.
CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  import_id UUID,
  academic_year TEXT NOT NULL,
  term TEXT NOT NULL,
  total_possible INTEGER NOT NULL,
  total_present INTEGER NOT NULL,
  authorised_absence INTEGER NOT NULL DEFAULT 0,
  unauthorised_absence INTEGER NOT NULL DEFAULT 0,
  attendance_pct DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE WHEN total_possible > 0 THEN (total_present::DECIMAL / total_possible * 100) ELSE 0 END
  ) STORED,
  is_below_90 BOOLEAN GENERATED ALWAYS AS (
    CASE WHEN total_possible > 0 THEN (total_present::DECIMAL / total_possible * 100) < 90 ELSE false END
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_attendance_records_school ON attendance_records(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_year ON attendance_records(academic_year);

-- 1b. pef_allocations
CREATE TABLE IF NOT EXISTS pef_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  total_allocation DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_pef_allocations_school ON pef_allocations(school_id);

-- 1c. pef_spend
CREATE TABLE IF NOT EXISTS pef_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id UUID REFERENCES pef_allocations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'staffing', 'resources', 'trips', 'technology', 'training', 'other'
  )),
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  target_student_count INTEGER,
  target_description TEXT,
  measured_impact TEXT,
  linked_intervention_ids JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pef_spend_allocation ON pef_spend(allocation_id);

-- 1d. sip_priorities
CREATE TABLE IF NOT EXISTS sip_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  priority_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_metric TEXT,
  baseline_value DECIMAL(5,1),
  target_value DECIMAL(5,1),
  current_value DECIMAL(5,1),
  inspection_indicator_id UUID REFERENCES inspection_indicators(id),
  status TEXT DEFAULT 'in_progress' CHECK (status IN (
    'not_started', 'in_progress', 'on_track', 'at_risk', 'achieved'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sip_priorities_school ON sip_priorities(school_id);
CREATE INDEX IF NOT EXISTS idx_sip_priorities_year ON sip_priorities(school_id, academic_year);

-- 1e. inspection_evidence
CREATE TABLE IF NOT EXISTS inspection_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  indicator_id UUID REFERENCES inspection_indicators(id),
  evidence_type TEXT NOT NULL CHECK (evidence_type IN (
    'quantitative', 'qualitative', 'observation', 'stakeholder_voice', 'document'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data_snapshot JSONB,
  source TEXT,
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inspection_evidence_school ON inspection_evidence(school_id);
CREATE INDEX IF NOT EXISTS idx_inspection_evidence_indicator ON inspection_evidence(indicator_id);

-- 1f. curriculum_rationale
CREATE TABLE IF NOT EXISTS curriculum_rationale (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
  academic_year TEXT NOT NULL,
  rationale_data JSONB NOT NULL,
  vision_statement TEXT,
  local_context TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ,
  published_url TEXT,
  UNIQUE(school_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_curriculum_rationale_school ON curriculum_rationale(school_id);

-- ============================================================================
-- 2. Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION set_sip_priorities_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sip_priorities_updated_at ON sip_priorities;
CREATE TRIGGER trg_sip_priorities_updated_at
  BEFORE UPDATE ON sip_priorities
  FOR EACH ROW EXECUTE FUNCTION set_sip_priorities_updated_at();

-- ============================================================================
-- 3. RLS
-- ============================================================================

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pef_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pef_spend ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_rationale ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3a. attendance_records
--   Individual rows: staff with can_view_individual_students at the same school.
--   Aggregate reads go through API routes using the admin/service-role client,
--   which bypasses RLS entirely (matching the existing pattern for
--   tracking_entries aggregates).
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff view attendance rows with view-students permission" ON attendance_records;
CREATE POLICY "Staff view attendance rows with view-students permission" ON attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = attendance_records.school_id
        AND (ss.can_view_individual_students = true OR ss.is_school_admin = true
             OR ss.role IN ('depute', 'head_teacher'))
    )
  );

DROP POLICY IF EXISTS "Tracking-management staff import attendance" ON attendance_records;
CREATE POLICY "Tracking-management staff import attendance" ON attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = attendance_records.school_id
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Admin updates attendance" ON attendance_records;
CREATE POLICY "Admin updates attendance" ON attendance_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = attendance_records.school_id
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Admin deletes attendance" ON attendance_records;
CREATE POLICY "Admin deletes attendance" ON attendance_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = attendance_records.school_id
        AND ss.is_school_admin = true
    )
  );

-- ----------------------------------------------------------------------------
-- 3b. pef_allocations: leadership only (depute / head_teacher / is_school_admin)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leadership views PEF allocations" ON pef_allocations;
CREATE POLICY "Leadership views PEF allocations" ON pef_allocations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = pef_allocations.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership writes PEF allocations" ON pef_allocations;
CREATE POLICY "Leadership writes PEF allocations" ON pef_allocations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = pef_allocations.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership updates PEF allocations" ON pef_allocations;
CREATE POLICY "Leadership updates PEF allocations" ON pef_allocations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = pef_allocations.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership deletes PEF allocations" ON pef_allocations;
CREATE POLICY "Leadership deletes PEF allocations" ON pef_allocations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = pef_allocations.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

-- ----------------------------------------------------------------------------
-- 3c. pef_spend: leadership only, via parent allocation's school
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Leadership views PEF spend" ON pef_spend;
CREATE POLICY "Leadership views PEF spend" ON pef_spend
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pef_allocations pa
        JOIN school_staff ss ON ss.school_id = pa.school_id
      WHERE pa.id = pef_spend.allocation_id
        AND ss.user_id = auth.uid()
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership writes PEF spend" ON pef_spend;
CREATE POLICY "Leadership writes PEF spend" ON pef_spend
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pef_allocations pa
        JOIN school_staff ss ON ss.school_id = pa.school_id
      WHERE pa.id = pef_spend.allocation_id
        AND ss.user_id = auth.uid()
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership updates PEF spend" ON pef_spend;
CREATE POLICY "Leadership updates PEF spend" ON pef_spend
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pef_allocations pa
        JOIN school_staff ss ON ss.school_id = pa.school_id
      WHERE pa.id = pef_spend.allocation_id
        AND ss.user_id = auth.uid()
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership deletes PEF spend" ON pef_spend;
CREATE POLICY "Leadership deletes PEF spend" ON pef_spend
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pef_allocations pa
        JOIN school_staff ss ON ss.school_id = pa.school_id
      WHERE pa.id = pef_spend.allocation_id
        AND ss.user_id = auth.uid()
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

-- ----------------------------------------------------------------------------
-- 3d. sip_priorities: all staff read; only leadership writes
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "All staff view SIP priorities" ON sip_priorities;
CREATE POLICY "All staff view SIP priorities" ON sip_priorities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = sip_priorities.school_id
    )
  );

DROP POLICY IF EXISTS "Leadership writes SIP priorities" ON sip_priorities;
CREATE POLICY "Leadership writes SIP priorities" ON sip_priorities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = sip_priorities.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership updates SIP priorities" ON sip_priorities;
CREATE POLICY "Leadership updates SIP priorities" ON sip_priorities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = sip_priorities.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership deletes SIP priorities" ON sip_priorities;
CREATE POLICY "Leadership deletes SIP priorities" ON sip_priorities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = sip_priorities.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

-- ----------------------------------------------------------------------------
-- 3e. inspection_evidence: all staff read + insert; only leadership edits/deletes
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "All staff view inspection evidence" ON inspection_evidence;
CREATE POLICY "All staff view inspection evidence" ON inspection_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = inspection_evidence.school_id
    )
  );

DROP POLICY IF EXISTS "All staff add inspection evidence" ON inspection_evidence;
CREATE POLICY "All staff add inspection evidence" ON inspection_evidence
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = inspection_evidence.school_id
    )
  );

DROP POLICY IF EXISTS "Leadership updates inspection evidence" ON inspection_evidence;
CREATE POLICY "Leadership updates inspection evidence" ON inspection_evidence
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = inspection_evidence.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership deletes inspection evidence" ON inspection_evidence;
CREATE POLICY "Leadership deletes inspection evidence" ON inspection_evidence
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = inspection_evidence.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

-- ----------------------------------------------------------------------------
-- 3f. curriculum_rationale: all staff read; leadership writes
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "All staff view curriculum rationale" ON curriculum_rationale;
CREATE POLICY "All staff view curriculum rationale" ON curriculum_rationale
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = curriculum_rationale.school_id
    )
  );

DROP POLICY IF EXISTS "Leadership writes curriculum rationale" ON curriculum_rationale;
CREATE POLICY "Leadership writes curriculum rationale" ON curriculum_rationale
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = curriculum_rationale.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership updates curriculum rationale" ON curriculum_rationale;
CREATE POLICY "Leadership updates curriculum rationale" ON curriculum_rationale
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = curriculum_rationale.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );

DROP POLICY IF EXISTS "Leadership deletes curriculum rationale" ON curriculum_rationale;
CREATE POLICY "Leadership deletes curriculum rationale" ON curriculum_rationale
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM school_staff ss
      WHERE ss.user_id = auth.uid()
        AND ss.school_id = curriculum_rationale.school_id
        AND (ss.role IN ('depute', 'head_teacher') OR ss.is_school_admin = true)
    )
  );
