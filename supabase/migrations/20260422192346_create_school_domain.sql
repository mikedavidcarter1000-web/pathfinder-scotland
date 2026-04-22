-- School dashboard domain: schools, staff, student links, join codes.
-- Plus students.school_id + students.last_active_at for linking and activity.

-- =====================================================================
-- schools
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  local_authority TEXT,
  postcode TEXT,
  seed_code TEXT UNIQUE,
  school_type TEXT CHECK (school_type IN ('secondary', 'all_through', 'special', 'independent')),
  total_roll INTEGER,
  simd_profile JSONB DEFAULT '{}'::jsonb,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled')),
  is_founding_school BOOLEAN DEFAULT false,
  trial_started_at TIMESTAMPTZ,
  trial_expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_status ON public.schools(subscription_status);

-- =====================================================================
-- school_staff
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.school_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('guidance_teacher', 'pt_guidance', 'dyw_coordinator', 'depute', 'head_teacher', 'admin')),
  can_view_individual_students BOOLEAN DEFAULT false,
  is_school_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_school_staff_user ON public.school_staff(user_id);
CREATE INDEX IF NOT EXISTS idx_school_staff_school ON public.school_staff(school_id);

-- =====================================================================
-- school_student_links
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.school_student_links (
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  linked_at TIMESTAMPTZ DEFAULT now(),
  linked_by TEXT DEFAULT 'self' CHECK (linked_by IN ('self', 'school_code', 'import')),
  PRIMARY KEY (school_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_school_student_links_student ON public.school_student_links(student_id);
CREATE INDEX IF NOT EXISTS idx_school_student_links_school ON public.school_student_links(school_id);

-- =====================================================================
-- school_join_codes
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.school_join_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES public.school_staff(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_join_codes_school ON public.school_join_codes(school_id);
CREATE INDEX IF NOT EXISTS idx_school_join_codes_code ON public.school_join_codes(code) WHERE is_active = true;

-- =====================================================================
-- students: link + activity
-- =====================================================================

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_students_school_id ON public.students(school_id);

-- =====================================================================
-- updated_at triggers
-- =====================================================================

CREATE OR REPLACE FUNCTION public.set_school_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_schools_updated_at ON public.schools;
CREATE TRIGGER trg_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.set_school_tables_updated_at();

DROP TRIGGER IF EXISTS trg_school_staff_updated_at ON public.school_staff;
CREATE TRIGGER trg_school_staff_updated_at
  BEFORE UPDATE ON public.school_staff
  FOR EACH ROW
  EXECUTE FUNCTION public.set_school_tables_updated_at();

-- =====================================================================
-- Helper functions (SECURITY DEFINER) used by RLS policies
-- =====================================================================

CREATE OR REPLACE FUNCTION public.is_school_staff(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_staff
    WHERE user_id = p_user_id AND school_id = p_school_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin(p_user_id UUID, p_school_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.school_staff
    WHERE user_id = p_user_id AND school_id = p_school_id AND is_school_admin = true
  );
$$;

CREATE OR REPLACE FUNCTION public.user_school_ids(p_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.school_staff WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_staff_for_student(p_user_id UUID, p_student_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.school_student_links ssl
    JOIN public.school_staff ss ON ss.school_id = ssl.school_id
    WHERE ssl.student_id = p_student_id AND ss.user_id = p_user_id
  );
$$;

-- =====================================================================
-- school_visible_students: view excluding sensitive columns.
-- Sensitive flags (care_experienced, is_estranged, has_disability,
-- is_refugee_or_asylum_seeker, is_young_parent, is_young_carer,
-- disability_details, household_income_band, is_single_parent_household,
-- receives_free_school_meals, receives_ema) are intentionally excluded.
-- =====================================================================

CREATE OR REPLACE VIEW public.school_visible_students
WITH (security_invoker = true)
AS
SELECT
  id,
  first_name,
  last_name,
  email,
  school_name,
  school_stage,
  school_id,
  postcode,
  simd_decile,
  first_generation,
  created_at,
  updated_at,
  last_active_at,
  demographic_completed
FROM public.students
WHERE public.is_staff_for_student(auth.uid(), id);

GRANT SELECT ON public.school_visible_students TO authenticated;

COMMENT ON VIEW public.school_visible_students IS
  'Students visible to school staff. Excludes sensitive vulnerability flags, household_income_band, FSM/EMA, disability_details. Aggregate counts of sensitive columns must go through a service-role API route.';
