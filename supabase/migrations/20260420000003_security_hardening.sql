-- Security hardening — 2026-04-13
-- 1. Prevent students from self-modifying simd_decile / user_type via direct client writes
-- 2. Lock down SECURITY DEFINER function search_paths to satisfy Supabase linter

-- ============================================
-- 1. Students UPDATE guard trigger
--    The existing RLS policy only checks `auth.uid() = id` on UPDATE — it does
--    NOT restrict which columns change. Without this trigger a logged-in
--    student could PATCH their own row to flip simd_decile (which should be
--    derived from postcode via the auto_lookup_simd trigger) or user_type
--    (set at account creation), fraudulently unlocking widening-access routing
--    or admin-only surfaces. Service-role writes (webhooks, admin tooling)
--    must continue to work.
--
--    simd_decile CAN change when postcode also changes in the same UPDATE —
--    auto_lookup_simd (alphabetically earlier, BEFORE UPDATE) has already
--    set it from the simd_postcodes lookup. This trigger detects attempts
--    to set simd_decile without also changing postcode.
--
--    Demographic fields (has_disability, care_experienced, is_carer,
--    is_young_carer) are legitimately self-declared via the settings UI,
--    so they are NOT guarded here.
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_restricted_student_column_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF current_setting('role', true) IN ('service_role', 'postgres') THEN
        RETURN NEW;
    END IF;

    IF NEW.simd_decile IS DISTINCT FROM OLD.simd_decile
       AND NEW.postcode IS NOT DISTINCT FROM OLD.postcode THEN
        RAISE EXCEPTION 'simd_decile cannot be modified directly; update postcode to recalculate'
            USING ERRCODE = '42501';
    END IF;
    IF NEW.user_type IS DISTINCT FROM OLD.user_type THEN
        RAISE EXCEPTION 'user_type cannot be modified after account creation'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS students_restricted_column_guard ON public.students;
CREATE TRIGGER students_restricted_column_guard
    BEFORE UPDATE ON public.students
    FOR EACH ROW EXECUTE FUNCTION public.prevent_restricted_student_column_update();

-- ============================================
-- 2. Lock search_path on existing SECURITY DEFINER functions
--    Detected by the Supabase security linter
--    (function_search_path_mutable). A mutable search_path on a DEFINER
--    function is a privilege-escalation vector if an attacker can create
--    schema/functions in a schema earlier on the search_path.
-- ============================================

ALTER FUNCTION public.log_audit_event() SET search_path = '';
ALTER FUNCTION public.cleanup_old_audit_logs(integer) SET search_path = '';
ALTER FUNCTION public.validate_promo_code(text, uuid, numeric) SET search_path = '';
ALTER FUNCTION public.get_promo_code_stats(uuid) SET search_path = '';
ALTER FUNCTION public.redeem_promo_code(text, numeric, uuid) SET search_path = '';
ALTER FUNCTION public.export_user_data(uuid) SET search_path = '';
ALTER FUNCTION public.delete_user_data(uuid) SET search_path = '';
ALTER FUNCTION public.get_user_subscription(uuid) SET search_path = '';
ALTER FUNCTION public.has_active_subscription(uuid) SET search_path = '';
ALTER FUNCTION public.parents_updated_at() SET search_path = '';
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
