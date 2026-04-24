-- Schools-3: subject choice collection.
--
-- Five new tables for column-based subject choices:
--   choice_rounds                  -- per-school choice windows (e.g. "S4 2026/27")
--   choice_round_columns           -- columns within a round (e.g. "Column 1: English")
--   choice_round_column_subjects   -- subjects offered in each column, with capacity
--   student_choices                -- student submission for a round (draft/submitted/...)
--   student_choice_items           -- individual picks within a submission (one per column)
--
-- Plus: trigger to recalc current_demand on column_subjects when student_choice_items
-- change; trigger to stamp updated_at on student_choices.
--
-- Idempotent: all CREATE TABLE guarded with IF NOT EXISTS; triggers use
-- DROP IF EXISTS then CREATE. Re-applying is a no-op.

-- =====================================================================
-- choice_rounds: per-school windows for collecting choices.
-- Status machine: draft -> open -> closed -> finalised.
--  * draft: school building column structure; students cannot see it.
--  * open: students can submit.
--  * closed: no further submissions but demand analytics still relevant.
--  * finalised: results locked; used for next-year rollover.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.choice_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  year_group TEXT NOT NULL,
  transition TEXT CHECK (transition IS NULL OR transition IN ('s2_to_s3','s3_to_s4','s4_to_s5','s5_to_s6')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','closed','finalised')),
  opens_at TIMESTAMPTZ,
  closes_at TIMESTAMPTZ,
  requires_parent_approval BOOLEAN DEFAULT false,
  instructions TEXT,
  created_by UUID REFERENCES public.school_staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_choice_rounds_school ON public.choice_rounds(school_id);
CREATE INDEX IF NOT EXISTS idx_choice_rounds_school_year ON public.choice_rounds(school_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_choice_rounds_status ON public.choice_rounds(school_id, status);

DROP TRIGGER IF EXISTS trg_choice_rounds_updated ON public.choice_rounds;
CREATE TRIGGER trg_choice_rounds_updated
  BEFORE UPDATE ON public.choice_rounds
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_entry_updated_at();

-- =====================================================================
-- choice_round_columns: a column within a round. Students pick ONE
-- subject per column in most cases. Compulsory columns pre-select the
-- single subject offered (typically core English / Maths).
-- allow_multiple=true supports "options cap" columns (pick 2 of 5).
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.choice_round_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.choice_rounds(id) ON DELETE CASCADE,
  column_position INTEGER NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  is_compulsory BOOLEAN DEFAULT false,
  allow_multiple BOOLEAN DEFAULT false,
  max_selections INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(round_id, column_position),
  CHECK (max_selections >= 1)
);

CREATE INDEX IF NOT EXISTS idx_choice_round_columns_round ON public.choice_round_columns(round_id, column_position);

-- =====================================================================
-- choice_round_column_subjects: subjects available in each column.
-- current_demand is denormalised for fast heatmap rendering; kept in
-- sync by triggers on student_choice_items.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.choice_round_column_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  column_id UUID NOT NULL REFERENCES public.choice_round_columns(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  qualification_type_id UUID REFERENCES public.qualification_types(id),
  capacity INTEGER,
  current_demand INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(column_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_column_subjects_column ON public.choice_round_column_subjects(column_id);
CREATE INDEX IF NOT EXISTS idx_column_subjects_subject ON public.choice_round_column_subjects(subject_id);

-- =====================================================================
-- student_choices: one row per student per round. Status transitions:
--   draft -> submitted -> parent_pending -> confirmed  (when approval required)
--   draft -> submitted -> confirmed                    (no approval required)
--   any -> rejected (parent) / cancelled (admin override)
-- Parent approval workflow populates parent_approved_at / parent_rejected_at
-- and parent_comment. parent_token is used when the parent approves via
-- an email link without being signed in (future enhancement; the column
-- is provisioned now to avoid a later ALTER).
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.student_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID NOT NULL REFERENCES public.choice_rounds(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','parent_pending','confirmed','rejected','cancelled')),
  submitted_at TIMESTAMPTZ,
  parent_approval_required BOOLEAN DEFAULT false,
  parent_approved_at TIMESTAMPTZ,
  parent_rejected_at TIMESTAMPTZ,
  parent_comment TEXT,
  parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
  parent_token TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(round_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_student_choices_round ON public.student_choices(round_id);
CREATE INDEX IF NOT EXISTS idx_student_choices_student ON public.student_choices(student_id);
CREATE INDEX IF NOT EXISTS idx_student_choices_school ON public.student_choices(school_id, status);
CREATE INDEX IF NOT EXISTS idx_student_choices_parent_pending ON public.student_choices(parent_id, status)
  WHERE status = 'parent_pending';

DROP TRIGGER IF EXISTS trg_student_choices_updated ON public.student_choices;
CREATE TRIGGER trg_student_choices_updated
  BEFORE UPDATE ON public.student_choices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_tracking_entry_updated_at();

-- =====================================================================
-- student_choice_items: individual picks within a submission.
-- One row per student x column selection. For multi-select columns
-- (allow_multiple=true), multiple rows exist for the same (choice, column).
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.student_choice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_choice_id UUID NOT NULL REFERENCES public.student_choices(id) ON DELETE CASCADE,
  column_id UUID NOT NULL REFERENCES public.choice_round_columns(id) ON DELETE CASCADE,
  column_subject_id UUID NOT NULL REFERENCES public.choice_round_column_subjects(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  is_reserve BOOLEAN DEFAULT false,
  reserve_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_choice_items_choice ON public.student_choice_items(student_choice_id);
CREATE INDEX IF NOT EXISTS idx_choice_items_column ON public.student_choice_items(column_id);
CREATE INDEX IF NOT EXISTS idx_choice_items_subject ON public.student_choice_items(subject_id);
CREATE INDEX IF NOT EXISTS idx_choice_items_column_subject ON public.student_choice_items(column_subject_id);

-- =====================================================================
-- Demand recalculation trigger. Keeps choice_round_column_subjects.current_demand
-- in sync with the count of student_choice_items pointing at it, scoped to
-- choices whose status indicates the student has committed (submitted,
-- parent_pending, confirmed). Drafts do NOT count towards demand -- the
-- heatmap reflects commitments, not browsing.
-- =====================================================================
CREATE OR REPLACE FUNCTION public.recalc_choice_demand()
RETURNS TRIGGER AS $$
DECLARE
  target_ids UUID[];
BEGIN
  -- Collect the affected column_subject ids from OLD and NEW rows.
  IF TG_OP = 'INSERT' THEN
    target_ids := ARRAY[NEW.column_subject_id];
  ELSIF TG_OP = 'UPDATE' THEN
    target_ids := ARRAY[NEW.column_subject_id, OLD.column_subject_id];
  ELSE
    target_ids := ARRAY[OLD.column_subject_id];
  END IF;

  UPDATE public.choice_round_column_subjects crcs
  SET current_demand = (
    SELECT COUNT(*)
    FROM public.student_choice_items sci
    JOIN public.student_choices sc ON sc.id = sci.student_choice_id
    WHERE sci.column_subject_id = crcs.id
      AND sc.status IN ('submitted','parent_pending','confirmed')
      AND sci.is_reserve = false
  )
  WHERE crcs.id = ANY(target_ids);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_choice_items_demand_ins ON public.student_choice_items;
CREATE TRIGGER trg_choice_items_demand_ins
  AFTER INSERT ON public.student_choice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_choice_demand();

DROP TRIGGER IF EXISTS trg_choice_items_demand_upd ON public.student_choice_items;
CREATE TRIGGER trg_choice_items_demand_upd
  AFTER UPDATE ON public.student_choice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_choice_demand();

DROP TRIGGER IF EXISTS trg_choice_items_demand_del ON public.student_choice_items;
CREATE TRIGGER trg_choice_items_demand_del
  AFTER DELETE ON public.student_choice_items
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_choice_demand();

-- A matching trigger on student_choices.status changes: when a draft
-- flips to submitted (or back), demand recounts for every item in that
-- submission.
CREATE OR REPLACE FUNCTION public.recalc_choice_demand_on_status()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    UPDATE public.choice_round_column_subjects crcs
    SET current_demand = (
      SELECT COUNT(*)
      FROM public.student_choice_items sci
      JOIN public.student_choices sc ON sc.id = sci.student_choice_id
      WHERE sci.column_subject_id = crcs.id
        AND sc.status IN ('submitted','parent_pending','confirmed')
        AND sci.is_reserve = false
    )
    WHERE crcs.id IN (
      SELECT column_subject_id FROM public.student_choice_items WHERE student_choice_id = NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_choices_demand_status ON public.student_choices;
CREATE TRIGGER trg_student_choices_demand_status
  AFTER UPDATE OF status ON public.student_choices
  FOR EACH ROW
  EXECUTE FUNCTION public.recalc_choice_demand_on_status();

-- =====================================================================
-- RLS: enable on all five new tables.
-- =====================================================================
ALTER TABLE public.choice_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choice_round_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choice_round_column_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_choice_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- choice_rounds policies
--  - any staff at the school can read all rounds
--  - students linked to the school can read non-draft rounds
--  - manage-tracking staff / admins can insert / update / delete
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view rounds" ON public.choice_rounds;
CREATE POLICY "Staff can view rounds" ON public.choice_rounds
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = choice_rounds.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Linked students can view open rounds" ON public.choice_rounds;
CREATE POLICY "Linked students can view open rounds" ON public.choice_rounds
  FOR SELECT TO authenticated
  USING (
    status IN ('open','closed','finalised')
    AND EXISTS (
      SELECT 1 FROM public.school_student_links ssl
      WHERE ssl.school_id = choice_rounds.school_id
        AND ssl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can view rounds for linked students" ON public.choice_rounds;
CREATE POLICY "Parents can view rounds for linked students" ON public.choice_rounds
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.parents p ON p.id = psl.parent_id
      JOIN public.school_student_links ssl ON ssl.student_id = psl.student_id
      WHERE p.user_id = auth.uid()
        AND ssl.school_id = choice_rounds.school_id
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can insert rounds" ON public.choice_rounds;
CREATE POLICY "Managers can insert rounds" ON public.choice_rounds
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = choice_rounds.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Managers can update rounds" ON public.choice_rounds;
CREATE POLICY "Managers can update rounds" ON public.choice_rounds
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = choice_rounds.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Admins can delete rounds" ON public.choice_rounds;
CREATE POLICY "Admins can delete rounds" ON public.choice_rounds
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = choice_rounds.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- choice_round_columns policies (same shape as rounds, joined via round_id)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view columns" ON public.choice_round_columns;
CREATE POLICY "Staff can view columns" ON public.choice_round_columns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE cr.id = choice_round_columns.round_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Linked students can view columns for open rounds" ON public.choice_round_columns;
CREATE POLICY "Linked students can view columns for open rounds" ON public.choice_round_columns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_student_links ssl ON ssl.school_id = cr.school_id
      WHERE cr.id = choice_round_columns.round_id
        AND cr.status IN ('open','closed','finalised')
        AND ssl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can view columns for linked students" ON public.choice_round_columns;
CREATE POLICY "Parents can view columns for linked students" ON public.choice_round_columns
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_student_links ssl ON ssl.school_id = cr.school_id
      JOIN public.parent_student_links psl ON psl.student_id = ssl.student_id
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE cr.id = choice_round_columns.round_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can write columns" ON public.choice_round_columns;
CREATE POLICY "Managers can write columns" ON public.choice_round_columns
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE cr.id = choice_round_columns.round_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE cr.id = choice_round_columns.round_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

-- ---------------------------------------------------------------------
-- choice_round_column_subjects policies
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view column subjects" ON public.choice_round_column_subjects;
CREATE POLICY "Staff can view column subjects" ON public.choice_round_column_subjects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_round_columns crc
      JOIN public.choice_rounds cr ON cr.id = crc.round_id
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE crc.id = choice_round_column_subjects.column_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Linked students can view column subjects" ON public.choice_round_column_subjects;
CREATE POLICY "Linked students can view column subjects" ON public.choice_round_column_subjects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_round_columns crc
      JOIN public.choice_rounds cr ON cr.id = crc.round_id
      JOIN public.school_student_links ssl ON ssl.school_id = cr.school_id
      WHERE crc.id = choice_round_column_subjects.column_id
        AND cr.status IN ('open','closed','finalised')
        AND ssl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can view column subjects" ON public.choice_round_column_subjects;
CREATE POLICY "Parents can view column subjects" ON public.choice_round_column_subjects
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_round_columns crc
      JOIN public.choice_rounds cr ON cr.id = crc.round_id
      JOIN public.school_student_links ssl ON ssl.school_id = cr.school_id
      JOIN public.parent_student_links psl ON psl.student_id = ssl.student_id
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE crc.id = choice_round_column_subjects.column_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Managers can write column subjects" ON public.choice_round_column_subjects;
CREATE POLICY "Managers can write column subjects" ON public.choice_round_column_subjects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.choice_round_columns crc
      JOIN public.choice_rounds cr ON cr.id = crc.round_id
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE crc.id = choice_round_column_subjects.column_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.choice_round_columns crc
      JOIN public.choice_rounds cr ON cr.id = crc.round_id
      JOIN public.school_staff ss ON ss.school_id = cr.school_id
      WHERE crc.id = choice_round_column_subjects.column_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

-- ---------------------------------------------------------------------
-- student_choices policies
--  - students read / write their own row
--  - parents read row for linked students and UPDATE the parent_*
--    fields (approval workflow)
--  - staff read rows at their school; managers can also UPDATE (override)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Students read own choices" ON public.student_choices;
CREATE POLICY "Students read own choices" ON public.student_choices
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Students insert own choices for own school round" ON public.student_choices;
CREATE POLICY "Students insert own choices for own school round" ON public.student_choices
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.choice_rounds cr
      JOIN public.school_student_links ssl ON ssl.school_id = cr.school_id
      WHERE cr.id = student_choices.round_id
        AND cr.school_id = student_choices.school_id
        AND cr.status = 'open'
        AND ssl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students update own choices while round open" ON public.student_choices;
CREATE POLICY "Students update own choices while round open" ON public.student_choices
  FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Students delete own draft choices" ON public.student_choices;
CREATE POLICY "Students delete own draft choices" ON public.student_choices
  FOR DELETE TO authenticated
  USING (student_id = auth.uid() AND status = 'draft');

DROP POLICY IF EXISTS "Staff read choices for own school" ON public.student_choices;
CREATE POLICY "Staff read choices for own school" ON public.student_choices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = student_choices.school_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers update choices" ON public.student_choices;
CREATE POLICY "Managers update choices" ON public.student_choices
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = student_choices.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = student_choices.school_id
        AND ss.user_id = auth.uid()
        AND (ss.is_school_admin = true OR ss.can_manage_tracking = true)
    )
  );

DROP POLICY IF EXISTS "Parents read linked student choices" ON public.student_choices;
CREATE POLICY "Parents read linked student choices" ON public.student_choices
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE psl.student_id = student_choices.student_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Parents approve linked student choices" ON public.student_choices;
CREATE POLICY "Parents approve linked student choices" ON public.student_choices
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE psl.student_id = student_choices.student_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parent_student_links psl
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE psl.student_id = student_choices.student_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

-- ---------------------------------------------------------------------
-- student_choice_items policies
--  - students read / write items on their own submission
--  - parents read items for linked students (read-only)
--  - staff read items at their school
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Students read own choice items" ON public.student_choice_items;
CREATE POLICY "Students read own choice items" ON public.student_choice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_choices sc
      WHERE sc.id = student_choice_items.student_choice_id
        AND sc.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students write own choice items while editable" ON public.student_choice_items;
CREATE POLICY "Students write own choice items while editable" ON public.student_choice_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_choices sc
      WHERE sc.id = student_choice_items.student_choice_id
        AND sc.student_id = auth.uid()
        AND sc.status IN ('draft','submitted','parent_pending','rejected')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.student_choices sc
      WHERE sc.id = student_choice_items.student_choice_id
        AND sc.student_id = auth.uid()
        AND sc.status IN ('draft','submitted','parent_pending','rejected')
    )
  );

DROP POLICY IF EXISTS "Parents read linked student choice items" ON public.student_choice_items;
CREATE POLICY "Parents read linked student choice items" ON public.student_choice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_choices sc
      JOIN public.parent_student_links psl ON psl.student_id = sc.student_id
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE sc.id = student_choice_items.student_choice_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Staff read choice items for own school" ON public.student_choice_items;
CREATE POLICY "Staff read choice items for own school" ON public.student_choice_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.student_choices sc
      JOIN public.school_staff ss ON ss.school_id = sc.school_id
      WHERE sc.id = student_choice_items.student_choice_id
        AND ss.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.choice_rounds IS
  'Per-school subject-choice windows. One row per (year_group x academic_year).';
COMMENT ON COLUMN public.choice_rounds.status IS
  'draft (school building structure) -> open (students submit) -> closed -> finalised.';
COMMENT ON TABLE public.choice_round_columns IS
  'Columns within a round. Students pick N subjects per column (typically one).';
COMMENT ON COLUMN public.choice_round_columns.is_compulsory IS
  'When true the column has exactly one subject which is auto-selected in the UI.';
COMMENT ON COLUMN public.choice_round_column_subjects.capacity IS
  'Max students per subject. NULL means uncapped. Oversubscription flagged in heatmap.';
COMMENT ON COLUMN public.choice_round_column_subjects.current_demand IS
  'Denormalised count of non-reserve student_choice_items pointing here with committed status.';
COMMENT ON TABLE public.student_choices IS
  'Student submission for a round. Status machine: draft -> submitted -> parent_pending -> confirmed.';
COMMENT ON TABLE public.student_choice_items IS
  'Individual picks within a submission. One row per (choice, column) for single-select columns.';
