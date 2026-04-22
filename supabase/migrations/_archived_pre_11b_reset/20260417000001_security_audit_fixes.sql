-- Security Audit Fixes — 2026-04-12
-- Addresses: GDPR function gaps, benefit_clicks RLS, audit triggers

-- ============================================
-- 1. FIX benefit_clicks INSERT policy
--    Old policy: WITH CHECK (true) — any authenticated user can insert
--    New policy: student_id must match auth.uid() or be NULL (anonymous)
-- ============================================

DROP POLICY IF EXISTS "Authenticated insert clicks" ON benefit_clicks;

CREATE POLICY "Insert own clicks only"
  ON benefit_clicks FOR INSERT
  TO authenticated
  WITH CHECK (student_id IS NULL OR student_id = auth.uid());

-- Allow anon users to insert clicks (with student_id = NULL only)
CREATE POLICY "Anon insert clicks"
  ON benefit_clicks FOR INSERT
  TO anon
  WITH CHECK (student_id IS NULL);

-- Allow students to view their own click history (GDPR data access)
CREATE POLICY "Users can view own clicks"
  ON benefit_clicks FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- ============================================
-- 2. UPDATE export_user_data() — add missing tables
--    Missing: student_offers, prep_checklist_items,
--    student_subject_choices, student_academy_choices,
--    benefit_reminders, benefit_clicks
-- ============================================

CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
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
            FROM students s
            WHERE s.id = export_user_id
        ),
        'grades', (
            SELECT COALESCE(jsonb_agg(to_jsonb(g.*)), '[]'::jsonb)
            FROM student_grades g
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
            FROM saved_courses sc
            JOIN courses c ON c.id = sc.course_id
            JOIN universities u ON u.id = c.university_id
            WHERE sc.student_id = export_user_id
        ),
        'offers', (
            SELECT COALESCE(jsonb_agg(to_jsonb(o.*)), '[]'::jsonb)
            FROM student_offers o
            WHERE o.student_id = export_user_id
        ),
        'checklist_items', (
            SELECT COALESCE(jsonb_agg(to_jsonb(p.*)), '[]'::jsonb)
            FROM prep_checklist_items p
            WHERE p.student_id = export_user_id
        ),
        'subject_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(sc2.*)), '[]'::jsonb)
            FROM student_subject_choices sc2
            WHERE sc2.student_id = export_user_id
        ),
        'academy_choices', (
            SELECT COALESCE(jsonb_agg(to_jsonb(ac.*)), '[]'::jsonb)
            FROM student_academy_choices ac
            WHERE ac.student_id = export_user_id
        ),
        'benefit_reminders', (
            SELECT COALESCE(jsonb_agg(to_jsonb(br.*)), '[]'::jsonb)
            FROM benefit_reminders br
            WHERE br.student_id = export_user_id
        ),
        'benefit_clicks', (
            SELECT COALESCE(jsonb_agg(to_jsonb(bc.*)), '[]'::jsonb)
            FROM benefit_clicks bc
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
            FROM audit_log al
            WHERE al.user_id = export_user_id
        )
    ) INTO result;

    INSERT INTO audit_log (user_id, action, table_name)
    VALUES (export_user_id, 'DATA_EXPORT', 'all_user_data');

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. UPDATE delete_user_data() — add missing tables
--    Missing: student_offers, prep_checklist_items,
--    student_subject_choices, student_academy_choices,
--    benefit_reminders, benefit_clicks
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
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

    -- Delete from all student data tables (order matters for FK constraints)
    DELETE FROM benefit_clicks WHERE student_id = delete_user_id;
    GET DIAGNOSTICS clicks_count = ROW_COUNT;

    DELETE FROM benefit_reminders WHERE student_id = delete_user_id;
    GET DIAGNOSTICS reminders_count = ROW_COUNT;

    DELETE FROM prep_checklist_items WHERE student_id = delete_user_id;
    GET DIAGNOSTICS checklist_count = ROW_COUNT;

    DELETE FROM student_offers WHERE student_id = delete_user_id;
    GET DIAGNOSTICS offers_count = ROW_COUNT;

    DELETE FROM student_subject_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS subject_choices_count = ROW_COUNT;

    DELETE FROM student_academy_choices WHERE student_id = delete_user_id;
    GET DIAGNOSTICS academy_choices_count = ROW_COUNT;

    DELETE FROM student_grades WHERE student_id = delete_user_id;
    GET DIAGNOSTICS grades_count = ROW_COUNT;

    DELETE FROM saved_courses WHERE student_id = delete_user_id;
    GET DIAGNOSTICS courses_count = ROW_COUNT;

    -- Anonymize audit logs (keep for compliance but remove PII)
    UPDATE audit_log
    SET old_data = NULL, new_data = NULL
    WHERE user_id = delete_user_id;
    GET DIAGNOSTICS audit_count = ROW_COUNT;

    -- Delete student profile last (other tables reference it)
    DELETE FROM students WHERE id = delete_user_id;

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

    INSERT INTO audit_log (user_id, action, table_name, new_data)
    VALUES (NULL, 'USER_DATA_DELETED', 'all_user_data',
            jsonb_build_object('deleted_user_id', delete_user_id));

    RETURN deleted_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ADD audit triggers to newer tables
-- ============================================

-- Use DO block to conditionally create triggers (avoids error if they already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_student_offers'
  ) THEN
    CREATE TRIGGER audit_student_offers
      AFTER INSERT OR UPDATE OR DELETE ON student_offers
      FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_prep_checklist_items'
  ) THEN
    CREATE TRIGGER audit_prep_checklist_items
      AFTER INSERT OR UPDATE OR DELETE ON prep_checklist_items
      FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'audit_benefit_reminders'
  ) THEN
    CREATE TRIGGER audit_benefit_reminders
      AFTER INSERT OR UPDATE OR DELETE ON benefit_reminders
      FOR EACH ROW EXECUTE FUNCTION log_audit_event();
  END IF;
END;
$$;
