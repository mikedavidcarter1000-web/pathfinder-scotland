-- =============================================================================
-- GDPR Compliance Enhancements (2026-04-19)
-- =============================================================================
-- This migration layers the GDPR feature spec on top of the existing
-- audit_log table and delete/export functions created in
-- 20240129000002_gdpr_features.sql. Changes:
--
--   1. Defensive IF-NOT-EXISTS creation of audit_log (no-op on live DB).
--   2. Additional admin read policy on audit_log (keeps existing user policy).
--   3. delete_user_data(target_user_id UUID) -- expanded to cover every
--      user-referencing table currently in the schema. Analytics tables are
--      anonymised rather than deleted. Emits a single audit_log record.
--   4. export_user_data(target_user_id UUID) -- expanded to cover every
--      user-referencing table. Emits a single audit_log record.
--   5. Postgres COMMENTs on students columns that hold GDPR special category
--      or otherwise sensitive personal data.
--
-- The existing audit_log shape already covers the spec's requested fields:
--     spec field         ->  audit_log column
--     action             ->  action
--     performed_by       ->  user_id (auth.uid() at write time)
--     target_user_id     ->  record_id (when table_name = 'students')
--     details            ->  new_data (JSONB)
--     ip_address         ->  ip_address (inet)
--     performed_at       ->  created_at
--
-- The table is NOT restructured here.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. audit_log (idempotent safety net)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action     TEXT NOT NULL,
    table_name TEXT,
    record_id  UUID,
    old_data   JSONB,
    new_data   JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 2. RLS: admin read access (in addition to existing "own row" SELECT policy)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can read all audit logs" ON audit_log;
CREATE POLICY "Admins can read all audit logs"
    ON audit_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM students
            WHERE students.id = auth.uid()
              AND students.user_type = 'admin'
        )
    );

-- -----------------------------------------------------------------------------
-- 3. Special category / sensitive column comments
--    Only applied to columns that exist in the current schema.
-- -----------------------------------------------------------------------------
COMMENT ON COLUMN students.has_disability IS
    'GDPR Article 9 special category data (health) - requires explicit consent before collection or processing.';
COMMENT ON COLUMN students.care_experienced IS
    'GDPR sensitive personal data (Scottish care experience status) - treat as special category; requires explicit consent.';
COMMENT ON COLUMN students.is_carer IS
    'GDPR sensitive personal data - carer status may reveal health information about family members; handle per Article 9 principles.';
COMMENT ON COLUMN students.is_young_carer IS
    'GDPR sensitive personal data - young carer status may reveal health information about family members; handle per Article 9 principles.';
COMMENT ON COLUMN students.postcode IS
    'Personal location data - combined with other fields can identify individuals; minimise retention period.';

-- -----------------------------------------------------------------------------
-- 4. export_user_data (GDPR Article 15 / 20 - Subject Access Request)
-- -----------------------------------------------------------------------------
-- Covers every user-referencing table present in the schema.
-- Authorisation: subject themselves, service_role/postgres, or admin.
-- Logs one audit_log row per call.
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id  UUID;
    _is_admin BOOLEAN;
    _result   JSONB;
BEGIN
    _user_id := COALESCE(target_user_id, auth.uid());
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'export_user_data: no user id provided and no auth session';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM students
        WHERE students.id = auth.uid() AND students.user_type = 'admin'
    ) INTO _is_admin;

    IF _user_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
       AND current_setting('role', true) NOT IN ('service_role', 'postgres')
       AND NOT _is_admin
    THEN
        RAISE EXCEPTION 'Access denied: cannot export another user''s data';
    END IF;

    SELECT jsonb_build_object(
        'export_date', NOW(),
        'user_id',     _user_id,
        'profile',     (SELECT to_jsonb(s.*) FROM students s WHERE s.id = _user_id),
        'grades',              COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM student_grades         x WHERE x.student_id = _user_id), '[]'::jsonb),
        'saved_courses',       COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM saved_courses          x WHERE x.student_id = _user_id), '[]'::jsonb),
        'subject_choices',     COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM student_subject_choices x WHERE x.student_id = _user_id), '[]'::jsonb),
        'academy_choices',     COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM student_academy_choices x WHERE x.student_id = _user_id), '[]'::jsonb),
        'offers',              COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM student_offers         x WHERE x.student_id = _user_id), '[]'::jsonb),
        'prep_checklist',      COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM prep_checklist_items   x WHERE x.student_id = _user_id), '[]'::jsonb),
        'benefit_reminders',   COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM benefit_reminders      x WHERE x.student_id = _user_id), '[]'::jsonb),
        'benefit_clicks',      COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM benefit_clicks         x WHERE x.student_id = _user_id), '[]'::jsonb),
        'promo_redemptions',   COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM promo_code_redemptions x WHERE x.user_id    = _user_id), '[]'::jsonb),
        'stripe_customer',     (SELECT to_jsonb(x.*) FROM stripe_customers x WHERE x.user_id = _user_id LIMIT 1),
        'stripe_subscriptions',COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM stripe_subscriptions   x WHERE x.user_id    = _user_id), '[]'::jsonb),
        'stripe_payments',     COALESCE((SELECT jsonb_agg(to_jsonb(x.*)) FROM stripe_payments        x WHERE x.user_id    = _user_id), '[]'::jsonb),
        'audit_history',       COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'action',    al.action,
                'table',     al.table_name,
                'timestamp', al.created_at
            ) ORDER BY al.created_at DESC)
            FROM audit_log al
            WHERE al.user_id = _user_id
        ), '[]'::jsonb)
    ) INTO _result;

    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'data_exported', 'students', _user_id,
            jsonb_build_object('target_user_id', _user_id, 'exported_at', NOW()));

    RETURN _result;
END;
$$;

-- -----------------------------------------------------------------------------
-- 5. delete_user_data (GDPR Article 17 - Right to Erasure)
-- -----------------------------------------------------------------------------
-- Hard-deletes user-owned rows, anonymises analytics rows, logs a single
-- audit_log entry, then removes the auth.users row. PL/pgSQL functions are
-- atomic within the calling transaction, so all-or-nothing is enforced.
-- Authorisation: subject themselves, service_role/postgres, or admin.
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    _user_id  UUID;
    _is_admin BOOLEAN;
    _summary  JSONB;
    _grades      INT;
    _saved       INT;
    _subj        INT;
    _acad        INT;
    _offers      INT;
    _prep        INT;
    _brems       INT;
    _redemp      INT;
    _subs        INT;
    _pays        INT;
    _cust        INT;
    _clicks_anon INT;
    _audit_anon  INT;
BEGIN
    _user_id := COALESCE(target_user_id, auth.uid());
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'delete_user_data: no user id provided and no auth session';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM students
        WHERE students.id = auth.uid() AND students.user_type = 'admin'
    ) INTO _is_admin;

    IF _user_id <> COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'::uuid)
       AND current_setting('role', true) NOT IN ('service_role', 'postgres')
       AND NOT _is_admin
    THEN
        RAISE EXCEPTION 'Access denied: cannot delete another user''s data';
    END IF;

    -- Hard-delete user-owned rows
    DELETE FROM student_grades          WHERE student_id = _user_id; GET DIAGNOSTICS _grades  = ROW_COUNT;
    DELETE FROM saved_courses           WHERE student_id = _user_id; GET DIAGNOSTICS _saved   = ROW_COUNT;
    DELETE FROM student_subject_choices WHERE student_id = _user_id; GET DIAGNOSTICS _subj    = ROW_COUNT;
    DELETE FROM student_academy_choices WHERE student_id = _user_id; GET DIAGNOSTICS _acad    = ROW_COUNT;
    DELETE FROM student_offers          WHERE student_id = _user_id; GET DIAGNOSTICS _offers  = ROW_COUNT;
    DELETE FROM prep_checklist_items    WHERE student_id = _user_id; GET DIAGNOSTICS _prep    = ROW_COUNT;
    DELETE FROM benefit_reminders       WHERE student_id = _user_id; GET DIAGNOSTICS _brems   = ROW_COUNT;
    DELETE FROM promo_code_redemptions  WHERE user_id    = _user_id; GET DIAGNOSTICS _redemp  = ROW_COUNT;
    DELETE FROM stripe_subscriptions    WHERE user_id    = _user_id; GET DIAGNOSTICS _subs    = ROW_COUNT;
    DELETE FROM stripe_payments         WHERE user_id    = _user_id; GET DIAGNOSTICS _pays    = ROW_COUNT;
    DELETE FROM stripe_customers        WHERE user_id    = _user_id; GET DIAGNOSTICS _cust    = ROW_COUNT;

    -- Anonymise analytics rows (preserve the row, null the user reference)
    UPDATE benefit_clicks SET student_id = NULL WHERE student_id = _user_id;
    GET DIAGNOSTICS _clicks_anon = ROW_COUNT;

    -- Strip PII from prior audit_log rows but retain them for compliance
    UPDATE audit_log
        SET user_id = NULL, old_data = NULL, new_data = NULL
        WHERE user_id = _user_id;
    GET DIAGNOSTICS _audit_anon = ROW_COUNT;

    -- Delete the student profile row
    DELETE FROM students WHERE id = _user_id;

    _summary := jsonb_build_object(
        'deletion_date', NOW(),
        'user_id',       _user_id,
        'deleted', jsonb_build_object(
            'student_grades',          _grades,
            'saved_courses',           _saved,
            'student_subject_choices', _subj,
            'student_academy_choices', _acad,
            'student_offers',          _offers,
            'prep_checklist_items',    _prep,
            'benefit_reminders',       _brems,
            'promo_code_redemptions',  _redemp,
            'stripe_subscriptions',    _subs,
            'stripe_payments',         _pays,
            'stripe_customers',        _cust,
            'students',                1
        ),
        'anonymised', jsonb_build_object(
            'benefit_clicks', _clicks_anon,
            'audit_log',      _audit_anon
        ),
        'status', 'complete'
    );

    -- Log the deletion (user_id NULL: subject is gone)
    INSERT INTO audit_log (user_id, action, table_name, record_id, new_data)
    VALUES (NULL, 'user_deleted', 'students', _user_id, _summary);

    -- Finally, remove the auth account
    DELETE FROM auth.users WHERE id = _user_id;

    RETURN _summary;
END;
$$;

-- -----------------------------------------------------------------------------
-- 6. Grants
-- -----------------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION export_user_data(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_user_data(UUID) TO authenticated;
