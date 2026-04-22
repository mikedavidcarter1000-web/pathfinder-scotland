-- GDPR/Data Security Features
-- Audit logging, data export, and user deletion

-- ============================================
-- AUDIT LOG TABLE
-- ============================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying by user
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
    ON audit_log FOR SELECT
    USING (auth.uid() = user_id);

-- Only service role can insert audit logs (via triggers/functions)
CREATE POLICY "Service role can insert audit logs"
    ON audit_log FOR INSERT
    TO service_role
    WITH CHECK (true);

-- ============================================
-- AUDIT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    audit_user_id UUID;
    old_record JSONB;
    new_record JSONB;
BEGIN
    -- Get current user ID
    audit_user_id := auth.uid();

    -- Build old/new data based on operation
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

    -- Insert audit log entry
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_data, new_data)
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

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to user data tables
CREATE TRIGGER audit_students
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_saved_courses
    AFTER INSERT OR UPDATE OR DELETE ON saved_courses
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_student_grades
    AFTER INSERT OR UPDATE OR DELETE ON student_grades
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- EXPORT USER DATA FUNCTION (GDPR Article 20)
-- ============================================

CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    export_user_id UUID;
    result JSONB;
BEGIN
    -- Use provided user_id or current user
    export_user_id := COALESCE(target_user_id, auth.uid());

    -- Verify user can only export their own data (unless service role)
    IF export_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only export your own data';
    END IF;

    -- Build comprehensive data export
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

    -- Log the export action
    INSERT INTO audit_log (user_id, action, table_name)
    VALUES (export_user_id, 'DATA_EXPORT', 'all_user_data');

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DELETE USER DATA FUNCTION (GDPR Article 17)
-- ============================================

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    delete_user_id UUID;
    deleted_counts JSONB;
    grades_count INTEGER;
    courses_count INTEGER;
    audit_count INTEGER;
BEGIN
    -- Use provided user_id or current user
    delete_user_id := COALESCE(target_user_id, auth.uid());

    -- Verify user can only delete their own data (unless service role)
    IF delete_user_id != auth.uid() AND current_setting('role') != 'service_role' THEN
        RAISE EXCEPTION 'Access denied: Can only delete your own data';
    END IF;

    -- Delete student grades
    DELETE FROM student_grades WHERE student_id = delete_user_id;
    GET DIAGNOSTICS grades_count = ROW_COUNT;

    -- Delete saved courses
    DELETE FROM saved_courses WHERE student_id = delete_user_id;
    GET DIAGNOSTICS courses_count = ROW_COUNT;

    -- Anonymize audit logs (keep for compliance but remove PII)
    UPDATE audit_log
    SET old_data = NULL, new_data = NULL
    WHERE user_id = delete_user_id;
    GET DIAGNOSTICS audit_count = ROW_COUNT;

    -- Delete student profile
    DELETE FROM students WHERE id = delete_user_id;

    -- Build result summary
    deleted_counts := jsonb_build_object(
        'deletion_date', NOW(),
        'user_id', delete_user_id,
        'deleted_records', jsonb_build_object(
            'grades', grades_count,
            'saved_courses', courses_count,
            'audit_logs_anonymized', audit_count,
            'profile', 1
        ),
        'status', 'complete'
    );

    -- Log the deletion (with anonymized user reference)
    INSERT INTO audit_log (user_id, action, table_name, new_data)
    VALUES (NULL, 'USER_DATA_DELETED', 'all_user_data',
            jsonb_build_object('deleted_user_id', delete_user_id));

    RETURN deleted_counts;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATA RETENTION CLEANUP (Optional scheduled job)
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete audit logs older than retention period
    -- Keep deletion/export logs indefinitely for compliance
    DELETE FROM audit_log
    WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND action NOT IN ('USER_DATA_DELETED', 'DATA_EXPORT');

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Allow authenticated users to call export/delete functions
GRANT EXECUTE ON FUNCTION export_user_data TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data TO authenticated;

-- Service role can cleanup old logs
GRANT EXECUTE ON FUNCTION cleanup_old_audit_logs TO service_role;

-- Grant select on audit_log to authenticated (RLS will filter)
GRANT SELECT ON audit_log TO authenticated;
