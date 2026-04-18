-- Add three widening-access flags to students.
-- match_bursaries_for_student() already references these columns; without them the function errors at runtime.
-- Transaction boundary is owned by the applying tool (see CLAUDE.md: no BEGIN/COMMIT in migration files).

ALTER TABLE public.students
  ADD COLUMN is_estranged boolean NOT NULL DEFAULT false,
  ADD COLUMN is_refugee_or_asylum_seeker boolean NOT NULL DEFAULT false,
  ADD COLUMN is_young_parent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.students.is_estranged IS
  'Student is estranged from their family (no contact with either biological or adoptive parent). Widening-access flag used by match_bursaries_for_student.';
COMMENT ON COLUMN public.students.is_refugee_or_asylum_seeker IS
  'Student holds refugee status, humanitarian protection, or is an asylum seeker. Widening-access flag used by match_bursaries_for_student.';
COMMENT ON COLUMN public.students.is_young_parent IS
  'Student has dependent children and is under the age threshold for the Lone Parent Grant or similar schemes. Widening-access flag used by match_bursaries_for_student.';
