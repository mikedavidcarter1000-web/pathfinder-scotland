-- Restore auto_lookup_simd trigger on students -- 2026-04-20
--
-- The original trigger was created in 20240101000000_initial_schema.sql:281
-- as function lookup_simd_for_student() attached as trigger auto_lookup_simd
-- (BEFORE INSERT OR UPDATE OF postcode ON students). It is not present in
-- the live DB (no DROP in any committed migration; likely removed by an
-- earlier simd_postcodes schema change that CASCADE-dropped it).
--
-- The security-hardening guard prevent_restricted_student_column_update
-- (20260420000003_security_hardening.sql) documents auto_lookup_simd as
-- the alphabetically-earlier trigger that populates simd_decile when the
-- postcode column changes. Without auto_lookup_simd present the guard
-- unconditionally blocks any non-postgres/non-service_role UPDATE that
-- needs to refresh a cached decile, which forced a SET LOCAL ROLE postgres
-- workaround during the Stage 1.5b postcode refresh.
--
-- Restoring the trigger matches the documented architecture and removes
-- the need for that workaround on subsequent simd_postcodes refreshes:
-- callers can issue `UPDATE students SET postcode = postcode` to re-trigger
-- the lookup against fresh simd_postcodes data.
--
-- Differences from the 2024 original:
--  1. Looks up via simd_postcodes.postcode_normalised (generated column
--     added by Stage 1.5b, 20260420000001_refresh_simd_postcodes_schema)
--     rather than the legacy unspaced postcode column -- storage format
--     changed in Stage 1.5b to the spaced canonical form.
--  2. Sets NEW.simd_decile := NULL when the new postcode has no match
--     (terminated or non-Scottish). The 2024 original left the previous
--     value in place, which produces a stale decile against a changed
--     postcode -- the exact failure mode that Task B's student-sync step
--     had to repair.
--  3. Clears simd_decile when NEW.postcode is NULL or blank, same reason.
--
-- SECURITY INVOKER is adequate: simd_postcodes has a public read RLS
-- policy, so the trigger body can read it under invoker permissions
-- during an authenticated student's own-row UPDATE. search_path is locked
-- to '' to satisfy the Supabase security linter.
--
-- Trigger ordering (alphabetical, BEFORE triggers only):
--    auto_lookup_simd          (new, fires only on postcode writes)
--    students_restricted_column_guard
--    update_students_updated_at
-- auto_lookup_simd runs first, so when postcode changes it has already
-- reconciled simd_decile by the time the guard checks the pair.

CREATE OR REPLACE FUNCTION public.lookup_simd_for_student()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    normalised text;
    looked_up integer;
BEGIN
    IF NEW.postcode IS NULL OR NEW.postcode = '' THEN
        NEW.simd_decile := NULL;
        RETURN NEW;
    END IF;

    normalised := upper(replace(NEW.postcode, ' ', ''));

    SELECT simd_decile INTO looked_up
    FROM public.simd_postcodes
    WHERE postcode_normalised = normalised
    LIMIT 1;

    NEW.simd_decile := looked_up;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_lookup_simd ON public.students;
CREATE TRIGGER auto_lookup_simd
    BEFORE INSERT OR UPDATE OF postcode ON public.students
    FOR EACH ROW
    EXECUTE FUNCTION public.lookup_simd_for_student();
