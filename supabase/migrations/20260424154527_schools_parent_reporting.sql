-- Schools-6a: parent reporting + parents' evening booking
--
-- This migration extends Schools-2's report_templates + parent_reports
-- (which already ship) and adds the parents' evening booking model:
--   parent_evenings               -- event definition
--   parent_evening_availability   -- which staff are available and when
--   parent_evening_bookings       -- booked slots (parent <-> staff <-> student)
--   parent_evening_tokens         -- magic-link booking for unlinked parents
--
-- report_templates and parent_reports already exist (verified via
-- information_schema.columns) so their DDL is omitted here; RLS extensions
-- are added to let parents see their child's reports via
-- parent_student_links.status = 'active'.
--
-- Idempotent: CREATE TABLE IF NOT EXISTS, DROP POLICY IF EXISTS, triggers
-- via DROP/CREATE. No BEGIN/COMMIT -- the applying tool wraps the txn.

-- =====================================================================
-- 1. Tables
-- =====================================================================

-- parent_evenings -- one row per event
CREATE TABLE IF NOT EXISTS public.parent_evenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  event_date DATE NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 5,
  break_between_slots_minutes INTEGER NOT NULL DEFAULT 1,
  earliest_slot TIME NOT NULL,
  latest_slot TIME NOT NULL,
  booking_opens_at TIMESTAMPTZ,
  booking_closes_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','open','closed','completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_evenings_school ON public.parent_evenings(school_id);
CREATE INDEX IF NOT EXISTS idx_parent_evenings_open ON public.parent_evenings(school_id, status) WHERE status = 'open';

-- parent_evening_availability -- staff's slots for the event
CREATE TABLE IF NOT EXISTS public.parent_evening_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_evening_id UUID NOT NULL REFERENCES public.parent_evenings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.school_staff(id) ON DELETE CASCADE,
  available_from TIME NOT NULL,
  available_to TIME NOT NULL,
  room TEXT,
  max_consecutive_slots INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_evening_id, staff_id)
);

CREATE INDEX IF NOT EXISTS idx_parent_evening_availability_event ON public.parent_evening_availability(parent_evening_id);
CREATE INDEX IF NOT EXISTS idx_parent_evening_availability_staff ON public.parent_evening_availability(staff_id);

-- parent_evening_bookings -- booked slots
CREATE TABLE IF NOT EXISTS public.parent_evening_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_evening_id UUID NOT NULL REFERENCES public.parent_evenings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.school_staff(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.parents(id) ON DELETE SET NULL,
  slot_time TIME NOT NULL,
  prep_snapshot JSONB,
  booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed','cancelled','no_show')),
  booked_by TEXT NOT NULL DEFAULT 'parent' CHECK (booked_by IN ('parent','school')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_evening_id, staff_id, slot_time)
);

CREATE INDEX IF NOT EXISTS idx_parent_evening_bookings_event ON public.parent_evening_bookings(parent_evening_id);
CREATE INDEX IF NOT EXISTS idx_parent_evening_bookings_student ON public.parent_evening_bookings(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_evening_bookings_staff ON public.parent_evening_bookings(staff_id);
CREATE INDEX IF NOT EXISTS idx_parent_evening_bookings_parent ON public.parent_evening_bookings(parent_id);

-- parent_evening_tokens -- magic-link booking without login
CREATE TABLE IF NOT EXISTS public.parent_evening_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_evening_id UUID NOT NULL REFERENCES public.parent_evenings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parent_evening_tokens_event ON public.parent_evening_tokens(parent_evening_id);
CREATE INDEX IF NOT EXISTS idx_parent_evening_tokens_student ON public.parent_evening_tokens(student_id);

-- =====================================================================
-- 2. Additional RLS on parent_reports so linked parents can see their
--    child's reports. Schools-2 already enabled RLS and created staff /
--    student SELECT policies -- this adds a parent branch.
-- =====================================================================

DROP POLICY IF EXISTS "Linked parents can view their child reports" ON public.parent_reports;
CREATE POLICY "Linked parents can view their child reports" ON public.parent_reports
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parents p
      JOIN public.parent_student_links psl ON psl.parent_id = p.id
      WHERE p.user_id = auth.uid()
        AND psl.student_id = parent_reports.student_id
        AND psl.status = 'active'
    )
  );

-- =====================================================================
-- 3. RLS on the four new tables
-- =====================================================================
ALTER TABLE public.parent_evenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_evening_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_evening_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_evening_tokens ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- parent_evenings
-- SELECT: staff at school; parents of students linked to school; students at school
-- INSERT/UPDATE/DELETE: is_school_admin
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view parent evenings" ON public.parent_evenings;
CREATE POLICY "Staff can view parent evenings" ON public.parent_evenings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_evenings.school_id AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Linked parents can view parent evenings" ON public.parent_evenings;
CREATE POLICY "Linked parents can view parent evenings" ON public.parent_evenings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parents p
      JOIN public.parent_student_links psl ON psl.parent_id = p.id
      JOIN public.school_student_links sl ON sl.student_id = psl.student_id
      WHERE p.user_id = auth.uid()
        AND psl.status = 'active'
        AND sl.school_id = parent_evenings.school_id
    )
  );

DROP POLICY IF EXISTS "Students can view parent evenings at their school" ON public.parent_evenings;
CREATE POLICY "Students can view parent evenings at their school" ON public.parent_evenings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_student_links sl
      WHERE sl.school_id = parent_evenings.school_id
        AND sl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert parent evenings" ON public.parent_evenings;
CREATE POLICY "Admins can insert parent evenings" ON public.parent_evenings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_evenings.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update parent evenings" ON public.parent_evenings;
CREATE POLICY "Admins can update parent evenings" ON public.parent_evenings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_evenings.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete parent evenings" ON public.parent_evenings;
CREATE POLICY "Admins can delete parent evenings" ON public.parent_evenings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.school_id = parent_evenings.school_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- parent_evening_availability
-- SELECT: staff at school; parents; students
-- INSERT/UPDATE/DELETE: the staff member themselves or is_school_admin
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view availability" ON public.parent_evening_availability;
CREATE POLICY "Staff can view availability" ON public.parent_evening_availability
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Parents can view availability" ON public.parent_evening_availability;
CREATE POLICY "Parents can view availability" ON public.parent_evening_availability
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parent_evenings pe
      JOIN public.school_student_links sl ON sl.school_id = pe.school_id
      JOIN public.parent_student_links psl ON psl.student_id = sl.student_id
      JOIN public.parents p ON p.id = psl.parent_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND p.user_id = auth.uid()
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Students can view availability at their school" ON public.parent_evening_availability;
CREATE POLICY "Students can view availability at their school" ON public.parent_evening_availability
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.parent_evenings pe
      JOIN public.school_student_links sl ON sl.school_id = pe.school_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND sl.student_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff manage own availability" ON public.parent_evening_availability;
CREATE POLICY "Staff manage own availability" ON public.parent_evening_availability
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.id = parent_evening_availability.staff_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins set availability" ON public.parent_evening_availability;
CREATE POLICY "Admins set availability" ON public.parent_evening_availability
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Staff update own availability" ON public.parent_evening_availability;
CREATE POLICY "Staff update own availability" ON public.parent_evening_availability
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.id = parent_evening_availability.staff_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins update availability" ON public.parent_evening_availability;
CREATE POLICY "Admins update availability" ON public.parent_evening_availability
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Staff delete own availability" ON public.parent_evening_availability;
CREATE POLICY "Staff delete own availability" ON public.parent_evening_availability
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.id = parent_evening_availability.staff_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins delete availability" ON public.parent_evening_availability;
CREATE POLICY "Admins delete availability" ON public.parent_evening_availability
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_availability.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- parent_evening_bookings
-- SELECT: the involved staff, the parent who booked, the student, is_school_admin
-- INSERT: parents for their linked child; is_school_admin
-- UPDATE: parents cancelling own; is_school_admin
-- DELETE: is_school_admin only
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff view own bookings" ON public.parent_evening_bookings;
CREATE POLICY "Staff view own bookings" ON public.parent_evening_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.school_staff ss
      WHERE ss.id = parent_evening_bookings.staff_id
        AND ss.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "School admins view all bookings" ON public.parent_evening_bookings;
CREATE POLICY "School admins view all bookings" ON public.parent_evening_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_bookings.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Parents view own bookings" ON public.parent_evening_bookings;
CREATE POLICY "Parents view own bookings" ON public.parent_evening_bookings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = parent_evening_bookings.parent_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students view own bookings" ON public.parent_evening_bookings;
CREATE POLICY "Students view own bookings" ON public.parent_evening_bookings
  FOR SELECT TO authenticated
  USING (student_id = auth.uid());

DROP POLICY IF EXISTS "Parents insert bookings for linked child" ON public.parent_evening_bookings;
CREATE POLICY "Parents insert bookings for linked child" ON public.parent_evening_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parents p
      JOIN public.parent_student_links psl ON psl.parent_id = p.id
      WHERE p.id = parent_evening_bookings.parent_id
        AND p.user_id = auth.uid()
        AND psl.student_id = parent_evening_bookings.student_id
        AND psl.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Admins insert bookings" ON public.parent_evening_bookings;
CREATE POLICY "Admins insert bookings" ON public.parent_evening_bookings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_bookings.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Parents update own bookings" ON public.parent_evening_bookings;
CREATE POLICY "Parents update own bookings" ON public.parent_evening_bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parents p
      WHERE p.id = parent_evening_bookings.parent_id
        AND p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins update bookings" ON public.parent_evening_bookings;
CREATE POLICY "Admins update bookings" ON public.parent_evening_bookings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_bookings.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins delete bookings" ON public.parent_evening_bookings;
CREATE POLICY "Admins delete bookings" ON public.parent_evening_bookings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_bookings.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

-- ---------------------------------------------------------------------
-- parent_evening_tokens
-- SELECT: anyone (token auth model -- uniqueness is the gate)
-- INSERT: is_school_admin only
-- UPDATE: anyone (mark used_at on redemption)
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read tokens" ON public.parent_evening_tokens;
CREATE POLICY "Anyone can read tokens" ON public.parent_evening_tokens
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins insert tokens" ON public.parent_evening_tokens;
CREATE POLICY "Admins insert tokens" ON public.parent_evening_tokens
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.parent_evenings pe
      JOIN public.school_staff ss ON ss.school_id = pe.school_id
      WHERE pe.id = parent_evening_tokens.parent_evening_id
        AND ss.user_id = auth.uid()
        AND ss.is_school_admin = true
    )
  );

DROP POLICY IF EXISTS "Anyone can redeem tokens" ON public.parent_evening_tokens;
CREATE POLICY "Anyone can redeem tokens" ON public.parent_evening_tokens
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (true);
