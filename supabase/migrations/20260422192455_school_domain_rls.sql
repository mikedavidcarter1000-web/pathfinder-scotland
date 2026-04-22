-- RLS policies for school dashboard domain.
-- Staff see rows only for students linked to a school they are staff at.
-- Sensitive data on public.students remains owner-only at the table level;
-- school staff read the students table through the school_visible_students
-- view which excludes vulnerability flags. Aggregate counts of sensitive
-- flags go through a service-role API route.

-- schools
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read own school" ON public.schools;
CREATE POLICY "Staff can read own school" ON public.schools
  FOR SELECT TO authenticated
  USING (public.is_school_staff(auth.uid(), id));

DROP POLICY IF EXISTS "Admins can update own school" ON public.schools;
CREATE POLICY "Admins can update own school" ON public.schools
  FOR UPDATE TO authenticated
  USING (public.is_school_admin(auth.uid(), id))
  WITH CHECK (public.is_school_admin(auth.uid(), id));

-- school_staff
ALTER TABLE public.school_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read staff in own school" ON public.school_staff;
CREATE POLICY "Staff can read staff in own school" ON public.school_staff
  FOR SELECT TO authenticated
  USING (public.is_school_staff(auth.uid(), school_id));

DROP POLICY IF EXISTS "Staff can update own row" ON public.school_staff;
CREATE POLICY "Staff can update own row" ON public.school_staff
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert staff for own school" ON public.school_staff;
CREATE POLICY "Admins can insert staff for own school" ON public.school_staff
  FOR INSERT TO authenticated
  WITH CHECK (public.is_school_admin(auth.uid(), school_id));

DROP POLICY IF EXISTS "Admins can update staff in own school" ON public.school_staff;
CREATE POLICY "Admins can update staff in own school" ON public.school_staff
  FOR UPDATE TO authenticated
  USING (public.is_school_admin(auth.uid(), school_id))
  WITH CHECK (public.is_school_admin(auth.uid(), school_id));

DROP POLICY IF EXISTS "Admins can delete staff in own school" ON public.school_staff;
CREATE POLICY "Admins can delete staff in own school" ON public.school_staff
  FOR DELETE TO authenticated
  USING (public.is_school_admin(auth.uid(), school_id));

-- school_student_links
ALTER TABLE public.school_student_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read links for own school" ON public.school_student_links;
CREATE POLICY "Staff can read links for own school" ON public.school_student_links
  FOR SELECT TO authenticated
  USING (
    public.is_school_staff(auth.uid(), school_id)
    OR student_id = auth.uid()
  );

DROP POLICY IF EXISTS "Student can link self" ON public.school_student_links;
CREATE POLICY "Student can link self" ON public.school_student_links
  FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid());

DROP POLICY IF EXISTS "Student can unlink self" ON public.school_student_links;
CREATE POLICY "Student can unlink self" ON public.school_student_links
  FOR DELETE TO authenticated
  USING (student_id = auth.uid());

-- school_join_codes
ALTER TABLE public.school_join_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can read join codes for own school" ON public.school_join_codes;
CREATE POLICY "Staff can read join codes for own school" ON public.school_join_codes
  FOR SELECT TO authenticated
  USING (public.is_school_staff(auth.uid(), school_id));

DROP POLICY IF EXISTS "Admins can insert join codes for own school" ON public.school_join_codes;
CREATE POLICY "Admins can insert join codes for own school" ON public.school_join_codes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_school_admin(auth.uid(), school_id));

DROP POLICY IF EXISTS "Admins can update join codes for own school" ON public.school_join_codes;
CREATE POLICY "Admins can update join codes for own school" ON public.school_join_codes
  FOR UPDATE TO authenticated
  USING (public.is_school_admin(auth.uid(), school_id))
  WITH CHECK (public.is_school_admin(auth.uid(), school_id));

DROP POLICY IF EXISTS "Admins can delete join codes for own school" ON public.school_join_codes;
CREATE POLICY "Admins can delete join codes for own school" ON public.school_join_codes
  FOR DELETE TO authenticated
  USING (public.is_school_admin(auth.uid(), school_id));

-- Cross-table read policies for staff: scope reads to linked students via
-- is_staff_for_student(). Existing owner-only policies remain intact --
-- these are additive so both the student and the staff can SELECT.

DROP POLICY IF EXISTS "Staff can read saved_courses for linked students" ON public.saved_courses;
CREATE POLICY "Staff can read saved_courses for linked students" ON public.saved_courses
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_staff_for_student(auth.uid(), student_id)
  );

DROP POLICY IF EXISTS "Staff can read student_grades for linked students" ON public.student_grades;
CREATE POLICY "Staff can read student_grades for linked students" ON public.student_grades
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_staff_for_student(auth.uid(), student_id)
  );

DROP POLICY IF EXISTS "Staff can read student_subject_choices for linked students" ON public.student_subject_choices;
CREATE POLICY "Staff can read student_subject_choices for linked students" ON public.student_subject_choices
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_staff_for_student(auth.uid(), student_id)
  );

DROP POLICY IF EXISTS "Staff can read student_checklist_progress for linked students" ON public.student_checklist_progress;
CREATE POLICY "Staff can read student_checklist_progress for linked students" ON public.student_checklist_progress
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.is_staff_for_student(auth.uid(), student_id)
  );
