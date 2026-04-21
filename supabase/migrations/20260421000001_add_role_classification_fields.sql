-- Stage 1.5f (part 2): add hand-classified salary and entry-route fields to
-- role_profiles. The companion career_roles.maturity_tier enum ('foundational',
-- 'intermediate', 'specialised') already exists from Stage 1.5e.
--
-- Convention: no BEGIN/COMMIT -- the applying tool wraps a transaction.

CREATE TYPE public.entry_qualification AS ENUM (
  'none',
  'national_4',
  'national_5',
  'highers',
  'hnc',
  'hnd',
  'degree',
  'degree_plus_professional'
);

ALTER TABLE public.role_profiles
  ADD COLUMN min_entry_qualification     public.entry_qualification,
  ADD COLUMN typical_entry_qualification public.entry_qualification,
  ADD COLUMN typical_starting_salary_gbp integer
    CHECK (typical_starting_salary_gbp    BETWEEN 10000 AND 500000),
  ADD COLUMN typical_experienced_salary_gbp integer
    CHECK (typical_experienced_salary_gbp BETWEEN 10000 AND 500000);

COMMENT ON COLUMN public.role_profiles.min_entry_qualification IS
  'Lowest Scottish qualification level that reliably leads into this role. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_entry_qualification IS
  'Most common entry qualification for new entrants today. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_starting_salary_gbp IS
  'UK-wide typical starting salary in GBP, rounded to nearest 1000. Nullable.';
COMMENT ON COLUMN public.role_profiles.typical_experienced_salary_gbp IS
  'UK-wide typical experienced salary in GBP, rounded to nearest 1000. Nullable.';
