-- Authority-15 hardening: address Codex review findings.
--
-- 1. SECURITY DEFINER functions: pin search_path to `public, pg_temp` so
--    a temp-table shadow attack cannot replace national_staff in the
--    function's resolution. (Default behaviour can search pg_temp first.)
-- 2. create_national_staff: REVOKE FROM PUBLIC removed EXECUTE for
--    service_role too, so explicitly GRANT to service_role.
-- 3. national_staff: add UNIQUE constraint on email so concurrent POSTs
--    can't race past the API-level duplicate check.
-- 4. national_audit_log: drop the broad INSERT policy. Audit writes only
--    happen through the service-role admin client (logNationalAction in
--    lib/national/auth.ts); RLS on a authenticated session would let a
--    national analyst forge audit rows otherwise.

ALTER FUNCTION is_national_staff() SET search_path = public, pg_temp;
ALTER FUNCTION is_national_admin() SET search_path = public, pg_temp;
ALTER FUNCTION create_national_staff(TEXT, TEXT, TEXT, TEXT)
  SET search_path = public, pg_temp;

GRANT EXECUTE ON FUNCTION create_national_staff(TEXT, TEXT, TEXT, TEXT)
  TO service_role;

ALTER TABLE national_staff
  ADD CONSTRAINT national_staff_email_unique UNIQUE (email);

DROP POLICY IF EXISTS "national_staff_insert_audit_log" ON national_audit_log;
