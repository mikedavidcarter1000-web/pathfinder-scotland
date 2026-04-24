-- Adds institutional-level overall student satisfaction percentage to
-- universities. Populated from HESA / NSS; nullable because specialist
-- institutions (GSA, RCS, SRUC, UHI) do not appear in the NSS at
-- comparable scale.

ALTER TABLE public.universities ADD COLUMN IF NOT EXISTS student_satisfaction_overall INTEGER
    CHECK (student_satisfaction_overall IS NULL OR (student_satisfaction_overall >= 0 AND student_satisfaction_overall <= 100));
COMMENT ON COLUMN public.universities.student_satisfaction_overall IS 'Institutional-level overall student satisfaction percentage from NSS. Source: HESA / NSS.';
