-- Fix latent unqualified-reference bug in four SECURITY DEFINER functions.
--
-- All four functions are defined with `SET search_path TO ''` (deliberately empty,
-- as best practice for SECURITY DEFINER functions to prevent search_path attacks).
-- However, their bodies contain unqualified references to user tables, which fail
-- to resolve when called from sessions that don't have a separately-set search_path.
--
-- The Next.js app via PostgREST works because the session search_path is set by the
-- connection pooler, but direct SQL invocations (admin SQL Editor, MCP execute_sql,
-- some SECURITY DEFINER call paths) hit the bug:
--   ERROR:  42P01: relation "audit_log" does not exist
--
-- Fix: schema-qualify every user-table reference with `public.`. This is Postgres
-- best practice for SECURITY DEFINER functions regardless of whether the current
-- prod context hits the edge case. No logic changes; identical behaviour for all
-- existing successful call paths.
--
-- Built-ins like auth.uid(), NOW(), to_jsonb(), jsonb_build_object(), COALESCE()
-- resolve via pg_catalog (always implicitly first in search_path) and do not need
-- additional qualification. auth.uid() is already qualified.
--
-- Verified pre-apply: all 12 referenced tables exist in public schema
-- (audit_log, benefit_clicks, benefit_reminders, prep_checklist_items,
--  student_offers, student_subject_choices, student_academy_choices,
--  student_grades, saved_courses, students, courses, universities).
--
-- Transaction boundary owned by applying tool (no BEGIN/COMMIT here).

-- 1. log_audit_event() trigger function (audit_students INSERT/UPDATE/DELETE on students,
--    saved_courses, student_grades, promo_codes, promo_code_redemptions per CLAUDE.md)
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    audit_user_id UUID;
    old_record JSONB;
    new_record JSONB;
BEGIN
    audit_user_id := auth.uid();

    IF TG_OP = 'DELETE' THEN
        old_record := to_jsonb(OLD);
        new_record := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_record := to_jsonb(OLD);
        new_record := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_record := NULL;
        new_record := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_log (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (
        audit_user_id,
        TG_OP,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        old_record,
        new_record
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$function$;

-- 2. cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365) - GDPR retention sweep
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_days integer DEFAULT 365)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND action NOT IN ('USER_DATA_DELETED', 'DATA_EXPORT');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$function$;

-- 3. delete_user_data(target_user_id UUID DEFAULT NULL) - GDPR Article 17 right to erasure
CREATE OR REPLACE FUNCTION public.delete_user_data(target_user_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    delete_user_id UUID;
    deleted_counts JSONB;
    grades_count INTEGER;
    courses_count INTEGER;
    offers_count INTEGER;
    checklist_count INTEGER;
    subject_choices_count INTEGER;
    academy_choices_count INTEGER;
    reminders_count INTEGER;
    clicks_count INTEGER;
    audit_count INTEGER;
BEGIN
    delete_user_id := COALESCE(target_user_id, auth.uid());

    IF delete_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only delete your own data';
    END IF;

    DELETE FROM public.benefit_clicks WHERE student_id = delete_user_id;
    GET DIAGNOSTICS clicks_count = ROW_COUNT;

    DELETE FROM public.benefit_reminders WHERE student_id = delete_user_id;
    GET DIAGNOSTICS reminders_count = ROW_COUNT;

    DELETE FROM public.prep_checklist_items WHERE student_id = delete_user_id;
    GET DIAGNOSTICS checklist_count = ROW_COUNT;

    DELETE FROM public.student_offers WHERE student_id = delete_user_id;
    GET DIAGNOSTICS offers_count = ROW_COUNT;

    DELETE FROM public.student_subject_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS subject_choices_count = ROW_COUNT;

    DELETE FROM public.student_academy_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS academy_choices_count = ROW_COUNT;

    DELETE FROM public.student_grades WHERE student_id = delete_user_id;
    GET DIAGNOSTICS grades_count = ROW_COUNT;

    DELETE FROM public.saved_courses WHERE student_id = delete_user_id;
    GET DIAGNOSTICS courses_count = ROW_COUNT;

    UPDATE public.audit_log
    SET old_data = NULL, new_data = NULL
    WHERE user_id = delete_user_id;
    GET DIAGNOSTICS audit_count = ROW_COUNT;

    DELETE FROM public.students WHERE id = delete_user_id;

    deleted_counts := jsonb_build_object(
        'deletion_date', NOW(),
        'user_id', delete_user_id,
        'deleted_records', jsonb_build_object(
            'grades', grades_count,
            'saved_courses', courses_count,
            'offers', offers_count,
            'checklist_items', checklist_count,
            'subject_choices', subject_choices_count,
            'academy_choices', academy_choices_count,
            'benefit_reminders', reminders_count,
            'benefit_clicks', clicks_count,
            'audit_logs_anonymized', audit_count,
            'profile', 1
        ),
        'status', 'complete'
    );

    INSERT INTO public.audit_log (user_id, action, table_name, new_data)
    VALUES (NULL, 'USER_DATA_DELETED', 'all_user_data',
            jsonb_build_object('deleted_user_id', delete_user_id));

    RETURN deleted_counts;
END;
$function$;

-- 4. export_user_data(target_user_id UUID DEFAULT NULL) - GDPR Article 20 data portability
CREATE OR REPLACE FUNCTION public.export_user_data(target_user_id uuid DEFAULT NULL::uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    export_user_id UUID;
    result JSONB;
BEGIN
    export_user_id := COALESCE(target_user_id, auth.uid());

    IF export_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only export your own data';
    END IF;

    SELECT jsonb_build_object(
        'export_date', NOW(),
        'user_id', export_user_id,
        'profile', (
            SELECT to_jsonb(s.*)
            FROM public.students s
            WHERE s.id = export_user_id
        ),
        'grades', (
            SELECT COALESCE(jsonb_agg(to_jsonb(g.*)), '[]'::jsonb)
            FROM public.student_grades g
            WHERE g.student_id = export_user_id
        ),
        'saved_courses', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'course', to_jsonb(c.*),
                    'university', to_jsonb(u.*),
                    'saved_at', sc.created_at,
                    'priority', sc.priority,
                    'notes', sc.notes
                )
            ), '[]'::jsonb)
            FROM public.saved_courses sc
            JOIN public.courses c ON c.id = sc.course_id
            JOIN public.universities u ON u.id = c.university_id
            WHERE sc.student_id = export_user_id
        ),
        'offers', (
            SELECT COALESCE(jsonb_agg(to_jsonb(o.*)), '[]'::jsonb)
            FROM public.student_offers o
            WHERE o.student_id = export_user_id
        ),
        'checklist_items', (
            SELECT COALESCE(jsonb_agg(to_jsonb(p.*)), '[]'::jsonb)
            FROM public.prep_checklist_items p
            WHERE p.student_id = export_user_id
        ),
        'subject_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(sc2.*)), '[]'::jsonb)
            FROM public.student_subject_choices sc2
            WHERE sc2.student_id = export_user_id
        ),
        'academy_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(ac.*)), '[]'::jsonb)
            FROM public.student_academy_choices ac
            WHERE ac.student_id = export_user_id
        ),
        'benefit_reminders', (
            SELECT COALESCE(jsonb_agg(to_jsonb(br.*)), '[]'::jsonb)
            FROM public.benefit_reminders br
            WHERE br.student_id = export_user_id
        ),
        'benefit_clicks', (
            SELECT COALESCE(jsonb_agg(to_jsonb(bc.*)), '[]'::jsonb)
            FROM public.benefit_clicks bc
            WHERE bc.student_id = export_user_id
        ),
        'audit_history', (
            SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                    'action', al.action,
                    'table', al.table_name,
                    'timestamp', al.created_at
                )
                ORDER BY al.created_at DESC
            ), '[]'::jsonb)
            FROM public.audit_log al
            WHERE al.user_id = export_user_id
        )
    ) INTO result;

    INSERT INTO public.audit_log (user_id, action, table_name)
    VALUES (export_user_id, 'DATA_EXPORT', 'all_user_data');

    RETURN result;
END;
$function$;
