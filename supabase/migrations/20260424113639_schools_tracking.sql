-- Schools-2: grade tracking system.
--
-- Six new tables for cycle-based assessment tracking:
--   tracking_cycles         -- per-school reporting windows (Autumn / Winter / ...)
--   class_assignments       -- teacher ↔ subject ↔ year group ↔ qualification
--   class_students          -- student ↔ class join table
--   comment_banks           -- reusable comment templates (created BEFORE
--                              tracking_entries so the FK can be inline)
--   tracking_entries        -- per-student, per-cycle, per-class teacher grade
--   school_tracking_metrics -- per-school custom metric definitions
--
-- Plus: can_manage_tracking permission boolean on school_staff (the Schools-1
-- permission matrix had can_view_tracking / can_edit_tracking; managing
-- cycles and class assignments is a distinct admin action).
--
-- Idempotent: all CREATE TABLE guarded with IF NOT EXISTS; triggers use
-- DROP IF EXISTS then CREATE; permission column uses ADD COLUMN IF NOT EXISTS.
-- Re-applying this migration against an already-migrated schema is a no-op.

-- =====================================================================
-- school_staff: add can_manage_tracking (not in the Schools-1 permission
-- matrix; covers "create cycles, lock cycles, manage class assignments,
-- manage tracking metrics" -- admin-flavoured actions distinct from the
-- per-teacher can_edit_tracking which means "enter grades for own classes").
-- =====================================================================
ALTER TABLE public.school_staff
  ADD COLUMN IF NOT EXISTS can_manage_tracking BOOLEAN DEFAULT false;

-- Back-fill: everyone who is a school admin gets manage-tracking by default.
UPDATE public.school_staff
SET can_manage_tracking = true
WHERE is_school_admin = true AND can_manage_tracking IS NOT TRUE;

-- Back-fill: depute / head_teacher roles get manage-tracking by default
-- (matches DEFAULT_ROLE_PERMISSIONS in lib/school/constants.ts).
UPDATE public.school_staff
SET can_manage_tracking = true
WHERE role IN ('depute','head_teacher') AND can_manage_tracking IS NOT TRUE;

-- =====================================================================
-- tracking_cycles: per-school reporting windows.
-- Only one row per school can have is_current = true; enforced via trigger
-- because a partial unique index on a nullable boolean would block NULLs.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tracking_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  cycle_number INTEGER NOT NULL,
  starts_at DATE NOT NULL,
  ends_at DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tracking_cycles_school ON public.tracking_cycles(school_id);
CREATE INDEX IF NOT EXISTS idx_tracking_cycles_current ON public.tracking_cycles(school_id, is_current) WHERE is_current = true;

CREATE OR REPLACE FUNCTION public.set_current_tracking_cycle()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE public.tracking_cycles
    SET is_current = false
    WHERE school_id = NEW.school_id AND id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_current_tracking_cycle ON public.tracking_cycles;
CREATE TRIGGER trg_set_current_tracking_cycle
  BEFORE INSERT OR UPDATE ON public.tracking_cycles
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION public.set_current_tracking_cycle();

-- =====================================================================
-- class_assignments: teacher teaching a subject to a year group.
-- One row per teacher × subject × year group × academic year.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.class_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.school_staff(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id),
  year_group TEXT NOT NULL,
  class_code TEXT,
  qualification_type_id UUID REFERENCES public.qualification_types(id),
  academic_year TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_class_assignments_school ON public.class_assignments(school_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_staff ON public.class_assignments(staff_id);
CREATE INDEX IF NOT EXISTS idx_class_assignments_subject ON public.class_assignments(subject_id);

-- =====================================================================
-- class_students: students enrolled in a class.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_assignment_id UUID NOT NULL REFERENCES public.class_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_assignment_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- =====================================================================
-- comment_banks: reusable comment templates per school / department.
-- Created BEFORE tracking_entries so the FK there can be inline.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.comment_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  department TEXT,
  category TEXT NOT NULL CHECK (category IN ('positive','improvement','concern','general')),
  comment_template TEXT NOT NULL,
  created_by UUID REFERENCES public.school_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comment_banks_school ON public.comment_banks(school_id);
CREATE INDEX IF NOT EXISTS idx_comment_banks_dept ON public.comment_banks(school_id, department);

-- =====================================================================
-- tracking_entries: per-student per-cycle per-class grade entry.
-- UNIQUE(cycle_id, class_assignment_id, student_id) makes upsert cheap
-- from the grid auto-save path.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tracking_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.tracking_cycles(id) ON DELETE CASCADE,
  class_assignment_id UUID NOT NULL REFERENCES public.class_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.school_staff(id) ON DELETE SET NULL,
  working_grade TEXT,
  on_track TEXT CHECK (on_track IS NULL OR on_track IN ('above','on_track','below','significantly_below')),
  effort TEXT CHECK (effort IS NULL OR effort IN ('excellent','good','satisfactory','concern')),
  custom_metrics JSONB DEFAULT '{}'::jsonb,
  comment TEXT,
  comment_bank_id UUID REFERENCES public.comment_banks(id) ON DELETE SET NULL,
  is_predicted_grade BOOLEAN DEFAULT true,
  actual_grade TEXT,
  entered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(cycle_id, class_assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_tracking_entries_school ON public.tracking_entries(school_id);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_cycle ON public.tracking_entries(cycle_id);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_class ON public.tracking_entries(class_assignment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_student ON public.tracking_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_tracking_entries_staff ON public.tracking_entries(staff_id);

CREATE OR REPLACE FUNCTION public.set_tracking_entry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tracking_entries_updated ON public.tracking_entries;
CREATE TRIGGER trg_tracking_entries_updated
  BEFORE UPDATE ON public.tracking_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_entry_updated_at();

-- =====================================================================
-- school_tracking_metrics: per-school custom columns on the tracking grid.
-- UNIQUE(school_id, metric_key) supports ON CONFLICT DO NOTHING on defaults.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.school_tracking_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  scale_type TEXT NOT NULL CHECK (scale_type IN ('rating','yes_no','custom')),
  scale_options JSONB,
  colour_coding JSONB,
  applies_to_departments JSONB,
  sort_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(school_id, metric_key)
);

CREATE INDEX IF NOT EXISTS idx_school_tracking_metrics_school ON public.school_tracking_metrics(school_id, sort_order);

-- =====================================================================
-- Parent reports (Task 10): report_templates + parent_reports.
-- Placed in the same migration so Schools-2 is one atomic DDL unit.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_html TEXT NOT NULL,
  school_logo_url TEXT,
  header_colour TEXT DEFAULT '#1B3A5C',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_report_templates_school ON public.report_templates(school_id);

CREATE TABLE IF NOT EXISTS public.parent_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  cycle_id UUID REFERENCES public.tracking_cycles(id) ON DELETE SET NULL,
  report_data JSONB NOT NULL,
  template_id UUID REFERENCES public.report_templates(id) ON DELETE SET NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  emailed_at TIMESTAMPTZ,
  emailed_to TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_reports_school ON public.parent_reports(school_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_student ON public.parent_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_reports_cycle ON public.parent_reports(cycle_id);

-- =====================================================================
-- RLS: enable on every new table; per-verb policies follow.
-- =====================================================================
ALTER TABLE public.tracking_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_tracking_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_reports ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- tracking_cycles policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view cycles at their school" ON public.tracking_cycles;
CREATE POLICY "Staff can view cycles at their school" ON public.tracking_cycles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_cycles.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Tracking managers can insert cycles" ON public.tracking_cycles;
CREATE POLICY "Tracking managers can insert cycles" ON public.tracking_cycles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_cycles.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Tracking managers can update cycles" ON public.tracking_cycles;
CREATE POLICY "Tracking managers can update cycles" ON public.tracking_cycles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_cycles.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Admins can delete cycles" ON public.tracking_cycles;
CREATE POLICY "Admins can delete cycles" ON public.tracking_cycles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_cycles.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- class_assignments policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view classes at their school" ON public.class_assignments;
CREATE POLICY "Staff can view classes at their school" ON public.class_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = class_assignments.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can insert class assignments" ON public.class_assignments;
CREATE POLICY "Managers can insert class assignments" ON public.class_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = class_assignments.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can update class assignments" ON public.class_assignments;
CREATE POLICY "Managers can update class assignments" ON public.class_assignments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = class_assignments.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can delete class assignments" ON public.class_assignments;
CREATE POLICY "Managers can delete class assignments" ON public.class_assignments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = class_assignments.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

-- ---------------------------------------------------------------------
-- class_students policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view class students" ON public.class_students;
CREATE POLICY "Staff can view class students" ON public.class_students
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments ca
      JOIN public.school_staff ss ON ss.school_id = ca.school_id
      WHERE ca.id = class_students.class_assignment_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view their own class links" ON public.class_students;
CREATE POLICY "Students can view their own class links" ON public.class_students
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Managers can add students to classes" ON public.class_students;
CREATE POLICY "Managers can add students to classes" ON public.class_students
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.class_assignments ca
      JOIN public.school_staff ss ON ss.school_id = ca.school_id
      WHERE ca.id = class_students.class_assignment_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can update class student links" ON public.class_students;
CREATE POLICY "Managers can update class student links" ON public.class_students
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments ca
      JOIN public.school_staff ss ON ss.school_id = ca.school_id
      WHERE ca.id = class_students.class_assignment_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can remove students from classes" ON public.class_students;
CREATE POLICY "Managers can remove students from classes" ON public.class_students
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.class_assignments ca
      JOIN public.school_staff ss ON ss.school_id = ca.school_id
      WHERE ca.id = class_students.class_assignment_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

-- ---------------------------------------------------------------------
-- tracking_entries policies.
-- SELECT: the assigned teacher, OR any staff with can_view_individual_students,
--         OR deputes / head teachers.
-- INSERT/UPDATE: only the assigned teacher for that class_assignment AND the
--                cycle must not be locked. Admins can also write (catch-all).
-- DELETE: is_school_admin only.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Teachers and leadership can view tracking" ON public.tracking_entries;
CREATE POLICY "Teachers and leadership can view tracking" ON public.tracking_entries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_entries.school_id
        AND ss.user_id = auth.uid()
        AND (
          ss.is_school_admin = true
          OR ss.can_view_individual_students = true
          OR ss.role IN ('depute','head_teacher')
          OR EXISTS (
            SELECT 1 FROM public.class_assignments ca
            WHERE ca.id = tracking_entries.class_assignment_id
              AND ca.staff_id = ss.id
          )
        )
    )
  );

DROP POLICY IF EXISTS "Teachers insert tracking for own unlocked classes" ON public.tracking_entries;
CREATE POLICY "Teachers insert tracking for own unlocked classes" ON public.tracking_entries
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tracking_cycles tc
      WHERE tc.id = tracking_entries.cycle_id AND tc.is_locked = false
    )
    AND (
      EXISTS (
        SELECT 1 FROM public.class_assignments ca
        JOIN public.school_staff ss ON ss.id = ca.staff_id
        WHERE ca.id = tracking_entries.class_assignment_id
          AND ss.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.school_staff ss
        WHERE ss.school_id = tracking_entries.school_id
          AND ss.user_id = auth.uid()
          AND ss.is_school_admin = true
      )
    )
  );

DROP POLICY IF EXISTS "Teachers update tracking for own unlocked classes" ON public.tracking_entries;
CREATE POLICY "Teachers update tracking for own unlocked classes" ON public.tracking_entries
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tracking_cycles tc
      WHERE tc.id = tracking_entries.cycle_id AND tc.is_locked = false
    )
    AND (
      EXISTS (
        SELECT 1 FROM public.class_assignments ca
        JOIN public.school_staff ss ON ss.id = ca.staff_id
        WHERE ca.id = tracking_entries.class_assignment_id
          AND ss.user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.school_staff ss
        WHERE ss.school_id = tracking_entries.school_id
          AND ss.user_id = auth.uid()
          AND ss.is_school_admin = true
      )
    )
  );

DROP POLICY IF EXISTS "Admins delete tracking entries" ON public.tracking_entries;
CREATE POLICY "Admins delete tracking entries" ON public.tracking_entries
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = tracking_entries.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- comment_banks policies (any staff at the school can manage their own
-- department's comments; cross-department edits are also allowed because
-- teachers share comment banks freely).
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view comment banks" ON public.comment_banks;
CREATE POLICY "Staff can view comment banks" ON public.comment_banks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = comment_banks.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can insert comment banks" ON public.comment_banks;
CREATE POLICY "Staff can insert comment banks" ON public.comment_banks
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = comment_banks.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can update comment banks" ON public.comment_banks;
CREATE POLICY "Staff can update comment banks" ON public.comment_banks
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = comment_banks.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can delete comment banks" ON public.comment_banks;
CREATE POLICY "Staff can delete comment banks" ON public.comment_banks
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = comment_banks.school_id AND ss.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------
-- school_tracking_metrics policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view tracking metrics" ON public.school_tracking_metrics;
CREATE POLICY "Staff can view tracking metrics" ON public.school_tracking_metrics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = school_tracking_metrics.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can insert tracking metrics" ON public.school_tracking_metrics;
CREATE POLICY "Managers can insert tracking metrics" ON public.school_tracking_metrics
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = school_tracking_metrics.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can update tracking metrics" ON public.school_tracking_metrics;
CREATE POLICY "Managers can update tracking metrics" ON public.school_tracking_metrics
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = school_tracking_metrics.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can delete tracking metrics" ON public.school_tracking_metrics;
CREATE POLICY "Managers can delete tracking metrics" ON public.school_tracking_metrics
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = school_tracking_metrics.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

-- ---------------------------------------------------------------------
-- report_templates + parent_reports policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view templates" ON public.report_templates;
CREATE POLICY "Staff can view templates" ON public.report_templates
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = report_templates.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers can write templates" ON public.report_templates;
CREATE POLICY "Managers can write templates" ON public.report_templates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = report_templates.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = report_templates.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Staff can view parent reports" ON public.parent_reports;
CREATE POLICY "Staff can view parent reports" ON public.parent_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_reports.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can insert parent reports" ON public.parent_reports;
CREATE POLICY "Staff can insert parent reports" ON public.parent_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_reports.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can update parent reports" ON public.parent_reports;
CREATE POLICY "Staff can update parent reports" ON public.parent_reports
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_reports.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can view their own parent reports" ON public.parent_reports;
CREATE POLICY "Students can view their own parent reports" ON public.parent_reports
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete parent reports" ON public.parent_reports;
CREATE POLICY "Admins can delete parent reports" ON public.parent_reports
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_reports.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );
